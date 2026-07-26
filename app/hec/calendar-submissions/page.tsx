import type { Metadata } from "next";
import { HECCalendarSubmissionQueue } from "@/components/calendar-submissions/HECCalendarSubmissionQueue";

export const metadata: Metadata = {
  title: "University Calendar Submission Queue",
  description:
    "Review and lock structured annual academic calendars submitted by universities.",
};

export default function HECCalendarSubmissionsPage() {
  return <HECCalendarSubmissionQueue />;
}
