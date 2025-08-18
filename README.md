# 环境变量配置

请在项目根目录创建 `.env.local` 文件，添加以下环境变量：

```bash
# 数据库连接（Vercel Postgres）
DATABASE_URL="your_vercel_postgres_connection_string"

# NextAuth 配置
NEXTAUTH_SECRET="your_nextauth_secret_key_generate_a_random_string"
NEXTAUTH_URL="http://localhost:3000"

# 生产环境（部署到 Vercel 时自动设置）
# NEXTAUTH_URL="https://your-domain.vercel.app"
```

## 如何获取 DATABASE_URL

1. 在 Vercel 控制台创建 Postgres 存储
2. 复制连接字符串到 `DATABASE_URL`
3. 确保连接字符串格式类似：
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

## 如何生成 NEXTAUTH_SECRET

运行以下命令生成随机密钥：
```bash
openssl rand -base64 32
```

或者使用在线工具生成32位随机字符串。

## 测试账号

数据库种子脚本已创建以下测试账号：
- **管理员**: `admin@example.com` / `admin123`
- **教师**: `zhang@teacher.com` / `teacher123`
- **学生**: `zhang.san@student.com` / `student123`
