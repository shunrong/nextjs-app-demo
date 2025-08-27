import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 优化的连接配置
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url:
          process.env.DATABASE_URL +
          (process.env.NODE_ENV === "development" ? "?connection_limit=5&pool_timeout=0" : ""),
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
