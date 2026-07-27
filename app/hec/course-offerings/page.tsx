import type { Metadata } from "next";
import { HECCourseOfferingWorkspace } from "@/components/course-offerings/HECCourseOfferingWorkspace";

export const metadata: Metadata = {
  title: "HEC Course Offering Verification",
  description:
    "Verify institutional course offerings and approval references.",
};

export default function HECCourseOfferingPage() {
  return <HECCourseOfferingWorkspace />;
}
