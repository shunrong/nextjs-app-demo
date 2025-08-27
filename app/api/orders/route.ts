import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { getTermLabel } from "@/lib/term-utils"
import { Role, OrderStatus } from "@/lib/enums"

// 获取订单列表
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

    const where = search
      ? {
          OR: [
            { orderNo: { contains: search, mode: "insensitive" as const } },
            { student: { name: { contains: search, mode: "insensitive" as const } } },
            { course: { title: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          student: {
            select: {
              name: true,
              phone: true,
              student: {
                select: {
                  parentName1: true,
                  parentPhone1: true,
                },
              },
            },
          },
          course: {
            select: {
              title: true,
              category: true,
              year: true,
              term: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ])

    // 格式化订单数据
    const formattedOrders = orders.map(order => ({
      id: order.id,
      displayCode: `OD${String(order.id).padStart(6, "0")}`,
      studentName: order.student.name,
      studentPhone: order.student.phone,
      parentName: order.student.student?.parentName1,
      parentPhone: order.student.student?.parentPhone1,
      courseTitle: order.course.title,
      courseCategory: order.course.category,
      courseTerm: `${order.course.year}年${getTermLabel(order.course.term)}`,
      amount: order.amount,
      status: order.status,
      payTime: order.payTime,
      createdAt: order.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取订单失败:", error)
    return NextResponse.json({ error: "获取订单失败" }, { status: 500 })
  }
}

// 创建订单（报名记录）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：老师和老板可以为学生创建订单
    const userRole = parseInt(session.user.role)
    if (![Role.TEACHER, Role.BOSS].includes(userRole)) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const body = await request.json()
    const { studentId, courseId, amount, payTime } = body

    // 验证必填字段
    if (!studentId || !courseId) {
      return NextResponse.json({ error: "学生和课程为必填项" }, { status: 400 })
    }

    // 验证学生是否存在
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: Role.STUDENT,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "指定的学生不存在" }, { status: 400 })
    }

    // 验证课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    // 检查是否已经报名过
    const existingOrder = await prisma.order.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
        status: OrderStatus.PAID,
      },
    })

    if (existingOrder) {
      return NextResponse.json({ error: "该学生已经报名过这门课程" }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        studentId,
        courseId,
        amount: amount || course.price, // 使用传入的金额或课程价格
        status: OrderStatus.PAID,
        payTime: payTime ? new Date(payTime) : new Date(), // 支付时间
      },
      include: {
        student: { select: { name: true } },
        course: { select: { title: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "报名成功",
        data: {
          id: order.id,
          studentName: order.student.name,
          courseTitle: order.course.title,
          amount: order.amount,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建订单失败:", error)
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
  }
}
