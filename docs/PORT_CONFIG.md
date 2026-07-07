# 端口配置说明

> ⚠️ 个人版纯本地架构，移动端直连 MiMo API，**无需后端、无需端口配置**。

个人版移动端通过 `--dart-define` 注入 MiMo API key/url/model，App 直接调用大模型 API，所有数据存本机 SharedPreferences，动作库 JSON 打包进 assets 离线可用。

## 移动端配置

只需在 `flutter run` / `flutter build apk` 时注入 3 个 `--dart-define`：

```bash
flutter run \
  --dart-define=MIMO_API_KEY=sk-你的key \
  --dart-define=MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions \
  --dart-define=MIMO_MODEL=mimo-v2.5
```

无端口、无服务器、无网络监听。

## 后端（可选/历史参考）

`backend/` 目录保留 Express.js 后端代码供开发参考，**个人版移动端不再依赖**。若需独立运行后端（如开发测试数据持久化），参见 [backend/README.md](../backend/README.md)，默认端口 3003。

## 相关文件

- 移动端配置：`mobile/lib/services/api_service.dart`（`--dart-define` 读取）
- 后端配置（可选）：`backend/.env`
