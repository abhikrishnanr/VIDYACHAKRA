import type { Metadata } from "next";
import { UniversityCourseOfferingList } from "@/components/course-offerings/UniversityCourseOfferingList";

export const metadata: Metadata = {
  title: "Course Offerings",
  description:
    "Manage official HEC course offerings by academic delivery unit.",
};

export default function CourseOfferingsPage() {
  return <UniversityCourseOfferingList />;
}
