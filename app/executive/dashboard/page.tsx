import type { Metadata } from "next";
import { ExecutiveDashboard } from "@/components/executive/ExecutiveDashboard";

export const metadata: Metadata = {
  title: "Kerala FYUGP Academic Pulse",
  description:
    "A plain-language executive view of statewide academic alignment, milestone risk and decisions awaiting action.",
};

export default function ExecutiveDashboardPage() {
  return <ExecutiveDashboard />;
}
