import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

import 'storage_service.dart';

/// 个人版本地 ApiService —— 直连小米 mimo API，无后端、无登录、无 token。
///
/// mimo key / url / model 通过 `--dart-define` 注入：
///   --dart-define=MIMO_API_KEY=sk-xxx
///   --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
///   --dart-define=MIMO_MODEL=mimo-v2.5
class ApiService {
  static const String _apiKey = String.fromEnvironment('MIMO_API_KEY', defaultValue: '');
  static const String _apiUrl = String.fromEnvironment(
    'MIMO_API_URL',
    defaultValue: 'https://api.xiaomimimo.com/v1/chat/completions',
  );
  static const String _model = String.fromEnvironment('MIMO_MODEL', defaultValue: 'mimo-v2.5');

  static const Duration _defaultTimeout = Duration(seconds: 30);
  static const Duration _longTimeout = Duration(seconds: 90);

  // 个人版无登录态，恒为 true，保留方法签名兼容旧调用方
  static Future<bool> isAuthenticated() async => true;

  // ==================== mimo 调用底层 ====================

  static Map<String, String> _headers() => {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_apiKey',
      };

  /// 调用 mimo（纯文本消息），返回 choices[0].message.content
  /// mimo-V2.5 是推理模型：先输出 reasoning_content（思维链），再输出 content（正文）。
  /// 若 content 为空（max_tokens 不足被推理耗尽），回退取 reasoning_content 保证有响应。
  static Future<String> _chat(List<Map<String, dynamic>> messages,
      {int maxTokens = 4096, Duration? timeout}) async {
    final r = await http
        .post(Uri.parse(_apiUrl),
            headers: _headers(),
            body: jsonEncode({
              'model': _model,
              'messages': messages,
              'max_tokens': maxTokens,
              'temperature': 0.7,
              'stream': false,
            }))
        .timeout(timeout ?? _defaultTimeout);
    if (r.statusCode != 200) {
      throw Exception('MiMo API 错误: ${r.statusCode} ${r.body}');
    }
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final msg = data['choices']?[0]?['message'] as Map<String, dynamic>?;
    if (msg == null) throw Exception('MiMo API 返回为空');
    final content = msg['content']?.toString();
    if (content != null && content.isNotEmpty) return content;
    // 推理模型可能 max_tokens 不足，正文未生成，回退思维链
    final reasoning = msg['reasoning_content']?.toString();
    if (reasoning != null && reasoning.isNotEmpty) return reasoning;
    throw Exception('MiMo API 返回为空');
  }

