import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function UniversityLayout({ children }: { children: ReactNode }) {
  return <AppShell role="university">{children}</AppShell>;
}
