import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Role, CourseStatus, CourseTerm, courseTermLabels } from "@/lib/enums"

// 获取下拉选项数据
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    switch (type) {
      case "teachers":
        // 获取教师选项
        const teachers = await prisma.user.findMany({
          where: { role: Role.TEACHER },
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        })
        return NextResponse.json({
          success: true,
          data: teachers,
        })

      case "students":
        // 获取学生选项
        const students = await prisma.user.findMany({
          where: { role: Role.STUDENT },
          select: {
            id: true,
            name: true,
          },
          orderBy: { name: "asc" },
        })
        return NextResponse.json({
          success: true,
          data: students,
        })

      case "courses":
        // 获取课程选项
        const courses = await prisma.course.findMany({
          where: { status: CourseStatus.OPEN },
          select: {
            id: true,
            title: true,
            year: true,
            term: true,
          },
          orderBy: [{ year: "desc" }, { term: "asc" }, { title: "asc" }],
        })
        // 格式化课程名称
        const formattedCourses = courses.map(course => ({
          id: course.id,
          name: `${course.title} (${course.year}年${courseTermLabels[course.term as CourseTerm]})`,
        }))
        return NextResponse.json({
          success: true,
          data: formattedCourses,
        })

      default:
        return NextResponse.json({ error: "无效的选项类型" }, { status: 400 })
    }
  } catch (error) {
    console.error("获取选项数据失败:", error)
    return NextResponse.json({ error: "获取选项数据失败" }, { status: 500 })
  }
}
