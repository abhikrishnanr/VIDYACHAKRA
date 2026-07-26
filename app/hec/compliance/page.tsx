import type { Metadata } from "next";
import { ComplianceView } from "@/components/compliance/ComplianceView";

export const metadata: Metadata = {
  title: "Statewide Compliance Matrix",
  description:
    "University and college-level FYUGP milestone alignment across Kerala.",
  openGraph: {
    title: "VIDYACHAKRA · Statewide Compliance Matrix",
    description: "FYUGP milestone alignment at one glance.",
    images: [
      {
        url: "/og-compliance-matrix.png",
        width: 1536,
        height: 1024,
        alt: "VIDYACHAKRA Statewide Compliance Matrix",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA · Statewide Compliance Matrix",
    description: "FYUGP milestone alignment at one glance.",
    images: ["/og-compliance-matrix.png"],
  },
};

export default function CompliancePage() {
  return <ComplianceView />;
}
