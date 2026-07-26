import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Sahya University Workspace · VIDYACHAKRA",
    template: "%s · VIDYACHAKRA",
  },
  description:
    "Operational FYUGP calendar adoption, completion reporting and formal change control for Sahya Higher Studies University.",
  openGraph: {
    title: "Sahya University Workspace · VIDYACHAKRA",
    description:
      "Adopted calendar, completion reporting and formal change requests in one operational workspace.",
    images: [
      {
        url: "/og-sahya-university-workspace.png",
        width: 2048,
        height: 1075,
        alt: "Sahya University Workspace preview",
      },
    ],
  },
};

export default function UniversityLayout({ children }: { children: ReactNode }) {
  return <AppShell role="university">{children}</AppShell>;
}
