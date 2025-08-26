"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// 路由配置映射
const routeConfig: Record<string, { name: string; href?: string }> = {
  "/dashboard": { name: "首页", href: "/dashboard" },
  "/courses": { name: "课程信息", href: "/courses" },
  "/orders": { name: "报名缴费", href: "/orders" },
  "/leaves": { name: "请假记录", href: "/leaves" },
  "/students": { name: "学生档案", href: "/students" },
  "/teachers": { name: "教师档案", href: "/teachers" },
  // 支持详情页面
  "/courses/[id]": { name: "课程详情" },
  "/students/[id]": { name: "学生详情" },
  "/teachers/[id]": { name: "教师详情" },
  "/orders/[id]": { name: "订单详情" },
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // 解析路径段，过滤掉路由组
  const pathSegments = pathname
    .split("/")
    .filter(segment => segment && !segment.startsWith("(") && !segment.endsWith(")"))

  // 生成面包屑项
  const breadcrumbItems: Array<{
    name: string
    href?: string
    isLast: boolean
  }> = []

  // 如果是首页，直接返回
  if (pathname === "/dashboard" || pathname === "/") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>首页</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // 添加首页
  breadcrumbItems.push({
    name: "首页",
    href: "/dashboard",
    isLast: false,
  })

  // 处理路径段
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]
    const currentPath = "/" + pathSegments.slice(0, i + 1).join("/")
    const isLast = i === pathSegments.length - 1

    // 查找匹配的配置
    let config = routeConfig[currentPath]

    // 如果没找到精确匹配，尝试动态路由
    if (!config && i > 0) {
      const parentPath = "/" + pathSegments.slice(0, i).join("/")
      const dynamicPath = parentPath + "/[id]"
      config = routeConfig[dynamicPath]
    }

    if (config) {
      breadcrumbItems.push({
        name: config.name,
        href: isLast ? undefined : config.href,
        isLast,
      })
    } else {
      // 如果没有配置，使用默认名称
      const defaultName = segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbItems.push({
        name: defaultName,
        href: isLast ? undefined : currentPath,
        isLast,
      })
    }
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={`${item.href || item.name}-${index}`} className="flex items-center">
            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
              {item.isLast ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href!}>{item.name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast && (
              <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
            )}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
