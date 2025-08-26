"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserRound,
  Receipt,
  CalendarDays,
} from "lucide-react"

import { NavLogo } from "@/components/nav-logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// 导航菜单数据
const navMain = [
  {
    title: "首页",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "课程信息",
    url: "/courses",
    icon: GraduationCap,
  },
  {
    title: "报名缴费",
    url: "/orders",
    icon: Receipt,
  },
  {
    title: "请假记录",
    url: "/leaves",
    icon: CalendarDays,
  },
  {
    title: "学生档案",
    url: "/students",
    icon: Users,
  },
  {
    title: "教师档案",
    url: "/teachers",
    icon: UserRound,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // 根据当前路径设置活动状态
  const navItems = navMain.map(item => ({
    ...item,
    isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
