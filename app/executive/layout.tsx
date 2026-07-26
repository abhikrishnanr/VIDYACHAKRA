import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Kerala FYUGP Academic Pulse",
    template: "%s · VIDYACHAKRA",
  },
  description:
    "A plain-language leadership view of Kerala’s statewide academic calendar, milestone risk and decisions requiring action.",
  openGraph: {
    title: "Kerala FYUGP Academic Pulse · VIDYACHAKRA",
    description:
      "Is the academic year on track? A clear statewide view for senior higher-education leadership.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "VIDYACHAKRA Kerala FYUGP Academic Pulse executive overview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala FYUGP Academic Pulse · VIDYACHAKRA",
    description: "A clear statewide academic calendar overview for senior leadership.",
    images: ["/og.png"],
  },
};

export default function ExecutiveLayout({ children }: { children: ReactNode }) {
  return <AppShell role="executive">{children}</AppShell>;
}
