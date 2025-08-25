/**
 * 显示编码工具函数
 * 将数据库的数字 ID 转换为业务显示编码
 */

type EntityType = "user" | "student" | "teacher" | "boss" | "course" | "lesson" | "order"

const PREFIXES: Record<EntityType, string> = {
  user: "U",
  student: "S",
  teacher: "T",
  boss: "B",
  course: "C",
  lesson: "L",
  order: "O",
}

/**
 * 生成显示编码
 * @param type 实体类型
 * @param id 数据库 ID
 * @param padding 补零位数，默认 3 位
 * @returns 显示编码，如 U001, S025, C100
 */
export function generateDisplayCode(type: EntityType, id: number, padding: number = 3): string {
  const prefix = PREFIXES[type] || "X"
  return `${prefix}${String(id).padStart(padding, "0")}`
}

/**
 * 生成订单号
 * @param id 订单 ID
 * @param date 创建日期，默认今天
 * @returns 订单号，如 OD20240301001
 */
export function generateOrderNo(id: number, date?: Date): string {
  const orderDate = date || new Date()
  const year = orderDate.getFullYear()
  const month = String(orderDate.getMonth() + 1).padStart(2, "0")
  const day = String(orderDate.getDate()).padStart(2, "0")
  const orderSeq = String(id).padStart(3, "0")

  return `OD${year}${month}${day}${orderSeq}`
}

/**
 * 批量生成显示编码
 * @param type 实体类型
 * @param items 包含 id 字段的对象数组
 * @returns 添加了 displayCode 字段的对象数组
 */
export function addDisplayCodes<T extends { id: number }>(
  type: EntityType,
  items: T[]
): (T & { displayCode: string })[] {
  return items.map(item => ({
    ...item,
    displayCode: generateDisplayCode(type, item.id),
  }))
}

/**
 * 从显示编码解析出 ID
 * @param code 显示编码，如 U001
 * @returns 数字 ID，如 1
 */
export function parseDisplayCode(code: string): number | null {
  const match = code.match(/^[A-Z]+(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * 验证显示编码格式
 * @param code 显示编码
 * @param type 预期的实体类型
 * @returns 是否有效
 */
export function validateDisplayCode(code: string, type: EntityType): boolean {
  const expectedPrefix = PREFIXES[type]
  const regex = new RegExp(`^${expectedPrefix}\\d+$`)
  return regex.test(code)
}

// 常用的快捷函数
export const userCode = (id: number) => generateDisplayCode("user", id)
export const studentCode = (id: number) => generateDisplayCode("student", id)
export const teacherCode = (id: number) => generateDisplayCode("teacher", id)
export const bossCode = (id: number) => generateDisplayCode("boss", id)
export const courseCode = (id: number) => generateDisplayCode("course", id)
export const lessonCode = (id: number) => generateDisplayCode("lesson", id)

/**
 * 使用示例：
 *
 * // 基本使用
 * generateDisplayCode('user', 1)     // "U001"
 * generateDisplayCode('student', 25)  // "S025"
 *
 * // 生成订单号
 * generateOrderNo(1, new Date('2024-03-01'))  // "OD20240301001"
 *
 * // 批量处理
 * const users = [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
 * const usersWithCodes = addDisplayCodes('user', users)
 * // 结果: [{ id: 1, name: '张三', displayCode: 'U001' }, ...]
 *
 * // 快捷函数
 * userCode(1)     // "U001"
 * studentCode(25) // "S025"
 */
