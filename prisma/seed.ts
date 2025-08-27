import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import {
  Role,
  Gender,
  Job,
  ParentRole,
  CourseStatus,
  CourseCategory,
  CourseTerm,
  LessonStatus,
  OrderStatus,
} from "../lib/enums"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 开始种子数据...")

  // ！！！危险操作：清理现有数据（注意顺序）
  // await prisma.leave.deleteMany()
  // await prisma.order.deleteMany()
  // await prisma.lesson.deleteMany()
  // await prisma.course.deleteMany()
  // await prisma.student.deleteMany()
  // await prisma.teacher.deleteMany()
  // await prisma.boss.deleteMany()
  // await prisma.social.deleteMany()
  // await prisma.user.deleteMany()

  console.log("🗑️  清理完成")

  // 创建密码哈希
  const hashedPassword = await bcrypt.hash("123456", 10)

  // 1) 老板
  const bossUser = await prisma.user.create({
    data: {
      phone: "13800000001",
      name: "张老板",
      nick: "老板",
      password: hashedPassword,
      gender: Gender.MALE,
      role: Role.BOSS,
      boss: {
        create: {},
      },
    },
    include: { boss: { select: { id: true } } },
  })

  // 2) 教师
  const teacherUser1 = await prisma.user.create({
    data: {
      phone: "13800000002",
      name: "李老师",
      nick: "舞蹈老师",
      password: hashedPassword,
      gender: Gender.FEMALE,
      role: Role.TEACHER,
      teacher: {
        create: {
          job: Job.TEACHER, // 职位：主课
        },
      },
    },
    include: { teacher: { select: { id: true } } },
  })

  const teacherUser2 = await prisma.user.create({
    data: {
      phone: "13800000003",
      name: "王老师",
      nick: "绘画老师",
      password: hashedPassword,
      gender: Gender.FEMALE,
      role: Role.TEACHER,
      teacher: {
        create: {
          job: Job.ASSISTANT, // 职位：助教
        },
      },
    },
    include: { teacher: { select: { id: true } } },
  })

  // 3) 学生
  const studentUser1 = await prisma.user.create({
    data: {
      phone: "13800000004",
      name: "小明",
      nick: "明明",
      gender: Gender.MALE,
      role: Role.STUDENT,
      password: hashedPassword,
      student: {
        create: {
          birth: new Date("2015-05-15"),
          parentName1: "明妈妈",
          parentPhone1: "13900000001",
          parentRole1: ParentRole.MOTHER,
          parentName2: "明爸爸",
          parentPhone2: "13900000002",
          parentRole2: ParentRole.FATHER,
        },
      },
    },
    include: { student: { select: { id: true } } },
  })

  const studentUser2 = await prisma.user.create({
    data: {
      phone: "13800000005",
      name: "小红",
      nick: "红红",
      gender: Gender.FEMALE,
      role: Role.STUDENT,
      password: hashedPassword,
      student: {
        create: {
          birth: new Date("2014-08-20"),
          parentName1: "红妈妈",
          parentPhone1: "13900000003",
          parentRole1: ParentRole.MOTHER,
        },
      },
    },
    include: { student: { select: { id: true } } },
  })

  const studentUser3 = await prisma.user.create({
    data: {
      phone: "13800000006",
      name: "小刚",
      nick: "刚刚",
      gender: Gender.MALE,
      role: Role.STUDENT,
      password: hashedPassword,
      student: {
        create: {
          birth: new Date("2016-02-10"),
          parentName1: "刚奶奶",
          parentPhone1: "13900000004",
          parentRole1: ParentRole.GRAND_MOTHER,
        },
      },
    },
    include: { student: { select: { id: true } } },
  })

  console.log("👥 用户创建完成")

  // 4) 课程
  const course1 = await prisma.course.create({
    data: {
      title: "中国舞基础班",
      subtitle: "适合零基础的小朋友，培养舞蹈兴趣",
      category: CourseCategory.DANCE,
      teacherId: teacherUser1.id,
      year: 2024,
      term: CourseTerm.SPRING,
      status: CourseStatus.OPEN,
      address: "舞蹈室A",
      price: 120000, // 1200元，以分为单位
    },
  })

  const course2 = await prisma.course.create({
    data: {
      title: "儿童绘画启蒙",
      subtitle: "开发孩子的艺术天赋和创造力",
      category: CourseCategory.PAINTING,
      teacherId: teacherUser2.id,
      year: 2024,
      term: CourseTerm.SUMMER,
      status: CourseStatus.OPEN,
      address: "美术室B",
      price: 100000, // 1000元，以分为单位
    },
  })

  const course3 = await prisma.course.create({
    data: {
      title: "中国舞提高班",
      subtitle: "有基础的学生进阶课程",
      category: CourseCategory.DANCE,
      teacherId: teacherUser1.id,
      year: 2024,
      term: CourseTerm.SUMMER,
      status: CourseStatus.DRAFT,
      address: "舞蹈室A",
      price: 150000, // 1500元，以分为单位
    },
  })

  console.log("📚 课程创建完成")

  // 5) 课时
  const baseDate = new Date("2024-03-01")

  // 中国舞基础班（每周五晚上）
  for (let i = 0; i < 12; i++) {
    const lessonDate = new Date(baseDate)
    lessonDate.setDate(baseDate.getDate() + i * 7)

    const startTime = new Date(lessonDate)
    startTime.setHours(19, 0, 0, 0)

    const endTime = new Date(lessonDate)
    endTime.setHours(20, 30, 0, 0)

    await prisma.lesson.create({
      data: {
        courseId: course1.id,
        title: `第${i + 1}课`,
        subtitle: i < 4 ? "基础动作训练" : i < 8 ? "舞蹈组合练习" : "成品舞蹈",
        startTime,
        endTime,
        status: i < 6 ? LessonStatus.COMPLETED : LessonStatus.PENDING,
      },
    })
  }

  // 绘画课（每周六下午）
  for (let i = 0; i < 10; i++) {
    const lessonDate = new Date(baseDate)
    lessonDate.setDate(baseDate.getDate() + 1 + i * 7)

    const startTime = new Date(lessonDate)
    startTime.setHours(14, 0, 0, 0)

    const endTime = new Date(lessonDate)
    endTime.setHours(15, 30, 0, 0)

    await prisma.lesson.create({
      data: {
        courseId: course2.id,
        title: `绘画第${i + 1}课`,
        subtitle: i < 3 ? "色彩认知" : i < 6 ? "简单图形" : "创意绘画",
        startTime,
        endTime,
        status: i < 4 ? LessonStatus.COMPLETED : LessonStatus.PENDING,
      },
    })
  }

  console.log("📖 课时创建完成")

  // 6) 订单（报名）
  await prisma.order.create({
    data: {
      studentId: studentUser1.id,
      courseId: course1.id,
      status: OrderStatus.PAID,
      amount: 120000,
      payTime: new Date("2024-02-25T10:30:00Z"),
    },
  })

  await prisma.order.create({
    data: {
      studentId: studentUser2.id,
      courseId: course1.id,
      status: OrderStatus.PAID,
      amount: 120000,
      payTime: new Date("2024-02-26T14:20:00Z"),
    },
  })

  await prisma.order.create({
    data: {
      studentId: studentUser1.id,
      courseId: course2.id,
      status: OrderStatus.PAID,
      amount: 100000,
      payTime: new Date("2024-02-28T16:45:00Z"),
    },
  })

  await prisma.order.create({
    data: {
      studentId: studentUser3.id,
      courseId: course2.id,
      status: OrderStatus.UNPAID,
      amount: 0,
    },
  })

  console.log("📋 订单创建完成")

  // 7) 请假记录
  const firstThreeLessons = await prisma.lesson.findMany({
    where: { courseId: course1.id },
    take: 3,
    orderBy: { id: "asc" },
  })

  if (firstThreeLessons.length >= 2) {
    await prisma.leave.create({
      data: {
        studentId: studentUser1.id,
        lessonId: firstThreeLessons[1].id,
        reason: "生病发烧",
      },
    })
  }

  if (firstThreeLessons.length >= 3) {
    await prisma.leave.create({
      data: {
        studentId: studentUser2.id,
        lessonId: firstThreeLessons[2].id,
        reason: "家里有事",
      },
    })
  }

  console.log("🏥 请假记录创建完成")

  // 8) 社交账号绑定示例
  await prisma.social.create({
    data: {
      userId: studentUser1.id,
      openId: "wx_xiaoming_123456",
      platform: "微信",
    },
  })

  await prisma.social.create({
    data: {
      userId: teacherUser1.id,
      openId: "wx_teacher_789012",
      platform: "微信",
    },
  })

  console.log("📱 社交账号绑定完成")

  const stats = {
    users: await prisma.user.count(),
    students: await prisma.student.count(),
    teachers: await prisma.teacher.count(),
    bosses: await prisma.boss.count(),
    courses: await prisma.course.count(),
    lessons: await prisma.lesson.count(),
    orders: await prisma.order.count(),
    leaves: await prisma.leave.count(),
  }

  console.log("📊 种子数据统计:", stats)
  console.log("✅ 种子数据创建完成！")

  console.log("\n👤 测试账号信息:")
  console.log("- 老板: 13800000001 / 123456")
  console.log("- 李老师(舞蹈): 13800000002 / 123456")
  console.log("- 王老师(绘画): 13800000003 / 123456")
  console.log("- 小明: 13800000004 / 123456")
  console.log("- 小红: 13800000005 / 123456")
  console.log("- 小刚: 13800000006 / 123456")
}

main()
  .catch(e => {
    console.error("❌ 种子数据创建失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
