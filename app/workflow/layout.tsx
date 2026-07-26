import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  return <AppShell role="committee">{children}</AppShell>;
}