  /// 从可能含非 JSON 文本的字符串中提取第一个 JSON 对象
  static Map<String, dynamic> _extractJson(String text) {
    final start = text.indexOf('{');
    if (start < 0) throw Exception('返回内容不含 JSON');
    // 找匹配的右大括号
    var depth = 0;
    var end = -1;
    for (var i = start; i < text.length; i++) {
      final c = text[i];
      if (c == '{') depth++;
      else if (c == '}') {
        depth--;
        if (depth == 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) throw Exception('JSON 解析失败');
    final raw = text.substring(start, end + 1);
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  // ==================== AI 对话 ====================

  static const String _chatSystemPrompt = '你是KB教练，专业的AI健身顾问。回答要求：\n'
      '- 用列表和**加粗**组织内容\n- 简洁具体，控制在100字内\n- 复杂问题最多200字\n- 不提供医疗诊断';

  /// 读取本地个人资料，拼成 prompt 上下文（年龄/性别/身高/体重等）。
  /// 个人资料是 AI 给出个性化建议的重要参考，未填则返回空字符串。
  static String _getProfileContext() {
    final profile = StorageService.getProfile();
    if (profile == null || profile.isEmpty) return '';
    final parts = <String>[];
    if (profile['nickname'] != null && profile['nickname'].toString().isNotEmpty) {
      parts.add('昵称：${profile['nickname']}');
    }
    if (profile['gender'] != null && profile['gender'].toString().isNotEmpty) {
      parts.add('性别：${profile['gender']}');
    }
    if (profile['age'] != null) parts.add('年龄：${profile['age']}岁');
    if (profile['height'] != null) parts.add('身高：${profile['height']}cm');
    if (profile['weight'] != null) parts.add('体重：${profile['weight']}kg');
    if (parts.isEmpty) return '';
    return '\n\n用户个人资料（请作为个性化建议的参考）：\n- ${parts.join('\n- ')}\n';
  }

  static Future<String> sendMessage(String message, List<Map<String, String>> history) async {
    final messages = <Map<String, dynamic>>[
      {'role': 'system', 'content': _chatSystemPrompt + _getProfileContext()},
      ...history.map((h) => {'role': h['role'] ?? 'user', 'content': h['content'] ?? ''}),
      {'role': 'user', 'content': message},
    ];
    return _chat(messages, maxTokens: 4096);
  }

  /// 流式 AI 对话 —— mimo SSE，每行 `data: {json}`
  /// mimo-V2.5 推理模型流式分两阶段：
  ///   1. 推理阶段：delta.reasoning_content 有值，delta.content 为 null（思维链）
  ///   2. 正文阶段：delta.content 有值（正式回答）
  /// 这里只 yield 正文（content），思维链不混入对话，避免用户看到内部推理。
  static Stream<String> sendMessageStream(
    String message,
    List<Map<String, String>> history,
  ) async* {
    final client = http.Client();
    try {
      final messages = <Map<String, dynamic>>[
        {'role': 'system', 'content': _chatSystemPrompt + _getProfileContext()},
        ...history.map((h) => {'role': h['role'] ?? 'user', 'content': h['content'] ?? ''}),
        {'role': 'user', 'content': message},
      ];
      final request = http.Request('POST', Uri.parse(_apiUrl))
        ..headers.addAll(_headers())
        ..body = jsonEncode({
          'model': _model,
          'messages': messages,
          'max_tokens': 4096,
          'temperature': 0.7,
          'stream': true,
        });
      final response = await client.send(request).timeout(_longTimeout);
      if (response.statusCode != 200) {
        final body = await response.stream.bytesToString();
        throw Exception('对话失败（${response.statusCode}）: $body');
      }
      await for (final chunk in response.stream.transform(utf8.decoder).transform(const LineSplitter())) {
        if (!chunk.startsWith('data:')) continue;
        final payload = chunk.substring(5).trim();
        if (payload == '[DONE]' || payload.isEmpty) break;
        try {
          final json = jsonDecode(payload) as Map<String, dynamic>;
          final delta = json['choices']?[0]?['delta'] as Map<String, dynamic>?;
          if (delta == null) continue;
          // 只输出正文；推理阶段 content 为 null 会被跳过
          final c = delta['content']?.toString();
          if (c != null && c.isNotEmpty) yield c;
        } catch (_) {
          // 跳过无法解析的行
        }
      }
    } finally {
      client.close();
    }
  }

  // ==================== 体态分析 ====================

  static const String _analysisPrompt =
      '你是一位拥有 15 年经验的健身康复师和运动科学专家。请对这张身体照片进行专业体态评估。\n\n'
      '**评估维度（8 项，逐一分析）：**\n\n'
      '1. **头前伸 (headForward)**：耳朵是否在肩膀正上方？下巴是否前探？\n'
      '2. **圆肩 (roundShoulder)**：肩膀是否前扣？手臂自然下垂时手掌是否朝后？肩胛骨是否外翻？\n'
      '3. **骨盆前倾 (pelvicTilt)**：腹部是否前凸？臀部是否后翘？腰椎是否过度前弯？\n'
      '4. **膝超伸 (kneeExtension)**：站立时膝盖是否过度向后顶？\n'
      '5. **脊柱侧弯 (spineCurve)**：从背面观察，脊柱是否有左右弯曲？双肩/骨盆是否等高？\n'
      '6. **高低肩 (shoulderHeight)**：双肩是否等高？是否有明显一侧高于另一侧？\n'
      '7. **X/O 型腿 (legAlignment)**：双腿并拢时，膝盖和脚踝能否同时靠拢？\n'
      '8. **核心稳定性 (coreStability)**：腹部是否松弛？是否有明显的腹直肌分离或核心无力表现？\n\n'
      '**评分标准 (0-100)：** 0-20 正常；21-40 轻微；41-60 中度；61-80 较重；81-100 严重\n\n'
      '**综合评分 (0-100)：** 90-100 优秀；80-89 良好；70-79 中等；60-69 较差；<60 差\n\n'
      '**严重程度：** mild / moderate / severe\n\n'
      '请严格按以下 JSON 格式输出，不要输出其他内容：\n'
      '{\n'
      '  "score": 68,\n'
      '  "summary": "体态评分偏低，主要存在圆肩和头前伸问题...",\n'
      '  "issues": [{"name":"圆肩","severity":"moderate","description":"双侧肩膀明显前扣"}],\n'
      '  "radar": {"headForward":55,"roundShoulder":62,"pelvicTilt":35,"kneeExtension":12,"spineCurve":18,"shoulderHeight":22,"legAlignment":10,"coreStability":48},\n'
      '  "bodyMetrics": {"postureType":"上交叉综合征","riskLevel":"中","affectedAreas":["颈椎","肩胛骨"]},\n'
      '  "suggestions": [{"exercise":"面拉","sets":"3组 × 15次","description":"改善圆肩","targetMuscle":"肩袖","difficulty":"初级","priority":"高","steps":["..."],"tips":["..."]}]\n'
      '}\n'
      '注意：8 个雷达维度必须全部输出；只识别明确可见的问题；建议动作按优先级排序。';

  static Future<Map<String, dynamic>> analyzePhoto(dynamic imageFile) async {
    final bytes = imageFile is File
        ? await imageFile.readAsBytes()
        : (imageFile as List<int>);
    final base64 = base64Encode(bytes);
    final dataUri = 'data:image/jpeg;base64,$base64';

    final messages = <Map<String, dynamic>>[
      {'role': 'system', 'content': _analysisPrompt + _getProfileContext()},
      {
        'role': 'user',
        'content': [
          {'type': 'image_url', 'image_url': {'url': dataUri}},
          {'type': 'text', 'text': '请严格按照评估标准分析这张体态照片，只输出JSON格式结果'},
        ],
      },
    ];

    final r = await http
        .post(Uri.parse(_apiUrl),
            headers: _headers(),
            body: jsonEncode({
              'model': _model,
              'messages': messages,
              'max_completion_tokens': 8192,
              'temperature': 0,
              'top_p': 1,
              'stream': false,
            }))
        .timeout(_longTimeout);
    if (r.statusCode != 200) throw Exception('分析失败: ${r.statusCode} ${r.body}');
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final msg = data['choices']?[0]?['message'] as Map<String, dynamic>?;
    if (msg == null) throw Exception('MiMo API 返回为空');
    var content = msg['content']?.toString();
    if (content == null || content.isEmpty) {
      // 推理模型 max_tokens 不足时正文可能为空，回退思维链
      content = msg['reasoning_content']?.toString();
    }
    if (content == null || content.isEmpty) throw Exception('MiMo API 返回为空');
    return _extractJson(content);
  }

  // ==================== 训练方案生成 ====================

  static String _buildPlanPrompt({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) {
    final issues = (analysisResult['issues'] as List?)?.cast<Map>() ?? [];
    final radar = (analysisResult['radar'] as Map?)?.cast<String, dynamic>() ?? {};
    final issuesStr = issues.map((i) => '${i['name']}（${i['severity']}）').join('、');
    return '你是一位拥有 15 年经验的健身教练和运动康复专家。请根据用户的体态分析结果和训练偏好，生成个性化训练方案。\n\n'
        '用户信息：\n'
        '- 训练目标：$goal\n'
        '- 经验水平：$experience\n'
        '- 训练设备：$equipment\n'
        '- 每周训练：$daysPerWeek 天\n'
        '- 每次时长：$sessionDuration 分钟\n'
        '${_getProfileContext()}\n'
        '体态分析结果：\n'
        '- 综合评分：${analysisResult['score'] ?? 0}/100\n'
        '- 体态问题：${issuesStr.isNotEmpty ? issuesStr : '无'}\n'
        '- 雷达数据：头前伸 ${radar['headForward'] ?? 0}%、圆肩 ${radar['roundShoulder'] ?? 0}%、骨盆前倾 ${radar['pelvicTilt'] ?? 0}%、膝超伸 ${radar['kneeExtension'] ?? 0}%\n\n'
        '要求：\n'
        '1. 训练方案必须针对用户的体态问题进行优化\n'
        '2. 如果有圆肩问题，减少推类动作，增加拉类动作\n'
        '3. 如果有骨盆前倾，加强臀部和核心训练\n'
        '4. 如果有头前伸，加入颈部深层肌群训练\n'
        '5. 动作选择要适合用户的设备条件\n'
        '6. 根据经验水平调整训练强度\n\n'
        '请严格按以下 JSON 格式输出，不要输出其他内容：\n'
        '{\n'
        '  "name": "<训练方案名称>",\n'
        '  "durationWeeks": <4-12>,\n'
        '  "schedule": [{"day":1,"name":"<训练日名称>","exercises":[{"name":"<动作>","sets":<组数>,"reps":"<次数>","restSec":<休息秒>,"notes":"<要点>","targetMuscle":"<目标肌群>"}],"estimatedDuration":<分钟>}],\n'
        '  "nutrition": {"calories":<千卡>,"protein":<克>,"carbs":<克>,"fat":<克>,"notes":"<营养建议>"},\n'
        '  "notes": "<整体注意事项>"\n'
        '}\n'
        '注意：每个训练日 4-8 个动作；体态严重者降低强度。';
  }

  static Future<Map<String, dynamic>> generatePlan({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) async {
    final prompt = _buildPlanPrompt(
      goal: goal,
      experience: experience,
      equipment: equipment,
      daysPerWeek: daysPerWeek,
      sessionDuration: sessionDuration,
      analysisResult: analysisResult,
    );
    final content = await _chat(
      [
        {'role': 'system', 'content': prompt},
      ],
      maxTokens: 4096,
      timeout: _longTimeout,
    );
    return _extractJson(content);
  }

  // 渐进式方案：复用同一 prompt（个人版简化，后端 extraPrompt 可选）
  static Future<Map<String, dynamic>> generateProgressivePlan({
    required String goal,
    required String experience,
    required String equipment,
    required int daysPerWeek,
    required int sessionDuration,
    required Map<String, dynamic> analysisResult,
  }) =>
      generatePlan(
        goal: goal,
        experience: experience,
        equipment: equipment,
        daysPerWeek: daysPerWeek,
        sessionDuration: sessionDuration,
        analysisResult: analysisResult,
      );

  // ==================== 饮食识别 ====================

  static const String _foodPrompt =
      '你是一位专业的营养师和食品识别专家。请识别这张图片中的食物，并估算营养成分。\n\n'
      '**识别要求：**\n1. 识别所有可见的食物\n2. 估算每种食物的大致份量\n3. 计算营养成分\n\n'
      '请严格按以下 JSON 格式输出，不要输出其他内容：\n'
      '{\n'
      '  "foods": [{"name":"<食物>","portion":"<份量>","calories":<千卡>,"protein":<克>,"carbs":<克>,"fat":<克>}],\n'
      '  "totalCalories": <总热量>,\n'
      '  "totalProtein": <总蛋白质>,\n'
      '  "totalCarbs": <总碳水>,\n'
      '  "totalFat": <总脂肪>,\n'
      '  "tips": "<饮食建议，30字以内>"\n'
      '}\n'
      '注意：无法识别返回空数组；不要输出 JSON 以外内容。';

  static Future<Map<String, dynamic>> analyzeFood(dynamic imageFile) async {
    final bytes = imageFile is File
        ? await imageFile.readAsBytes()
        : (imageFile as List<int>);
    final dataUri = 'data:image/jpeg;base64,${base64Encode(bytes)}';

    final messages = <Map<String, dynamic>>[
      {'role': 'system', 'content': _foodPrompt},
      {
        'role': 'user',
        'content': [
          {'type': 'image_url', 'image_url': {'url': dataUri}},
          {'type': 'text', 'text': '请识别食物并输出JSON'},
        ],
      },
    ];

    final r = await http
        .post(Uri.parse(_apiUrl),
            headers: _headers(),
            body: jsonEncode({
              'model': _model,
              'messages': messages,
              'max_completion_tokens': 4096,
              'temperature': 0,
              'stream': false,
            }))
        .timeout(_longTimeout);
    if (r.statusCode != 200) throw Exception('识别失败: ${r.statusCode} ${r.body}');
    final data = jsonDecode(r.body) as Map<String, dynamic>;
    final msg = data['choices']?[0]?['message'] as Map<String, dynamic>?;
    if (msg == null) throw Exception('MiMo API 返回为空');
    var content = msg['content']?.toString();
    if (content == null || content.isEmpty) {
      content = msg['reasoning_content']?.toString();
    }
    if (content == null || content.isEmpty) throw Exception('MiMo API 返回为空');
    return _extractJson(content);
  }

  // ==================== 前后对比分析（纯文本，无需图片）====================

  static Future<Map<String, dynamic>> compareAnalysis({
    required Map<String, dynamic> beforeResult,
    required Map<String, dynamic> afterResult,
  }) async {
    final prompt = '请对比两次体态分析结果，给出改善情况。\n\n'
        '前一次：\n- 综合评分：${beforeResult['score']}/100\n- 体态问题：${(beforeResult['issues'] as List?)?.map((i) => '${(i as Map)['name']}(${(i)['severity']})').join('、') ?? '无'}\n\n'
        '后一次：\n- 综合评分：${afterResult['score']}/100\n- 体态问题：${(afterResult['issues'] as List?)?.map((i) => '${(i as Map)['name']}(${(i)['severity']})').join('、') ?? '无'}\n\n'
        '请严格按以下 JSON 格式输出：\n'
        '{"scoreChange":<分数变化,正数改善负数退步>,"improved":[<改善的问题>],"worsened":[<退步的问题>],"summary":"<总结>","suggestions":[<后续建议>]}';
    final content = await _chat(
      [
        {'role': 'system', 'content': prompt},
      ],
      maxTokens: 1024,
      timeout: _longTimeout,
    );
    return _extractJson(content);
  }

  // ==================== 健康检查（个人版无后端，恒 true）====================

  static Future<bool> healthCheck() async => true;

  // ==================== 已废弃的认证/订单/配额接口（保留空实现避免编译断裂）====================
  // 个人版无登录、无支付、无配额。以下方法保留签名以兼容旧 screen 调用，统一抛 NotImplemented。

  static Future<void> logout() async {}
  static Future<Map<String, dynamic>> getProfile() async => {'nickname': '个人用户'};
  static Future<List<Map<String, dynamic>>> getPlans() async => [];
  static Future<Map<String, dynamic>> getQuota() async => {'remaining': 9999, 'limit': 9999};

  // 通用认证接口（个人版改为本地 no-op，避免 CloudStorageService 编译断裂）
  static Future<Map<String, dynamic>?> authenticatedPost(
    String path, {
    required Map<String, dynamic> body,
  }) async => null;

  static Future<List<dynamic>> authenticatedGetList(String path) async => [];

  static Future<bool> authenticatedDelete(String path) async => true;

  static Future<void> forgotPassword({required String email}) async {
    throw Exception('个人版不支持找回密码');
  }

  static Future<void> resetPassword({
    required String email,
    required String code,
    required String newPassword,
  }) async {
    throw Exception('个人版不支持重置密码');
  }

  static Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? nickname,
  }) async {
    throw Exception('个人版无需注册');
  }

  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    throw Exception('个人版无需登录');
  }

  static Future<Map<String, dynamic>> createOrder({required String plan}) async {
    throw Exception('个人版无支付');
  }

  static Future<Map<String, dynamic>> getOrderPayment({
    required String orderId,
    required String platform,
    String? openid,
  }) async {
    throw Exception('个人版无支付');
  }

  static Future<void> mockPay(String orderId) async {
    throw Exception('个人版无支付');
  }

  static Future<Map<String, dynamic>> getOrder(String orderId) async => {};

  static Future<List<Map<String, dynamic>>> getUserOrders() async => [];

  static Future<Map<String, dynamic>> getProgressionAdvice({String experience = 'beginner'}) async => {
        'advice': '请根据自身情况循序渐进增加训练量',
      };

  // Token 管理（个人版无 token，保留空实现兼容旧调用）
  static Future<String?> getToken() async => null;
  static Future<void> saveToken(String token) async {}
  static Future<void> clearToken() async {}
}

/// 保留旧异常类型，避免引用方编译断裂
class AuthExpiredException implements Exception {
  const AuthExpiredException();
  @override
  String toString() => '个人版无登录态';
}
