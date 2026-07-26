import type { Metadata } from "next";
import { DemoStateProvider } from "@/lib/demo-state";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vidyachakra.example"),
  title: {
    default: "VIDYACHAKRA · One State. One Academic Rhythm.",
    template: "%s · VIDYACHAKRA",
  },
  description:
    "Kerala Higher Education Academic & Examination Calendar — a shared rhythm for academic planning, examinations and institutional coordination.",
  openGraph: {
    title: "VIDYACHAKRA · One State. One Academic Rhythm.",
    description: "Kerala Higher Education Academic & Examination Calendar",
    images: [{ url: "/og.png", width: 1672, height: 941, alt: "VIDYACHAKRA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIDYACHAKRA · One State. One Academic Rhythm.",
    description: "Kerala Higher Education Academic & Examination Calendar",
    images: ["/og.png"],
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
          <div className="prototype-indicator">Illustrative Prototype</div>
        </DemoStateProvider>
      </body>
    </html>
  );
}
