import type { Metadata } from "next";
import { CommitteeDecisionWorkspace } from "@/components/workflow/CommitteeDecisionWorkspace";

export const metadata: Metadata = { title: "Committee Decision Register" };

export default function CommitteeDecisionsPage() {
  return <CommitteeDecisionWorkspace />;
}
