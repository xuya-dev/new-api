# Docker 部署指南（外部 MySQL + Redis）

## 架构概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  new-api    │────▶│   MySQL     │
│  (反向代理)  │     │  (容器)     │     │  (外部)     │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Redis     │
                    │  (外部)     │
                    └─────────────┘
```

## 目录

- [1. 准备工作](#1-准备工作)
- [2. MySQL 配置](#2-mysql-配置)
- [3. Redis 配置](#3-redis-配置)
- [4. Docker Compose 部署](#4-docker-compose-部署)
- [5. 环境变量说明](#5-环境变量说明)
- [6. Nginx 反向代理](#6-nginx-反向代理)
- [7. 数据备份](#7-数据备份)
- [8. 常见问题](#8-常见问题)

---

## 1. 准备工作

### 服务器要求

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核+ |
| 内存 | 1 GB | 2 GB+ |
| 磁盘 | 10 GB | 50 GB+ SSD |
| 系统 | Linux (x86_64 / ARM64) | Ubuntu 22.04 / Debian 12 |

### 安装 Docker

```bash
# 安装 Docker Engine
curl -fsSL https://get.docker.com | sh

# 启动 Docker
systemctl enable docker && systemctl start docker

# 验证安装
docker --version
docker compose version
```

---

## 2. MySQL 配置

### 创建数据库和用户

连接到你的 MySQL 服务器，执行：

```sql
-- 创建数据库（使用 utf8mb4 字符集）
CREATE DATABASE IF NOT EXISTS `new-api`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（将密码替换为强密码）
CREATE USER 'newapi'@'%' IDENTIFIED BY 'YourStrongPassword123!';

-- 授权
GRANT ALL PRIVILEGES ON `new-api`.* TO 'newapi'@'%';
FLUSH PRIVILEGES;
```

> 程序启动时会自动创建所需的表（GORM AutoMigrate），无需手动建表。

### MySQL 连接字符串格式

```
用户名:密码@tcp(主机地址:端口)/数据库名?parseTime=true
```

示例：

```
newapi:YourStrongPassword123!@tcp(192.168.1.100:3306)/new-api?parseTime=true
```

---

## 3. Redis 配置

### 基本要求

- Redis 6.0+
- 建议设置密码认证
- 建议启用持久化（AOF 或 RDB）

### Redis 连接字符串格式

```
redis://:密码@主机地址:端口/数据库编号
```

示例：

```
# 无密码
redis://192.168.1.100:6379

# 有密码
redis://:YourRedisPassword@192.168.1.100:6379/0
```

---

## 4. Docker Compose 部署

### 4.1 创建目录结构

```bash
mkdir -p /opt/new-api/{data,logs}
cd /opt/new-api
```

### 4.2 创建 docker-compose.yml

```yaml
version: '3.4'

services:
  new-api:
    image: calciumion/new-api:latest
    container_name: new-api
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      # ===== 数据库（必填）=====
      - SQL_DSN=newapi:YourStrongPassword123!@tcp(192.168.1.100:3306)/new-api?parseTime=true

      # ===== Redis（必填）=====
      - REDIS_CONN_STRING=redis://:YourRedisPassword@192.168.1.100:6379/0

      # ===== 会话密钥（生产环境必填）=====
      - SESSION_SECRET=替换为一个随机字符串至少32位

      # ===== 时区 =====
      - TZ=Asia/Shanghai

      # ===== 推荐配置 =====
      - BATCH_UPDATE_ENABLED=true
      - BATCH_UPDATE_INTERVAL=5
      - ERROR_LOG_ENABLED=true
      - MEMORY_CACHE_ENABLED=true
      - SYNC_FREQUENCY=60

      # ===== 渠道监控（可选）=====
      # - CHANNEL_TEST_FREQUENCY=600

      # ===== 节点名称（可选）=====
      - NODE_NAME=production-node-1
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/status | grep -o '\"success\":\\s*true' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
```

> **注意**：请将 `SQL_DSN`、`REDIS_CONN_STRING`、`SESSION_SECRET` 替换为你自己的实际值。

### 4.3 启动服务

```bash
# 拉取镜像
docker compose pull

