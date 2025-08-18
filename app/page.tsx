import { redirect } from "next/navigation"

export default function HomePage() {
  // 中间件会处理登录检查，这里直接重定向到 dashboard
  redirect("/dashboard")
}
