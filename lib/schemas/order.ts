import { z } from "zod"

export const orderSchema = z.object({
  studentId: z.number().min(1, "请选择学生"),

  courseId: z.number().min(1, "请选择课程"),

  amount: z.number().min(0, "金额不能为负数").max(100000, "金额不能超过100000元"),

  orderNo: z.string().min(1, "订单号不能为空"),

  status: z.enum(["REGISTERED", "CANCELLED"], {
    errorMap: () => ({ message: "请选择订单状态" }),
  }),

  payTime: z.string().optional(),
})

// 推导出 TypeScript 类型
export type OrderFormData = z.infer<typeof orderSchema>

// 针对不同模式的 Schema
export const createOrderSchema = orderSchema.omit({ orderNo: true }) // 创建时不需要订单号，系统自动生成
export const editOrderSchema = orderSchema
