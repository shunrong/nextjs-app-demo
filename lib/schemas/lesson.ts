import { z } from "zod"

export const lessonSchema = z.object({
  id: z.number().optional(),
  courseId: z.number().min(1, "请选择课程"),
  title: z.string().min(1, "课时标题不能为空"),
  subtitle: z.string().optional(),
  startTime: z.string().min(1, "请选择开始时间"),
  endTime: z.string().min(1, "请选择结束时间"),
  status: z.enum(["PENDING", "COMPLETED"]).default("PENDING"),
})

// 推导出 TypeScript 类型
export type LessonFormData = z.infer<typeof lessonSchema>

// 针对不同模式的 Schema
export const createLessonSchema = lessonSchema.omit({ id: true })
export const editLessonSchema = lessonSchema
