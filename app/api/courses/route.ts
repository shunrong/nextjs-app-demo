import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取课程列表
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
            { title: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { teacher: { user: { name: { contains: search, mode: "insensitive" as const } } } },
          ],
        }
      : {}

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          teacher: {
            include: { user: { select: { name: true } } },
          },
          _count: {
            select: { enrollments: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.course.count({ where }),
    ])

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price,
      lessons: course.lessons,
      banner: course.banner,
      status: course.status,
      teacher: course.teacher.user.name,
      students: course._count.enrollments,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedCourses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取课程失败:", error)
    return NextResponse.json({ error: "获取课程失败" }, { status: 500 })
  }
}

// 创建课程
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { title, description, category, level, price, lessons, banner } = await request.json()

    if (!title || !category || !price) {
      return NextResponse.json({ error: "标题、分类和价格是必填项" }, { status: 400 })
    }

    // 获取教师资料
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user!.id },
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "教师资料不存在" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level: level || "BEGINNER",
        price: Math.round(price * 100), // 转换为分
        lessons: lessons || 0,
        banner,
        teacherId: teacherProfile.id,
      },
      include: {
        teacher: {
          include: { user: { select: { name: true } } },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "课程创建成功",
        data: course,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("创建课程失败:", error)
    return NextResponse.json({ error: "创建课程失败" }, { status: 500 })
  }
}
