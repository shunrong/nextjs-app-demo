import { z } from "zod"

export const studentSchema = z.object({
  name: z.string().min(1, "姓名不能为空").min(2, "姓名至少2个字符").max(20, "姓名不能超过20个字符"),

  phone: z
    .string()
    .min(1, "手机号不能为空")
    .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),

  email: z.string().email("请输入正确的邮箱地址").optional().or(z.literal("")),

  gender: z.enum(["MALE", "FEMALE"]).nullable().optional(),

  birth: z
    .string()
    .optional()
    .refine(date => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 3 && age <= 25
    }, "年龄应在3-25岁之间"),

  // 监护人信息
  parentName1: z.string().min(1, "监护人姓名不能为空").min(2, "监护人姓名至少2个字符"),

  parentPhone1: z
    .string()
    .min(1, "监护人手机号不能为空")
    .regex(/^1[3-9]\d{9}$/, "请输入正确的监护人手机号"),

  parentRole1: z.string().min(1, "请选择与学生的关系"),

  // 可选的第二监护人
  parentName2: z.string().optional(),
  parentPhone2: z
    .string()
    .regex(/^1[3-9]\d{9}$/, "请输入正确的手机号")
    .optional()
    .or(z.literal("")),
  parentRole2: z.string().optional(),

  photo: z.string().optional(),
})

// 推导出 TypeScript 类型
export type StudentFormData = z.infer<typeof studentSchema>

// 针对不同模式的 Schema
export const createStudentSchema = studentSchema
export const editStudentSchema = studentSchema
export const copyStudentSchema = studentSchema
