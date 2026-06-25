import 'package:flutter/material.dart';

/// KB 教练设计 token — 与 miniprogram app.wxss 对齐 (spec §3)
class KbColors {
  KbColors._();

  // 品牌色
  static const brand = Color(0xFF0F766E);
  static const brand600 = Color(0xFF0D5A54);
  static const brandSoft = Color(0xFFCCFBF1);

  // 警示(仅问题/不达标)
  static const accentWarn = Color(0xFFF97316);

  // 背景/表面
  static const bg = Color(0xFFF6F8F7);
  static const surface = Color(0xFFFFFFFF);
  static const surface2 = Color(0xFFF9FAFB);

  // 文字
  static const text1 = Color(0xFF0F172A);
  static const text2 = Color(0xFF475569);
  static const text3 = Color(0xFF94A3B8);

  // 线
  static const line = Color(0xFFE2E8E4);
  static const lineSoft = Color(0xFFEEF2F1);

  // 肌群数据色板 (仅分类)
  static const dataChest = Color(0xFF0F766E);
  static const dataBack = Color(0xFF4F6D7A);
  static const dataLeg = Color(0xFF6B7280);
  static const dataGlute = Color(0xFF9F6F8F);
  static const dataCore = Color(0xFF5B7A8C);
  static const dataShoulder = Color(0xFFB08968);

  // 危险(退出等破坏性操作)
  static const danger = Color(0xFFEF4444);
}
