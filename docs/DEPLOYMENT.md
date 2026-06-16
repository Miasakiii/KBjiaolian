# KB教练 Railway 部署指南

## 前置条件

1. GitHub 账号
2. Railway 账号（https://railway.app）
3. 二级域名（例如：kb.example.com）
4. MiMo API 密钥

## 部署步骤

### 第一步：准备代码仓库

```bash
# 1. 初始化 git 仓库（如果还没有）
cd F:/su/KBjiaolian
git init
git add .
git commit -m "Initial commit"

# 2. 创建 GitHub 仓库并推送
git remote add origin https://github.com/你的用户名/kb-coach.git
git push -u origin main
```

### 第二步：部署后端到 Railway

1. **登录 Railway**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的 kb-coach 仓库
   - 选择 `backend` 目录

3. **配置环境变量**
   在 Railway 项目设置中添加以下环境变量：
   ```
   JWT_SECRET=生成一个随机密钥（至少32位）
   MIMO_API_KEY=your-mimo-api-key
   MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
   MIMO_MODEL=mimo-v2.5
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://你的二级域名
   ```

4. **生成随机密钥**
   ```bash
   # 在 PowerShell 中运行
   -join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
   ```

5. **部署**
   - Railway 会自动检测并部署
   - 等待部署完成，获取后端 URL（例如：https://your-backend.railway.app）

### 第三步：部署 Web 前端到 Railway

1. **在同一项目中添加新服务**
   - 点击 "New Service"
   - 选择 "GitHub Repo"
   - 选择同一个仓库
   - 选择 `web` 目录

2. **配置环境变量**
   ```
   NEXT_PUBLIC_API_URL=https://你的后端URL/api
   NEXT_PUBLIC_APP_NAME=KB教练
   ```

3. **部署**
   - 等待部署完成
   - 获取前端 URL（例如：https://your-frontend.railway.app）

### 第四步：配置自定义域名

1. **在 Railway 中添加域名**
   - 进入前端服务设置
   - 点击 "Settings" → "Networking"
   - 点击 "Custom Domain"
   - 输入你的二级域名（例如：kb.example.com）

2. **配置 DNS**
   - 登录你的域名管理面板
   - 添加 CNAME 记录：
     ```
     类型: CNAME
     名称: kb（或你的子域名前缀）
     值: your-frontend.railway.app
     TTL: 600
     ```

3. **等待 DNS 生效**
   - 通常需要 5-30 分钟
   - Railway 会自动配置 SSL 证书

4. **为后端也配置域名（可选）**
   - 例如：api-kb.example.com
   - 同样添加 CNAME 记录指向后端 URL

### 第五步：更新前端 API 地址

如果后端也使用了自定义域名，需要更新前端环境变量：

```
NEXT_PUBLIC_API_URL=https://api-kb.example.com/api
```

然后在 Railway 中重新部署前端服务。

## 验证部署

1. 访问你的域名（例如：https://kb.example.com）
2. 测试注册和登录功能
3. 测试 AI 对话功能
4. 测试体态分析功能

## 常见问题

### Q: 部署失败怎么办？
A: 检查 Railway 日志，通常是环境变量配置错误或依赖安装失败。

### Q: API 调用失败怎么办？
A: 检查 CORS_ORIGIN 是否正确配置，确保包含你的前端域名。

### Q: 如何查看日志？
A: 在 Railway 项目中，点击服务 → "Logs" 标签页。

### Q: 如何更新部署？
A: 推送代码到 GitHub，Railway 会自动重新部署。

### Q: 免费额度够用吗？
A: Railway 免费提供 $5/月的额度，个人项目通常够用。超出后会暂停服务，不会产生额外费用。

## 监控和维护

1. **健康检查**
   - 后端：https://你的后端URL/api/health
   - 前端：https://你的域名

2. **日志监控**
   - 定期检查 Railway 日志
   - 关注错误和警告

3. **数据库备份**
   - Railway 的 SQLite 数据存储在容器中
   - 建议定期导出重要数据

4. **依赖更新**
   - 定期更新 npm 依赖
   - 检查安全漏洞：`npm audit`
