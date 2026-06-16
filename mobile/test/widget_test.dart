import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/app.dart';

void main() {
  testWidgets('App starts correctly', (WidgetTester tester) async {
    await tester.pumpWidget(const KBCoachApp());
    expect(find.text('KB教练'), findsOneWidget);
  });
}
