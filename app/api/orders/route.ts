import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
            { user: { name: { contains: search, mode: "insensitive" as const } } },
            { course: { title: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true } },
          course: { select: { title: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ])

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNo: order.orderNo,
      studentName: order.user.name,
      courseTitle: order.course.title,
      amount: order.amount,
      payMethod: order.payMethod,
      status: order.status,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
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

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { courseId, payMethod } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: "课程ID是必填项" }, { status: 400 })
    }

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    // 检查是否已经购买过
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user!.id,
        courseId: courseId,
        status: "PAID",
      },
    })

    if (existingOrder) {
      return NextResponse.json({ error: "您已经购买过这门课程" }, { status: 400 })
    }

    // 生成订单号
    const orderNo = `OD${new Date().getFullYear()}${Date.now().toString().slice(-6)}`

    const order = await prisma.order.create({
      data: {
        orderNo,
        userId: session.user!.id,
        courseId,
        amount: course.price,
        payMethod: payMethod || "ALIPAY",
        status: "PENDING",
      },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "订单创建成功",
        data: order,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建订单失败:", error)
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 })
  }
}
