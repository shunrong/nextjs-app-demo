"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
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

interface Student {
  id: string
  name: string
  email: string
  phone: string | null
  gender: "MALE" | "FEMALE" | null
  credits: number
  status: "ACTIVE" | "SUSPENDED" | "GRADUATED"
  enrolledCourses: number
  joinedAt: string
}

export default function StudentsPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("table")

  const {
    data: students,
    loading,
    error,
    total,
    totalPages,
  } = useApi<Student>("/api/students", {
    page: pageIndex,
    limit: PAGE_SIZE,
    search: query,
  })

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
  }

  if (loading && students.length === 0) {
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
          data={students}
          columns={[
            {
              header: "姓名",
              accessorKey: "name",
              cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
            },
            { header: "邮箱", accessorKey: "email" },
            { header: "手机号", accessorKey: "phone", cell: ({ getValue }) => getValue() || "-" },
            {
              header: "性别",
              accessorKey: "gender",
              cell: ({ getValue }) => {
                const gender = getValue() as "MALE" | "FEMALE" | null
                return gender === "MALE" ? "男" : gender === "FEMALE" ? "女" : "-"
              },
            },
            { header: "选课数", accessorKey: "enrolledCourses" },
            { header: "学分", accessorKey: "credits" },
            {
              header: "状态",
              accessorKey: "status",
              cell: ({ getValue }) =>
                ({ ACTIVE: "在读", SUSPENDED: "休学", GRADUATED: "毕业" })[
                  String(getValue()) as "ACTIVE" | "SUSPENDED" | "GRADUATED"
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
          {students.map(s => {
            // 根据状态选择渐变色
            const gradients = {
              ACTIVE: "from-green-400 to-green-600",
              SUSPENDED: "from-yellow-400 to-yellow-600",
              GRADUATED: "from-blue-400 to-blue-600",
            }
            const gradient = gradients[s.status] || "from-gray-400 to-gray-600"

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
                        s.status === "ACTIVE"
                          ? "bg-green-500"
                          : s.status === "SUSPENDED"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    >
                      {s.status === "ACTIVE" ? "在读" : s.status === "SUSPENDED" ? "休学" : "毕业"}
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
                      {s.gender === "MALE" ? "男" : s.gender === "FEMALE" ? "女" : ""} · {s.email}
                    </p>
                  </div>
                </div>

                {/* 底部信息 */}
                <div className="p-4 bg-card">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="size-4" />
                      选课 {s.enrolledCourses} 门
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="size-4" />
                      学分 {s.credits}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    入学时间：{formatDate(s.joinedAt)}
                  </div>
                </div>
              </Card>
            )
          })}
          {students.length === 0 && !loading && (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              {query ? "没有匹配的学生" : "暂无学生数据"}
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
