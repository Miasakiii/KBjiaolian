#!/bin/bash

# SSL 证书配置脚本（使用 Let's Encrypt）
# 用法: ./setup-ssl.sh your-email@example.com

set -e

if [ -z "$1" ]; then
    echo "用法: ./setup-ssl.sh your-email@example.com"
    exit 1
fi

EMAIL=$1
DOMAIN="kb.wctgrzpj.cn"

echo "🔐 开始配置 SSL 证书..."

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

# 停止 Nginx（如果正在运行）
echo "⏸️  停止 Nginx..."
docker-compose stop nginx 2>/dev/null || true

# 获取证书
echo "📜 获取 SSL 证书..."
sudo certbot certonly --standalone \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# 创建 SSL 目录
mkdir -p nginx/ssl

# 复制证书
echo "📋 复制证书到项目目录..."
sudo cp -r /etc/letsencrypt/live/$DOMAIN nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# 设置自动续期
echo "⏰ 设置自动续期..."
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'docker-compose restart nginx'") | sudo crontab -

# 重启服务
echo "🚀 重启服务..."
docker-compose up -d

echo ""
echo "✅ SSL 证书配置完成！"
echo "🔗 访问: https://$DOMAIN"
echo ""
echo "📋 证书有效期: 90 天"
echo "🔄 已设置自动续期（每天凌晨 3 点检查）"
echo ""
