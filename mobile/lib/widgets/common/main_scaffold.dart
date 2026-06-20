import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class MainScaffold extends StatelessWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location == '/') return 0;
    if (location.startsWith('/analyze')) return 1;
    if (location.startsWith('/nutrition')) return 2;
    if (location.startsWith('/chat')) return 3;
    if (location.startsWith('/settings')) return 4;
    // 其他路由（/plan、/workout、/history、/about 等）不在底栏直接映射中，
    // 返回 -1 让 NavigationBar 不高亮任何 tab，避免误导
    return -1;
  }

  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/');
        break;
      case 1:
        context.go('/analyze');
        break;
      case 2:
        context.go('/nutrition');
        break;
      case 3:
        context.go('/chat');
        break;
      case 4:
        context.go('/settings');
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final index = _getCurrentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        // 非主导航路由（plan/workout/history/about） selectedIndex=-1 时不高亮
        selectedIndex: index < 0 ? 0 : index,
        onDestinationSelected: (i) => _onTap(context, i),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '首页',
          ),
          NavigationDestination(
            icon: Icon(Icons.camera_alt_outlined),
            selectedIcon: Icon(Icons.camera_alt),
            label: '分析',
          ),
          NavigationDestination(
            icon: Icon(Icons.restaurant_outlined),
            selectedIcon: Icon(Icons.restaurant),
            label: '饮食',
          ),
          NavigationDestination(
            icon: Icon(Icons.chat_outlined),
            selectedIcon: Icon(Icons.chat),
            label: 'AI',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: '设置',
          ),
        ],
      ),
    );
  }
}
