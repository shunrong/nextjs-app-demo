"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, GraduationCap, Users, UserRound, Receipt } from "lucide-react"

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

// This is sample data.
const data = {
  user: {
    name: "舒慧",
    email: "shuhui@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
      title: "订单管理",
      url: "/orders",
      icon: Receipt,
    },
    {
      title: "学员档案",
      url: "/students",
      icon: Users,
    },
    {
      title: "教师档案",
      url: "/teachers",
      icon: UserRound,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // 根据当前路径设置活动状态
  const navItems = data.navMain.map(item => ({
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
