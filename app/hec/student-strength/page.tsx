import type { Metadata } from "next";
import { HECStudentStrengthMonitor } from "@/components/student-strength/HECStudentStrengthMonitor";

export const metadata: Metadata = {
  title: "HEC Student Strength Monitoring",
  description:
    "Read-only statewide monitoring of aggregate cohort and semester strength reports.",
};

export default function HECStudentStrengthPage() {
  return <HECStudentStrengthMonitor />;
}
