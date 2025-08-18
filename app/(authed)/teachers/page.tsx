"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { generateMockTeachers } from "@/lib/mock-data"
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

export default function TeachersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")

  const all = useMemo(() => generateMockTeachers(13), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.skills.join(" ").toLowerCase().includes(q)
    )
  }, [query, all])

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
          data={pageItems}
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
              cell: ({ getValue }) =>
                Array.isArray(getValue()) ? (getValue() as string[]).join("、") : "",
            },
            { header: "课程数", accessorKey: "courses" },
            { header: "评分", accessorKey: "rating" },
            {
              header: "加入时间",
              accessorKey: "joinedAt",
              cell: ({ getValue }) => formatDate(String(getValue())),
            },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) => (String(getValue()) === "active" ? "在职" : "停用"),
            },
          ]}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map(t => {
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
                        t.status === "active" ? "bg-green-500" : "bg-gray-500"
                      }`}
                    >
                      {t.status === "active" ? "在职" : "停用"}
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
                      {t.title} · {t.skills.slice(0, 2).join("、")}
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
                      {t.rating}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    加入时间：{formatDate(t.joinedAt)}
                  </div>
                </div>
              </Card>
            )
          })}
          {pageItems.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              没有匹配的教师
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
