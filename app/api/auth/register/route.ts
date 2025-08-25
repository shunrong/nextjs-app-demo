import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, role = "STUDENT" } = await request.json()

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "姓名、手机号和密码都是必填项" }, { status: 400 })
    }

    // 检查手机号是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json({ error: "该手机号已被注册" }, { status: 400 })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        email,
        password: hashedPassword,
        role: role as "STUDENT" | "TEACHER" | "BOSS",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "注册成功",
        data: user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("注册失败:", error)
    return NextResponse.json({ error: "注册失败" }, { status: 500 })
  }
}
