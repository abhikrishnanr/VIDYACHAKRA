import type { Metadata } from "next";
import { CourseOfferingDetail } from "@/components/course-offerings/CourseOfferingDetail";

export const metadata: Metadata = {
  title: "Course Offering Detail",
  description:
    "Inspect official course, delivery-unit and approval information.",
};

export default async function UniversityCourseOfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseOfferingDetail offeringId={id} />;
}
