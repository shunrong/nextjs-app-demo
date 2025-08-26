// 学期枚举值转换工具

export type CourseTerm = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER"

// 将英文枚举值转换为中文显示
export function getTermLabel(term: CourseTerm): string {
  const termMap: Record<CourseTerm, string> = {
    SPRING: "春季",
    SUMMER: "暑期",
    AUTUMN: "秋季",
    WINTER: "冬季",
  }
  return termMap[term] || term
}

// 将中文显示转换为英文枚举值
export function getTermValue(label: string): CourseTerm {
  const labelMap: Record<string, CourseTerm> = {
    春季: "SPRING",
    暑期: "SUMMER",
    秋季: "AUTUMN",
    冬季: "WINTER",
  }
  return labelMap[label] || ("SPRING" as CourseTerm)
}

// 学期选项（用于表单下拉框）
export const termOptions = [
  { label: "春季", value: "SPRING" as CourseTerm },
  { label: "暑期", value: "SUMMER" as CourseTerm },
  { label: "秋季", value: "AUTUMN" as CourseTerm },
  { label: "冬季", value: "WINTER" as CourseTerm },
]
