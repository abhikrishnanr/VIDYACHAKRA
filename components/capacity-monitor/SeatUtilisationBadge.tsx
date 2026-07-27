import {
  AlertTriangle,
  CheckCircle2,
  CircleMinus,
  Clock3,
} from "lucide-react";
import type { SeatUtilisationStatus } from "@/lib/capacity-monitor";

const icons = {
  green: CheckCircle2,
  amber: Clock3,
  red: AlertTriangle,
  grey: CircleMinus,
};

export function SeatUtilisationBadge({
  status,
  label,
  reason,
  showReason = false,
}: {
  status: SeatUtilisationStatus;
  label: string;
  reason: string;
  showReason?: boolean;
}) {
  const Icon = icons[status];
  return (
    <span className={`seat-status seat-${status}`}>
      <span className="seat-status-label">
        <Icon size={13} aria-hidden="true" />
        {label}
      </span>
      {showReason ? <small>{reason}</small> : null}
    </span>
  );
}
