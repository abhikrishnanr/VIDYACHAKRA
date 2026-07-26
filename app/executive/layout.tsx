import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function ExecutiveLayout({ children }: { children: ReactNode }) {
  return <AppShell role="executive">{children}</AppShell>;
}
