import { z } from "zod"
import { LessonStatus, CourseTerm, Gender, OrderStatus, CourseCategory } from "@/lib/enums"

const lessonSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "课时标题不能为空"),
  subtitle: z.string().optional(),
  startTime: z.string().min(1, "请选择开始时间"),
  endTime: z.string().min(1, "请选择结束时间"),
  status: z.enum(LessonStatus),
})

const studentSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string(),
  gender: z.enum(Gender, "请选择性别"),
  orderId: z.number(),
  status: z.enum(OrderStatus),
  amount: z.number(),
  payTime: z.string().nullable(),
  createdAt: z.string(),
})

export const courseSchema = z.object({
  title: z
    .string()
    .min(1, "课程标题不能为空")
    .min(2, "课程标题至少2个字符")
    .max(50, "课程标题不能超过50个字符"),

  subtitle: z.string().max(200, "课程副标题不能超过200个字符").optional(),

  category: z.enum(CourseCategory, "请选择课程分类"),

  year: z.number().min(2020, "年份不能早于2020年").max(2030, "年份不能晚于2030年"),

  term: z.enum(CourseTerm),

  price: z.number().min(0, "价格不能为负数").max(100000, "价格不能超过100000元"),

  teacherId: z.number().min(1, "请选择授课教师"),

  address: z.string().max(100, "上课地点不能超过100个字符").optional(),

  banner: z.string().optional(),

  lessons: z.array(lessonSchema).optional(),

  students: z.array(studentSchema).optional(),
})

// 推导出 TypeScript 类型
export type CourseFormData = z.infer<typeof courseSchema>

// 针对不同模式的 Schema
export const createCourseSchema = courseSchema
export const editCourseSchema = courseSchema
export const copyCourseSchema = courseSchema
