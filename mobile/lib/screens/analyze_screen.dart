import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../providers/analysis_provider.dart';
import '../widgets/analyze/score_card.dart';
import '../widgets/analyze/radar_chart.dart';
import '../widgets/analyze/suggestion_list.dart';

class AnalyzeScreen extends StatefulWidget {
  const AnalyzeScreen({super.key});

  @override
  State<AnalyzeScreen> createState() => _AnalyzeScreenState();
}

class _AnalyzeScreenState extends State<AnalyzeScreen> {
  File? _imageFile;
  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image != null) {
        setState(() {
          _imageFile = File(image.path);
        });
        _analyzeImage();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('选择图片失败: $e')),
        );
      }
    }
  }

  Future<void> _analyzeImage() async {
    if (_imageFile == null) return;

    final provider = context.read<AnalysisProvider>();
    await provider.analyzePhoto(_imageFile!);

    if (provider.error != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('分析失败: ${provider.error}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('体态分析'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 图片预览区域
            _buildImagePreview(),
            const SizedBox(height: 16),

            // 拍照按钮
            _buildActionButtons(),
            const SizedBox(height: 24),

            // 分析结果
            _buildResult(),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePreview() {
    return Consumer<AnalysisProvider>(
      builder: (context, provider, _) {
        return Card(
          child: Container(
            height: 300,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              color: Colors.green.shade50,
            ),
            child: _imageFile != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.file(
                      _imageFile!,
                      fit: BoxFit.cover,
                    ),
                  )
                : Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.camera_alt_outlined,
                          size: 64,
                          color: Colors.green.shade300,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          '拍照或上传体态照片',
                          style: TextStyle(
                            color: Colors.green.shade600,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '支持 JPG、PNG 格式',
                          style: TextStyle(
                            color: Colors.green.shade400,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        );
      },
    );
  }

  Widget _buildActionButtons() {
    return Consumer<AnalysisProvider>(
      builder: (context, provider, _) {
        return Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: provider.isAnalyzing
                    ? null
                    : () => _pickImage(ImageSource.camera),
                icon: const Icon(Icons.camera_alt),
                label: const Text('拍照'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: provider.isAnalyzing
                    ? null
                    : () => _pickImage(ImageSource.gallery),
                icon: const Icon(Icons.photo_library),
                label: const Text('相册'),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildResult() {
    return Consumer<AnalysisProvider>(
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
                    'AI 正在分析体态...',
                    style: TextStyle(color: Colors.green.shade700),
                  ),
                ],
              ),
            ),
          );
        }

        final result = provider.currentResult;
        if (result == null) {
          return Card(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                children: [
                  Text('📊', style: TextStyle(fontSize: 48, color: Colors.green.shade200)),
                  const SizedBox(height: 16),
                  Text(
                    '等待上传照片',
                    style: TextStyle(
                      color: Colors.green.shade700,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '上传后 AI 将自动分析体态',
                    style: TextStyle(color: Colors.green.shade500),
                  ),
                ],
              ),
            ),
          );
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 评分卡片
            ScoreCard(score: result.score, issues: result.issues),
            const SizedBox(height: 16),

            // 分析总结
            if (result.summary.isNotEmpty) ...[
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text('📝', style: TextStyle(fontSize: 20)),
                          const SizedBox(width: 8),
                          Text(
                            '分析总结',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        result.summary,
                        style: const TextStyle(height: 1.6),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // 雷达图
            RadarChartWidget(data: result.radar),
            const SizedBox(height: 16),

            // 建议列表
            SuggestionList(suggestions: result.suggestions),
          ],
        );
      },
    );
  }
}
