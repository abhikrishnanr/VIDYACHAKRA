import type { Metadata } from "next";
import { PrototypeIndicator } from "@/components/shared/PrototypeIndicator";
import { DemoStateProvider } from "@/lib/demo-state";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vidyachakra.abhikrishnanr.chatgpt.site"),
  title: {
    default: "VIDYACHAKRA · One State. One Academic Rhythm.",
    template: "%s · VIDYACHAKRA",
  },
  description:
    "Kerala Higher Education Academic & Examination Calendar — a shared rhythm for academic planning, examinations and institutional coordination.",
  openGraph: {
    title: "VIDYACHAKRA · One State. One Academic Rhythm.",
    description: "Kerala Higher Education Academic & Examination Calendar",
    images: [{ url: "/og-workspaces.png", width: 1536, height: 1024, alt: "VIDYACHAKRA role-based academic calendar workspaces" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA · One State. One Academic Rhythm.",
    description: "Kerala Higher Education Academic & Examination Calendar",
    images: ["/og-workspaces.png"],
  },
  icons: {
    icon: "/brand/vidyachakra-mark.svg",
    shortcut: "/brand/vidyachakra-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DemoStateProvider>
          {children}
          <PrototypeIndicator />
        </DemoStateProvider>
      </body>
    </html>
  );
}
