import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { Role, isValidRole } from "@/lib/enums"

export async function POST(request: NextRequest) {
  try {
    const { name, phone, password, role = Role.STUDENT } = await request.json()

    if (!name || !phone || !password) {
      return NextResponse.json({ error: "姓名、手机号和密码都是必填项" }, { status: 400 })
    }

    // 验证角色
    if (!isValidRole(role)) {
      return NextResponse.json({ error: "无效的角色" }, { status: 400 })
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
        password: hashedPassword,
        role: role as Role,
      },
      select: {
        id: true,
        name: true,
        phone: true,
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
