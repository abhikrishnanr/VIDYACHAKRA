import type { Metadata } from "next";
import { InstitutionCapacityMonitor } from "@/components/capacity-monitor/InstitutionCapacityMonitor";

export const metadata: Metadata = {
  title: "Institution Capacity Monitor",
  description:
    "HEC monitoring of course offerings, approved batch capacity, intake, vacancies and current strength gaps.",
};

export default async function InstitutionCapacityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InstitutionCapacityMonitor id={id} />;
}
