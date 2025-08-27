import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 这里应该验证用户凭据
    // 实际项目中会查询数据库、验证密码等
    if (email && password) {
      // 模拟生成 JWT token
      const token = `fake-jwt-token-${Date.now()}`

      const response = NextResponse.json({
        success: true,
        message: "登录成功",
        user: {
          id: 1,
          email,
          name: "测试用户",
        },
      })

      // 设置 httpOnly cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })

      return response
    }

    return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 })
  } catch {
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