# 启动（后台运行）
docker compose up -d

# 查看日志
docker compose logs -f new-api
```

### 4.4 验证启动

```bash
# 检查容器状态
docker compose ps

# 检查健康状态
curl http://localhost:3000/api/status

# 查看启动日志
docker compose logs new-api --tail 50
```

启动成功后访问 `http://服务器IP:3000`。

### 默认管理员账号

首次启动后使用以下账号登录：

- 用户名：`root`
- 密码：`123456`

> **请立即登录后修改密码！**

---

## 5. 环境变量说明

### 核心配置

| 变量 | 必填 | 默认值 | 说明 |
|------|------|-------|------|
| `SQL_DSN` | 是 | SQLite | MySQL 连接字符串 |
| `REDIS_CONN_STRING` | 是 | 无 | Redis 连接字符串 |
| `SESSION_SECRET` | 生产必填 | 随机 UUID | 会话加密密钥，多节点必须相同 |
| `PORT` | 否 | `3000` | 监听端口 |

### 数据库优化

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `SQL_MAX_IDLE_CONNS` | `100` | 最大空闲连接数 |
| `SQL_MAX_OPEN_CONNS` | `1000` | 最大打开连接数 |
| `SQL_MAX_LIFETIME` | `60` | 连接最大生命周期（秒） |
| `LOG_SQL_DSN` | 同 SQL_DSN | 独立日志数据库连接字符串 |

### 缓存与同步

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `MEMORY_CACHE_ENABLED` | `false` | 启用内存缓存（Redis 启用时自动开启） |
| `SYNC_FREQUENCY` | `60` | 缓存同步频率（秒） |
| `BATCH_UPDATE_ENABLED` | `false` | 启用批量更新（推荐开启） |
| `BATCH_UPDATE_INTERVAL` | `5` | 批量更新间隔（秒） |

### 渠道监控

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `CHANNEL_TEST_FREQUENCY` | 不启用 | 自动测试频率（秒），如 `600` 表示每 10 分钟 |
| `CHANNEL_UPDATE_FREQUENCY` | 不启用 | 自动更新上游渠道频率（秒） |

### 请求与超时

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `RELAY_TIMEOUT` | `0` | 请求总超时（秒），0 为不限 |
| `STREAMING_TIMEOUT` | `300` | 流式请求无响应超时（秒） |
| `RELAY_MAX_IDLE_CONNS` | `500` | HTTP 中继最大空闲连接 |
| `RELAY_MAX_IDLE_CONNS_PER_HOST` | `100` | 每主机最大空闲连接 |

### 多节点部署

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `NODE_TYPE` | `master` | `master`（主节点）或 `slave`（从节点） |
| `NODE_NAME` | 空 | 节点名称，用于审计日志区分 |
| `CRYPTO_SECRET` | = SESSION_SECRET | 加密密钥，多节点必须相同 |

### 日志与调试

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `ERROR_LOG_ENABLED` | `false` | 记录错误日志 |
| `GIN_MODE` | `release` | `debug` 开启 Gin 调试模式 |
| `DEBUG` | `false` | 全局调试模式 |

---

## 6. Nginx 反向代理

### 基本配置

创建 `/etc/nginx/sites-available/new-api.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书
    ssl_certificate     /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/new-api.access.log;
    error_log  /var/log/nginx/new-api.error.log;

    # 请求体大小限制
    client_max_body_size 128m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（SSE 流式响应）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时设置（AI 请求可能耗时较长）
        proxy_connect_timeout 60s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;

        # 缓冲关闭（流式响应必须）
        proxy_buffering off;
        proxy_cache off;
    }
}
```

### 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/new-api.conf /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

---

## 7. 数据备份

### MySQL 备份

```bash
# 手动备份
mysqldump -u newapi -p'YourStrongPassword123!' -h 192.168.1.100 \
  --single-transaction --routines --triggers \
  new-api > backup_$(date +%Y%m%d_%H%M%S).sql

# 定时备份（添加到 crontab）
# 每天凌晨 3 点备份
0 3 * * * mysqldump -u newapi -p'YourStrongPassword123!' -h 192.168.1.100 --single-transaction new-api | gzip > /opt/backups/mysql/new-api_$(date +\%Y\%m\%d).sql.gz
```

