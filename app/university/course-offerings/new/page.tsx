import type { Metadata } from "next";
import { CourseOfferingForm } from "@/components/course-offerings/CourseOfferingForm";

export const metadata: Metadata = {
  title: "Create Course Offering",
  description:
    "Bind an official HEC course to an academic delivery unit and configure approved batches.",
};

export default function NewCourseOfferingPage() {
  return <CourseOfferingForm />;
}
