import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取学员列表
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
      role: "STUDENT" as const,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ])

    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      gender: student.gender,
      credits: student.credits,
      status: student.status,
      enrolledCourses: student._count.enrollments,
      joinedAt: student.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedStudents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取学员失败:", error)
    return NextResponse.json({ error: "获取学员失败" }, { status: 500 })
  }
}
