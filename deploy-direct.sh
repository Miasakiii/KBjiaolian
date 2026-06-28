#!/bin/bash
# ============================================
# KB教练 - 阿里云直接部署脚本（无 Docker）
# ============================================
# 使用方式:
#   1. 将整个项目上传到服务器 /opt/KBjiaolian
#   2. chmod +x deploy-direct.sh
#   3. ./deploy-direct.sh
#
# 架构:
#   前端: kb.wctgrzpj.cn -> Nginx:80 -> localhost:3000
#   后端: 服务器IP:3003 直接访问
# ============================================

set -e

# ---------- 配置变量 ----------
APP_DIR="/opt/KBjiaolian"
NODE_VERSION="20"
DOMAIN="kb.wctgrzpj.cn"
BACKEND_PORT=3003
FRONTEND_PORT=3000

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ---------- 1. 系统更新 & 基础依赖 ----------
log_info "===== 步骤 1/7: 安装系统依赖 ====="
if command -v apt-get &>/dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y curl git build-essential python3
elif command -v yum &>/dev/null; then
    sudo yum update -y
    sudo yum install -y curl git gcc gcc-c++ make python3
else
    log_error "不支持的包管理器，请手动安装 Node.js、Nginx"
    exit 1
fi

# ---------- 2. 安装 Node.js ----------
log_info "===== 步骤 2/7: 安装 Node.js ${NODE_VERSION} ====="
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    log_info "Node.js 已安装: ${NODE_VER}"
else
    curl -fsSL https://rpm.nodesource.com/setup_${NODE_VERSION}.x | sudo bash - 2>/dev/null || \
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs 2>/dev/null || sudo yum install -y nodejs 2>/dev/null
    log_info "Node.js 安装完成: $(node -v)"
fi

# 安装 npm（如果缺失）
if ! command -v npm &>/dev/null; then
    sudo apt-get install -y npm 2>/dev/null || sudo yum install -y npm 2>/dev/null
fi
log_info "npm 版本: $(npm -v)"

# ---------- 3. 安装 PM2 ----------
log_info "===== 步骤 3/7: 安装 PM2 ====="
if command -v pm2 &>/dev/null; then
    log_info "PM2 已安装: $(pm2 -v)"
else
    sudo npm install -g pm2
    log_info "PM2 安装完成: $(pm2 -v)"
fi

# 设置 PM2 开机自启
pm2 startup systemd 2>/dev/null || pm2 startup 2>/dev/null || log_warn "PM2 开机自启设置失败，请手动运行: pm2 startup"

# ---------- 4. 安装 Nginx ----------
log_info "===== 步骤 4/7: 安装 Nginx ====="
if command -v nginx &>/dev/null; then
    log_info "Nginx 已安装: $(nginx -v 2>&1)"
else
    if command -v apt-get &>/dev/null; then
        sudo apt-get install -y nginx
    elif command -v yum &>/dev/null; then
        sudo yum install -y epel-release
        sudo yum install -y nginx
    fi
    log_info "Nginx 安装完成"
fi

# ---------- 5. 构建项目 ----------
log_info "===== 步骤 5/7: 构建项目 ====="
cd "${APP_DIR}"

# 构建后端
log_info "构建后端..."
cd backend
npm ci --production=false
npm run build
# 安装生产依赖（精简 node_modules）
npm ci --production
cd ..

# 构建前端
log_info "构建前端..."
cd web
npm ci
npm run build
cd ..

# 创建日志目录
mkdir -p logs

# ---------- 6. 配置环境变量 ----------
log_info "===== 步骤 6/7: 配置环境变量 ====="

# 后端 .env（如果不存在则创建）
if [ ! -f backend/.env ]; then
    log_warn "backend/.env 不存在，请手动创建"
else
    log_info "后端 .env 已存在，请确认以下配置:"
    log_info "  - PORT=${BACKEND_PORT}"
    log_info "  - NODE_ENV=production (由 PM2 设置)"
    log_info "  - CORS_ORIGIN=http://${DOMAIN}"
    log_info "  - JWT_SECRET (请确保已修改为安全的随机值)"
fi

# ---------- 7. 配置 Nginx ----------
log_info "===== 步骤 7/7: 配置 Nginx ====="

# 复制 Nginx 配置
sudo cp nginx/kb-wctgrzpj.cn.conf /etc/nginx/conf.d/kb-wctgrzpj.cn.conf

# 移除默认的 default 配置（避免冲突）
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm -f /etc/nginx/sites-enabled/default
    log_info "已移除 Nginx 默认配置"
fi

# 测试 Nginx 配置
sudo nginx -t
if [ $? -ne 0 ]; then
    log_error "Nginx 配置测试失败，请检查配置文件"
    exit 1
fi

# 重载 Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
log_info "Nginx 配置完成并已重载"

# ---------- 8. 配置防火墙 ----------
log_info "配置防火墙..."
# 检查是否使用 firewalld
if command -v firewall-cmd &>/dev/null; then
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=${BACKEND_PORT}/tcp
    sudo firewall-cmd --reload
    log_info "firewalld 已开放端口 80 和 ${BACKEND_PORT}"
# 检查是否使用 ufw
elif command -v ufw &>/dev/null; then
    sudo ufw allow 80/tcp
    sudo ufw allow ${BACKEND_PORT}/tcp
    log_info "ufw 已开放端口 80 和 ${BACKEND_PORT}"
else
    log_warn "未检测到防火墙工具，请手动确保以下端口已开放:"
    log_warn "  - 80 (Nginx 前端)"
    log_warn "  - ${BACKEND_PORT} (后端 API)"
fi

# 阿里云安全组提示
log_warn "=========================================="
log_warn "重要: 请在阿里云控制台 > 安全组 中开放以下端口:"
log_warn "  - 80   (HTTP 前端)"
log_warn "  - 443  (HTTPS，如需)"
log_warn "  - ${BACKEND_PORT}  (后端 API)"
log_warn "=========================================="

# ---------- 9. 启动服务 ----------
log_info "启动 PM2 服务..."
cd "${APP_DIR}"
pm2 delete kb-backend 2>/dev/null || true
pm2 delete kb-web 2>/dev/null || true

# 使用 ecosystem 配置启动
pm2 start ecosystem.config.js

# 保存 PM2 进程列表
pm2 save

log_info ""
log_info "=========================================="
log_info "  部署完成!"
log_info "=========================================="
log_info ""
log_info "  前端地址: http://${DOMAIN}"
log_info "  后端地址: http://<服务器IP>:${BACKEND_PORT}"
log_info "  健康检查: http://<服务器IP>:${BACKEND_PORT}/api/health"
log_info ""
log_info "  PM2 管理命令:"
log_info "    pm2 status          # 查看状态"
log_info "    pm2 logs kb-backend # 查看后端日志"
log_info "    pm2 logs kb-web     # 查看前端日志"
log_info "    pm2 restart all     # 重启所有服务"
log_info "    pm2 reload all      # 零停机重载"
log_info ""
log_info "  注意事项:"
log_info "    1. 确保 backend/.env 中 CORS_ORIGIN 包含 http://${DOMAIN}"
log_info "    2. 确保 backend/.env 中 JWT_SECRET 已修改为安全的随机值"
log_info "    3. 确保阿里云安全组已开放 80 和 ${BACKEND_PORT} 端口"
log_info "    4. 确保域名 DNS 已解析到服务器 IP"
log_info ""
