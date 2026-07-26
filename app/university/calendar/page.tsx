import type { Metadata } from "next";
import { AdoptedCalendar } from "@/components/university/AdoptedCalendar";

export const metadata: Metadata = {
  title: "Sahya Adopted Calendar",
  description:
    "Compare the official Council baseline with Sahya schedules and completion reports.",
};

export default function UniversityCalendarPage() {
  return <AdoptedCalendar />;
}
