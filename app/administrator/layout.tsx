import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function AdministratorLayout({ children }: { children: ReactNode }) {
  return <AppShell role="administrator">{children}</AppShell>;
}
