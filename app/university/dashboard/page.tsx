import type { Metadata } from "next";
import { UniversityDashboard } from "@/components/governance/DashboardViews";

export const metadata: Metadata = { title: "University Overview" };

export default function UniversityDashboardPage() {
  return <UniversityDashboard />;
}
