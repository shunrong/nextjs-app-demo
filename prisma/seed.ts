import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("开始数据库种子...")

  // 创建管理员用户
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "系统管理员",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  // 创建教师用户
  const teacherPassword = await bcrypt.hash("teacher123", 12)
  const teacher1 = await prisma.user.upsert({
    where: { email: "zhang@teacher.com" },
    update: {},
    create: {
      email: "zhang@teacher.com",
      name: "张老师",
      password: teacherPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  })

  const teacher2 = await prisma.user.upsert({
    where: { email: "li@teacher.com" },
    update: {},
    create: {
      email: "li@teacher.com",
      name: "李老师",
      password: teacherPassword,
      role: "TEACHER",
      status: "ACTIVE",
    },
  })

  // 创建教师资料
  const teacherProfile1 = await prisma.teacherProfile.upsert({
    where: { userId: teacher1.id },
    update: {},
    create: {
      userId: teacher1.id,
      title: "高级讲师",
      bio: "专注于前端开发教学，有10年实战经验",
      skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
      rating: 4.8,
    },
  })

  const teacherProfile2 = await prisma.teacherProfile.upsert({
    where: { userId: teacher2.id },
    update: {},
    create: {
      userId: teacher2.id,
      title: "副教授",
      bio: "后端开发专家，Node.js 和数据库设计专家",
      skills: ["Node.js", "PostgreSQL", "Python", "Docker"],
      rating: 4.9,
    },
  })

  // 创建课程
  const course1 = await prisma.course.upsert({
    where: { id: "course-1" },
    update: {},
    create: {
      id: "course-1",
      title: "React 从入门到实战",
      description: "全面学习 React 开发，包括 Hooks、状态管理、路由等",
      category: "前端",
      level: "BEGINNER",
      price: 29900, // 299.00 元
      lessons: 24,
      banner: "/placeholder/cover-1.svg",
      status: "PUBLISHED",
      teacherId: teacherProfile1.id,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { id: "course-2" },
    update: {},
    create: {
      id: "course-2",
      title: "Node.js 后端开发",
      description: "学习 Node.js 后端开发，包括 Express、数据库、API 设计",
      category: "后端",
      level: "INTERMEDIATE",
      price: 39900, // 399.00 元
      lessons: 32,
      banner: "/placeholder/cover-2.svg",
      status: "PUBLISHED",
      teacherId: teacherProfile2.id,
    },
  })

  // 创建学生用户
  const studentPassword = await bcrypt.hash("student123", 12)
  const student1 = await prisma.user.upsert({
    where: { email: "zhang.san@student.com" },
    update: {},
    create: {
      email: "zhang.san@student.com",
      name: "张三",
      password: studentPassword,
      role: "STUDENT",
      phone: "13800138001",
      gender: "MALE",
      credits: 120,
      status: "ACTIVE",
    },
  })

  const student2 = await prisma.user.upsert({
    where: { email: "li.si@student.com" },
    update: {},
    create: {
      email: "li.si@student.com",
      name: "李四",
      password: studentPassword,
      role: "STUDENT",
      phone: "13800138002",
      gender: "FEMALE",
      credits: 85,
      status: "ACTIVE",
    },
  })

  // 创建选课记录
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student1.id, courseId: course1.id } },
    update: {},
    create: {
      userId: student1.id,
      courseId: course1.id,
      status: "ACTIVE",
      progress: 75,
    },
  })

  // 创建订单
  await prisma.order.upsert({
    where: { id: "order-1" },
    update: {},
    create: {
      id: "order-1",
      orderNo: "OD202400001",
      userId: student1.id,
      courseId: course1.id,
      amount: course1.price,
      payMethod: "ALIPAY",
      status: "PAID",
      paidAt: new Date(),
    },
  })

  console.log("数据库种子完成!")
  console.log("创建的用户:")
  console.log("- 管理员: admin@example.com / admin123")
  console.log("- 教师: zhang@teacher.com / teacher123")
  console.log("- 教师: li@teacher.com / teacher123")
  console.log("- 学生: zhang.san@student.com / student123")
  console.log("- 学生: li.si@student.com / student123")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
