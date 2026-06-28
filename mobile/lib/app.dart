import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'theme/kb_colors.dart';
import 'theme/kb_spacing.dart';

class KBCoachApp extends StatelessWidget {
  final GoRouter router;
  const KBCoachApp({super.key, required this.router});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'KB教练',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: KbColors.brand,
          brightness: Brightness.light,
          primary: KbColors.brand,
          surface: KbColors.surface,
          onSurface: KbColors.text1,
        ),
        brightness: Brightness.light,
        scaffoldBackgroundColor: KbColors.bg,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
          backgroundColor: Colors.transparent,
          foregroundColor: KbColors.text1,
          titleTextStyle: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: KbColors.text1,
          ),
        ),
        cardTheme: CardThemeData(
          elevation: 0,
          color: KbColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(KbSpacing.radius),
            side: const BorderSide(color: KbColors.lineSoft, width: 1),
          ),
          shadowColor: Colors.transparent,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(KbSpacing.radiusSm),
            ),
            backgroundColor: KbColors.brand,
            foregroundColor: Colors.white,
            textStyle: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(KbSpacing.radiusSm),
            ),
            side: const BorderSide(color: KbColors.brandSoft),
            foregroundColor: KbColors.brand,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: KbColors.surface2,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(KbSpacing.radius),
            borderSide: const BorderSide(color: KbColors.lineSoft),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(KbSpacing.radius),
            borderSide: const BorderSide(color: KbColors.lineSoft),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(KbSpacing.radius),
            borderSide: const BorderSide(color: KbColors.brand, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: KbColors.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: KbColors.lineSoft),
          ),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontSize: 36, fontWeight: FontWeight.w600, color: KbColors.text1),
          displayMedium: TextStyle(fontSize: 32, fontWeight: FontWeight.w600, color: KbColors.text1),
          headlineSmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w600, color: KbColors.text1),
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: KbColors.text1),
          titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: KbColors.text1),
          bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: KbColors.text1),
          bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: KbColors.text2),
          bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: KbColors.text3),
          labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: KbColors.text3, letterSpacing: 0.5),
        ),
      ),
      routerConfig: router,
    );
  }
}
