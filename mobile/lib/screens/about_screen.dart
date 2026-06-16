import 'package:flutter/material.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('关于'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Logo
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF16a34a), Color(0xFF15803d)],
                ),
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF16a34a).withOpacity(0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: const Center(
                child: Text(
                  '💪',
                  style: TextStyle(fontSize: 48),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'KB教练',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: const Color(0xFF166534),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'AI 驱动的健身康复师',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Colors.green.shade600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '版本 1.0.0',
              style: TextStyle(color: Colors.grey.shade500),
            ),
            const SizedBox(height: 32),

            // 产品介绍
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '产品介绍',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'KB教练是一款 AI 驱动的健身康复应用，专为久坐白领、健身新手和体态问题人群设计。',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '通过先进的 AI 技术，我们提供专业的体态分析、个性化训练方案、饮食指导和智能问答服务，帮助用户科学健身，改善体态，提升生活质量。',
                      style: TextStyle(
                        color: Colors.grey.shade700,
                        height: 1.6,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 核心功能
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '核心功能',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _FeatureItem(
                      icon: '📸',
                      title: 'AI 体态分析',
                      description: '拍照即可获得专业体态评估',
                    ),
                    _FeatureItem(
                      icon: '🏋️',
                      title: '个性化训练方案',
                      description: '根据体态分析生成针对性计划',
                    ),
                    _FeatureItem(
                      icon: '🍎',
                      title: '饮食识别',
                      description: '拍照识别食物，自动计算营养',
                    ),
                    _FeatureItem(
                      icon: '🤖',
                      title: 'AI 教练',
                      description: '随时咨询健身、营养问题',
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 数据安全
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '数据安全',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _SecurityItem(
                      icon: Icons.lock,
                      title: '本地存储',
                      subtitle: '所有数据存储在你的设备',
                    ),
                    _SecurityItem(
                      icon: Icons.upload,
                      title: '自由导出',
                      subtitle: '支持导出所有数据',
                    ),
                    _SecurityItem(
                      icon: Icons.delete,
                      title: '随时删除',
                      subtitle: '可以随时清空所有数据',
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FeatureItem extends StatelessWidget {
  final String icon;
  final String title;
  final String description;

  const _FeatureItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  description,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SecurityItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _SecurityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: Colors.green.shade50,
        child: Icon(icon, color: Colors.green),
      ),
      title: Text(title),
      subtitle: Text(subtitle),
      contentPadding: EdgeInsets.zero,
    );
  }
}
