import type { Metadata } from "next";
import { InstitutionStructureDetail } from "@/components/institutions/InstitutionStructureDetail";

export const metadata: Metadata = {
  title: "University Institution Structure",
  description:
    "University operating model, academic delivery units, offerings and reporting coverage.",
};

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InstitutionStructureDetail id={id} workspace="hec" />;
}
