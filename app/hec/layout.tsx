import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function HECLayout({ children }: { children: ReactNode }) {
  return <AppShell role="monitoring">{children}</AppShell>;
}
