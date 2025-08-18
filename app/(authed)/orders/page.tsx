"use client"

import { useMemo, useState } from "react"
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
import { generateMockOrders } from "@/lib/mock-data"

const PAGE_SIZE = 12

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(amount)
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

export default function OrdersPage() {
  const [query, setQuery] = useState("")
  const [pageIndex, setPageIndex] = useState(1)

  const all = useMemo(() => generateMockOrders(137), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      o =>
        o.orderNo.toLowerCase().includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.courseTitle.toLowerCase().includes(q)
    )
  }, [query, all])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(pageIndex, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function goToPage(next: number) {
    const n = Math.max(1, Math.min(next, totalPages))
    setPageIndex(n)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          placeholder="搜索订单号/学员/课程"
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
              <TableHead>订单号</TableHead>
              <TableHead>学员</TableHead>
              <TableHead>课程</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>支付时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.orderNo}</TableCell>
                <TableCell>{o.studentName}</TableCell>
                <TableCell>{o.courseTitle}</TableCell>
                <TableCell>{formatCurrency(o.amount)}</TableCell>
                <TableCell>
                  {o.payMethod === "alipay" && "支付宝"}
                  {o.payMethod === "wechat" && "微信"}
                  {o.payMethod === "card" && "银行卡"}
                </TableCell>
                <TableCell>
                  {o.status === "paid" && <span className="text-green-600">已支付</span>}
                  {o.status === "pending" && <span className="text-amber-600">待支付</span>}
                  {o.status === "refunded" && <span className="text-blue-600">已退款</span>}
                  {o.status === "failed" && <span className="text-red-600">失败</span>}
                </TableCell>
                <TableCell>{formatDateTime(o.createdAt)}</TableCell>
                <TableCell>
                  {o.paidAt ? (
                    formatDateTime(o.paidAt)
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="p-6 text-center text-muted-foreground">
                  没有匹配的订单
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          共 {filtered.length} 条 · 第 {currentPage}/{totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => goToPage(1)} disabled={currentPage === 1}>
            首页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            上一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
          <Button
            variant="secondary"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            末页
          </Button>
        </div>
      </div>
    </div>
  )
}
