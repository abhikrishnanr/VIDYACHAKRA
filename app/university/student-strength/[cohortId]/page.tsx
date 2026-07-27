import type { Metadata } from "next";
import { CohortStrengthDetail } from "@/components/student-strength/CohortStrengthDetail";

export const metadata: Metadata = {
  title: "Cohort Semester Journey",
  description:
    "Inspect and update aggregate batch strength across the semester journey.",
};

export default async function CohortStrengthPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  return <CohortStrengthDetail cohortId={cohortId} />;
}
