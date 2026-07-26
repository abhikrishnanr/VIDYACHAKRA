import type { Metadata } from "next";
import { AffiliatedCollegeMonitoring } from "@/components/university/AffiliatedCollegeMonitoring";

export const metadata: Metadata = { title: "Affiliated College Readiness" };

export default function CollegesPage() {
  return <AffiliatedCollegeMonitoring />;
}
