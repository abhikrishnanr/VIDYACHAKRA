import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock3,
} from "lucide-react";
import type { ComplianceStatus } from "@/lib/types";

const statuses = {
  "on-track": {
    label: "On track",
    icon: CheckCircle2,
  },
  attention: {
    label: "Needs attention",
    icon: Clock3,
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
  },
  "not-reported": {
    label: "Not reported",
    icon: CircleHelp,
  },
};

export function StatusBadge({ status }: { status: ComplianceStatus }) {
  const item = statuses[status];
  const Icon = item.icon;
  return (
    <span className={`status-badge status-${status}`}>
      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
      {item.label}
    </span>
  );
}
