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

## 用户字段 User
- userId 用户id
- phone 注册手机号
- name 姓名
- nick 昵称
- gendar 性别
- avatar头像
- role 角色：学生，老师，老板
- student 学生信息
- teacher 教师信息
- boss 老板信息
- socials 绑定社交账号

## 社交字段 Social
- openId 社交平台账号id
- platform 平台：微信，qq等


## 学生字段 Student
- studentId 学生 id
- birth 出生年月
- photo 形象照
- parentPhone1 监护人电话
- parentName1 监护人姓名
- parentRole1 监护人与本人关系
- parentPhone2 监护人电话
- parentName2 监护人姓名
- parentRole2 监护人与本人关系


## 教师字段 Teacher
- teacherId 教师 id
- position 职位


## 老板字段 Boss
- bossId 老板 id
- 

## 课程字段 Course 
- courseId 课程id
- title 课程标题
- subtitle 课程副标题描述
- categaory 课程专业：中国舞，拉丁舞，绘画，书法，口才
- teacher 主课老师
- assistant 助教（可选）
- banner 封面图
- year 课程开设年份
- term 课程学期：春季，暑期，秋季
- status 状态：待上架，开课中，已结课，已归档
- price 价格（分）
- lessons 课时列表
- students 报名学生
- address 上课地点


## 课时字段 Lesson
- lessonId 课时id
- title 课时标题
- subtitle 课时副标题描述
- startTime 课时开始时间
- endTime 课时结束时间
- status 状态：未开始，已完成
- leaveStudents 请假学生

## 订单字段 Order
- orderId 订单id
- courseId 课程id
- studentId 学生id
- status 状态：待付款，已支付
- payTime 支付时间
- money 付款金额
