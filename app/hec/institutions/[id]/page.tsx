import type { Metadata } from "next";
import { InstitutionComplianceDetail } from "@/components/compliance/InstitutionComplianceDetail";

export const metadata: Metadata = {
  title: "Institution Compliance Detail",
  description:
    "Institution-level FYUGP calendar alignment, evidence and change-request history.",
};

export default async function InstitutionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InstitutionComplianceDetail id={id} />;
}
