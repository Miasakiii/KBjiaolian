# 后端 Dockerfile
FROM node:20-alpine AS base

# 安装编译依赖（better-sqlite3 需要）
RUN apk add --no-cache python3 make g++

# 安装依赖（使用淘宝镜像加速 + 预编译）
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --production --prefer-offline

# 复制源代码
COPY . .

# 创建数据目录
RUN mkdir -p data

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# 启动应用
CMD ["node", "src/index.js"]
