import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取请假记录列表
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
      ...(search
        ? {
            OR: [
              { student: { name: { contains: search, mode: "insensitive" as const } } },
              { student: { phone: { contains: search, mode: "insensitive" as const } } },
              { lesson: { course: { title: { contains: search, mode: "insensitive" as const } } } },
              { reason: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    }

    const [leaves, total] = await Promise.all([
      prisma.leave.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          lesson: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  teacher: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.leave.count({ where }),
    ])

    // 格式化请假记录数据
    const formattedLeaves = leaves.map(leave => ({
      id: leave.id,
      displayCode: `L${String(leave.id).padStart(3, "0")}`,
      studentId: leave.studentId,
      studentName: leave.student.name,
      studentPhone: leave.student.phone,
      lessonId: leave.lessonId,
      lessonTitle: leave.lesson.title,
      courseId: leave.lesson.course.id,
      courseTitle: leave.lesson.course.title,
      teacherName: leave.lesson.course.teacher.name,
      lessonDate: leave.lesson.startTime,
      lessonStartTime: leave.lesson.startTime,
      lessonEndTime: leave.lesson.endTime,
      reason: leave.reason,
      createdAt: leave.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedLeaves,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("获取请假记录失败:", error)
    return NextResponse.json({ error: "获取请假记录失败" }, { status: 500 })
  }
}
