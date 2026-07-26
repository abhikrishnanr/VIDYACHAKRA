import type { Metadata } from "next";
import { AuditView } from "@/components/governance/AuditView";

export const metadata: Metadata = {
  title: "Audit Trail",
  description:
    "An immutable-looking history of VIDYACHAKRA calendar decisions, version changes and notifications.",
  openGraph: {
    title: "VIDYACHAKRA Governance Audit Trail",
    description:
      "Trace every previous value, decision, publication event and official version.",
    images: [
      {
        url: "/og-governance.png",
        width: 1731,
        height: 909,
        alt: "VIDYACHAKRA academic calendar governance workflow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA Governance Audit Trail",
    description: "Trace calendar decisions and version changes without hiding old values.",
    images: ["/og-governance.png"],
  },
};

export default function AuditPage() {
  return <AuditView />;
}
