import type { Metadata } from "next";
import { BulkStrengthUpdate } from "@/components/student-strength/BulkStrengthUpdate";

export const metadata: Metadata = {
  title: "Bulk Student Strength Update",
  description:
    "Enter aggregate batch and semester strength across academic delivery units.",
};

export default function BulkStudentStrengthPage() {
  return <BulkStrengthUpdate />;
}
