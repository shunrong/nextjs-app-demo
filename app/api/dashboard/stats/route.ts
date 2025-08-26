import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取仪表板统计数据
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 并行查询各种统计数据
    const [
      totalStudents,
      totalCourses,
      totalOrders,
      totalTeachers,
      totalBosses,
      monthlyRevenue,
      recentOrders,
    ] = await Promise.all([
      // 总学生数
      prisma.user.count({
        where: { role: "STUDENT" },
      }),

      // 活跃课程数
      prisma.course.count({
        where: { status: "PUBLISHED" },
      }),

      // 总订单数（报名记录）
      prisma.order.count({
        where: { status: "REGISTERED" },
      }),

      // 在职教师数
      prisma.user.count({
        where: {
          role: "TEACHER",
        },
      }),

      // 老板数
      prisma.user.count({
        where: { role: "BOSS" },
      }),

      // 本月收入（所有已登记的订单）
      prisma.order.aggregate({
        where: {
          status: "REGISTERED",
          payTime: {
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
          student: { select: { name: true } },
          course: {
            select: {
              title: true,
              category: true,
              year: true,
              term: true,
            },
          },
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

    // 年度/学期课程统计
    const termCourses = await prisma.course.groupBy({
      by: ["year", "term"],
      _count: {
        id: true,
      },
      orderBy: [{ year: "desc" }, { term: "asc" }],
    })

    // 请假统计
    const leaveStats = await prisma.leave.count()

    const stats = {
      // 基础统计
      totalStudents,
      totalTeachers,
      totalBosses,
      totalCourses,
      totalOrders,
      totalLeaves: leaveStats,

      // 收入统计
      monthlyRevenue: monthlyRevenue._sum.amount || 0,

      // 课程分类统计
      courseCategories: courseCategories.map(cat => ({
        name: cat.category,
        count: cat._count.category,
      })),

      // 学期课程统计
      termCourses: termCourses.map(term => ({
        year: term.year,
        term: term.term,
        count: term._count.id,
      })),

      // 最近订单
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNo: order.orderNo,
        studentName: order.student.name,
        courseTitle: order.course.title,
        courseCategory: order.course.category,
        courseTerm: `${order.course.year}年${order.course.term}`,
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
