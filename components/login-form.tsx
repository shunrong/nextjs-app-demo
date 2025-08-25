"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("尝试登录:", { phone, callbackUrl })

      const result = await signIn("credentials", {
        phone, // 改用手机号字段
        password,
        redirect: false,
      })

      console.log("登录结果:", result)

      if (result?.error) {
        setError(`登录失败: ${result.error}`)
      } else if (result?.ok) {
        console.log("登录成功，重定向到:", callbackUrl)
        // 等待一小段时间让 session 更新，然后重定向
        setTimeout(() => {
          window.location.href = callbackUrl
        }, 100)
      } else {
        setError("登录失败，请检查手机号和密码")
      }
    } catch (err) {
      console.error("登录异常:", err)
      setError("登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="py-8">
        <CardHeader>
          <CardTitle>教育管理系统</CardTitle>
          <p className="text-sm text-muted-foreground">培训机构内部管理平台</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "登录中..." : "登录"}
              </Button>
            </div>

            {/* 测试账号提示 */}
            <div className="mt-6 p-4 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">测试账号：</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>老板：13800000001 / 123456</p>
                <p>李老师：13800000002 / 123456</p>
                <p>王老师：13800000003 / 123456</p>
                <p>小明：13800000004 / 123456</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
