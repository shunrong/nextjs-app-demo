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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

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
  orderNo: string
  studentName: string
  studentPhone: string
  parentName?: string | null
  parentPhone?: string | null
  courseTitle: string
  courseCategory: string
  courseTerm: string
  amount: number
  status: "REGISTERED" | "CANCELLED"
  payTime?: string | null
  createdAt: string
}

export default function OrdersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)

  const {
    data: orders,
    loading,
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

  const showLoading = loading

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
        <Button onClick={() => (window.location.href = "/orders/new")}>报名缴费</Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        {showLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>学生</TableHead>
                <TableHead>课程</TableHead>
                <TableHead>学期</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>家长</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>登记时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(o => (
                <TableRow key={o.id}>
                  <TableCell>{`OD${String(o.id).padStart(6, "0")}`}</TableCell>
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
                    {o.status === "CANCELLED" && <span className="text-red-600">已取消</span>}
                  </TableCell>
                  <TableCell>
                    {o.payTime ? formatDateTime(o.payTime) : formatDateTime(o.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => (window.location.href = `/orders/${o.id}`)}
                      >
                        查看
                      </Button>
                      <Button
                        size="sm"
                        variant="link"
                        onClick={() => (window.location.href = `/orders/${o.id}?mode=edit`)}
                      >
                        编辑
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={9} className="p-6 text-center text-muted-foreground">
                    {query ? "没有匹配的订单" : "暂无订单数据"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

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
