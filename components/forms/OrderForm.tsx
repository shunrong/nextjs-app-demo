"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"
import {
  TextField,
  SelectField,
  NumberField,
  AsyncSelectField,
  DateField,
} from "@/components/forms/FormField"
import { orderSchema, type OrderFormData } from "@/lib/schemas/order"
import { FORM_CONFIGS, type FormMode } from "@/types/form"

interface OrderFormProps {
  id?: string | number
  mode: FormMode
  initialData?: OrderFormData | null
}

export function OrderForm({ id, mode, initialData }: OrderFormProps) {
  const router = useRouter()
  const config = FORM_CONFIGS[mode]

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      studentId: 0,
      courseId: 0,
      amount: 0,
      orderNo: "",
      status: "REGISTERED",
      payTime: "",
    },
  })

  // 数据初始化
  useEffect(() => {
    if (mode === "create") {
      // 新建模式 - 使用默认值
      form.reset({
        studentId: 0,
        courseId: 0,
        amount: 0,
        orderNo: "",
        status: "REGISTERED",
        payTime: "",
      })
    } else if (initialData) {
      // 查看/编辑模式
      form.reset(initialData)
    } else if (id) {
      // 从 API 获取数据
      fetchOrderData(id)
    }
  }, [id, mode, initialData, form])

  const fetchOrderData = async (orderId: string | number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const result = await response.json()
      if (result.success) {
        form.reset(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error("获取数据失败，请稍后重试")
    }
  }

  // 监听课程变化，自动更新价格
  const watchCourseId = form.watch("courseId")
  useEffect(() => {
    if (watchCourseId && mode === "create") {
      fetchCoursePrice(watchCourseId)
    }
  }, [watchCourseId, mode])

  const fetchCoursePrice = async (courseId: number) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`)
      const result = await response.json()
      if (result.success) {
        form.setValue("amount", result.data.price || 0)
      }
    } catch (error) {
      console.error("获取课程价格失败:", error)
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    try {
      const endpoint = mode === "edit" ? `/api/orders/${id}` : "/api/orders"
      const method = mode === "edit" ? "PUT" : "POST"

      // 对于创建模式，移除 orderNo 字段（服务器会自动生成）
      const submitData =
        mode === "create"
          ? {
              studentId: data.studentId,
              courseId: data.courseId,
              amount: data.amount,
              status: data.status,
              payTime: data.payTime,
            }
          : data

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(mode === "edit" ? "订单信息已更新" : "订单已创建")
        router.push("/orders")
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "操作失败，请稍后重试")
    }
  }

  const getTitle = () => {
    const orderNo = form.watch("orderNo")
    switch (mode) {
      case "create":
        return "报名缴费"
      case "edit":
        return `编辑订单${orderNo ? ` - ${orderNo}` : ""}`
      case "view":
        return `订单详情${orderNo ? ` - ${orderNo}` : ""}`
      default:
        return "订单信息"
    }
  }

  // 订单状态选项
  const statusOptions = [
    { label: "已登记", value: "REGISTERED" },
    { label: "已取消", value: "CANCELLED" },
  ]

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/orders")}>
            返回列表
          </Button>

          {mode === "view" && (
            <Button variant="outline" onClick={() => router.push(`/orders/${id}?mode=edit`)}>
              编辑
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {mode !== "create" && (
                <TextField
                  form={form}
                  name="orderNo"
                  label="订单号"
                  placeholder="系统自动生成"
                  disabled={true}
                />
              )}

              <AsyncSelectField
                form={form}
                name="studentId"
                label="学生"
                placeholder="请选择学生"
                apiEndpoint="/api/options?type=students"
                required
                disabled={config.readonly}
              />

              <AsyncSelectField
                form={form}
                name="courseId"
                label="课程"
                placeholder="请选择课程"
                apiEndpoint="/api/options?type=courses"
                required
                disabled={config.readonly}
              />

              <NumberField
                form={form}
                name="amount"
                label="金额"
                placeholder="请输入金额"
                min={0}
                step={0.01}
                required
                disabled={config.readonly}
              />

              <SelectField
                form={form}
                name="status"
                label="状态"
                placeholder="请选择状态"
                options={statusOptions}
                required
                disabled={config.readonly}
              />

              {form.watch("status") === "REGISTERED" && (
                <DateField form={form} name="payTime" label="缴费时间" disabled={config.readonly} />
              )}
            </CardContent>
          </Card>

          {/* 操作按钮 */}
          {config.showActions && (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/orders")}>
                取消
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : config.submitText}
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  )
}
