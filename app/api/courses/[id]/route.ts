import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { courseSchema } from "@/lib/schemas/course"

// 获取单个课程详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "无效的课程ID" }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: true, // teacher 直接关联到 User，不需要再 include user
      },
    })

    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    // 格式化数据以匹配表单结构
    const formattedCourse = {
      id: course.id,
      title: course.title || "",
      subtitle: course.subtitle || "",
      category: course.category || "",
      year: course.year,
      term: course.term,
      price: course.price,
      teacherId: course.teacherId,
      address: course.address || "",
      banner: course.banner || "",
    }

    return NextResponse.json({
      success: true,
      data: formattedCourse,
    })
  } catch (error) {
    console.error("获取课程详情失败:", error)
    return NextResponse.json({ error: "获取课程详情失败" }, { status: 500 })
  }
}

// 更新课程信息
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有教师和老板可以更新课程信息
    if (session.user.role !== "TEACHER" && session.user.role !== "BOSS") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "无效的课程ID" }, { status: 400 })
    }

    const body = await request.json()

    // 验证数据
    const validatedData = courseSchema.parse(body)
    const { title, subtitle, category, year, term, price, teacherId, address, banner } =
      validatedData

    // 检查教师是否存在
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: "TEACHER" },
    })
    if (!teacher) {
      return NextResponse.json({ error: "授课教师不存在" }, { status: 400 })
    }

    // 更新课程信息
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        subtitle,
        category,
        year,
        term,
        price,
        teacherId,
        address,
        banner,
      },
    })

    return NextResponse.json({
      success: true,
      message: "课程信息已更新",
      data: {
        id: updatedCourse.id,
        title: updatedCourse.title,
      },
    })
  } catch (error) {
    console.error("更新课程信息失败:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新课程信息失败" }, { status: 500 })
  }
}

// 删除课程
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以删除课程
    if (session.user.role !== "BOSS") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "无效的课程ID" }, { status: 400 })
    }

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: "课程不存在" }, { status: 404 })
    }

    // 删除课程（级联删除会自动处理相关数据）
    await prisma.course.delete({
      where: { id: courseId },
    })

    return NextResponse.json({
      success: true,
      message: "课程已删除",
    })
  } catch (error) {
    console.error("删除课程失败:", error)
    return NextResponse.json({ error: "删除课程失败" }, { status: 500 })
  }
}
