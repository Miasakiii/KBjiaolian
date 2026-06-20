import 'package:flutter/material.dart';

class PrivacyScreen extends StatelessWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('隐私政策'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '隐私政策',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              '最后更新日期：2025年6月',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey,
                  ),
            ),
            const SizedBox(height: 24),
            _buildSection(
              context,
              title: '一、数据收集',
              content:
                  '我们可能收集以下信息：\n'
                  '• 您主动提供的个人信息（昵称、性别、年龄、身高、体重等）\n'
                  '• 您输入的训练目标和营养偏好\n'
                  '• 您的训练记录和饮食记录\n'
                  '• 您与AI教练的对话内容\n'
                  '我们不会在未经您同意的情况下收集任何额外个人信息。',
            ),
            _buildSection(
              context,
              title: '二、数据使用',
              content:
                  '我们收集的数据仅用于以下目的：\n'
                  '• 为您提供个性化的训练和营养建议\n'
                  '• 分析您的体态和训练进展\n'
                  '• 改善应用功能和用户体验\n'
                  '• 生成训练计划和饮食方案\n'
                  '我们不会将您的数据用于上述目的以外的用途。',
            ),
            _buildSection(
              context,
              title: '三、数据存储',
              content:
                  '• 您的数据优先存储在您的设备本地\n'
                  '• 如您选择登录账号，部分数据将加密存储在云端服务器\n'
                  '• 我们采用行业标准的安全措施保护您的数据\n'
                  '• 您可以随时通过"清空数据"功能删除本地数据\n'
                  '• 注销账号后，云端数据将在30天内被永久删除',
            ),
            _buildSection(
              context,
              title: '四、数据共享',
              content:
                  '我们承诺：\n'
                  '• 不会出售您的个人数据\n'
                  '• 不会与第三方共享您的个人数据，除非：\n'
                  '  - 获得您的明确同意\n'
                  '  - 法律法规要求\n'
                  '  - 保护我们的合法权益\n'
                  '• AI分析功能可能调用第三方API，但传输数据经过匿名化处理',
            ),
            _buildSection(
              context,
              title: '五、用户权利',
              content:
                  '您享有以下权利：\n'
                  '• 访问权：查看我们收集的您的个人数据\n'
                  '• 更正权：更正不准确的个人数据\n'
                  '• 删除权：要求删除您的个人数据\n'
                  '• 导出权：导出您的所有数据\n'
                  '• 撤回同意权：随时撤回对数据处理的同意\n'
                  '如需行使上述权利，请通过以下联系方式与我们联系。',
            ),
            _buildSection(
              context,
              title: '六、联系方式',
              content:
                  '如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：\n'
                  '• 邮箱：privacy@kb-coach.example.com\n'
                  '• 应用内反馈：设置 → 关于 → 反馈\n'
                  '我们将在15个工作日内回复您的请求。',
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required String content,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.6,
                ),
          ),
        ],
      ),
    );
  }
}
