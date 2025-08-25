import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "手机号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        // 支持手机号或邮箱登录
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: credentials.phone },
              { email: credentials.phone }, // 如果输入的是邮箱格式
            ],
          },
          include: {
            student: true,
            teacher: true,
            boss: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(), // NextAuth 需要 string ID
          email: user.email || user.phone, // 如果没有邮箱用手机号
          name: user.name,
          image: user.avatar,
          // 自定义字段
          phone: user.phone,
          role: user.role,
          nick: user.nick,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt", // 纯 JWT，不存数据库
  },
  callbacks: {
    async jwt({ token, user }) {
      // 首次登录时，将用户信息存入 token
      if (user) {
        token.userId = parseInt(user.id) // 转回 Int 类型
        token.phone = user.phone
        token.role = user.role
        token.nick = user.nick
      }
      return token
    },
    async session({ session, token }) {
      // 将 token 中的信息传递给 session
      if (token && session.user) {
        session.user.id = token.userId as number
        session.user.phone = token.phone as string
        session.user.role = token.role as string
        session.user.nick = token.nick as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  // JWT 配置
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  debug: process.env.NODE_ENV === "development",
}
