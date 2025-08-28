"use client"

import { useState } from "react"
import { UserCheck, BookOpen } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, type DataTableProps } from "@/components/data-table"
import { DataCards } from "@/components/data-cards"
import { ViewToggle } from "@/components/view-toggle"
import { Badge } from "@/components/ui/badge"
import { PageTurning } from "@/components/page-turning"
import { useApi } from "@/hooks/use-api"
import { Gender, genderLabels, Job, jobLabels } from "@/lib/enums"

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
  nick?: string
  phone: string
  gender: Gender
  avatar?: string | null
  job: Job
  courseCount: number
  joinedAt: string
}

export default function TeachersPage() {
  const [query, setQuery] = useState("")
  const [current, setCurrent] = useState(1)
  const [tab, setTab] = useState("card")

  const PAGE_SIZE = tab === "card" ? 12 : 10

  const {
    data: teachers,
    total,
    loading,
  } = useApi<Teacher>("/api/teachers", {
    page: current,
    limit: PAGE_SIZE,
    search: query,
  })

  const columns: DataTableProps<Teacher, unknown>["columns"] = [
    {
      header: "编号",
      accessorKey: "id",
      cell: ({ row }) => `TC${String(row.original.id).padStart(3, "0")}`,
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
    {
      header: "职位",
      accessorKey: "job",
      cell: ({ row }) => jobLabels[row.original.job],
    },
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
            onClick={() => (window.location.href = `/teachers/${row.original.id}?mode=edit`)}
          >
            编辑
          </Button>
        </div>
      ),
    },
  ]

  const renderContent = (t: Teacher) => {
    // 根据职位选择渐变色
    const gradients = {
      [Job.TEACHER]: "from-cyan-400 to-cyan-600",
      [Job.ASSISTANT]: "from-purple-400 to-purple-600",
    }
    const gradient = gradients[t.job]

    return (
      <Card
        key={t.id}
        className="overflow-hidden border-0 py-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => (window.location.href = `/teachers/${t.id}`)}
      >
        <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
          {/* 教师编号 */}
          <div className="absolute top-4 left-4">
            <Badge variant="sale" className="text-white text-xs px-2 py-1 rounded-sm bg-white/20">
              {`TC${String(t.id).padStart(3, "0")}`}
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
              {genderLabels[t.gender]} · {t.phone}
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="p-4 bg-card">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <BookOpen className="size-4" />
              {t.courseCount} 门课程
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="size-4" />
              {t.nick}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">加入时间：{formatDate(t.joinedAt)}</div>
        </div>
      </Card>
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
            setCurrent(1)
          }}
          className="w-[260px]"
        />
        <div className="flex items-center gap-3">
          <Button onClick={() => (window.location.href = "/teachers/new")}>录入教师</Button>
          <ViewToggle tab={tab} setTab={setTab} />
        </div>
      </div>

      {tab === "card" ? (
        <DataCards data={teachers} loading={loading} renderContent={renderContent} />
      ) : (
        <DataTable data={teachers} loading={loading} columns={columns} />
      )}
      <PageTurning current={current} size={PAGE_SIZE} total={total} onChange={setCurrent} />
    </div>
  )
}
