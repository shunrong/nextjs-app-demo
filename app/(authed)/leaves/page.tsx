"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { Calendar, Clock, User, BookOpen, FileText } from "lucide-react"
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

function formatDate(input: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(input))
}

function formatTime(input: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input))
}

function formatDateTime(input: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input))
}

interface Leave {
  id: number
  studentId: number
  studentName: string
  studentPhone: string
  lessonId: number
  lessonTitle: string
  courseId: number
  courseTitle: string
  teacherName: string
  lessonDate: string
  lessonStartTime: string
  lessonEndTime: string
  reason: string | null
  createdAt: string
}

export default function LeavesPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)

  const {
    data: leaves,
    loading,
    totalPages,
  } = useApi<Leave>("/api/leaves", {
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
      <Input
        placeholder="搜索学生姓名/手机号/课程名称/请假理由"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setPageIndex(1)
        }}
        className="w-[400px]"
      />

      {showLoading ? (
        <div className="space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          key="id"
          pageSize={PAGE_SIZE}
          data={leaves}
          columns={[
            {
              header: "编号",
              accessorKey: "id",
              cell: ({ row }) => `LE${String(row.original.id).padStart(5, "0")}`,
            },
            {
              header: "学生信息",
              accessorKey: "studentName",
              cell: ({ row }) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.studentName}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{row.original.studentPhone}</div>
                </div>
              ),
            },
            {
              header: "课程信息",
              accessorKey: "courseTitle",
              cell: ({ row }) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-muted-foreground" />
                    <span className="font-medium">{row.original.courseTitle}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    教师：{row.original.teacherName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    课时：{row.original.lessonTitle}
                  </div>
                </div>
              ),
            },
            {
              header: "请假时间",
              accessorKey: "lessonDate",
              cell: ({ row }) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span>{formatDate(row.original.lessonDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4" />
                    <span>
                      {formatTime(row.original.lessonStartTime)} -{" "}
                      {formatTime(row.original.lessonEndTime)}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              header: "请假理由",
              accessorKey: "reason",
              cell: ({ getValue }) => {
                const reason = getValue() as string | null
                return reason ? (
                  <div className="flex items-start gap-2">
                    <FileText className="size-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm max-w-[200px] truncate" title={reason}>
                      {reason}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )
              },
            },
            {
              header: "申请时间",
              accessorKey: "createdAt",
              cell: ({ getValue }) => (
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(String(getValue()))}
                </span>
              ),
            },
          ]}
        />
      )}

      {leaves.length === 0 && !loading && (
        <div className="py-10 text-center text-muted-foreground">
          {query ? "没有匹配的请假记录" : "暂无请假记录"}
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
