import type { Metadata } from "next";
import { UniversityCalendarSubmissionList } from "@/components/calendar-submissions/UniversityCalendarSubmissionList";

export const metadata: Metadata = {
  title: "Annual Calendar Submissions",
  description:
    "Create, submit and track structured university academic calendars.",
};

export default function CalendarSubmissionsPage() {
  return <UniversityCalendarSubmissionList />;
}
