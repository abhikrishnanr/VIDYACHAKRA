import type { Metadata } from "next";
import { StudentStrengthOverview } from "@/components/student-strength/StudentStrengthOverview";

export const metadata: Metadata = {
  title: "Student Intake and Semester Strength",
  description:
    "Report aggregate admission intake and semester-wise cohort strength by academic delivery unit and course offering.",
};

export default function StudentStrengthPage() {
  return <StudentStrengthOverview />;
}
