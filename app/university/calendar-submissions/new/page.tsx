import type { Metadata } from "next";
import { CalendarSubmissionWizard } from "@/components/calendar-submissions/CalendarSubmissionWizard";

export const metadata: Metadata = {
  title: "New Calendar Submission",
  description:
    "Prepare a structured annual calendar from active HEC milestone definitions.",
};

export default function NewCalendarSubmissionPage() {
  return <CalendarSubmissionWizard />;
}
