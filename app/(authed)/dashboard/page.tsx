'use client'

import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here&apos;s an overview of your system.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">Hello World</h3>
          <Button onClick={() => alert("clicked")} className="mt-2">
            Click me
          </Button>
        </div>
        
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">快速操作</h3>
          <p className="text-sm text-muted-foreground mt-1">
            常用功能入口
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">数据统计</h3>
          <p className="text-sm text-muted-foreground mt-1">
            实时数据概览
          </p>
        </div>
        
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">最近活动</h3>
          <p className="text-sm text-muted-foreground mt-1">
            系统活动记录
          </p>
        </div>
      </div>
    </div>
  );
}