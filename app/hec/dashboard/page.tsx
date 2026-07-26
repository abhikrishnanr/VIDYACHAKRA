import type { Metadata } from "next";
import { HECCommandCentre } from "@/components/governance/HECCommandCentre";

export const metadata: Metadata = {
  title: "Academic Calendar Command Centre",
  description:
    "Statewide monitoring of FYUGP academic and examination milestones.",
  openGraph: {
    title: "VIDYACHAKRA · Academic Calendar Command Centre",
    description: "Are Kerala’s universities following the approved FYUGP calendar?",
    images: [
      {
        url: "/og-hec-command-centre.png",
        width: 1536,
        height: 1024,
        alt: "VIDYACHAKRA Academic Calendar Command Centre",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA · Academic Calendar Command Centre",
    description: "Are Kerala’s universities following the approved FYUGP calendar?",
    images: ["/og-hec-command-centre.png"],
  },
};

export default function HECDashboardPage() {
  return <HECCommandCentre />;
}
