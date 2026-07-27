"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useDemoState } from "@/lib/demo-state";

export default function HECLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { activeRole } = useDemoState();
  const isMasterRoute = pathname.startsWith("/hec/masters/");
  const isInstitutionRoute = pathname.startsWith("/hec/institutions");
  const role =
    pathname.startsWith("/hec/publication") ||
    isMasterRoute ||
    (isInstitutionRoute &&
      activeRole === "administrator")
      ? "administrator"
      : "monitoring";
  return (
    <AppShell role={role}>{children}</AppShell>
  );
}
