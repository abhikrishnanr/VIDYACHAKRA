import type { Metadata } from "next";
import { UniversityOperationsDashboard } from "@/components/university/UniversityOperationsDashboard";

export const metadata: Metadata = {
  title: "Sahya University Academic Operations",
  description:
    "The university operational workspace for adopted calendar delivery, completion reporting and change control.",
};

export default function UniversityDashboardPage() {
  return <UniversityOperationsDashboard />;
}
