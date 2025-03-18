"use client"; // 👈 Solo este archivo será cliente

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isNoviosPage = pathname.startsWith("/novios");

  return (
    <div className="container xl flex juatify-center mx-auto align-middle margin-0-auto">
      {isNoviosPage && <Sidebar />}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
