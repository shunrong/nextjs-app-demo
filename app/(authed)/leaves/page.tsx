"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { DataTable, type DataTableProps } from "@/components/data-table"
import { useApi } from "@/hooks/use-api"
import { Calendar, Clock, User, BookOpen, FileText } from "lucide-react"
import { PageTurning } from "@/components/page-turning"

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
  const [current, setCurrent] = useState(1)

  const {
    data: leaves,
    loading,
    total,
  } = useApi<Leave>("/api/leaves", {
    page: current,
    limit: PAGE_SIZE,
    search: query,
  })

  const columns: DataTableProps<Leave, unknown>["columns"] = [
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
          <div className="text-sm text-muted-foreground">教师：{row.original.teacherName}</div>
          <div className="text-sm text-muted-foreground">课时：{row.original.lessonTitle}</div>
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
              {formatTime(row.original.lessonStartTime)} - {formatTime(row.original.lessonEndTime)}
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
        <span className="text-sm text-muted-foreground">{formatDateTime(String(getValue()))}</span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Input
        placeholder="搜索学生姓名/手机号/课程名称/请假理由"
        value={query}
        onChange={e => {
          setQuery(e.target.value)
          setCurrent(1)
        }}
        className="w-[400px]"
      />
      <DataTable data={leaves} loading={loading} columns={columns} />
      <PageTurning current={current} size={PAGE_SIZE} total={total} onChange={setCurrent} />
    </div>
  )
}
