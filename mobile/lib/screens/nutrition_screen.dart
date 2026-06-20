import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../providers/nutrition_provider.dart';

class NutritionScreen extends StatefulWidget {
  const NutritionScreen({super.key});

  @override
  State<NutritionScreen> createState() => _NutritionScreenState();
}

class _NutritionScreenState extends State<NutritionScreen> {
  final ImagePicker _picker = ImagePicker();
  String _selectedMeal = 'lunch';

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image != null) {
        final provider = context.read<NutritionProvider>();
        await provider.analyzeFood(File(image.path), _selectedMeal);

        if (provider.error != null && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('识别失败: ${provider.error}')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('选择图片失败: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('饮食记录'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 餐次选择
            _buildMealSelector(),
            const SizedBox(height: 16),

            // 拍照区域
            _buildPhotoArea(),
            const SizedBox(height: 24),

            // 今日营养
            _buildTodayNutrition(),
            const SizedBox(height: 24),

            // 分析结果
            _buildAnalysisResult(),
          ],
        ),
      ),
    );
  }

  Widget _buildMealSelector() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '选择餐次',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _MealChip(
                  icon: '🌅',
                  label: '早餐',
                  value: 'breakfast',
                  selected: _selectedMeal == 'breakfast',
                  onTap: () => setState(() => _selectedMeal = 'breakfast'),
                ),
                const SizedBox(width: 8),
                _MealChip(
                  icon: '☀️',
                  label: '午餐',
                  value: 'lunch',
                  selected: _selectedMeal == 'lunch',
                  onTap: () => setState(() => _selectedMeal = 'lunch'),
                ),
                const SizedBox(width: 8),
                _MealChip(
                  icon: '🌙',
                  label: '晚餐',
                  value: 'dinner',
                  selected: _selectedMeal == 'dinner',
                  onTap: () => setState(() => _selectedMeal = 'dinner'),
                ),
                const SizedBox(width: 8),
                _MealChip(
                  icon: '🍪',
                  label: '加餐',
                  value: 'snack',
                  selected: _selectedMeal == 'snack',
                  onTap: () => setState(() => _selectedMeal = 'snack'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoArea() {
    return Consumer<NutritionProvider>(
      builder: (context, provider, _) {
        return Card(
          child: Container(
            height: 200,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.green.shade50,
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.restaurant,
                    size: 48,
                    color: Colors.green.shade300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    '拍照识别食物',
                    style: TextStyle(
                      color: Colors.green.shade600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      ElevatedButton.icon(
                        onPressed: provider.isAnalyzing
                            ? null
                            : () => _pickImage(ImageSource.camera),
                        icon: const Icon(Icons.camera_alt),
                        label: const Text('拍照'),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton.icon(
                        onPressed: provider.isAnalyzing
                            ? null
                            : () => _pickImage(ImageSource.gallery),
                        icon: const Icon(Icons.photo_library),
                        label: const Text('相册'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTodayNutrition() {
    return Consumer<NutritionProvider>(
      builder: (context, provider, _) {
        final nutrition = provider.todayNutrition;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('🍎', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 8),
                    Text(
                      '今日营养',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _NutritionItem(
                      label: '热量',
                      value: '${nutrition['calories']}',
                      unit: 'kcal',
                      color: Colors.orange,
                    ),
                    _NutritionItem(
                      label: '蛋白质',
                      value: '${nutrition['protein']}',
                      unit: 'g',
                      color: Colors.blue,
                    ),
                    _NutritionItem(
                      label: '碳水',
                      value: '${nutrition['carbs']}',
                      unit: 'g',
                      color: Colors.green,
                    ),
                    _NutritionItem(
                      label: '脂肪',
                      value: '${nutrition['fat']}',
                      unit: 'g',
                      color: Colors.red,
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAnalysisResult() {
    return Consumer<NutritionProvider>(
      builder: (context, provider, _) {
        if (provider.isAnalyzing) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 16),
                  Text(
                    'AI 正在识别食物...',
                    style: TextStyle(color: Colors.green.shade700),
                  ),
                ],
              ),
            ),
          );
        }

        final analysis = provider.currentAnalysis;
        if (analysis == null) {
          return const SizedBox.shrink();
        }

        final foods = analysis['foods'] as List? ?? [];

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '识别结果',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                ...foods.whereType<Map>().map((food) {
                  final calories = food['calories'];
                  return ListTile(
                    leading: const Text('🍽️', style: TextStyle(fontSize: 24)),
                    title: Text(food['name']?.toString() ?? ''),
                    subtitle: Text(food['portion']?.toString() ?? ''),
                    trailing: Text(
                      calories != null ? '$calories kcal' : '--',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _MealChip extends StatelessWidget {
  final String icon;
  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;

  const _MealChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: FilterChip(
        avatar: Text(icon),
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: Colors.green.shade100,
        checkmarkColor: Colors.green,
      ),
    );
  }
}

class _NutritionItem extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final Color color;

  const _NutritionItem({
    required this.label,
    required this.value,
    required this.unit,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '$value$unit',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }
}
