import type { Metadata } from "next";
import { DemoStoryControl } from "@/components/shared/DemoStoryControl";
import { PrototypeIndicator } from "@/components/shared/PrototypeIndicator";
import { DemoStateProvider } from "@/lib/demo-state";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vidyachakra.vercel.app"),
  title: {
    default: "VIDYACHAKRA · Kerala Higher Education Calendar",
    template: "%s · VIDYACHAKRA",
  },
  description:
    "One trusted academic timeline for Kerala higher education. Find official class dates, examinations, results and approved revisions.",
  openGraph: {
    title: "VIDYACHAKRA · Kerala Higher Education Calendar",
    description: "One trusted academic timeline for Kerala higher education.",
    images: [{ url: "/og-public-portal.png", width: 1536, height: 1024, alt: "VIDYACHAKRA public academic calendar portal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA · Kerala Higher Education Calendar",
    description: "One trusted academic timeline for Kerala higher education.",
    images: ["/og-public-portal.png"],
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
          <DemoStoryControl />
          <PrototypeIndicator />
        </DemoStateProvider>
      </body>
    </html>
  );
}
