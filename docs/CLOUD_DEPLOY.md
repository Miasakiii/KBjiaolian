# KB教练 云端部署指南（Workbench 远程连接）

## 前置条件

- 云服务器（推荐 2核4G 以上）
- 已配置安全组，开放端口：22, 80, 443, 3000, 3001
- 已有 MiMo API Key

---

## 第一步：连接服务器

1. 登录云服务商控制台
2. 找到目标实例，点击 **Workbench 远程连接**
3. 连接后，先切换到 root 用户（如需密码，输入实例密码）：
   ```bash
   sudo -i
   ```

---

## 第二步：系统初始化

```bash
# 更新系统包
apt update && apt upgrade -y

# 安装常用工具
apt install -y curl wget git vim
```

---

## 第三步：安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动 Docker 并设置开机自启
systemctl start docker
systemctl enable docker

# 验证安装
docker --version

# 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 验证
docker-compose --version
```

---

## 第四步：克隆项目

```bash
# 进入部署目录
cd /opt

# 克隆代码
git clone https://github.com/Miasakiii/KBjiaolian.git

# 进入项目目录
cd KBjiaolian
```

---

## 第五步：配置环境变量

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置文件
vim .env
```

**必须修改的配置项：**

```env
# 替换为你的真实 API Key
MIMO_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

# JWT 密钥（自动生成一个强密钥）
JWT_SECRET=your-very-long-random-secret-key-at-least-32-chars

# CORS 配置（你的域名）
CORS_ORIGIN=https://kb.wctgrzpj.cn

# 前端 API 地址
NEXT_PUBLIC_API_URL=https://kb.wctgrzpj.cn/api
```

**vim 编辑器操作提示：**
- 按 `i` 进入编辑模式
- 修改完成后按 `Esc`
- 输入 `:wq` 保存退出
- 输入 `:q!` 不保存退出

---

## 第六步：生成随机 JWT 密钥（可选）

```bash
# 生成 32 字节随机密钥
openssl rand -hex 32
```

将输出的字符串复制到 `.env` 文件的 `JWT_SECRET` 配置项。

---

## 第七步：一键部署

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

部署脚本会自动：
1. 创建数据目录
2. 构建 Docker 镜像
3. 启动所有服务
4. 运行健康检查

---

## 第八步：验证部署

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 测试后端 API
curl http://localhost:3001/api/health

# 测试前端
curl http://localhost:3000
```

---

## 第九步：配置 SSL 证书（可选，需要域名）

如果有域名并已解析到服务器：

```bash
# 给脚本执行权限
chmod +x setup-ssl.sh

# 运行 SSL 配置（替换为你的邮箱）
./setup-ssl.sh your-email@example.com
```

配置完成后访问：`https://your-domain.com`

---

## 常用运维命令

### 服务管理

```bash
# 查看服务状态
docker-compose ps

# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重启单个服务
docker-compose restart backend
docker-compose restart web
```

### 日志查看

```bash
# 查看所有日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f web

# 查看最近 100 行日志
docker-compose logs --tail=100 backend
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并部署
docker-compose up -d --build

# 或者使用部署脚本
./deploy.sh
```

### 数据备份

```bash
# 备份数据库
cp backend/data/kb-coach.db backup/kb-coach-$(date +%Y%m%d).db

# 备份整个数据目录
tar -czf backup/data-$(date +%Y%m%d).tar.gz backend/data/
```

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs backend

# 检查端口占用
netstat -tlnp | grep -E "3000|3001"

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### API 连接失败

```bash
# 检查后端是否运行
docker-compose ps backend

# 测试后端连接
curl http://localhost:3001/api/health

# 检查防火墙
ufw status
# 如果启用，需要放行端口
ufw allow 3000
ufw allow 3001
```

### 数据库问题

```bash
# 进入后端容器
docker-compose exec backend sh

# 查看数据库文件
ls -la /app/data/

# 退出容器
exit
```

---

## 安全建议

1. **修改默认端口**（可选）
   - 编辑 `docker-compose.yml`，修改端口映射
   - 例如：`"8080:3000"` 替代 `"3000:3000"`

2. **配置防火墙**
   ```bash
   # 启用防火墙
   ufw enable

   # 允许 SSH
   ufw allow 22

   # 允许 HTTP/HTTPS
   ufw allow 80
   ufw allow 443

   # 如果不使用域名，允许前端端口
   ufw allow 3000
   ```

3. **定期更新**
   ```bash
   # 更新系统
   apt update && apt upgrade -y

   # 更新 Docker 镜像
   docker-compose pull
   docker-compose up -d
   ```

---

## 访问地址

- **前端应用**: `http://your-server-ip:3000` 或 `https://your-domain.com`
- **后端 API**: `http://your-server-ip:3001/api`
- **健康检查**: `http://your-server-ip:3001/api/health`

---

## 需要帮助？

查看详细日志：
```bash
docker-compose logs -f
```

重启所有服务：
```bash
docker-compose down && docker-compose up -d
```

完全重新部署：
```bash
./deploy.sh
```
