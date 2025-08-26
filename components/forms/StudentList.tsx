"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Phone, Mail, Calendar, CreditCard } from "lucide-react"

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="size-5" />
          报名学生 ({students.length}人)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="size-12 mx-auto mb-2 opacity-50" />
            <p>暂无报名学生</p>
          </div>
        ) : (
          <div className="space-y-4">
            {students.map(student => (
              <Card key={student.orderId} className="border">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <User className="size-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{student.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Phone className="size-3" />
                            {student.phone}
                          </span>
                          {student.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="size-3" />
                              {student.email}
                            </span>
                          )}
                          <span>{getGenderText(student.gender)}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(student.status)}
                  </div>

                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">订单号：</span>
                      <span className="font-mono">{student.orderNo}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">报名金额：</span>
                      <span className="font-medium text-primary">
                        {formatCurrency(student.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">报名时间：</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(student.createdAt)}
                      </span>
                    </div>
                    {student.payTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">支付时间：</span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="size-3" />
                          {formatDate(student.payTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
