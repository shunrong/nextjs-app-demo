import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(_: NextRequest) {
  try {
    // 测试数据库连接
    const userCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      userCount,
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
    })
  } catch (error) {
    console.error("数据库连接测试失败:", error)
    return NextResponse.json(
      {
        error: "数据库连接失败",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    )
  }
}
