import type { Metadata } from "next";
import { CourseVacancyExplorer } from "@/components/capacity-monitor/CourseVacancyExplorer";

export const metadata: Metadata = {
  title: "Course Vacancy Explorer",
  description:
    "Course-first statewide comparison of Semester 1 approved capacity, intake and vacancy.",
};

export default function VacancyMonitorPage() {
  return <CourseVacancyExplorer />;
}
