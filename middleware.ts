import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// 需要登录才能访问的页面路径
const protectedPaths = ["/dashboard", "/courses", "/teachers", "/students", "/orders"]

// 已登录用户不应访问的路径（如登录页）
const authPaths = ["/login", "/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 跳过 API 路由的检查，让 NextAuth 自己处理
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // 获取 NextAuth token
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
    })

    const isAuthenticated = !!token
    console.log("Middleware 检查:", { pathname, isAuthenticated, tokenExists: !!token })

    // 如果访问受保护的页面但未登录，重定向到登录页
    if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
      console.log("重定向到登录页:", pathname)
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 如果已登录但访问登录页，重定向到 dashboard
    if (authPaths.some(path => pathname.startsWith(path)) && isAuthenticated) {
      console.log("已登录，重定向到 dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware 错误:", error)
    return NextResponse.next()
  }
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - 公共资源文件
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}
