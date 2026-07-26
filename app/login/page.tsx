import type { Metadata } from "next";
import { LoginExperience } from "@/components/governance/LoginExperience";

export const metadata: Metadata = {
  title: "Choose a Workspace",
};

export default function LoginPage() {
  return <LoginExperience />;
}
