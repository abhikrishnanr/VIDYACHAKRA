import { AlertTriangle, CheckCircle2, CircleHelp, Clock3 } from "lucide-react";
import type { RagStatus } from "@/lib/types";

const ragDetails = {
  green: { label: "On track", icon: CheckCircle2 },
  amber: { label: "Needs attention", icon: Clock3 },
  red: { label: "Unauthorised deviation", icon: AlertTriangle },
  grey: { label: "Not yet due", icon: CircleHelp },
};

export function RagBadge({
  status,
  label,
}: {
  status: RagStatus;
  label?: string;
}) {
  const detail = ragDetails[status];
  const Icon = detail.icon;
  return (
    <span className={`rag-badge rag-${status}`}>
      <Icon size={14} strokeWidth={2.2} aria-hidden="true" />
      {label ?? detail.label}
    </span>
  );
}
