// 学期枚举值转换工具
import { CourseTerm, courseTermLabels } from "@/lib/enums"

// 将枚举值转换为中文显示
export function getTermLabel(term: CourseTerm): string {
  return courseTermLabels[term] || "未知学期"
}

// 将中文显示转换为枚举值
export function getTermValue(label: string): CourseTerm {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const entry = Object.entries(courseTermLabels).find(([_, termLabel]) => termLabel === label)
  return entry ? (Number(entry[0]) as CourseTerm) : CourseTerm.SPRING
}

// 学期选项（用于表单下拉框）
export const termOptions = Object.entries(courseTermLabels).map(([value, label]) => ({
  label,
  value: Number(value) as CourseTerm,
}))
