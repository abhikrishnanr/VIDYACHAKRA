import type { Metadata } from "next";
import { ChangeRequestList } from "@/components/university/ChangeRequestList";

export const metadata: Metadata = { title: "University Change Requests" };

export default function UniversityChangeRequestsPage() {
  return <ChangeRequestList />;
}
