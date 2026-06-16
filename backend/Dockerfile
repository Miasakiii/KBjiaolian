# 后端 Dockerfile
FROM node:20-alpine AS base

# 安装依赖
WORKDIR /app
COPY package*.json ./
RUN npm install --production

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
