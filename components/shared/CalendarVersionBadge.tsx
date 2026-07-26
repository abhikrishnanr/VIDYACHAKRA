import { LockKeyhole } from "lucide-react";
import type { PublicationStatus } from "@/lib/types";

export function CalendarVersionBadge({
  version,
  status,
}: {
  version: string;
  status: PublicationStatus;
}) {
  return (
    <span className="calendar-version-badge">
      <LockKeyhole size={13} aria-hidden="true" />
      Version {version}
      <small>{status}</small>
    </span>
  );
}
