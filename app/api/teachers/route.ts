import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取教师列表
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
      role: "TEACHER" as const,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { teacherProfile: { skills: { hasSome: [search] } } },
            ],
          }
        : {}),
    }

    const [teachers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          teacherProfile: {
            include: {
              _count: {
                select: { courses: true },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      title: teacher.teacherProfile?.title || "讲师",
      skills: teacher.teacherProfile?.skills || [],
      courses: teacher.teacherProfile?._count.courses || 0,
      rating: teacher.teacherProfile?.rating || 0,
      status: teacher.status,
      joinedAt: teacher.createdAt,
      banner: teacher.image,
    }))

    return NextResponse.json({
      success: true,
      data: formattedTeachers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取教师失败:", error)
    return NextResponse.json({ error: "获取教师失败" }, { status: 500 })
  }
}
