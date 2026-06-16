#!/bin/bash

# KB教练 一键部署脚本
# 用法: ./deploy.sh

set -e

echo "🚀 开始部署 KB教练..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装，正在安装...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}✅ Docker 安装完成${NC}"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装，正在安装...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose 安装完成${NC}"
fi

# 创建环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 创建 .env 配置文件...${NC}"
    cat > .env << EOF
# 后端配置
JWT_SECRET=$(openssl rand -hex 32)
MIMO_API_KEY=sk-cmp4jr6jcooigneoe9tn8azhzfyih099h3yx7syksa9psoti
MIMO_API_URL=https://api.xiaomimimo.com/v1/chat/completions
MIMO_MODEL=mimo-v2.5
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://kb.wctgrzpj.cn

# 前端配置
NEXT_PUBLIC_API_URL=https://kb.wctgrzpj.cn/api
NEXT_PUBLIC_APP_NAME=KB教练

# 时区
TZ=Asia/Shanghai
EOF
    echo -e "${GREEN}✅ .env 文件已创建${NC}"
fi

# 创建数据目录
mkdir -p backend/data
mkdir -p nginx/ssl
mkdir -p nginx/logs

# 构建并启动服务
echo -e "${YELLOW}🔨 构建 Docker 镜像...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚀 启动服务...${NC}"
docker-compose up -d

# 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo -e "${YELLOW}📊 检查服务状态...${NC}"
docker-compose ps

# 测试后端
echo -e "${YELLOW}🏥 测试后端健康检查...${NC}"
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo -e "${GREEN}✅ 后端服务正常${NC}"
else
    echo -e "${RED}❌ 后端服务异常，请检查日志: docker-compose logs backend${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ KB教练部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "📱 访问地址: http://$(hostname -I | awk '{print $1}'):3000"
echo -e "🔗 或使用域名: https://kb.wctgrzpj.cn（需配置 Nginx 和 SSL）"
echo ""
echo -e "📋 常用命令:"
echo -e "   查看日志: ${YELLOW}docker-compose logs -f${NC}"
echo -e "   停止服务: ${YELLOW}docker-compose down${NC}"
echo -e "   重启服务: ${YELLOW}docker-compose restart${NC}"
echo -e "   更新部署: ${YELLOW}git pull && docker-compose up -d --build${NC}"
echo ""
