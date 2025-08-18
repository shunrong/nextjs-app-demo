"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { generateMockCourses } from "@/lib/mock-data"
import { LayoutGrid, Table as TableIcon, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const PAGE_SIZE = 8

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

export default function CoursesPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")

  const allCourses = useMemo(() => generateMockCourses(58), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allCourses
    return allCourses.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q)
    )
  }, [query, allCourses])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(pageIndex, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
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
          data={pageItems}
          columns={[
            {
              header: "课程",
              accessorKey: "title",
              cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
            },
            { header: "分类", accessorKey: "category" },
            { header: "讲师", accessorKey: "teacher" },
            {
              header: "难度",
              accessorKey: "level",
              cell: ({ getValue }) =>
                ({ beginner: "入门", intermediate: "进阶", advanced: "高级" })[
                  String(getValue()) as "beginner" | "intermediate" | "advanced"
                ],
            },
            { header: "课时", accessorKey: "lessons" },
            { header: "学员", accessorKey: "students" },
            {
              header: "价格",
              accessorKey: "price",
              cell: ({ getValue }) => formatCurrency(Number(getValue())),
            },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) =>
                ({ draft: "草稿", published: "已发布", archived: "已归档" })[
                  String(getValue()) as "draft" | "published" | "archived"
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
          {pageItems.map(c => {
            // 根据分类选择渐变色
            const gradients = {
              前端: "from-emerald-400 to-emerald-600",
              后端: "from-blue-400 to-blue-600",
              数据: "from-orange-400 to-orange-600",
              设计: "from-red-400 to-red-600",
              测试: "from-purple-400 to-purple-600",
            }
            const gradient =
              gradients[c.category as keyof typeof gradients] || "from-gray-400 to-gray-600"

            return (
              <Card
                key={c.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                  {/* 促销标签 */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="sale"
                      className="bg-red-500 text-white text-xs px-2 py-1 rounded-sm"
                    >
                      暑期特惠
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
                      {c.category} 从基础到精通，大型复杂业务架构落地实践
                    </p>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="px-4 bg-white">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      {c.level === "beginner" && "初级"}
                      {c.level === "intermediate" && "中级"}
                      {c.level === "advanced" && "高级"}· {c.students}人报名
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-red-500 text-lg font-bold">
                        {formatCurrency(c.price)}
                      </span>
                      <span className="text-gray-400 text-sm line-through">
                        {formatCurrency(Math.floor(c.price * 1.5))}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
          {pageItems.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              没有匹配的课程
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {filtered.length} 条 · 第 {currentPage}/{totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => goToPage(1)} disabled={currentPage === 1}>
            首页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  )
}
