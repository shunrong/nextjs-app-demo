import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Role } from "@/lib/enums"

// 获取教师列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const where = {
      role: Role.TEACHER,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [teachers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          teacher: true, // 包含教师详细信息
          _count: {
            select: { teacherCourses: true }, // 统计授课数量
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.user.count({ where }),
    ])

    // 格式化教师数据并添加显示编码
    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.teacher?.id,
      name: teacher.name,
      nick: teacher.nick,
      phone: teacher.phone,
      gender: teacher.gender,
      avatar: teacher.avatar,
      // 教师特有信息
      job: teacher.teacher?.job || "主课",
      // 统计信息
      courseCount: teacher._count.teacherCourses,
      joinedAt: teacher.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedTeachers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取教师失败:", error)
    return NextResponse.json({ error: "获取教师失败" }, { status: 500 })
  }
}

// 创建新教师
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以创建教师
    const userRole = parseInt(session.user.role)
    if (userRole !== Role.BOSS) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      password = "123456", // 默认密码
      gender,
      job = "主课",
    } = body

    // 验证必填字段
    if (!name || !phone) {
      return NextResponse.json({ error: "姓名和手机号为必填项" }, { status: 400 })
    }

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json({ error: "手机号已存在" }, { status: 400 })
    }

    // 创建用户和教师档案
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const teacherUser = await prisma.user.create({
      data: {
        phone,
        name,
        password: hashedPassword,
        gender,
        role: Role.TEACHER,
        teacher: {
          create: {
            job,
          },
        },
      },
      include: {
        teacher: true,
      },
    })

    // 更新用户的 teacherId
    if (teacherUser.teacher?.id) {
      await prisma.user.update({
        where: { id: teacherUser.id },
        data: { teacher: { connect: { id: teacherUser.teacher.id } } },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: teacherUser.teacher?.id,
        name: teacherUser.name,
        phone: teacherUser.phone,
        job: teacherUser.teacher?.job,
      },
    })
  } catch (error) {
    console.error("创建教师失败:", error)
    return NextResponse.json({ error: "创建教师失败" }, { status: 500 })
  }
}
