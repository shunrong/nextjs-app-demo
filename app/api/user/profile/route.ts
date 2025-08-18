import { NextRequest, NextResponse } from 'next/server'

// 受保护的 API：获取用户信息
export async function GET(request: NextRequest) {
  // 由于通过了 middleware 认证，可以安全地处理请求
  
  const authToken = request.cookies.get('auth-token')?.value
  
  // 这里应该根据 token 查询真实的用户信息
  // 模拟用户数据
  const userProfile = {
    id: 1,
    email: 'user@example.com',
    name: '测试用户',
    role: 'teacher',
    avatar: null,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: new Date().toISOString()
  }
  
  return NextResponse.json({
    success: true,
    data: userProfile
  })
}

// 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()
    
    // 这里应该更新数据库中的用户信息
    // 模拟更新操作
    const updatedProfile = {
      id: 1,
      email: 'user@example.com',
      name: updates.name || '测试用户',
      role: 'teacher',
      avatar: updates.avatar || null,
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: true,
      message: '用户信息更新成功',
      data: updatedProfile
    })
  } catch (error) {
    return NextResponse.json(
      { error: '更新失败' },
      { status: 500 }
    )
  }
}
