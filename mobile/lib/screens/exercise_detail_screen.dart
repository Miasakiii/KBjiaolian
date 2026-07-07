import 'package:flutter/material.dart';

import '../services/local_exercises_service.dart';
import '../theme/kb_colors.dart';

class _TagData {
  final String label;
  final Color bg;
  const _TagData(this.label, this.bg);
}

/// 动作详情页
///
/// 显示动作的标准步骤说明（中文）、目标肌群、协同肌群、所需设备。
class ExerciseDetailScreen extends StatefulWidget {
  final String exerciseId;

  const ExerciseDetailScreen({super.key, required this.exerciseId});

  @override
  State<ExerciseDetailScreen> createState() => _ExerciseDetailScreenState();
}

class _ExerciseDetailScreenState extends State<ExerciseDetailScreen> {
  Map<String, dynamic>? _data;
  bool _loading = true;
  bool _hasError = false;
  String _errorMsg = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _hasError = false;
    });
    try {
      final data = await LocalExercisesService.getById(widget.exerciseId);
      if (mounted) {
        setState(() {
          _data = data;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
          _hasError = true;
          _errorMsg = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = _data?['name'] as String? ?? '动作详情';
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_hasError || _data == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMsg.isEmpty ? '加载失败' : _errorMsg),
            const SizedBox(height: 12),
            FilledButton(onPressed: _load, child: const Text('重试')),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHeader(),
          const SizedBox(height: 16),
          _buildTags(),
          const SizedBox(height: 24),
          _buildInstructions(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    final name = _data!['name'] as String? ?? '';
    final bodyPart = _data!['bodyPart'] as String?;
    final equipment = _data!['equipment'] as String?;
    final initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?';

    return Row(
      children: [
        CircleAvatar(
          radius: 32,
          backgroundColor: KbColors.brand,
          child: Text(
            initial,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
              ),
              if (bodyPart != null)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    '分类：$bodyPart',
                    style: const TextStyle(color: KbColors.text2, fontSize: 13),
                  ),
                ),
              if (equipment != null)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    '设备：$equipment',
                    style: const TextStyle(color: KbColors.text2, fontSize: 13),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTags() {
    final target = _data!['target'] as String?;
    final muscleGroup = _data!['muscleGroup'] as String?;
    final secondaryMuscles = (_data!['secondaryMuscles'] as List?) ?? [];

    final tags = <_TagData>[
      if (target != null) _TagData('目标肌群：$target', KbColors.brandSoft),
      if (muscleGroup != null) _TagData('肌群：$muscleGroup', KbColors.lineSoft),
      ...secondaryMuscles.map((m) => _TagData('协同：$m', KbColors.lineSoft)),
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: tags.map((t) => _buildTag(t)).toList(),
    );
  }

  Widget _buildTag(_TagData t) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: t.bg,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(t.label, style: const TextStyle(fontSize: 12)),
    );
  }

  Widget _buildInstructions() {
    final instructions = _data?['instructions'] as Map<String, dynamic>?;
    final zh = instructions?['zh'] as String?;
    final en = instructions?['en'] as String?;

    if (zh == null && en == null) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(
          child: Text('暂无步骤说明', style: TextStyle(color: KbColors.text2)),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '动作步骤',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 12),
        if (zh != null) _buildStepList(zh),
        if (zh != null && en != null) const SizedBox(height: 20),
        if (en != null) _buildStepList(en),
      ],
    );
  }

  Widget _buildStepList(String raw) {
    final lines = raw
        .split(RegExp(r'\r?\n'))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    if (lines.isEmpty) {
      return Text(raw, style: const TextStyle(height: 1.6));
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.asMap().entries.map((entry) {
        final idx = entry.key + 1;
        final text = entry.value;
        // 去掉行首已存在的编号前缀（如 "1." "1、" "Step 1:"）
        final cleaned = text.replaceFirst(RegExp(r'^\s*(\d+[\.\)、]|\(?[a-z][\.\)]|step\s*\d+\s*[:\.]?)\s*', caseSensitive: false), '');
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 24,
                height: 24,
                decoration: const BoxDecoration(
                  color: KbColors.brand,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  '$idx',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  cleaned.isEmpty ? text : cleaned,
                  style: const TextStyle(height: 1.6),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
