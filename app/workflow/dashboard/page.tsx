import type { Metadata } from "next";
import { GovernanceWorkflowDashboard } from "@/components/workflow/GovernanceWorkflowDashboard";

export const metadata: Metadata = {
  title: "Academic Calendar Governance Workflow",
  description:
    "Controlled scrutiny, committee decision and publication for official academic calendar changes.",
};

export default function WorkflowDashboardPage() {
  return <GovernanceWorkflowDashboard />;
}
