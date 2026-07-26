import {
  Building2,
  GraduationCap,
  Presentation,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { roleDefinitions } from "@/lib/demo-data";
import type { DemoRoleId } from "@/lib/types";

const icons = {
  public: UserRound,
  university: GraduationCap,
  monitoring: Building2,
  committee: Scale,
  administrator: ShieldCheck,
  executive: Presentation,
};

export function RoleBadge({
  role,
  compact = false,
}: {
  role: DemoRoleId;
  compact?: boolean;
}) {
  const definition = roleDefinitions[role];
  const Icon = icons[role];
  return (
    <span
      className={`role-badge role-accent-${definition.accent} ${
        compact ? "role-badge-compact" : ""
      }`}
    >
      <Icon size={compact ? 13 : 15} aria-hidden="true" />
      {definition.shortLabel}
    </span>
  );
}
