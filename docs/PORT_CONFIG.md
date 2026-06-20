# 端口配置说明

## 端口分配

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 API | 3003 | Express 后端服务 |
| Web 前端 | 3000 | Next.js 前端服务 |
| Nginx | 80/443 | 反向代理（宝塔面板管理） |

## 本地开发

- 后端：`http://localhost:3003`
- 前端：`http://localhost:3000`
- Android 模拟器：`http://10.0.2.2:3003`
- iOS 模拟器：`http://localhost:3003`

## 生产环境

- 后端：`https://kb.wctgrzpj.cn/api`（通过 Nginx 反向代理）
- 前端：`https://kb.wctgrzpj.cn`

## 端口冲突说明

⚠️ **重要**：端口 3001 被其他二级站占用，本项目使用 3003

## 修改端口步骤

如需修改端口，需要同时修改：

1. `backend/.env` - PORT 变量
2. `docker-compose.yml` - 端口映射和环境变量
3. `nginx/nginx.conf` - upstream 配置
4. `mobile/lib/services/api_service.dart` - API 地址
5. `web/.env.local` - NEXT_PUBLIC_API_URL

## 相关文件

- 后端配置：`backend/.env`
- Docker 配置：`docker-compose.yml`
- Nginx 配置：`nginx/nginx.conf`
- Flutter 配置：`mobile/lib/services/api_service.dart`
- Web 配置：`web/.env.local`
