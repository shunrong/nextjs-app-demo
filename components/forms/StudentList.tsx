"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Users, ChevronDown, ChevronRight } from "lucide-react"

interface Student {
  id: number
  name: string
  phone: string
  email: string | null
  gender: "MALE" | "FEMALE" | null
  orderId: number
  orderNo: string
  status: "REGISTERED" | "CANCELLED"
  amount: number
  payTime: string | null
  createdAt: string
}

interface StudentListProps {
  students: Student[]
}

function formatDate(input: string | Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(input))
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount / 100) // 数据库中存储的是分
}

export function StudentList({ students }: StudentListProps) {
  const [isOpen, setIsOpen] = useState(true)

  const getStatusBadge = (status: string) => {
    return status === "REGISTERED" ? (
      <Badge variant="default" className="bg-green-500">
        已登记
      </Badge>
    ) : (
      <Badge variant="destructive">已取消</Badge>
    )
  }

  const getGenderText = (gender: string | null) => {
    return gender === "MALE" ? "男" : gender === "FEMALE" ? "女" : "-"
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <CardTitle className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="size-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
              <Users className="size-5" />
              报名学生 ({students.length}人)
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="size-12 mx-auto mb-2 opacity-50" />
                <p>暂无报名学生</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>学生姓名</TableHead>
                      <TableHead className="min-w-[120px]">手机号</TableHead>
                      <TableHead className="w-16">性别</TableHead>
                      <TableHead className="min-w-[140px]">订单号</TableHead>
                      <TableHead className="w-20">状态</TableHead>
                      <TableHead className="w-24">金额</TableHead>
                      <TableHead className="min-w-[140px]">支付时间</TableHead>
                      <TableHead className="min-w-[140px]">备注</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map(student => (
                      <TableRow key={student.orderId}>
                        <TableCell className="font-medium">{student.name}</TableCell>

                        <TableCell>{student.phone}</TableCell>

                        <TableCell>
                          <span className="text-sm">{getGenderText(student.gender)}</span>
                        </TableCell>

                        <TableCell>
                          <span className="font-mono text-xs">{student.orderNo}</span>
                        </TableCell>

                        <TableCell>{getStatusBadge(student.status)}</TableCell>

                        <TableCell>
                          <span className="font-medium text-primary">
                            {formatCurrency(student.amount)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-sm">{formatDate(student.createdAt)}</span>
                        </TableCell>
                        <TableCell>-</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
