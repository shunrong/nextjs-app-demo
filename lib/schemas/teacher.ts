import { z } from "zod"
import { Gender, Job } from "@/lib/enums"

export const teacherSchema = z.object({
  name: z.string().min(1, "姓名不能为空").min(2, "姓名至少2个字符").max(20, "姓名不能超过20个字符"),

  phone: z
    .string()
    .min(1, "手机号不能为空")
    .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),

  gender: z.enum(Gender, "请选择性别"),

  job: z.enum(Job, "请选择职位"),

  avatar: z.string().optional(),
})

// 推导出 TypeScript 类型
export type TeacherFormData = z.infer<typeof teacherSchema>

// 针对不同模式的 Schema
export const createTeacherSchema = teacherSchema
export const editTeacherSchema = teacherSchema
