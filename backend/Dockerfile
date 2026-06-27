# 后端 Dockerfile（多阶段构建）
# === Stage 1: Build ===
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm install
COPY src/ src/
RUN npx tsc

# === Stage 2: Production ===
FROM node:20-alpine
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://registry.npmmirror.com \
    && npm install --production --prefer-offline
COPY --from=builder /app/dist ./dist
COPY certs/ certs/
RUN mkdir -p data
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1
CMD ["node", "dist/index.js"]
