export type Course = {
  id: string
  title: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  lessons: number
  students: number
  price: number
  status: "draft" | "published" | "archived"
  updatedAt: string
  teacher: string
  banner: string
}

export function generateMockCourses(count: number): Course[] {
  const categories = ["前端", "后端", "数据", "设计", "测试"]
  const levels: Course["level"][] = ["beginner", "intermediate", "advanced"]
  const statuses: Course["status"][] = ["draft", "published", "archived"]
  const teachers = ["张老师", "李老师", "王老师", "刘老师", "陈老师"]
  return Array.from({ length: count }).map((_, index) => {
    const category = categories[index % categories.length]
    const level = levels[index % levels.length]
    const status = statuses[index % statuses.length]
    const teacher = teachers[index % teachers.length]
    return {
      id: String(1000 + index),
      title: `${category}实战课程 ${index + 1}`,
      category,
      level,
      lessons: 10 + (index % 20),
      students: 50 + (index % 200),
      price: 99 + (index % 5) * 50,
      status,
      updatedAt: new Date(Date.now() - index * 86400000).toISOString(),
      teacher,
      banner: `/placeholder/cover-${(index % 5) + 1}.jpg`,
    }
  })
}

export type Student = {
  id: string
  name: string
  email: string
  phone: string
  gender: "male" | "female"
  enrolledCourses: number
  credits: number
  status: "active" | "suspended" | "graduated"
  joinedAt: string
  banner?: string
}

export function generateMockStudents(count: number): Student[] {
  const names = [
    "张三",
    "李四",
    "王五",
    "赵六",
    "孙七",
    "周八",
    "吴九",
    "郑十",
    "钱一",
    "冯二",
    "陈三",
    "褚四",
    "卫五",
    "蒋六",
    "沈七",
    "韩八",
  ]
  const emails = ["example.com", "school.edu", "mail.com"]
  return Array.from({ length: count }).map((_, i) => {
    const name = names[i % names.length]
    const domain = emails[i % emails.length]
    return {
      id: String(10000 + i),
      name,
      email: `${name}${i}@${domain}`,
      phone: `1${(Math.random() * 9 + 3).toFixed(0)}${Math.floor(Math.random() * 10 ** 9)
        .toString()
        .padStart(9, "0")}`,
      gender: i % 2 === 0 ? "male" : "female",
      enrolledCourses: 1 + (i % 6),
      credits: 10 + (i % 120),
      status: i % 7 === 0 ? "suspended" : i % 11 === 0 ? "graduated" : "active",
      joinedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
      banner: `/placeholder/student-${(i % 5) + 1}.svg`,
    }
  })
}

export type Teacher = {
  id: string
  name: string
  email: string
  title: string
  skills: string[]
  courses: number
  rating: number
  joinedAt: string
  status: "active" | "inactive"
  banner?: string
}

export function generateMockTeachers(count: number): Teacher[] {
  const names = ["张老师", "李老师", "王老师", "刘老师", "陈老师", "杨老师", "赵老师", "周老师"]
  const titles = ["讲师", "高级讲师", "副教授", "教授"]
  const skillPool = ["HTML", "CSS", "JavaScript", "React", "Node.js", "数据库", "UI/UX", "测试"]
  return Array.from({ length: count }).map((_, i) => {
    const name = names[i % names.length]
    const title = titles[i % titles.length]
    const skills = Array.from(
      new Set([
        skillPool[i % skillPool.length],
        skillPool[(i + 2) % skillPool.length],
        skillPool[(i + 4) % skillPool.length],
      ])
    )
    return {
      id: String(2000 + i),
      name,
      email: `teacher${i}@school.edu`,
      title,
      skills,
      courses: 2 + (i % 8),
      rating: Number((3 + (i % 3) + Math.random()).toFixed(1)),
      joinedAt: new Date(Date.now() - i * 86400000 * 6).toISOString(),
      status: i % 5 === 0 ? "inactive" : "active",
      banner: `/placeholder/teacher-${(i % 5) + 1}.jpg`,
    }
  })
}

export type Order = {
  id: string
  orderNo: string
  studentName: string
  courseTitle: string
  amount: number
  payMethod: "alipay" | "wechat" | "card"
  status: "pending" | "paid" | "refunded" | "failed"
  createdAt: string
  paidAt?: string | null
}

export function generateMockOrders(count: number): Order[] {
  const studentNames = ["张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十"]
  const courseTitles = [
    "React 进阶实践",
    "Node.js 从入门到实战",
    "TypeScript 深入浅出",
    "Tailwind CSS 高效开发",
    "数据库设计与优化",
  ]
  const payMethods: Order["payMethod"][] = ["alipay", "wechat", "card"]
  const statuses: Order["status"][] = ["pending", "paid", "refunded", "failed"]
  return Array.from({ length: count }).map((_, i) => {
    const status = statuses[i % statuses.length]
    const created = new Date(Date.now() - i * 3600_000 * 5)
    const paidAt = status === "paid" ? new Date(created.getTime() + 3600_000).toISOString() : null
    return {
      id: String(5000 + i),
      orderNo: `OD${new Date().getFullYear()}${String(i).padStart(6, "0")}`,
      studentName: studentNames[i % studentNames.length],
      courseTitle: courseTitles[i % courseTitles.length],
      amount: 99 + (i % 5) * 50,
      payMethod: payMethods[i % payMethods.length],
      status,
      createdAt: created.toISOString(),
      paidAt,
    }
  })
}
