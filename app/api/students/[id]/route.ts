import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取单个学生详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { id } = await params
    const studentId = parseInt(id)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "无效的学生ID" }, { status: 400 })
    }

    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "STUDENT",
      },
      include: {
        student: true,
      },
    })

    if (!student) {
      return NextResponse.json({ error: "学生不存在" }, { status: 404 })
    }

    // 格式化数据以匹配表单结构
    const formattedStudent = {
      id: student.id,
      name: student.name || "",
      phone: student.phone || "",
      email: student.email || "",
      gender: student.gender,
      birth: student.student?.birth ? student.student.birth.toISOString().split("T")[0] : "",
      parentName1: student.student?.parentName1 || "",
      parentPhone1: student.student?.parentPhone1 || "",
      parentRole1: student.student?.parentRole1 || "",
      parentName2: student.student?.parentName2 || "",
      parentPhone2: student.student?.parentPhone2 || "",
      parentRole2: student.student?.parentRole2 || "",
      photo: student.student?.photo || "",
    }

    return NextResponse.json({
      success: true,
      data: formattedStudent,
    })
  } catch (error) {
    console.error("获取学生详情失败:", error)
    return NextResponse.json({ error: "获取学生详情失败" }, { status: 500 })
  }
}

// 更新学生信息
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老师和老板可以更新学生信息
    if (!["TEACHER", "BOSS"].includes(session.user.role)) {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const studentId = parseInt(id)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "无效的学生ID" }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      email,
      gender,
      birth,
      parentName1,
      parentPhone1,
      parentRole1,
      parentName2,
      parentPhone2,
      parentRole2,
      photo,
    } = body

    // 验证必填字段
    if (!name || !phone || !parentName1 || !parentPhone1 || !parentRole1) {
      return NextResponse.json(
        {
          error: "姓名、手机号、监护人姓名、监护人手机号和关系为必填项",
        },
        { status: 400 }
      )
    }

    // 检查手机号是否被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: studentId },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "该手机号已被其他用户使用" }, { status: 400 })
    }

    // 更新用户和学生信息
    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        name,
        phone,
        email: email || null,
        gender: gender || null,
        student: {
          update: {
            birth: birth ? new Date(birth) : null,
            photo: photo || null,
            parentName1,
            parentPhone1,
            parentRole1,
            parentName2: parentName2 || null,
            parentPhone2: parentPhone2 || null,
            parentRole2: parentRole2 || null,
          },
        },
      },
      include: {
        student: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "学生信息已更新",
      data: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        phone: updatedStudent.phone,
      },
    })
  } catch (error) {
    console.error("更新学生信息失败:", error)
    return NextResponse.json({ error: "更新学生信息失败" }, { status: 500 })
  }
}

// 删除学生
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以删除学生
    if (session.user.role !== "BOSS") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const { id } = await params
    const studentId = parseInt(id)
    if (isNaN(studentId)) {
      return NextResponse.json({ error: "无效的学生ID" }, { status: 400 })
    }

    // 检查学生是否存在
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        role: "STUDENT",
      },
    })

    if (!student) {
      return NextResponse.json({ error: "学生不存在" }, { status: 404 })
    }

    // 删除学生（级联删除会自动处理相关数据）
    await prisma.user.delete({
      where: { id: studentId },
    })

    return NextResponse.json({
      success: true,
      message: "学生已删除",
    })
  } catch (error) {
    console.error("删除学生失败:", error)
    return NextResponse.json({ error: "删除学生失败" }, { status: 500 })
  }
}
