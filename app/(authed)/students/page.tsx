"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { StudentImport } from "@/components/forms/StudentImport"
import { useApi } from "@/hooks/use-api"
import { LayoutGrid, Table as TableIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Gender, genderLabels } from "@/lib/enums"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

interface Student {
  id: number
  displayCode: string
  name: string
  phone: string
  gender: Gender
  parentName1: string
  parentPhone1: string
  parentRole1: string
  parentName2: string
  parentPhone2: string
  parentRole2: string
  enrolledCourses: number
  joinedAt: string
}

export default function StudentsPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")
  const [activeTab, setActiveTab] = useState("list") // 新增：list 或 import

  const PAGE_SIZE = tab === "card" ? 12 : 10

  const {
    data: students,
    loading,
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

  const showLoading = loading

  return (
    <div className="space-y-4">
      {/* 页面头部 */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">学生管理</h1>
        <div className="flex items-center gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">学生列表</TabsTrigger>
              <TabsTrigger value="import">批量导入</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="list">
          {/* 原有的学生列表内容 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Input
                placeholder="搜索学生姓名/手机号"
                value={query}
                onChange={e => {
                  setQuery(e.target.value)
                  setPageIndex(1)
                }}
                className="w-[260px]"
              />

              <div className="flex items-center gap-3">
                <Button onClick={() => (window.location.href = "/students/new")}>添加学生</Button>
                <Tabs value={tab} onValueChange={setTab}>
                  <TabsList>
                    <TabsTrigger value="card" aria-label="卡片视图">
                      <LayoutGrid className="size-4" />
                    </TabsTrigger>
                    <TabsTrigger value="table" aria-label="表格视图">
                      <TableIcon className="size-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* 原有的表格或卡片视图 */}
            {tab === "table" ? (
              showLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <DataTable
                  pageSize={PAGE_SIZE}
                  data={students}
                  columns={[
                    {
                      header: "编号",
                      accessorKey: "id",
                      cell: ({ row }) => `ST${String(row.original.id).padStart(6, "0")}`,
                    },
                    {
                      header: "姓名",
                      accessorKey: "name",
                      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
                    },
                    { header: "手机号", accessorKey: "phone" },
                    {
                      header: "性别",
                      accessorKey: "gender",
                      cell: ({ row }) => genderLabels[row.original.gender],
                    },
                    { header: "选课数", accessorKey: "enrolledCourses" },
                    {
                      header: "家长",
                      accessorKey: "parentName1",
                      cell: ({ row }) => {
                        const parent1 = row.original.parentName1
                        const phone1 = row.original.parentPhone1
                        return parent1 ? `${parent1}${phone1 ? ` (${phone1})` : ""}` : "-"
                      },
                    },
                    {
                      header: "入学时间",
                      accessorKey: "joinedAt",
                      cell: ({ getValue }) => formatDate(String(getValue())),
                    },
                    {
                      header: "操作",
                      accessorKey: "id",
                      cell: ({ row }) => (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() => (window.location.href = `/students/${row.original.id}`)}
                          >
                            查看
                          </Button>
                          <Button
                            size="sm"
                            variant="link"
                            onClick={() =>
                              (window.location.href = `/students/${row.original.id}?mode=edit`)
                            }
                          >
                            编辑
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              )
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {showLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i} className="overflow-hidden border-0 shadow-lg">
                        <div className="p-6">
                          <Skeleton className="h-5 w-20 mb-4" />
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      </Card>
                    ))
                  : students.map(s => {
                      // 使用默认渐变色
                      const gradient = "from-blue-400 to-blue-600"

                      return (
                        <Card
                          key={s.id}
                          className="overflow-hidden border-0 py-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                          onClick={() => (window.location.href = `/students/${s.id}`)}
                        >
                          <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                            {/* 学生编号 */}
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant="sale"
                                className="text-white text-xs px-2 py-1 rounded-sm bg-white/20"
                              >
                                {`ST${String(s.id).padStart(6, "0")}`}
                              </Badge>
                            </div>

                            {/* 图标 */}
                            <div className="absolute top-4 right-4">
                              <div className="bg-white/20 rounded-lg p-3">
                                {/* <User className="size-8 text-white" /> */}
                              </div>
                            </div>

                            {/* 学生信息 */}
                            <div className="mt-8">
                              <h3 className="text-xl font-bold mb-2">{s.name}</h3>
                              <p className="text-white/90 text-sm">
                                {genderLabels[s.gender]} · {s.phone}
                              </p>
                              {s.parentName1 && (
                                <p className="text-white/80 text-xs mt-1">家长：{s.parentName1}</p>
                              )}
                            </div>
                          </div>

                          {/* 底部信息 */}
                          <div className="p-4 bg-card">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                              <span className="flex items-center gap-1">
                                {/* <BookOpen className="size-4" /> */}
                                选课 {s.enrolledCourses} 门
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

            {!loading && totalPages > 1 && (
              <Pagination className="flex items-center justify-center">
                {(() => {
                  const max = totalPages || 1
                  const canPrev = pageIndex > 1 && !loading
                  const canNext = pageIndex < max && !loading
                  const start = Math.max(2, pageIndex - 1)
                  const end = Math.min(max - 1, pageIndex + 1)
                  const showLeftEllipsis = start > 2
                  const showRightEllipsis = end < max - 1

                  return (
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={e => {
                            e.preventDefault()
                            if (canPrev) goToPage(pageIndex - 1)
                          }}
                          className={!canPrev ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={pageIndex === 1}
                          onClick={e => {
                            e.preventDefault()
                            goToPage(1)
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {showLeftEllipsis && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {Array.from(
                        { length: Math.max(0, end - start + 1) },
                        (_, i) => start + i
                      ).map(n => (
                        <PaginationItem key={n}>
                          <PaginationLink
                            href="#"
                            isActive={pageIndex === n}
                            onClick={e => {
                              e.preventDefault()
                              goToPage(n)
                            }}
                          >
                            {n}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {showRightEllipsis && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {max > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={pageIndex === max}
                            onClick={e => {
                              e.preventDefault()
                              goToPage(max)
                            }}
                          >
                            {max}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={e => {
                            e.preventDefault()
                            if (canNext) goToPage(pageIndex + 1)
                          }}
                          className={!canNext ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  )
                })()}
              </Pagination>
            )}
          </div>
        </TabsContent>

        <TabsContent value="import">
          <StudentImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
