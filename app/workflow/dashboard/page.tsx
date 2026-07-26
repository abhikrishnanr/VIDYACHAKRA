import type { Metadata } from "next";
import { WorkflowDashboard } from "@/components/governance/DashboardViews";

export const metadata: Metadata = { title: "Governance Queue" };

export default function WorkflowDashboardPage() {
  return <WorkflowDashboard />;
}
