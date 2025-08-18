import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "教育管理系统",
  description: "一个现代化的教育管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* 这里可以添加全局提供者：主题、状态管理、国际化等 */}
        {/* <ThemeProvider>
          <AuthProvider>
            <ToastProvider> */}
              {children}
            {/* </ToastProvider>
          </AuthProvider>
        </ThemeProvider> */}
      </body>
    </html>
  );
}
