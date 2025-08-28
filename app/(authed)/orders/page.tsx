"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable, type DataTableProps } from "@/components/data-table"
import { PageTurning } from "@/components/page-turning"
import { useApi } from "@/hooks/use-api"
import { CourseTerm, courseTermLabels, OrderStatus, orderStatusLabels } from "@/lib/enums"

const PAGE_SIZE = 10

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 2,
  }).format(amount / 100) // 从分转换为元
}

function formatDateTime(input: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input))
}

interface Order {
  id: number
  studentName: string
  studentPhone: string
  parentName?: string | null
  parentPhone?: string | null
  courseTitle: string
  courseCategory: string
  year: number
  term: CourseTerm
  amount: number
  status: OrderStatus
  payTime?: string | null
  createdAt: string
}

export default function OrdersPage() {
  const [query, setQuery] = useState("")
  const [current, setCurrent] = useState(1)

  const {
    data: orders,
    total,
    loading,
  } = useApi<Order>("/api/orders", {
    page: current,
    limit: PAGE_SIZE,
    search: query,
  })

  const columns: DataTableProps<Order, unknown>["columns"] = [
    {
      header: "订单号",
      accessorKey: "id",
      cell: ({ row }) => `OD${String(row.original.id).padStart(6, "0")}`,
    },
    {
      header: "学生",
      accessorKey: "studentName",
      cell: ({ row }) => <span className="font-medium">{row.original.studentName}</span>,
    },
    {
      header: "课程",
      accessorKey: "courseTitle",
    },
    {
      header: "学期",
      accessorKey: "courseTerm",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.year}年{courseTermLabels[row.original.term]}
        </span>
      ),
    },

    {
      header: "金额",
      accessorKey: "amount",
      cell: ({ row }) => <span className="text-sm">{formatCurrency(row.original.amount)}</span>,
    },

    {
      header: "家长",
      accessorKey: "parentName",
      cell: ({ row }) => <span className="text-sm">{row.original.parentName}</span>,
    },

    {
      header: "状态",
      accessorKey: "status",
      cell: ({ row }) => <span className="text-sm">{orderStatusLabels[row.original.status]}</span>,
    },
    {
      header: "登记时间",
      accessorKey: "createdAt",
      cell: ({ row }) => <span className="text-sm">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      header: "操作",
      accessorKey: "id",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="link"
            onClick={() => (window.location.href = `/orders/${row.original.id}`)}
          >
            查看
          </Button>
          <Button
            size="sm"
            variant="link"
            onClick={() => (window.location.href = `/orders/${row.original.id}?mode=edit`)}
          >
            编辑
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="搜索订单号/学生/课程"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setCurrent(1)
          }}
          className="w-[300px]"
        />
        <Button onClick={() => (window.location.href = "/orders/new")}>报名缴费</Button>
      </div>

      <DataTable data={orders} loading={loading} columns={columns} />
      <PageTurning current={current} size={PAGE_SIZE} total={total} onChange={setCurrent} />
    </div>
  )
}
