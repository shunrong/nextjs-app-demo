"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useApi } from "@/hooks/use-api"

const PAGE_SIZE = 12

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
  orderNo: string
  studentName: string
  studentPhone: string
  parentName?: string | null
  parentPhone?: string | null
  courseTitle: string
  courseCategory: string
  courseTerm: string
  amount: number
  status: "REGISTERED" | "REFUNDED"
  payTime?: string | null
  createdAt: string
}

export default function OrdersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)

  const {
    data: orders,
    loading,
    error,
    total,
    totalPages,
  } = useApi<Order>("/api/orders", {
    page: pageIndex,
    limit: PAGE_SIZE,
    search: query,
  })

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
  }

  if (loading && orders.length === 0) {
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
          placeholder="搜索订单号/学生/课程"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setPageIndex(1)
          }}
          className="w-[300px]"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>报名登记号</TableHead>
              <TableHead>学生</TableHead>
              <TableHead>课程</TableHead>
              <TableHead>学期</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>家长</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>登记时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{o.studentName}</div>
                    <div className="text-xs text-muted-foreground">{o.studentPhone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{o.courseTitle}</div>
                    <div className="text-xs text-muted-foreground">{o.courseCategory}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{o.courseTerm}</span>
                </TableCell>
                <TableCell>{formatCurrency(o.amount)}</TableCell>
                <TableCell>
                  {o.parentName ? (
                    <div>
                      <div className="text-sm">{o.parentName}</div>
                      {o.parentPhone && (
                        <div className="text-xs text-muted-foreground">{o.parentPhone}</div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {o.status === "REGISTERED" && <span className="text-green-600">已登记</span>}
                  {o.status === "REFUNDED" && <span className="text-blue-600">已退款</span>}
                </TableCell>
                <TableCell>
                  {o.payTime ? formatDateTime(o.payTime) : formatDateTime(o.createdAt)}
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={8} className="p-6 text-center text-muted-foreground">
                  {query ? "没有匹配的订单" : "暂无订单数据"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
