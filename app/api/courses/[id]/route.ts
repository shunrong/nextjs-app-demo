import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { courseSchema } from "@/lib/schemas/course"
import { Role, LessonStatus, CourseCategory, CourseTerm } from "@/lib/enums"

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
        lessons: {
          orderBy: { startTime: "asc" },
        },
        orders: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                phone: true,
                gender: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
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
      lessons: course.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        subtitle: lesson.subtitle,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        status: lesson.status,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      })),
      students: course.orders.map(order => ({
        id: order.student.id,
        name: order.student.name,
        phone: order.student.phone,
        gender: order.student.gender,
        orderId: order.id,
        status: order.status,
        amount: order.amount,
        payTime: order.payTime,
        createdAt: order.createdAt,
      })),
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
    const userRole = parseInt(session.user.role)
    if (userRole !== Role.TEACHER && userRole !== Role.BOSS) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const courseId = parseInt(id)
    if (isNaN(courseId)) {
      return NextResponse.json({ error: "无效的课程ID" }, { status: 400 })
    }

    const body = await request.json()
    console.log("📝 接收到的更新数据:", JSON.stringify(body, null, 2))

    // 验证数据
    const validatedData = courseSchema.parse(body)
    const { title, subtitle, category, year, term, price, teacherId, address, banner, lessons } =
      validatedData

    console.log("✅ 数据验证通过")

    // 检查教师是否存在
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId, role: Role.TEACHER },
    })
    if (!teacher) {
      return NextResponse.json({ error: "授课教师不存在" }, { status: 400 })
    }

    console.log("✅ 教师验证通过")

    // 使用事务来更新课程信息和课时
    const result = await prisma.$transaction(async tx => {
      console.log("🔄 开始事务处理")

      // 更新课程信息
      const updatedCourse = await tx.course.update({
        where: { id: courseId },
        data: {
          title,
          subtitle,
          category:
            typeof category === "string"
              ? CourseCategory[category as keyof typeof CourseCategory]
              : category,
          year,
          term: typeof term === "string" ? CourseTerm[term as keyof typeof CourseTerm] : term,
          price,
          teacherId,
          address,
          banner,
        },
      })

      console.log("✅ 课程信息更新完成")

      // 如果提供了课时数据，则更新课时
      if (lessons && Array.isArray(lessons)) {
        console.log(`📚 开始处理 ${lessons.length} 个课时`)

        // 获取现有的课时ID列表
        const existingLessons = await tx.lesson.findMany({
          where: { courseId },
          select: { id: true },
        })
        const existingLessonIds = existingLessons.map(l => l.id)
        console.log("�� 现有课时ID:", existingLessonIds)

        // 获取要保留的课时ID列表
        const lessonIdsToKeep = lessons
          .filter(lesson => lesson.id && typeof lesson.id === "number")
          .map(lesson => lesson.id as number)
        console.log("�� 要保留的课时ID:", lessonIdsToKeep)

        // 删除不再需要的课时（但需要检查是否有请假记录）
        const lessonsToDelete = existingLessonIds.filter(id => !lessonIdsToKeep.includes(id))
        console.log("🗑️ 要删除的课时ID:", lessonsToDelete)

        for (const lessonId of lessonsToDelete) {
          const leaveCount = await tx.leave.count({
            where: { lessonId },
          })
          if (leaveCount > 0) {
            throw new Error(`课时ID ${lessonId} 已有学生请假记录，无法删除`)
          }
        }

        // 删除课时
        if (lessonsToDelete.length > 0) {
          await tx.lesson.deleteMany({
            where: { id: { in: lessonsToDelete } },
          })
          console.log("✅ 删除课时完成")
        }

        // 更新或创建课时
        for (let i = 0; i < lessons.length; i++) {
          const lesson = lessons[i]
          console.log(`📝 处理课时 ${i + 1}/${lessons.length}:`, lesson.title)

          const lessonData = {
            title: lesson.title,
            subtitle: lesson.subtitle,
            startTime: new Date(lesson.startTime),
            endTime: new Date(lesson.endTime),
            status:
              typeof lesson.status === "string"
                ? LessonStatus[lesson.status as keyof typeof LessonStatus]
                : lesson.status,
          }

          // 验证时间逻辑
          if (lessonData.startTime >= lessonData.endTime) {
            throw new Error(`课时"${lesson.title}"的结束时间必须晚于开始时间`)
          }

          if (lesson.id && typeof lesson.id === "number") {
            // 更新现有课时
            await tx.lesson.update({
              where: { id: lesson.id },
              data: lessonData,
            })
            console.log(`✅ 更新课时 ${lesson.id}`)
          } else {
            // 创建新课时
            const newLesson = await tx.lesson.create({
              data: {
                ...lessonData,
                courseId,
              },
            })
            console.log(`✅ 创建新课时 ${newLesson.id}`)
          }
        }

        console.log("✅ 课时处理完成")
      }

      return updatedCourse
    })

    console.log("✅ 事务处理完成")

    return NextResponse.json({
      success: true,
      message: "课程信息已更新",
      data: {
        id: result.id,
        title: result.title,
      },
    })
  } catch (error) {
    console.error("❌ 更新课程信息失败:", error)

    // 更详细的错误信息
    if (error instanceof Error) {
      console.error("错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      })
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
    const userRole = parseInt(session.user.role)
    if (userRole !== Role.BOSS) {
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