### 数据目录备份

```bash
# /data 目录存储上传文件等持久化数据
tar czf data_backup_$(date +%Y%m%d).tar.gz /opt/new-api/data/
```

---

## 8. 常见问题

### Q: 启动报错 `failed to initialize database`

检查 MySQL 连接字符串格式是否正确，确认 MySQL 服务可达：

```bash
# 从服务器测试 MySQL 连接
mysql -h 192.168.1.100 -u newapi -p'YourStrongPassword123!' new-api -e "SELECT 1"
```

### Q: 启动报错 `failed to initialize Redis`

检查 Redis 连接字符串和 Redis 是否可达：

```bash
# 从服务器测试 Redis 连接
redis-cli -h 192.168.1.100 -a YourRedisPassword ping
```

### Q: 容器启动正常但页面打不开

1. 检查端口映射是否正确：`docker compose ps`
2. 检查防火墙：`ufw allow 3000` 或 `firewall-cmd --add-port=3000/tcp --permanent`
3. 检查日志：`docker compose logs new-api --tail 100`

### Q: 如何更新版本

```bash
cd /opt/new-api

# 拉取最新镜像
docker compose pull

# 重启容器（数据在 volumes 中不会丢失）
docker compose up -d
```

### Q: 如何查看应用日志

```bash
# 实时查看
docker compose logs -f new-api

# 查看最近 100 行
docker compose logs new-api --tail 100

# 日志文件也在挂载的目录中
ls -la /opt/new-api/logs/
```

### Q: 如何重置管理员密码

在 MySQL 中执行：

```sql
-- 查看管理员用户
SELECT id, username FROM users WHERE role = 100;

-- 重置密码（密码为 123456 的 hash）
UPDATE users SET password = '$2a$10$W feedbackXkElRJYwJ9lN8OPmZwJ9lN8OPmZwJ9lN8OPmZwJ9lN8OPm' WHERE role = 100;
```

或直接删除数据库重新启动（谨慎操作）。

### Q: 多节点部署

```yaml
# 主节点
environment:
  - NODE_TYPE=master
  - NODE_NAME=node-1
  - SESSION_SECRET=所有节点使用相同的密钥
  - CRYPTO_SECRET=所有节点使用相同的密钥

# 从节点
environment:
  - NODE_TYPE=slave
  - NODE_NAME=node-2
  - SESSION_SECRET=所有节点使用相同的密钥
  - CRYPTO_SECRET=所有节点使用相同的密钥
```

> 所有节点的 `SESSION_SECRET` 和 `CRYPTO_SECRET` 必须完全相同。

---

## 完整 docker-compose.yml 示例（外部服务）

```yaml
version: '3.4'

services:
  new-api:
    image: calciumion/new-api:latest
    container_name: new-api
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    environment:
      # 数据库 - 外部 MySQL
      - SQL_DSN=newapi:YourStrongPassword123!@tcp(192.168.1.100:3306)/new-api?parseTime=true

      # 数据库连接池
      - SQL_MAX_IDLE_CONNS=50
      - SQL_MAX_OPEN_CONNS=200
      - SQL_MAX_LIFETIME=60

      # Redis - 外部
      - REDIS_CONN_STRING=redis://:YourRedisPassword@192.168.1.100:6379/0

      # 安全
      - SESSION_SECRET=在此填入一个64位随机字符串

      # 缓存与性能
      - MEMORY_CACHE_ENABLED=true
      - SYNC_FREQUENCY=60
      - BATCH_UPDATE_ENABLED=true
      - BATCH_UPDATE_INTERVAL=5

      # 渠道监控
      - CHANNEL_TEST_FREQUENCY=600

      # 日志
      - ERROR_LOG_ENABLED=true

      # 时区
      - TZ=Asia/Shanghai

      # 节点
      - NODE_NAME=prod-1
    healthcheck:
      test: ["CMD-SHELL", "wget -q -O - http://localhost:3000/api/status | grep -o '\"success\":\\s*true' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
```
