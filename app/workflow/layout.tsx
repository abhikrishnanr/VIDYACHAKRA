import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Academic Calendar Governance",
  description:
    "Review, decide, publish and audit academic calendar revisions through the VIDYACHAKRA governance workflow.",
  openGraph: {
    title: "VIDYACHAKRA Academic Calendar Governance",
    description:
      "A controlled review, committee decision and publication workflow for official academic calendar revisions.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "VIDYACHAKRA academic calendar governance workflow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA Academic Calendar Governance",
    description: "Review, decide and publish official academic calendar revisions.",
    images: ["/og.png"],
  },
};

export default function WorkflowLayout({ children }: { children: ReactNode }) {
  return <AppShell role="committee">{children}</AppShell>;
}
