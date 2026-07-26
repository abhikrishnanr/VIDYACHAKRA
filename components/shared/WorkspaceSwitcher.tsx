"use client";

import { ArrowRightLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { roleDefinitions, workspaceRoles } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";
import type { WorkspaceRole } from "@/lib/types";

export function WorkspaceSwitcher({ role }: { role: WorkspaceRole }) {
  const router = useRouter();
  const { selectWorkspace } = useDemoState();

  function switchWorkspace(nextRole: WorkspaceRole) {
    selectWorkspace(nextRole);
    router.push(roleDefinitions[nextRole].destination);
  }

  return (
    <label className="workspace-switcher">
      <ArrowRightLeft size={14} aria-hidden="true" />
      <span className="sr-only">Switch workspace</span>
      <select
        value={role}
        onChange={(event) => switchWorkspace(event.target.value as WorkspaceRole)}
      >
        {workspaceRoles.map((roleId) => (
          <option key={roleId} value={roleId}>
            {roleDefinitions[roleId].shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
