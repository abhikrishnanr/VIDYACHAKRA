import type { Metadata } from "next";
import { UniversityDeliveryUnitMonitoring } from "@/components/institutions/UniversityDeliveryUnitMonitoring";

export const metadata: Metadata = { title: "Academic Delivery Network" };

export default function CollegesPage() {
  return <UniversityDeliveryUnitMonitoring />;
}
