import type { Metadata } from "next";
import { ComplianceView } from "@/components/compliance/ComplianceView";

export const metadata: Metadata = { title: "Institutional Alignment" };

export default function CompliancePage() {
  return <ComplianceView />;
}
