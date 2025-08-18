import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取仪表板统计数据
export async function GET(_: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 并行查询各种统计数据
    const [totalStudents, totalCourses, totalOrders, totalTeachers, monthlyRevenue, recentOrders] =
      await Promise.all([
        // 总学员数
        prisma.user.count({
          where: { role: "STUDENT" },
        }),

        // 活跃课程数
        prisma.course.count({
          where: { status: "PUBLISHED" },
        }),

        // 总订单数
        prisma.order.count(),

        // 在线教师数
        prisma.user.count({
          where: {
            role: "TEACHER",
            status: "ACTIVE",
          },
        }),

        // 本月收入
        prisma.order.aggregate({
          where: {
            status: "PAID",
            paidAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: {
            amount: true,
          },
        }),

        // 最近订单
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
            course: { select: { title: true } },
          },
        }),
      ])

    // 课程分类统计
    const courseCategories = await prisma.course.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
      _count: {
        category: true,
      },
    })

    const stats = {
      totalStudents,
      totalCourses,
      totalOrders,
      totalTeachers,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      courseCategories: courseCategories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        studentName: order.user.name,
        courseTitle: order.course.title,
        amount: order.amount,
        status: order.status,
        createdAt: order.createdAt,
      })),
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("获取统计数据失败:", error)
    return NextResponse.json({ error: "获取统计数据失败" }, { status: 500 })
  }
}
