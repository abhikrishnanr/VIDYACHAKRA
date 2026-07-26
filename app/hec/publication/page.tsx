import type { Metadata } from "next";
import { PublicationDesk } from "@/components/workflow/PublicationDesk";

export const metadata: Metadata = {
  title: "Calendar Publication Desk",
  description:
    "Permissioned publication of approved academic calendar revisions.",
  openGraph: {
    title: "VIDYACHAKRA Calendar Publication Desk",
    description:
      "Publish an approved academic calendar revision as a traceable new official version.",
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
    title: "VIDYACHAKRA Calendar Publication Desk",
    description: "Controlled publication of approved academic calendar revisions.",
    images: ["/og.png"],
  },
};

export default function HECPublicationPage() {
  return <PublicationDesk />;
}
