import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Nav } from "./components/Nav";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "변명공작소 — AI가 만들어주는 완벽한 변명",
  description:
    "지각, 마감 연기, 회식 불참... AI가 상황별로 그럴듯한 변명을 생성하고 상대방 반응까지 시뮬레이션해 드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="py-6 text-center text-xs text-zinc-400">
          © 2025 변명공작소 · Powered by Claude AI
        </footer>
      </body>
    </html>
  );
}
