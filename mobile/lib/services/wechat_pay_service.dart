import 'package:flutter/foundation.dart';

/// 个人版 WeChatPayService —— 无微信支付，no-op stub。
/// 保留类与方法签名，避免 payment_screen 等旧引用编译断裂（个人版已移除支付路由）。
class WeChatPayService {
  static final WeChatPayService instance = WeChatPayService._();
  WeChatPayService._();

  Future<void> init() async {
    debugPrint('个人版：无微信支付 SDK');
  }

  Future<bool> isInstalled() async => false;

  Future<Map<String, dynamic>> pay({
    required String orderId,
    required String prepayId,
  }) async {
    throw Exception('个人版无微信支付');
  }
}
