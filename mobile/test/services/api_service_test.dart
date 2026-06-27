import 'package:flutter_test/flutter_test.dart';
import 'package:kb_coach/services/api_service.dart';

void main() {
  group('ApiService Configuration', () {
    test('baseUrl should return a non-empty string', () {
      expect(ApiService.baseUrl, isNotEmpty);
    });

    test('baseUrl should contain /api suffix', () {
      expect(ApiService.baseUrl, endsWith('/api'));
    });

    test('baseUrl should be an http URL in dev mode', () {
      // In test environment, no --dart-define is set, so it falls back to dev defaults
      expect(ApiService.baseUrl, startsWith('http'));
    });
  });

  group('ApiService Static Methods', () {
    test('should have register method', () {
      expect(ApiService.register, isA<Function>());
    });

    test('should have login method', () {
      expect(ApiService.login, isA<Function>());
    });

    test('should have logout method', () {
      expect(ApiService.logout, isA<Function>());
    });

    test('should have isAuthenticated method', () {
      expect(ApiService.isAuthenticated, isA<Function>());
    });

    test('should have getProfile method', () {
      expect(ApiService.getProfile, isA<Function>());
    });

    test('should have analyzePhoto method', () {
      expect(ApiService.analyzePhoto, isA<Function>());
    });

    test('should have generatePlan method', () {
      expect(ApiService.generatePlan, isA<Function>());
    });

    test('should have analyzeFood method', () {
      expect(ApiService.analyzeFood, isA<Function>());
    });

    test('should have sendMessage method', () {
      expect(ApiService.sendMessage, isA<Function>());
    });

    test('should have healthCheck method', () {
      expect(ApiService.healthCheck, isA<Function>());
    });

    test('should have compareAnalysis method', () {
      expect(ApiService.compareAnalysis, isA<Function>());
    });

    test('should have generateProgressivePlan method', () {
      expect(ApiService.generateProgressivePlan, isA<Function>());
    });

    test('should have getProgressionAdvice method', () {
      expect(ApiService.getProgressionAdvice, isA<Function>());
    });

    test('should have authenticatedPost method', () {
      expect(ApiService.authenticatedPost, isA<Function>());
    });

    test('should have authenticatedGetList method', () {
      expect(ApiService.authenticatedGetList, isA<Function>());
    });

    test('should have authenticatedDelete method', () {
      expect(ApiService.authenticatedDelete, isA<Function>());
    });
  });
}
