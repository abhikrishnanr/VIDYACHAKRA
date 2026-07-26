import type { Metadata } from "next";
import { UniversityCalendarWorkspace } from "@/components/calendar/UniversityCalendarWorkspace";

export const metadata: Metadata = { title: "University Calendar Workspace" };

export default function UniversityCalendarPage() {
  return <UniversityCalendarWorkspace />;
}
