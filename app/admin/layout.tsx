import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "COWIN 后台管理",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div lang="zh-CN">{children}</div>;
}
