import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../services/storage_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nicknameController = TextEditingController();
  final _ageController = TextEditingController();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  String? _gender;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() {
    final profile = StorageService.getProfile();
    if (profile != null) {
      _nicknameController.text = (profile['nickname'] as String?) ?? '';
      _gender = profile['gender'] as String?;
      _ageController.text = profile['age']?.toString() ?? '';
      _heightController.text = profile['height']?.toString() ?? '';
      _weightController.text = profile['weight']?.toString() ?? '';
    }
  }

  @override
  void dispose() {
    _nicknameController.dispose();
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _saving = true);

    try {
      await StorageService.saveProfile({
        'nickname': _nicknameController.text.trim(),
        'gender': _gender,
        'age': int.tryParse(_ageController.text),
        'height': double.tryParse(_heightController.text),
        'weight': double.tryParse(_weightController.text),
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('个人资料已保存')),
      );
      Navigator.pop(context);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('个人资料'),
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('保存'),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nicknameController,
              decoration: const InputDecoration(
                labelText: '昵称',
                border: OutlineInputBorder(),
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? '请输入昵称' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              initialValue: _gender,
              decoration: const InputDecoration(
                labelText: '性别',
                border: OutlineInputBorder(),
              ),
              items: const [
                DropdownMenuItem(value: '男', child: Text('男')),
                DropdownMenuItem(value: '女', child: Text('女')),
                DropdownMenuItem(value: '保密', child: Text('保密')),
              ],
              onChanged: (v) => setState(() => _gender = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _ageController,
              decoration: const InputDecoration(
                labelText: '年龄',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _heightController,
              decoration: const InputDecoration(
                labelText: '身高 (cm)',
                border: OutlineInputBorder(),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _weightController,
              decoration: const InputDecoration(
                labelText: '体重 (kg)',
                border: OutlineInputBorder(),
              ),
              keyboardType:
                  const TextInputType.numberWithOptions(decimal: true),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
