"use client";

import {
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  GraduationCap,
  Presentation,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand/Brand";
import { roleDefinitions } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";
import type { DemoRoleId } from "@/lib/types";

const loginRoles: Array<{
  id: DemoRoleId;
  icon: typeof Building2;
}> = [
  { id: "public", icon: CalendarRange },
  { id: "university", icon: GraduationCap },
  { id: "monitoring", icon: Building2 },
  { id: "committee", icon: Scale },
  { id: "administrator", icon: ShieldCheck },
  { id: "executive", icon: Presentation },
];

export function LoginExperience() {
  const [loadingRole, setLoadingRole] = useState<DemoRoleId | null>(null);
  const { selectWorkspace } = useDemoState();
  const router = useRouter();

  function enterWorkspace(role: DemoRoleId) {
    const definition = roleDefinitions[role];
    setLoadingRole(role);
    selectWorkspace(role);
    window.setTimeout(() => router.push(definition.destination), 360);
  }

  return (
    <main className="login-page workspace-login-page">
      <section className="login-scene workspace-login-scene">
        <div className="login-scene-top">
          <Brand inverse />
          <span className="login-year">ACADEMIC YEAR 2026–27</span>
        </div>
        <div className="login-message workspace-login-message">
          <p className="eyebrow">Role-aware academic coordination</p>
          <h1>One calendar. A clear workspace for every responsibility.</h1>
          <p>
            Enter the same statewide academic rhythm through the lens of a
            university, monitoring officer, committee member, administrator or
            executive stakeholder.
          </p>
          <div className="login-benefits">
            <span><Check size={15} /> No credentials required</span>
            <span><Check size={15} /> Progress stays on this device</span>
            <span><Check size={15} /> Switch roles at any time</span>
          </div>
        </div>
        <Image
          src="/brand/kerala-academic-landscape.svg"
          alt=""
          className="login-landscape"
          width={1200}
          height={760}
          priority
        />
      </section>

      <section className="login-panel workspace-login-panel">
        <div className="workspace-login-head">
          <Link className="login-back" href="/calendar">
            ← Back to the public calendar
          </Link>
          <p className="eyebrow">Interactive demonstration</p>
          <h2>Choose your workspace</h2>
          <p>
            Each workspace reveals the tools and decisions relevant to that role.
            No personal information is collected.
          </p>
        </div>

        <div className="workspace-role-list">
          {loginRoles.map(({ id, icon: Icon }, index) => {
            const role = roleDefinitions[id];
            const loading = loadingRole === id;
            return (
              <article
                className={`workspace-role-card role-card-${role.accent}`}
                key={id}
              >
                <div className="workspace-role-number">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <span className="workspace-role-icon">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <div className="workspace-role-copy">
                  <div className="workspace-role-title">
                    <div>
                      <h3>{role.label}</h3>
                      <span>{role.identity}</span>
                    </div>
                  </div>
                  <p>{role.description}</p>
                  <div className="permission-summary" aria-label="Permissions">
                    {role.permissions.map((permission) => (
                      <span key={permission}>{permission}</span>
                    ))}
                  </div>
                </div>
                <button
                  className="workspace-enter-button"
                  onClick={() => enterWorkspace(id)}
                  disabled={loadingRole !== null}
                  aria-label={`Enter Demo Workspace as ${role.label}`}
                >
                  {loading ? "Opening…" : id === "public" ? "Open public calendar" : "Enter Demo Workspace"}
                  {!loading ? <ArrowRight size={16} /> : null}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
