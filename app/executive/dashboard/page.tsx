import type { Metadata } from "next";
import { ExecutiveDashboard } from "@/components/governance/DashboardViews";

export const metadata: Metadata = { title: "Executive View" };

export default function ExecutiveDashboardPage() {
  return <ExecutiveDashboard />;
}
