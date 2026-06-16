#!/bin/bash

# SSL 证书配置脚本（为 Docker Nginx 容器准备 Let's Encrypt 证书）
# 用法: ./setup-ssl.sh your-email@example.com
#
# 本脚本只负责：申请证书 → 复制到 nginx/ssl/ 供 Docker 挂载
# 所有 Nginx 反向代理逻辑由 docker-compose 中的 nginx 容器处理

set -e

if [ -z "$1" ]; then
    echo "用法: ./setup-ssl.sh your-email@example.com"
    exit 1
fi

EMAIL=$1
DOMAIN="kb.wctgrzpj.cn"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔐 开始配置 SSL 证书（Docker Nginx 方案）..."

# 安装 Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 安装 Certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot
    else
        echo "❌ 无法自动安装 Certbot，请手动安装"
        exit 1
    fi
fi

# 确保 80/443 端口未被占用（停止 Docker nginx 容器）
if docker ps -q --filter "name=kb-coach-nginx" | grep -q .; then
    echo "🛑 临时停止 Docker Nginx 容器以释放 80 端口..."
    docker stop kb-coach-nginx
fi

# 获取证书（使用 standalone 模式，不需要宿主机 Nginx）
echo "📜 获取 SSL 证书..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# 创建 SSL 目录并复制证书
echo "📋 复制证书到项目目录..."
mkdir -p "$PROJECT_DIR/nginx/ssl"
sudo cp -r /etc/letsencrypt/live/$DOMAIN "$PROJECT_DIR/nginx/ssl/"
sudo chown -R $USER:$USER "$PROJECT_DIR/nginx/ssl"

# 验证证书文件存在
if [ ! -f "$PROJECT_DIR/nginx/ssl/$DOMAIN/fullchain.pem" ] || [ ! -f "$PROJECT_DIR/nginx/ssl/$DOMAIN/privkey.pem" ]; then
    echo "❌ 证书文件复制失败，请检查"
    exit 1
fi

echo "✅ 证书复制成功："
echo "   $PROJECT_DIR/nginx/ssl/$DOMAIN/fullchain.pem"
echo "   $PROJECT_DIR/nginx/ssl/$DOMAIN/privkey.pem"

# 设置自动续期（续期后自动复制证书并重启 Docker Nginx）
echo "⏰ 设置自动续期..."
CERTBOT_HOOK="cp -r /etc/letsencrypt/live/$DOMAIN $PROJECT_DIR/nginx/ssl/ && chown -R $USER:$USER $PROJECT_DIR/nginx/ssl/$DOMAIN && docker restart kb-coach-nginx 2>/dev/null || true"
(sudo crontab -l 2>/dev/null | grep -v certbot; echo "0 3 * * * certbot renew --quiet --deploy-hook '$CERTBOT_HOOK'") | sudo crontab -

# 重启 Docker Nginx 容器（如果之前在运行）
echo "🚀 重启 Docker Nginx 容器..."
docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d nginx

echo ""
echo "✅ SSL 证书配置完成！"
echo "🔗 访问: https://$DOMAIN"
echo ""
echo "📋 证书有效期: 90 天"
echo "🔄 已设置自动续期（每天凌晨 3 点检查，续期后自动重启 Nginx 容器）"
echo ""
echo "⚠️  注意：本项目使用 Docker 内 Nginx 容器处理 HTTPS"
echo "    证书文件位于 nginx/ssl/$DOMAIN/，由 docker-compose 挂载到容器"
echo ""
