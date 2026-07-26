import type { Metadata } from "next";
import { AuditView } from "@/components/governance/AuditView";

export const metadata: Metadata = { title: "Audit Trail" };

export default function AuditPage() {
  return <AuditView />;
}
