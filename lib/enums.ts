// 角色
export enum Role {
  BOSS = 1,
  TEACHER = 2,
  STUDENT = 3,
}

export enum Gender {
  MALE = 1,
  FEMALE = 2,
}

export enum Job {
  TEACHER = 1,
  ASSISTANT = 2,
}

export enum ParentRole {
  MOTHER = 1, // 妈妈
  FATHER = 2, // 爸爸
  GRAND_MOTHER = 3, // 奶奶/外婆
  GRAND_FATHER = 4, // 爷爷/外公
  OTHER = 5, // 其他监护人
}

export enum CourseStatus {
  DRAFT = 1, // 待上架
  OPEN = 2, // 开课中
  COMPLETED = 3, // 已结课
  ARCHIVED = 4, // 已归档
}

export enum LessonStatus {
  PENDING = 1, // 未开始
  COMPLETED = 2, // 已完成
}

export enum CourseTerm {
  SPRING = 1, // 春季
  SUMMER = 2, // 暑期
  AUTUMN = 3, // 秋季
  WINTER = 4, // 冬季
}

export enum OrderStatus {
  UNPAID = 1, // 待付款
  PAID = 2, // 已付款
}

export enum CourseCategory {
  DANCE = 1, // 舞蹈
  PAINTING = 2, // 绘画
  SPEECH = 3, // 口才
  MUSIC = 4, // 音乐
}

// 标签映射
export const roleLabels: Record<Role, string> = {
  [Role.BOSS]: "管理员",
  [Role.TEACHER]: "教师",
  [Role.STUDENT]: "学生",
}

export const genderLabels: Record<Gender, string> = {
  [Gender.MALE]: "男",
  [Gender.FEMALE]: "女",
}

export const jobLabels: Record<Job, string> = {
  [Job.TEACHER]: "主课",
  [Job.ASSISTANT]: "助教",
}

export const parentRoleLabels: Record<ParentRole, string> = {
  [ParentRole.MOTHER]: "妈妈",
  [ParentRole.FATHER]: "爸爸",
  [ParentRole.GRAND_MOTHER]: "奶奶/外婆",
  [ParentRole.GRAND_FATHER]: "爷爷/外公",
  [ParentRole.OTHER]: "其他监护人",
}

export const courseStatusLabels: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "待上架",
  [CourseStatus.OPEN]: "开课中",
  [CourseStatus.COMPLETED]: "已结课",
  [CourseStatus.ARCHIVED]: "已归档",
}

export const courseTermLabels: Record<CourseTerm, string> = {
  [CourseTerm.SPRING]: "春季",
  [CourseTerm.SUMMER]: "暑期",
  [CourseTerm.AUTUMN]: "秋季",
  [CourseTerm.WINTER]: "冬季",
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: "待付款",
  [OrderStatus.PAID]: "已付款",
}

export const courseCategoryLabels: Record<CourseCategory, string> = {
  [CourseCategory.DANCE]: "舞蹈",
  [CourseCategory.PAINTING]: "绘画",
  [CourseCategory.SPEECH]: "口才",
  [CourseCategory.MUSIC]: "音乐",
}

export const lessonStatusLabels: Record<LessonStatus, string> = {
  [LessonStatus.PENDING]: "未开始",
  [LessonStatus.COMPLETED]: "已完成",
}

// 工具函数
export function getRoleLabel(role: Role): string {
  return roleLabels[role] || "未知角色"
}

export function isValidRole(role: number): role is Role {
  return Object.values(Role).includes(role as Role)
}

// 导出所有枚举值的数组（用于选择组件）
export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value: Number(value) as Role,
  label,
}))

export const courseStatusOptions = Object.entries(courseStatusLabels).map(([value, label]) => ({
  value: Number(value) as CourseStatus,
  label,
}))
