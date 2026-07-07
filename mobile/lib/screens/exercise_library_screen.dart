import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../services/local_exercises_service.dart';
import '../theme/kb_colors.dart';

/// 动作库浏览页
///
/// 数据来源：hasaneyldrm/exercises-dataset（1324 条，含中文说明）
/// 支持按身体部位/设备筛选 + 关键词搜索 + 分页加载
class ExerciseLibraryScreen extends StatefulWidget {
  const ExerciseLibraryScreen({super.key});

  @override
  State<ExerciseLibraryScreen> createState() => _ExerciseLibraryScreenState();
}

class _ExerciseLibraryScreenState extends State<ExerciseLibraryScreen> {
  // 筛选状态
  String? _bodyPart;
  String? _equipment;
  String? _target;
  String _searchQuery = '';

  // 元数据（筛选选项）
  Map<String, dynamic>? _meta;
  bool _metaLoading = true;

  // 列表数据
  List<Map<String, dynamic>> _items = [];
  int _page = 1;
  int _totalPages = 1;
  bool _loading = false;
  bool _hasError = false;
  String _errorMsg = '';

  @override
  void initState() {
    super.initState();
    _loadMeta();
    _loadFirstPage();
  }

  Future<void> _loadMeta() async {
    setState(() {
      _metaLoading = true;
    });
    try {
      final meta = await LocalExercisesService.getMeta();
      if (mounted) {
        setState(() {
          _meta = meta;
          _metaLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _metaLoading = false;
        });
      }
    }
  }

  Future<void> _loadFirstPage() async {
    setState(() {
      _page = 1;
      _items = [];
      _loading = true;
      _hasError = false;
    });
    await _loadPage();
  }

  Future<void> _loadNextPage() async {
    if (_loading || _page >= _totalPages) return;
    setState(() {
      _page += 1;
      _loading = true;
    });
    await _loadPage(append: true);
  }

  Future<void> _loadPage({bool append = false}) async {
    try {
      Map<String, dynamic> result;
      if (_searchQuery.isNotEmpty) {
        result = await LocalExercisesService.search(
          q: _searchQuery,
          page: _page,
          pageSize: 20,
        );
      } else {
        result = await LocalExercisesService.list(
          bodyPart: _bodyPart,
          equipment: _equipment,
          target: _target,
          page: _page,
          pageSize: 20,
        );
      }

      final items = (result['items'] as List?) ?? [];
      final totalPages = (result['totalPages'] as num?)?.toInt() ?? 1;

      if (mounted) {
        setState(() {
          if (append) {
            _items.addAll(items.cast<Map<String, dynamic>>());
          } else {
            _items = items.cast<Map<String, dynamic>>();
          }
          _totalPages = totalPages;
          _loading = false;
          _hasError = false;
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

  /// 按身体部位生成色块颜色（首字母占位图标的背景色）
  Color _colorForBodyPart(String? bodyPart) {
    const palette = [
      KbColors.brand,
      Color(0xFF0EA5E9), // sky
      Color(0xFF8B5CF6), // violet
      Color(0xFFF97316), // orange (warning)
      Color(0xFFEC4899), // pink
      Color(0xFF14B8A6), // teal
      Color(0xFF6366F1), // indigo
    ];
    if (bodyPart == null) return KbColors.lineSoft;
    final hash = bodyPart.hashCode.abs();
    return palette[hash % palette.length];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('动作库')),
      body: Column(
        children: [
          _buildSearchBar(),
          if (!_metaLoading) _buildFilterChips(),
          Expanded(child: _buildList()),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: TextField(
        decoration: InputDecoration(
          hintText: '搜索动作名称或肌群',
          prefixIcon: const Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: KbColors.lineSoft),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    setState(() => _searchQuery = '');
                    _loadFirstPage();
                  },
                )
              : null,
        ),
        onSubmitted: (value) {
          setState(() => _searchQuery = value.trim());
          _loadFirstPage();
        },
      ),
    );
  }

  Widget _buildFilterChips() {
    if (_searchQuery.isNotEmpty) {
      // 搜索模式下隐藏筛选（搜索端点不支持筛选）
      return const SizedBox.shrink();
    }
    final bodyParts = (_meta?['bodyParts'] as List?) ?? [];
    final equipment = (_meta?['equipment'] as List?) ?? [];

    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: [
          _filterChip('全部', _bodyPart == null, () {
            setState(() => _bodyPart = null);
            _loadFirstPage();
          }),
          ...bodyParts.map((b) {
            final value = (b as Map<String, dynamic>)['value'] as String;
            return _filterChip(value, _bodyPart == value, () {
              setState(() => _bodyPart = _bodyPart == value ? null : value);
              _loadFirstPage();
            });
          }),
          const SizedBox(width: 12),
          _filterChip('任意设备', _equipment == null, () {
            setState(() => _equipment = null);
            _loadFirstPage();
          }),
          ...equipment.map((e) {
            final value = (e as Map<String, dynamic>)['value'] as String;
            return _filterChip(value, _equipment == value, () {
              setState(() => _equipment = _equipment == value ? null : value);
              _loadFirstPage();
            });
          }),
        ],
      ),
    );
  }

  Widget _filterChip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: KbColors.brand,
        labelStyle: TextStyle(
          color: selected ? Colors.white : KbColors.text1,
          fontSize: 12,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 4),
      ),
    );
  }

  Widget _buildList() {
    if (_loading && _items.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_hasError && _items.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMsg.isEmpty ? '加载失败' : _errorMsg),
            const SizedBox(height: 12),
            FilledButton(onPressed: _loadFirstPage, child: const Text('重试')),
          ],
        ),
      );
    }
    if (_items.isEmpty) {
      return const Center(child: Text('没有匹配的动作'));
    }

    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is ScrollEndNotification &&
            notification.metrics.pixels >= notification.metrics.maxScrollExtent - 200) {
          _loadNextPage();
        }
        return false;
      },
      child: ListView.separated(
        padding: const EdgeInsets.all(12),
        itemCount: _items.length + (_page < _totalPages ? 1 : 0),
        separatorBuilder: (_, __) => const Divider(height: 1),
        itemBuilder: (context, index) {
          if (index >= _items.length) {
            return const Padding(
              padding: EdgeInsets.all(16),
              child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
            );
          }
          final item = _items[index];
          return _buildListItem(item);
        },
      ),
    );
  }

  Widget _buildListItem(Map<String, dynamic> item) {
    final name = (item['name'] as String?) ?? '未命名';
    final bodyPart = item['bodyPart'] as String?;
    final equipment = item['equipment'] as String?;
    final target = item['target'] as String?;
    final initial = name.isNotEmpty ? name.substring(0, 1).toUpperCase() : '?';
    final color = _colorForBodyPart(bodyPart);

    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color,
        child: Text(
          initial,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
      ),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Wrap(
        spacing: 6,
        runSpacing: 2,
        children: [
          if (target != null) _miniChip(target, KbColors.brandSoft),
          if (equipment != null) _miniChip(equipment, KbColors.lineSoft),
        ],
      ),
      onTap: () {
        final id = item['id']?.toString();
        if (id != null) {
          context.push('/exercises/$id');
        }
      },
    );
  }

  Widget _miniChip(String label, Color bg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 11, color: KbColors.text2),
      ),
    );
  }
}
