import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/models/training_plan.dart';

void main() {
  group('TrainingPlan Model', () {
    test('should create TrainingPlan from JSON', () {
      final json = {
        'id': 'plan-123',
        'name': '增肌计划',
        'goal': 'muscle_gain',
        'experience': 'intermediate',
        'equipment': 'gym',
        'daysPerWeek': 4,
        'sessionDuration': 60,
        'schedule': [
          {'day': 1, 'name': '胸+三头', 'exercises': []},
          {'day': 2, 'name': '背+二头', 'exercises': []},
        ],
        'nutrition': {'calories': 2500, 'protein': 150},
        'notes': '注意休息',
        'durationWeeks': 8,
        'createdAt': 1718000000000,
      };

      final plan = TrainingPlan.fromJson(json);

      expect(plan.id, 'plan-123');
      expect(plan.name, '增肌计划');
      expect(plan.goal, 'muscle_gain');
      expect(plan.experience, 'intermediate');
      expect(plan.equipment, 'gym');
      expect(plan.daysPerWeek, 4);
      expect(plan.sessionDuration, 60);
      expect(plan.schedule.length, 2);
      expect(plan.nutrition['calories'], 2500);
      expect(plan.notes, '注意休息');
      expect(plan.durationWeeks, 8);
      expect(plan.createdAt, 1718000000000);
    });

    test('should convert TrainingPlan to JSON', () {
      final plan = TrainingPlan(
        id: 'plan-123',
        name: '增肌计划',
        goal: 'muscle_gain',
        experience: 'intermediate',
        equipment: 'gym',
        daysPerWeek: 4,
        sessionDuration: 60,
        schedule: [
          {'day': 1, 'name': '胸+三头', 'exercises': []},
        ],
        nutrition: {'calories': 2500, 'protein': 150},
        notes: '注意休息',
        durationWeeks: 8,
        createdAt: 1718000000000,
      );

      final json = plan.toJson();

      expect(json['id'], 'plan-123');
      expect(json['name'], '增肌计划');
      expect(json['goal'], 'muscle_gain');
      expect(json['experience'], 'intermediate');
      expect(json['equipment'], 'gym');
      expect(json['daysPerWeek'], 4);
      expect(json['sessionDuration'], 60);
      expect(json['schedule'].length, 1);
      expect(json['nutrition']['calories'], 2500);
      expect(json['notes'], '注意休息');
      expect(json['durationWeeks'], 8);
      expect(json['createdAt'], 1718000000000);
    });

    test('should handle missing fields with defaults', () {
      final json = <String, dynamic>{
        'id': 'plan-456',
      };

      final plan = TrainingPlan.fromJson(json);

      expect(plan.id, 'plan-456');
      expect(plan.name, '');
      expect(plan.goal, '');
      expect(plan.experience, '');
      expect(plan.equipment, '');
      expect(plan.daysPerWeek, 0);
      expect(plan.sessionDuration, 0);
      expect(plan.schedule, isEmpty);
      expect(plan.nutrition, isEmpty);
      expect(plan.notes, '');
      expect(plan.durationWeeks, 0);
      expect(plan.createdAt, 0);
    });

    test('should handle toString', () {
      final plan = TrainingPlan(
        id: 'plan-123',
        name: '增肌计划',
        goal: 'muscle_gain',
        experience: 'intermediate',
        equipment: 'gym',
        daysPerWeek: 4,
        sessionDuration: 60,
        schedule: [],
        nutrition: {},
        notes: '',
        durationWeeks: 8,
        createdAt: 1718000000000,
      );

      final string = plan.toString();

      expect(string, contains('TrainingPlan'));
      expect(string, contains('plan-123'));
      expect(string, contains('增肌计划'));
      expect(string, contains('muscle_gain'));
    });
  });
}
