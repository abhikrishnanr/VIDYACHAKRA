import type { Metadata } from "next";
import { CalendarSubmissionDetail } from "@/components/calendar-submissions/CalendarSubmissionDetail";

export const metadata: Metadata = {
  title: "Calendar Submission Detail",
  description:
    "Review the scope, milestone dates and HEC status of a university calendar submission.",
};

export default async function UniversityCalendarSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CalendarSubmissionDetail submissionId={id} workspace="university" />;
}
