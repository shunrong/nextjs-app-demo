"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  Receipt,
  UserCheck,
  TrendingUp,
  Activity,
  DollarSign,
  Calendar,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalOrders: number
  totalTeachers: number
  monthlyRevenue: number
  courseCategories: Array<{ name: string; count: number }>
  recentOrders: Array<{
    id: string
    orderNo: string
    studentName: string
    courseTitle: string
    amount: number
    status: string
    createdAt: string
  }>
}

// 模拟月度数据（后续可以从 API 获取）
const monthlyData = [
  { month: "1月", students: 45, revenue: 12000, courses: 8 },
  { month: "2月", students: 52, revenue: 15600, courses: 12 },
  { month: "3月", students: 48, revenue: 14400, courses: 10 },
  { month: "4月", students: 61, revenue: 18300, courses: 15 },
  { month: "5月", students: 55, revenue: 16500, courses: 13 },
  { month: "6月", students: 67, revenue: 20100, courses: 18 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()
      if (response.ok && result.success) {
        setStats(result.data)
      } else {
        const message = result.error || "获取统计数据失败"
        setError(message)
        toast.error(message, {
          action: { label: "重试", onClick: () => fetchStats() },
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "网络错误"
      setError(message)
      toast.error(message, {
        action: { label: "重试", onClick: () => fetchStats() },
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (loading || (!stats && !error)) {
    return (
      <div className="space-y-6">
        {/* 页面标题骨架 */}
        <Skeleton className="h-5 w-64" />

        {/* 统计卡片骨架 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-28 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 图表区骨架 */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-32 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>

        {/* 最近订单骨架 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 快速操作骨架 */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24 mb-2" />
            <Skeleton className="h-4 w-32 mb-2" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!stats) {
    // 错误已通过 toast 提示，这里不再渲染错误块
    return null
  }

  // 转换课程分类数据为图表格式
  const courseCategories = stats.courseCategories.map((cat, index) => ({
    name: cat.name,
    value: cat.count,
    color: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5],
  }))

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <p className="text-muted-foreground">欢迎回来！这里是您的平台数据概览。</p>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总学生数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              活跃学生
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃课程</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              已发布课程
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥
              {(stats.monthlyRevenue / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              已支付订单
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线教师</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <div className="flex items-center text-xs text-blue-600">
              <Activity className="h-3 w-3 mr-1" />
              活跃教师
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* 收入趋势图 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>收入趋势</CardTitle>
            <CardDescription>过去6个月的收入变化情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={value => [`¥${value}`, "收入"]} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 课程分类饼图 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>课程分类分布</CardTitle>
            <CardDescription>各类别课程数量</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={courseCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {courseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={value => [`${value}门`, "课程数"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {courseCategories.map(category => (
                <div key={category.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                  <span className="font-medium">{category.value}门</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近订单 */}
      <Card>
        <CardHeader>
          <CardTitle>最近订单</CardTitle>
          <CardDescription>最新的课程购买记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Receipt className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{order.studentName} 购买了课程</div>
                    <div className="text-sm text-muted-foreground">{order.courseTitle}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">¥{(order.amount / 100).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="text-center text-muted-foreground py-8">暂无订单记录</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>添加学生</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <GraduationCap className="h-6 w-6" />
              <span>添加课程</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <UserCheck className="h-6 w-6" />
              <span>邀请教师</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <Calendar className="h-6 w-6" />
              <span>查看日程</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
