import type { Metadata } from "next";
import { HECAdmissionsPulse } from "@/components/capacity-monitor/HECAdmissionsPulse";

export const metadata: Metadata = {
  title: "Admission Capacity Pulse",
  description:
    "Statewide HEC monitoring of Semester 1 sanctioned capacity, actual intake and admission vacancy.",
};

export default function AdmissionIntakePage() {
  return <HECAdmissionsPulse />;
}
