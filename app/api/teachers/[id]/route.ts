import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// 获取单个教师详情
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json({ error: "无效的教师ID" }, { status: 400 })
    }

    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        role: "TEACHER",
      },
      include: {
        teacher: true,
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "教师不存在" }, { status: 404 })
    }

    // 格式化数据以匹配表单结构
    const formattedTeacher = {
      id: teacher.id,
      name: teacher.name || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      gender: teacher.gender,
      position: teacher.teacher?.position || "",
      avatar: teacher.avatar || "",
    }

    return NextResponse.json({
      success: true,
      data: formattedTeacher,
    })
  } catch (error) {
    console.error("获取教师详情失败:", error)
    return NextResponse.json({ error: "获取教师详情失败" }, { status: 500 })
  }
}

// 更新教师信息
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以更新教师信息
    if (session.user.role !== "BOSS") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json({ error: "无效的教师ID" }, { status: 400 })
    }

    const body = await request.json()
    const { name, phone, email, gender, position, avatar } = body

    // 验证必填字段
    if (!name || !phone || !position) {
      return NextResponse.json(
        {
          error: "姓名、手机号和职位为必填项",
        },
        { status: 400 }
      )
    }

    // 检查手机号是否被其他用户使用
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: teacherId },
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "该手机号已被其他用户使用" }, { status: 400 })
    }

    // 更新用户和教师信息
    const updatedTeacher = await prisma.user.update({
      where: { id: teacherId },
      data: {
        name,
        phone,
        email: email || null,
        gender: gender || null,
        avatar: avatar || null,
        teacher: {
          update: {
            position,
          },
        },
      },
      include: {
        teacher: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "教师信息已更新",
      data: {
        id: updatedTeacher.id,
        name: updatedTeacher.name,
        phone: updatedTeacher.phone,
      },
    })
  } catch (error) {
    console.error("更新教师信息失败:", error)
    return NextResponse.json({ error: "更新教师信息失败" }, { status: 500 })
  }
}

// 删除教师
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    // 检查权限：只有老板可以删除教师
    if (session.user.role !== "BOSS") {
      return NextResponse.json({ error: "权限不足" }, { status: 403 })
    }

    const teacherId = parseInt(params.id)
    if (isNaN(teacherId)) {
      return NextResponse.json({ error: "无效的教师ID" }, { status: 400 })
    }

    // 检查教师是否存在
    const teacher = await prisma.user.findFirst({
      where: {
        id: teacherId,
        role: "TEACHER",
      },
    })

    if (!teacher) {
      return NextResponse.json({ error: "教师不存在" }, { status: 404 })
    }

    // 删除教师（级联删除会自动处理相关数据）
    await prisma.user.delete({
      where: { id: teacherId },
    })

    return NextResponse.json({
      success: true,
      message: "教师已删除",
    })
  } catch (error) {
    console.error("删除教师失败:", error)
    return NextResponse.json({ error: "删除教师失败" }, { status: 500 })
  }
}
