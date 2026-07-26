import type { Metadata } from "next";
import { ChangeRequestWizard } from "@/components/university/ChangeRequestWizard";

export const metadata: Metadata = {
  title: "New Calendar Change Request",
};

export default function NewUniversityChangeRequestPage() {
  return <ChangeRequestWizard />;
}
