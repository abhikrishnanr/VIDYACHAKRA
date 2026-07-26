import type { Metadata } from "next";
import { HECDashboard } from "@/components/governance/DashboardViews";

export const metadata: Metadata = { title: "HEC Overview" };

export default function HECDashboardPage() {
  return <HECDashboard />;
}
