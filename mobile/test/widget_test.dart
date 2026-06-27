import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:kb_coach/app.dart';

void main() {
  testWidgets('App starts correctly', (WidgetTester tester) async {
    final router = GoRouter(
      initialLocation: '/',
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const Scaffold(
            body: Center(child: Text('KB教练')),
          ),
        ),
      ],
    );

    await tester.pumpWidget(KBCoachApp(router: router));

    // 等待第一帧渲染完成
    await tester.pumpAndSettle();

    expect(find.text('KB教练'), findsOneWidget);
  });
}
