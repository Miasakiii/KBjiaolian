# Web 前端 Dockerfile
FROM node:20-alpine AS base

# 安装依赖
WORKDIR /app
COPY package*.json ./
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产镜像
FROM node:20-alpine AS production

WORKDIR /app

# 从构建阶段复制必要文件
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package*.json ./
COPY --from=base /app/next.config.js ./

# 安装生产依赖
RUN npm install --production

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# 启动应用
CMD ["npm", "start"]
