import type { Metadata } from "next";
import { CourseOfferingDetail } from "@/components/course-offerings/CourseOfferingDetail";

export const metadata: Metadata = {
  title: "Course Offering Detail",
  description:
    "Inspect course, delivery-unit, batch capacity and student reporting information.",
};

export default async function UniversityCourseOfferingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseOfferingDetail offeringId={id} />;
}
