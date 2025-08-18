"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  Receipt,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Calendar,
  Clock,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// 模拟数据
const monthlyData = [
  { month: "1月", students: 45, revenue: 12000, courses: 8 },
  { month: "2月", students: 52, revenue: 15600, courses: 12 },
  { month: "3月", students: 48, revenue: 14400, courses: 10 },
  { month: "4月", students: 61, revenue: 18300, courses: 15 },
  { month: "5月", students: 55, revenue: 16500, courses: 13 },
  { month: "6月", students: 67, revenue: 20100, courses: 18 },
]

const courseCategories = [
  { name: "前端开发", value: 35, color: "#10b981" },
  { name: "后端开发", value: 25, color: "#3b82f6" },
  { name: "数据分析", value: 20, color: "#f59e0b" },
  { name: "设计", value: 15, color: "#ef4444" },
  { name: "测试", value: 5, color: "#8b5cf6" },
]

const recentActivities = [
  {
    type: "new_student",
    user: "张三",
    action: "新学员注册",
    time: "5分钟前",
    course: "React 进阶课程",
  },
  {
    type: "course_complete",
    user: "李四",
    action: "完成课程",
    time: "12分钟前",
    course: "Node.js 实战",
  },
  {
    type: "new_order",
    user: "王五",
    action: "购买课程",
    time: "25分钟前",
    course: "TypeScript 深入",
  },
  {
    type: "teacher_join",
    user: "陈老师",
    action: "加入平台",
    time: "1小时前",
    course: "Vue3 高级开发",
  },
  {
    type: "course_publish",
    user: "刘老师",
    action: "发布新课程",
    time: "2小时前",
    course: "Python 数据科学",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">欢迎回来！这里是您的教育管理平台数据概览。</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总学员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% 较上月
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃课程</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% 较上月
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥20,100</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3% 较上月
            </div>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在线教师</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              -2.1% 较上月
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* 收入趋势图 */}
        <Card className="col-span-4 py-4">
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
        <Card className="col-span-3 py-4">
          <CardHeader>
            <CardTitle>课程分类分布</CardTitle>
            <CardDescription>各类别课程占比情况</CardDescription>
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
                <Tooltip formatter={value => [`${value}%`, "占比"]} />
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
                  <span className="font-medium">{category.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 学员增长和最近活动 */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* 学员增长柱状图 */}
        <Card className="col-span-4 py-4">
          <CardHeader>
            <CardTitle>学员增长</CardTitle>
            <CardDescription>过去6个月新增学员数量</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card className="col-span-3 py-4">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>平台最新动态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === "new_student" && (
                      <Users className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === "course_complete" && (
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "new_order" && (
                      <Receipt className="h-4 w-4 text-orange-600" />
                    )}
                    {activity.type === "teacher_join" && (
                      <UserCheck className="h-4 w-4 text-purple-600" />
                    )}
                    {activity.type === "course_publish" && (
                      <Activity className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.user} {activity.action}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{activity.course}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card className="py-4">
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>常用功能快速入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Users className="h-6 w-6" />
              <span>添加学员</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
            >
              <GraduationCap className="h-6 w-6" />
              <span>创建课程</span>
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
