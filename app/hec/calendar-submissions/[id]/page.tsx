import type { Metadata } from "next";
import { CalendarSubmissionDetail } from "@/components/calendar-submissions/CalendarSubmissionDetail";

export const metadata: Metadata = {
  title: "HEC Calendar Submission Review",
  description:
    "Compare university milestone dates against HEC baselines and record a control decision.",
};

export default async function HECCalendarSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CalendarSubmissionDetail submissionId={id} workspace="hec" />;
}
