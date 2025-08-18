"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { LayoutGrid, Table as TableIcon, UserCheck, Star, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const PAGE_SIZE = 12

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

interface Teacher {
  id: string
  name: string
  email: string
  title: string
  skills: string[]
  courses: number
  rating: number
  status: "ACTIVE" | "SUSPENDED"
  joinedAt: string
  banner?: string | null
}

export default function TeachersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("table")

  const {
    data: teachers,
    loading,
    error,
    total,
    totalPages,
  } = useApi<Teacher>("/api/teachers", {
    page: pageIndex,
    limit: PAGE_SIZE,
    search: query,
  })

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
  }

  if (loading && teachers.length === 0) {
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
          placeholder="搜索姓名/邮箱/技能"
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
          data={teachers}
          columns={[
            {
              header: "姓名",
              accessorKey: "name",
              cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
            },
            { header: "邮箱", accessorKey: "email" },
            { header: "职称", accessorKey: "title" },
            {
              header: "技能",
              accessorKey: "skills",
              cell: ({ getValue }) => {
                const skills = getValue() as string[]
                return skills.length > 0 ? skills.join("、") : "-"
              },
            },
            { header: "课程数", accessorKey: "courses" },
            {
              header: "评分",
              accessorKey: "rating",
              cell: ({ getValue }) => {
                const rating = Number(getValue())
                return rating > 0 ? rating.toFixed(1) : "-"
              },
            },
            {
              header: "加入时间",
              accessorKey: "joinedAt",
              cell: ({ getValue }) => formatDate(String(getValue())),
            },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) => (String(getValue()) === "ACTIVE" ? "在职" : "停用"),
            },
          ]}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map(t => {
            // 根据职称选择渐变色
            const gradients = {
              讲师: "from-cyan-400 to-cyan-600",
              高级讲师: "from-purple-400 to-purple-600",
              副教授: "from-indigo-400 to-indigo-600",
              教授: "from-pink-400 to-pink-600",
            }
            const gradient =
              gradients[t.title as keyof typeof gradients] || "from-gray-400 to-gray-600"

            return (
              <Card
                key={t.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                  {/* 状态标签 */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="sale"
                      className={`text-white text-xs px-2 py-1 rounded-sm ${
                        t.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {t.status === "ACTIVE" ? "在职" : "停用"}
                    </Badge>
                  </div>

                  {/* 图标 */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <UserCheck className="size-8 text-white" />
                    </div>
                  </div>

                  {/* 教师信息 */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-2">{t.name}</h3>
                    <p className="text-white/90 text-sm">
                      {t.title} · {t.skills.slice(0, 2).join("、") || "暂无技能标签"}
                    </p>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="p-4 bg-card">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-4" />
                      {t.courses} 门课程
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="size-4 fill-current text-yellow-400" />
                      {t.rating > 0 ? t.rating.toFixed(1) : "暂无评分"}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    加入时间：{formatDate(t.joinedAt)}
                  </div>
                </div>
              </Card>
            )
          })}
          {teachers.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              {query ? "没有匹配的教师" : "暂无教师数据"}
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
