import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: number // 改为 number 类型
      phone: string
      role: string
      nick?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    phone: string
    role: string
    nick?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId: number
    phone: string
    role: string
    nick?: string | null
  }
}
