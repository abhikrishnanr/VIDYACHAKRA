import type { Metadata } from "next";
import { CourseCapacityMonitor } from "@/components/capacity-monitor/CourseCapacityMonitor";

export const metadata: Metadata = {
  title: "Course Capacity Monitor",
  description:
    "Statewide capacity, admission intake, vacancy and semester-strength monitoring for an official HEC course.",
};

export default async function CourseMonitorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseCapacityMonitor courseId={courseId} />;
}
