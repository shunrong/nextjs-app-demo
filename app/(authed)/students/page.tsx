"use client"

import { useState } from "react"
import Image from "next/image"
import { BookOpen, PhoneCall, Calendar1 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { DataTable, type DataTableProps } from "@/components/data-table"
import { DataCards } from "@/components/data-cards"
import { ViewToggle } from "@/components/view-toggle"
import { PageTurning } from "@/components/page-turning"
import { StudentImport } from "@/components/forms/StudentImport"
import { useApi } from "@/hooks/use-api"
import { Gender, genderLabels } from "@/lib/enums"
import boyAvatar from "@/public/boy.png"
import girlAvatar from "@/public/girl.png"

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
  nick: string
  photo: string
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
  const [current, setCurrent] = useState(1)
  const [tab, setTab] = useState("card")

  const PAGE_SIZE = tab === "card" ? 12 : 10

  const {
    data: students,
    total,
    loading,
  } = useApi<Student>("/api/students", {
    page: current,
    limit: PAGE_SIZE,
    search: query,
  })

  const columns: DataTableProps<Student, unknown>["columns"] = [
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
            onClick={() => (window.location.href = `/students/${row.original.id}?mode=edit`)}
          >
            编辑
          </Button>
        </div>
      ),
    },
  ]

  const renderContent = (s: Student) => {
    // 使用默认渐变色
    const gradient =
      s.gender === Gender.MALE ? "from-blue-400 to-blue-600" : "from-purple-400 to-purple-600"

    return (
      <Card
        key={s.id}
        className="overflow-hidden border-0 py-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
        onClick={() => (window.location.href = `/students/${s.id}`)}
      >
        <div className={`bg-gradient-to-br ${gradient} p-6 text-white relative`}>
          {/* 学生编号 */}
          <div className="absolute top-4 left-4">
            <Badge variant="sale" className="text-white text-xs px-2 py-1 rounded-sm bg-white/20">
              {`ST${String(s.id).padStart(6, "0")}`}
            </Badge>
          </div>

          {/* 图标 */}
          <div className="absolute top-6 right-6">
            <Image
              className="rounded-lg w-[70px] h-[90px] object-cover overflow-hidden"
              src={s.photo || (s.gender === Gender.MALE ? boyAvatar : girlAvatar)}
              alt={s.name}
            />
          </div>

          {/* 学生信息 */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">{s.name}</h3>
            <p className="text-white/90 text-sm">
              {genderLabels[s.gender]} · 家长：{s.parentName1}
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="p-4 bg-card text-xs text-muted-foreground">
          <div className="flex items-center justify-between  mb-3">
            <span className="flex items-center gap-1">
              <BookOpen className="size-4" />
              选课 {s.enrolledCourses} 门
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="size-4" />
              {s.phone}
            </span>
          </div>

          <div className="flex items-center justify-between  mb-3">
            <span className="flex items-center gap-1">
              <Calendar1 className="size-4" />
              {formatDate(s.joinedAt)}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="搜索姓名/手机号"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setCurrent(1)
          }}
          className="w-[260px]"
        />

        <div className="flex items-center gap-3">
          <Button onClick={() => (window.location.href = "/students/new")}>添加学生</Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button>批量导入</Button>
            </SheetTrigger>
            <SheetContent style={{ minWidth: "800px" }}>
              <SheetHeader>
                <SheetTitle>批量导入</SheetTitle>
                <div className="mt-4">
                  <StudentImport />
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
          <ViewToggle tab={tab} setTab={setTab} />
        </div>
      </div>

      {tab === "card" ? (
        <DataCards data={students} loading={loading} renderContent={renderContent} />
      ) : (
        <DataTable data={students} loading={loading} columns={columns} />
      )}

      <PageTurning current={current} size={PAGE_SIZE} total={total} onChange={setCurrent} />
    </div>
  )
}
