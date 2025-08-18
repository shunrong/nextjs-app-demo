import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 需要登录才能访问的页面路径
const protectedPaths = ['/dashboard', '/courses', '/teachers', '/students', '/orders']

// 需要登录才能访问的 API 路径
const protectedApiPaths = ['/api/courses', '/api/teachers', '/api/students', '/api/orders', '/api/user']

// 公开的 API 路径（不需要登录）
const publicApiPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

// 已登录用户不应访问的路径（如登录页）
const authPaths = ['/login']

// 验证 JWT token（简化版本）
function validateToken(token: string): boolean {
  // 这里应该验证 JWT token 的有效性
  // 实际项目中会调用 jwt.verify() 或发送到认证服务验证
  return !!token && token.length > 10 // 简化的验证逻辑
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 获取认证信息
  const authToken = request.cookies.get('auth-token')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '') ||
                   null
  
  const isAuthenticated = authToken ? validateToken(authToken) : true

  // === API 路由鉴权 ===
  if (pathname.startsWith('/api/')) {
    // 公开 API，直接放行
    if (publicApiPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next()
    }
    
    // 受保护的 API，需要验证登录状态
    if (protectedApiPaths.some(path => pathname.startsWith(path))) {
      if (!isAuthenticated) {
        // API 请求未授权，返回 401 而不是重定向
        return NextResponse.json(
          { 
            error: 'Unauthorized', 
            message: '请先登录',
            code: 'AUTH_REQUIRED'
          },
          { status: 401 }
        )
      }
      
      // 可以在这里添加更细粒度的权限检查
      // 例如：检查用户角色、特定资源访问权限等
      
      return NextResponse.next()
    }
    
    // 其他 API 路由，直接放行
    return NextResponse.next()
  }

  // === 页面路由鉴权 ===
  
  // 如果访问受保护的页面但未登录，重定向到登录页
  if (protectedPaths.some(path => pathname.startsWith(path)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // 记录重定向目标
    return NextResponse.redirect(loginUrl)
  }

  // 如果已登录但访问登录页，重定向到 dashboard
  if (authPaths.some(path => pathname.startsWith(path)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// 配置中间件匹配路径
export const config = {
  matcher: [
    /*
     * 匹配所有路径包括 API 路由，除了：
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - 公共资源文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}
