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
import {
  CourseCategory,
  CourseStatus,
  CourseTerm,
  courseStatusLabels,
  courseTermLabels,
} from "@/lib/enums"

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
  term: CourseTerm
  price: number
  banner?: string | null
  status: CourseStatus
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

  const PAGE_SIZE = tab === "card" ? 12 : 12

  const {
    data: courses,
    loading,
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

  const showLoading = loading

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

        <div className="flex items-center gap-3">
          <Button onClick={() => (window.location.href = "/courses/new")}>添加课程</Button>
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
                  return `${row.original.year}年${courseTermLabels[row.original.term]}`
                },
              },
              { header: "讲师", accessorKey: "teacher" },
              { header: "课时", accessorKey: "lessonCount" },
              { header: "学生", accessorKey: "enrolledStudents" },
              {
                header: "价格",
                accessorKey: "price",
                cell: ({ getValue }) => formatCurrency(Number(getValue())),
              },
              {
                header: "状态",
                accessorKey: "status",
                cell: ({ row }) => courseStatusLabels[row.original.status],
              },
              {
                header: "更新于",
                accessorKey: "updatedAt",
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
                      onClick={() => (window.location.href = `/courses/${row.original.id}`)}
                    >
                      查看
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() =>
                        (window.location.href = `/courses/${row.original.id}?mode=edit`)
                      }
                    >
                      编辑
                    </Button>
                    <Button
                      size="sm"
                      variant="link"
                      onClick={() =>
                        (window.location.href = `/courses/${row.original.id}?mode=copy`)
                      }
                    >
                      复制
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
                <Card key={i} className="overflow-hidden py-0 border-0 shadow-lg">
                  <div className="p-6">
                    <Skeleton className="h-5 w-20 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))
            : courses.map(c => {
                // 根据分类选择渐变色
                const gradients = {
                  [CourseCategory.DANCE]: "from-emerald-400 to-emerald-600",
                  [CourseCategory.PAINTING]: "from-blue-400 to-blue-600",
                  [CourseCategory.SPEECH]: "from-orange-400 to-orange-600",
                  [CourseCategory.MUSIC]: "from-red-400 to-red-600",
                }
                const gradient =
                  gradients[c.category as unknown as CourseCategory] || "from-gray-400 to-gray-600"

                return (
                  <Card
                    key={c.id}
                    className="overflow-hidden py-0 border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => (window.location.href = `/courses/${c.id}`)}
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
                            c.status === CourseStatus.OPEN
                              ? "bg-green-500"
                              : c.status === CourseStatus.DRAFT
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                          }`}
                        >
                          {courseStatusLabels[c.status]}
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
                          {c.year}年{courseTermLabels[c.term]}班{c.address && ` · ${c.address}`}
                        </div>
                      </div>
                    </div>

                    {/* 底部信息 */}
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          {c.lessonCount}课时 · {c.enrolledStudents}人报名
                        </span>
                        <span className="text-xs">授课老师：{c.teacher}</span>
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
