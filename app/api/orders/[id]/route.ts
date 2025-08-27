import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { orderSchema } from "@/lib/schemas/order"
import { Role } from "@/lib/enums"

// 获取单个订单详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const orderId = parseInt(id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单ID" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        student: true,
        course: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 })
    }

    // 格式化数据以匹配表单结构
    const formattedOrder = {
      id: order.id,
      displayCode: `OD${String(order.id).padStart(6, "0")}`,
      studentId: order.studentId,
      courseId: order.courseId,
      amount: order.amount,
      status: order.status,
      payTime: order.payTime ? order.payTime.toISOString().split("T")[0] : "",
    }

    return NextResponse.json({
      success: true,
      data: formattedOrder,
    })
  } catch (error) {
    console.error("获取订单详情失败:", error)
    return NextResponse.json({ error: "获取订单详情失败" }, { status: 500 })
  }
}

// 更新订单信息
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有教师和老板可以更新订单信息
    const userRole = parseInt(session.user.role)
    if (userRole !== Role.TEACHER && userRole !== Role.BOSS) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const orderId = parseInt(id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单ID" }, { status: 400 })
    }

    const body = await request.json()

    // 验证数据
    const validatedData = orderSchema.parse(body)
    const { studentId, courseId, amount, status, payTime } = validatedData

    // 检查学生是否存在
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: Role.STUDENT },
    })
    if (!student) {
      return NextResponse.json({ error: "学生不存在" }, { status: 400 })
    }

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })
    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 400 })
    }

    // 更新订单信息
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        studentId,
        courseId,
        amount,
        status,
        payTime: payTime ? new Date(payTime) : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "订单信息已更新",
      data: {
        id: updatedOrder.id,
      },
    })
  } catch (error) {
    console.error("更新订单信息失败:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新订单信息失败" }, { status: 500 })
  }
}

// 删除订单
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以删除订单
    const userRole = parseInt(session.user.role)
    if (userRole !== Role.BOSS) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const orderId = parseInt(id)
    if (isNaN(orderId)) {
      return NextResponse.json({ error: "无效的订单ID" }, { status: 400 })
    }

    // 检查订单是否存在
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: "订单不存在" }, { status: 404 })
    }

    // 删除订单
    await prisma.order.delete({
      where: { id: orderId },
    })

    return NextResponse.json({
      success: true,
      message: "订单已删除",
    })
  } catch (error) {
    console.error("删除订单失败:", error)
    return NextResponse.json({ error: "删除订单失败" }, { status: 500 })
  }
}
