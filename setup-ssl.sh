#!/bin/bash

# SSL 证书配置脚本（使用 Let's Encrypt webroot 模式）
# 用法: ./setup-ssl.sh your-email@example.com

set -e

if [ -z "$1" ]; then
    echo "用法: ./setup-ssl.sh your-email@example.com"
    exit 1
fi

EMAIL=$1
DOMAIN="kb.wctgrzpj.cn"
WEBROOT="/var/www/certbot"

echo "🔐 开始配置 SSL 证书..."

# 安装 Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 安装 Certbot..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    elif command -v yum &> /dev/null; then
        sudo yum install -y certbot python3-certbot-nginx
    else
        echo "❌ 无法自动安装 Certbot，请手动安装"
        exit 1
    fi
fi

# 创建验证目录
echo "📁 创建验证目录..."
sudo mkdir -p $WEBROOT

# 创建临时 Nginx 配置用于验证
echo "📝 创建验证用 Nginx 配置..."
sudo tee /etc/nginx/conf.d/kb-certbot.conf > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOF

# 重载 Nginx
echo "🔄 重载 Nginx..."
sudo nginx -t && sudo nginx -s reload

# 获取证书（使用 webroot 模式）
echo "📜 获取 SSL 证书..."
sudo certbot certonly --webroot \
    -w $WEBROOT \
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

# 更新 Nginx 配置，添加 HTTPS 支持
echo "📝 更新 Nginx 配置..."
sudo tee /etc/nginx/conf.d/kb-wctgrzpj.conf > /dev/null << EOF
# HTTP - 重定向到 HTTPS
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS - 反向代理到 Docker 容器
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 前端路由
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # API 路由
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时设置（AI 请求可能较慢）
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 删除临时配置
sudo rm -f /etc/nginx/conf.d/kb-certbot.conf

# 重载 Nginx
echo "🔄 重载 Nginx..."
sudo nginx -t && sudo nginx -s reload

# 设置自动续期
echo "⏰ 设置自动续期..."
(sudo crontab -l 2>/dev/null | grep -v certbot; echo "0 3 * * * certbot renew --quiet --deploy-hook 'nginx -s reload'") | sudo crontab -

# 启动 Docker 服务
echo "🚀 启动 Docker 服务..."
docker-compose up -d

echo ""
echo "✅ SSL 证书配置完成！"
echo "🔗 访问: https://$DOMAIN"
echo ""
echo "📋 证书有效期: 90 天"
echo "🔄 已设置自动续期（每天凌晨 3 点检查）"
echo ""
echo "⚠️  注意：Docker 容器只监听 127.0.0.1，通过系统 Nginx 反向代理访问"
echo ""
