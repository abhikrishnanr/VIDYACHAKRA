import type { Metadata } from "next";
import { UniversityCourseOfferingList } from "@/components/course-offerings/UniversityCourseOfferingList";

export const metadata: Metadata = {
  title: "Course Offerings and Approved Capacity",
  description:
    "Manage HEC Course Master offerings by academic delivery unit and approved batch capacity.",
};

export default function CourseOfferingsPage() {
  return <UniversityCourseOfferingList />;
}
