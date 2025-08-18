import { NextRequest, NextResponse } from 'next/server'

// 这个 API 需要登录才能访问，会被 middleware 拦截
export async function GET(request: NextRequest) {
  // 如果到达这里，说明用户已经通过了 middleware 的认证检查
  
  // 可以从 cookie 或 header 中获取用户信息
  const authToken = request.cookies.get('auth-token')?.value
  
  // 模拟课程数据
  const courses = [
    {
      id: 1,
      title: '前端开发基础',
      description: 'HTML、CSS、JavaScript 基础课程',
      instructor: '张老师',
      students: 25
    },
    {
      id: 2,
      title: 'React 进阶',
      description: 'React Hooks、状态管理等高级特性',
      instructor: '李老师',
      students: 18
    },
    {
      id: 3,
      title: 'Node.js 后端开发',
      description: 'Express、数据库操作、API 设计',
      instructor: '王老师',
      students: 22
    }
  ]
  
  return NextResponse.json({
    success: true,
    data: courses,
    total: courses.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()
    
    // 这里应该保存到数据库
    // 模拟创建课程
    const newCourse = {
      id: Date.now(),
      ...courseData,
      createdAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: '课程创建成功',
      data: newCourse
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: '创建课程失败' },
      { status: 500 }
    )
  }
}
