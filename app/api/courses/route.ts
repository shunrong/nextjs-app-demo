import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { CourseStatus, Role } from "@/lib/enums"

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
            { teacher: { name: { contains: search, mode: "insensitive" as const } } },
          ],
        }
      : {}

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          teacher: { select: { name: true } }, // 主课老师
          _count: {
            select: {
              orders: true, // 报名人数（通过订单统计）
              lessons: true, // 课时数量
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.course.count({ where }),
    ])

    // 格式化课程数据并添加显示编码
    const formattedCourses = courses.map(course => ({
      id: course.id,
      displayCode: `C${String(course.id).padStart(3, "0")}`, // 动态生成显示编码
      title: course.title,
      subtitle: course.subtitle,
      category: course.category,
      year: course.year,
      term: course.term,
      price: course.price,
      banner: course.banner,
      status: course.status,
      address: course.address,
      teacher: course.teacher.name,
      teacherId: course.teacherId,
      // 统计信息
      enrolledStudents: course._count.orders, // 报名学生数
      lessonCount: course._count.lessons, // 课时数
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

// 添加课程
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：老师和老板可以添加课程
    const userRole = parseInt(session.user.role)
    if (![Role.TEACHER, Role.BOSS].includes(userRole)) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      subtitle,
      category,
      year = new Date().getFullYear(),
      term = "SPRING",
      price,
      address,
      teacherId, // 指定主课老师ID
    } = body

    // 验证必填字段
    if (!title || !category || !price || !teacherId) {
      return NextResponse.json(
        {
          error: "标题、分类、价格和授课教师为必填项",
        },
        { status: 400 }
      )
    }

    // 验证教师是否存在
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        role: Role.TEACHER,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "指定的教师不存在" }, { status: 400 })
    }

    const course = await prisma.course.create({
      data: {
        title,
        subtitle,
        category,
        year,
        term,
        price: Math.round(price * 100), // 转换为分
        address,
        teacherId,
        status: CourseStatus.DRAFT, // 默认草稿状态
      },
      include: {
        teacher: { select: { name: true } },
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "课程创建成功",
        data: {
          id: course.id,
          displayCode: `C${String(course.id).padStart(3, "0")}`,
          title: course.title,
          category: course.category,
          teacher: course.teacher.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("添加课程失败:", error)
    return NextResponse.json({ error: "添加课程失败" }, { status: 500 })
  }
}
