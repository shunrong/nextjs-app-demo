import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取学员列表
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
      role: "STUDENT" as const,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          student: true, // 包含学生详细信息
          _count: {
            select: { orders: true }, // 修改为 orders
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    // 格式化学生数据并添加显示编码
    const formattedStudents = students.map(student => ({
      id: student.id,
      displayCode: `S${String(student.id).padStart(3, "0")}`, // 动态生成显示编码
      name: student.name,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      // 学生特有信息
      birth: student.student?.birth,
      photo: student.student?.photo,
      parentName1: student.student?.parentName1,
      parentPhone1: student.student?.parentPhone1,
      parentRole1: student.student?.parentRole1,
      parentName2: student.student?.parentName2,
      parentPhone2: student.student?.parentPhone2,
      parentRole2: student.student?.parentRole2,
      // 统计信息
      enrolledCourses: student._count.orders,
      joinedAt: student.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedStudents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取学员失败:", error)
    return NextResponse.json({ error: "获取学员失败" }, { status: 500 })
  }
}

// 创建新学生
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老师和老板可以创建学生
    if (!["TEACHER", "BOSS"].includes(session.user.role)) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      email,
      password = "123456", // 默认密码
      gender,
      birth,
      parentName1,
      parentPhone1,
      parentRole1,
      parentName2,
      parentPhone2,
      parentRole2,
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

    // 创建用户和学生档案
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const studentUser = await prisma.user.create({
      data: {
        phone,
        name,
        email,
        password: hashedPassword,
        gender,
        role: "STUDENT",
        student: {
          create: {
            birth: birth ? new Date(birth) : null,
            parentName1,
            parentPhone1,
            parentRole1,
            parentName2,
            parentPhone2,
            parentRole2,
          },
        },
      },
      include: {
        student: true,
      },
    })

    // 更新用户的 studentId
    if (studentUser.student?.id) {
      await prisma.user.update({
        where: { id: studentUser.id },
        data: { studentId: studentUser.student.id },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: studentUser.id,
        displayCode: `S${String(studentUser.id).padStart(3, "0")}`,
        name: studentUser.name,
        phone: studentUser.phone,
        email: studentUser.email,
      },
    })
  } catch (error) {
    console.error("创建学生失败:", error)
    return NextResponse.json({ error: "创建学生失败" }, { status: 500 })
  }
}
