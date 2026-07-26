"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default function HECLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell role={pathname.startsWith("/hec/publication") ? "administrator" : "monitoring"}>
      {children}
    </AppShell>
  );
}
