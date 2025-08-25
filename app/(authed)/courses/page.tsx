"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { LayoutGrid, Table as TableIcon, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const PAGE_SIZE = 8

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(amount / 100) // 从分转换为元
}

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

interface Course {
  id: number
  displayCode: string
  title: string
  subtitle?: string | null
  category: string
  year: number
  term: "SPRING" | "SUMMER" | "AUTUMN" | "WINTER"
  price: number
  banner?: string | null
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  address?: string | null
  teacher: string
  teacherId: number
  assistantId?: number | null
  enrolledStudents: number
  lessonCount: number
  createdAt: string
  updatedAt: string
}

export default function CoursesPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")

  const {
    data: courses,
    loading,
    error,
    total,
    totalPages,
  } = useApi<Course>("/api/courses", {
    page: pageIndex,
    limit: PAGE_SIZE,
    search: query,
  })

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
  }

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">加载失败: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="搜索课程/分类/讲师"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setPageIndex(1)
          }}
          className="w-[260px]"
        />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="table" aria-label="表格视图">
              <TableIcon className="size-4" />
            </TabsTrigger>
            <TabsTrigger value="card" aria-label="卡片视图">
              <LayoutGrid className="size-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tab === "table" ? (
        <DataTable
          pageSize={PAGE_SIZE}
          data={courses}
          columns={[
            {
              header: "编号",
              accessorKey: "displayCode",
              cell: ({ getValue }) => (
                <span className="font-mono text-sm">{String(getValue())}</span>
              ),
            },
            {
              header: "课程",
              accessorKey: "title",
              cell: ({ row }) => (
                <div>
                  <span className="font-medium">{row.original.title}</span>
                  {row.original.subtitle && (
                    <div className="text-xs text-muted-foreground">{row.original.subtitle}</div>
                  )}
                </div>
              ),
            },
            { header: "分类", accessorKey: "category" },
            {
              header: "学期",
              accessorKey: "term",
              cell: ({ row }) => {
                return `${row.original.year}年${row.original.term}`
              },
            },
            { header: "讲师", accessorKey: "teacher" },
            { header: "课时", accessorKey: "lessonCount" },
            { header: "学员", accessorKey: "enrolledStudents" },
            {
              header: "价格",
              accessorKey: "price",
              cell: ({ getValue }) => formatCurrency(Number(getValue())),
            },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) =>
                ({ DRAFT: "草稿", PUBLISHED: "已发布", ARCHIVED: "已归档" })[
                  String(getValue()) as "DRAFT" | "PUBLISHED" | "ARCHIVED"
                ],
            },
            {
              header: "更新于",
              accessorKey: "updatedAt",
              cell: ({ getValue }) => formatDate(String(getValue())),
            },
          ]}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => {
            // 根据分类选择渐变色
            const gradients = {
              数学: "from-emerald-400 to-emerald-600",
              英语: "from-blue-400 to-blue-600",
              物理: "from-orange-400 to-orange-600",
              化学: "from-red-400 to-red-600",
              编程: "from-purple-400 to-purple-600",
            }
            const gradient =
              gradients[c.category as keyof typeof gradients] || "from-gray-400 to-gray-600"

            return (
              <Card
                key={c.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                  {/* 课程编号 */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="sale"
                      className="text-white text-xs px-2 py-1 rounded-sm bg-white/20"
                    >
                      {c.displayCode}
                    </Badge>
                  </div>

                  {/* 状态标签 */}
                  <div className="absolute top-4 right-16">
                    <Badge
                      variant="sale"
                      className={`text-white text-xs px-2 py-1 rounded-sm ${
                        c.status === "PUBLISHED"
                          ? "bg-green-500"
                          : c.status === "DRAFT"
                            ? "bg-yellow-500"
                            : "bg-gray-500"
                      }`}
                    >
                      {c.status === "PUBLISHED"
                        ? "已发布"
                        : c.status === "DRAFT"
                          ? "草稿"
                          : "已归档"}
                    </Badge>
                  </div>

                  {/* 图标 */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <BookOpen className="size-8 text-white" />
                    </div>
                  </div>

                  {/* 标题和描述 */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{c.title}</h3>
                    <p className="text-white/90 text-sm line-clamp-2">
                      {c.subtitle || `${c.category} 专业课程，由 ${c.teacher} 授课`}
                    </p>
                    <div className="text-white/80 text-xs mt-1">
                      {c.year}年
                      {c.term === "SPRING"
                        ? "春季"
                        : c.term === "SUMMER"
                          ? "暑期"
                          : c.term === "AUTUMN"
                            ? "秋季"
                            : "冬季"}
                      学期
                      {c.address && ` · ${c.address}`}
                    </div>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="p-4 bg-card">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      {c.lessonCount}课时 · {c.enrolledStudents}人报名
                    </span>
                    <span className="text-xs">授课：{c.teacher}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-destructive text-lg font-bold">
                        {formatCurrency(c.price)}
                      </span>
                      <span className="text-muted-foreground text-sm line-through">
                        {formatCurrency(Math.floor(c.price * 1.2))}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
          {courses.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              {query ? "没有匹配的课程" : "暂无课程数据"}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {total} 条 · 第 {pageIndex}/{totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => goToPage(1)}
            disabled={pageIndex === 1 || loading}
          >
            首页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 1 || loading}
          >
            上一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === totalPages || loading}
          >
            下一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(totalPages)}
            disabled={pageIndex === totalPages || loading}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  )
}
