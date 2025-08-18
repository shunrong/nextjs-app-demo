"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { generateMockStudents } from "@/lib/mock-data"
import { LayoutGrid, Table as TableIcon, User, GraduationCap, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const PAGE_SIZE = 10

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

export default function StudentsPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")

  const all = useMemo(() => generateMockStudents(293), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      s =>
        s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)
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
          placeholder="搜索姓名/邮箱/手机号"
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
            { header: "手机号", accessorKey: "phone" },
            {
              header: "性别",
              accessorKey: "gender",
              cell: ({ getValue }) => (String(getValue()) === "male" ? "男" : "女"),
            },
            { header: "选课数", accessorKey: "enrolledCourses" },
            { header: "学分", accessorKey: "credits" },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) =>
                ({ active: "在读", suspended: "休学", graduated: "毕业" })[
                  String(getValue()) as "active" | "suspended" | "graduated"
                ],
            },
            {
              header: "入学时间",
              accessorKey: "joinedAt",
              cell: ({ getValue }) => formatDate(String(getValue())),
            },
          ]}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map(s => {
            // 根据状态选择渐变色
            const gradients = {
              active: "from-green-400 to-green-600",
              suspended: "from-yellow-400 to-yellow-600",
              graduated: "from-blue-400 to-blue-600",
            }
            const gradient =
              gradients[s.status as keyof typeof gradients] || "from-gray-400 to-gray-600"

            return (
              <Card
                key={s.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                  {/* 状态标签 */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      variant="sale"
                      className={`text-white text-xs px-2 py-1 rounded-sm ${
                        s.status === "active"
                          ? "bg-green-500"
                          : s.status === "suspended"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {s.status === "active" ? "在读" : s.status === "suspended" ? "休学" : "毕业"}
                    </Badge>
                  </div>

                  {/* 图标 */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <User className="size-8 text-white" />
                    </div>
                  </div>

                  {/* 学生信息 */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                    <p className="text-white/90 text-sm">
                      {s.gender === "male" ? "男" : "女"} · {s.email}
                    </p>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="px-4 bg-white">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-4" />
                      选课 {s.enrolledCourses} 门
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="size-4" />
                      学分 {s.credits}
                    </span>
                  </div>

                  <div className="pb-4 text-xs text-gray-500">
                    入学时间：{formatDate(s.joinedAt)}
                  </div>
                </div>
              </Card>
            )
          })}
          {pageItems.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              没有匹配的学生
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
