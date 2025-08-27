"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { LayoutGrid, Table as TableIcon, UserCheck, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

const PAGE_SIZE = 10

function formatDate(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

interface Teacher {
  id: number
  displayCode: string
  name: string
  email?: string | null
  phone: string
  gender?: "MALE" | "FEMALE" | null
  avatar?: string | null
  position: string
  courseCount: number
  joinedAt: string
}

export default function TeachersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)
  const [tab, setTab] = useState("card")

  const {
    data: teachers,
    loading,
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

  const showLoading = loading

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
        <div className="flex items-center gap-3">
          <Button onClick={() => (window.location.href = "/teachers/new")}>录入教师</Button>
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
            data={teachers}
            columns={[
              {
                header: "编号",
                accessorKey: "displayCode",
                cell: ({ getValue }) => (
                  <span className="font-mono text-sm">{String(getValue())}</span>
                ),
              },
              {
                header: "姓名",
                accessorKey: "name",
                cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
              },
              { header: "手机号", accessorKey: "phone" },
              { header: "邮箱", accessorKey: "email", cell: ({ getValue }) => getValue() || "-" },
              {
                header: "性别",
                accessorKey: "gender",
                cell: ({ getValue }) => {
                  const gender = getValue() as "MALE" | "FEMALE" | null
                  return gender === "MALE" ? "男" : gender === "FEMALE" ? "女" : "-"
                },
              },
              { header: "职位", accessorKey: "position" },
              { header: "课程数", accessorKey: "courseCount" },
              {
                header: "加入时间",
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
                      onClick={() => (window.location.href = `/teachers/${row.original.id}`)}
                    >
                      查看
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() =>
                        (window.location.href = `/teachers/${row.original.id}?mode=edit`)
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
            : teachers.map(t => {
                // 根据职位选择渐变色
                const gradients = {
                  主课: "from-cyan-400 to-cyan-600",
                  助教: "from-purple-400 to-purple-600",
                }
                const gradient =
                  gradients[t.position as keyof typeof gradients] || "from-gray-400 to-gray-600"

                return (
                  <Card
                    key={t.id}
                    className="overflow-hidden border-0 py-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => (window.location.href = `/teachers/${t.id}`)}
                  >
                    <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
                      {/* 教师编号 */}
                      <div className="absolute top-4 left-4">
                        <Badge
                          variant="sale"
                          className="text-white text-xs px-2 py-1 rounded-sm bg-white/20"
                        >
                          {t.displayCode}
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
                          {t.position} ·{" "}
                          {t.gender === "MALE" ? "男" : t.gender === "FEMALE" ? "女" : ""} ·{" "}
                          {t.phone}
                        </p>
                        {t.email && <p className="text-white/80 text-xs mt-1">{t.email}</p>}
                      </div>
                    </div>

                    {/* 底部信息 */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-4" />
                          {t.courseCount} 门课程
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

                {Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i).map(
                  n => (
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
                  )
                )}

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
  )
}
