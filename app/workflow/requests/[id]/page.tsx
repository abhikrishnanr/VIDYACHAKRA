import type { Metadata } from "next";
import { WorkflowRequestDetail } from "@/components/workflow/WorkflowRequestDetail";

export const metadata: Metadata = {
  title: "Academic Calendar Change Request",
  description:
    "Complete governance record for an official academic calendar change request.",
};

export default async function WorkflowRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <WorkflowRequestDetail id={id} />;
}
