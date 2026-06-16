# KB教练 云服务器部署指南

## 前置条件

- 阿里云/腾讯云服务器（推荐 2核4G 以上）
- 域名 `kb.wctgrzpj.cn` 已解析到服务器 IP
- SSH 登录权限

## 服务器要求

| 项目 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 1 核 | 2 核 |
| 内存 | 1 GB | 2 GB |
| 硬盘 | 20 GB | 40 GB |
| 系统 | Ubuntu 20.04+ | Ubuntu 22.04 |
| 带宽 | 1 Mbps | 3 Mbps |

## 一键部署

### 第一步：上传代码到服务器

```bash
# 方法1: 使用 Git（推荐）
ssh root@你的服务器IP
git clone https://github.com/你的用户名/kb-coach.git
cd kb-coach

# 方法2: 使用 SCP 上传
scp -r F:/su/KBjiaolian root@你的服务器IP:/opt/kb-coach
ssh root@你的服务器IP
cd /opt/kb-coach
```

### 第二步：运行部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh setup-ssl.sh

# 运行部署脚本
./deploy.sh
```

脚本会自动：
- ✅ 安装 Docker 和 Docker Compose
- ✅ 创建环境变量配置
- ✅ 构建 Docker 镜像
- ✅ 启动所有服务

### 第三步：配置域名 DNS

在你的域名管理面板（阿里云/腾讯云）添加：

```
类型: A
主机记录: kb
记录值: 你的服务器IP
TTL: 600
```

### 第四步：配置 SSL 证书（HTTPS）

```bash
# 运行 SSL 配置脚本
./setup-ssl.sh your-email@example.com
```

脚本会自动：
- ✅ 安装 Certbot
- ✅ 获取 Let's Encrypt 免费证书
- ✅ 配置自动续期

### 第五步：验证部署

访问 **https://kb.wctgrzpj.cn** 测试功能。

---

## 手动部署（如果不使用脚本）

### 1. 安装 Docker

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl start docker
sudo systemctl enable docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker --version
docker-compose --version
```

### 2. 配置环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
JWT_SECRET=你的随机密钥
MIMO_API_KEY=sk-cmp4jr6jcooigneoe9tn8azhzfyih099h3yx7syksa9psoti
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2.5
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://kb.wctgrzpj.cn
NEXT_PUBLIC_API_URL=https://kb.wctgrzpj.cn/api
NEXT_PUBLIC_APP_NAME=KB教练
TZ=Asia/Shanghai
EOF
```

### 3. 启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 配置 SSL

```bash
# 安装 Certbot
sudo apt install certbot -y

# 停止 Nginx
docker-compose stop nginx

# 获取证书
sudo certbot certonly --standalone -d kb.wctgrzpj.cn --email your-email@example.com --agree-tos

# 复制证书
mkdir -p nginx/ssl
sudo cp -r /etc/letsencrypt/live/kb.wctgrzpj.cn nginx/ssl/

# 重启服务
docker-compose up -d
```

---

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新部署
git pull
docker-compose up -d --build

# 备份数据库
cp backend/data/kb-coach.db backup/kb-coach-$(date +%Y%m%d).db

# 恢复数据库
cp backup/kb-coach-20260616.db backend/data/kb-coach.db
docker-compose restart backend
```

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs web

# 检查端口占用
sudo netstat -tlnp | grep -E '80|443|3000|3001'

# 检查防火墙
sudo ufw status
sudo ufw allow 80
sudo ufw allow 443
```

### API 调用失败

```bash
# 测试后端健康检查
curl http://localhost:3001/api/health

# 检查 CORS 配置
curl -H "Origin: https://kb.wctgrzpj.cn" -I http://localhost:3001/api/health
```

### SSL 证书问题

```bash
# 检查证书状态
sudo certbot certificates

# 手动续期
sudo certbot renew --dry-run
sudo certbot renew
docker-compose restart nginx
```

---

## 监控和维护

### 设置自动备份

```bash
# 创建备份脚本
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/kb-coach/backend/data/kb-coach.db $BACKUP_DIR/kb-coach_$DATE.db

# 保留最近30天的备份
find $BACKUP_DIR -name "kb-coach_*.db" -mtime +30 -delete
EOF

chmod +x /opt/backup.sh

# 添加定时任务（每天凌晨2点备份）
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup.sh") | crontab -
```

### 监控服务状态

```bash
# 创建监控脚本
cat > /opt/monitor.sh << 'EOF'
#!/bin/bash
if ! curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo "[$(date)] 后端服务异常，正在重启..." >> /var/log/kb-coach.log
    cd /opt/kb-coach && docker-compose restart backend
fi
EOF

chmod +x /opt/monitor.sh

# 添加定时任务（每5分钟检查一次）
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/monitor.sh") | crontab -
```

---

## 性能优化

### 1. 启用 Redis 缓存（可选）

在 `docker-compose.yml` 中添加 Redis 服务。

### 2. 配置 CDN

使用阿里云 CDN 或腾讯云 CDN 加速静态资源。

### 3. 数据库优化

```bash
# 定期清理过期数据
sqlite3 backend/data/kb-coach.db "VACUUM;"
```
