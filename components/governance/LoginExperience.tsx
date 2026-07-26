"use client";

import { ArrowRight, Building2, Check, Landmark, Scale, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand/Brand";

const roles = [
  {
    id: "hec",
    label: "HEC Secretariat",
    description: "Coordinate statewide calendars and compliance.",
    icon: Landmark,
    destination: "/hec/dashboard",
  },
  {
    id: "university",
    label: "University Nodal Office",
    description: "Align an institutional calendar to the state baseline.",
    icon: Building2,
    destination: "/university/dashboard",
  },
  {
    id: "workflow",
    label: "Governance Secretariat",
    description: "Review submissions, variations and approvals.",
    icon: Scale,
    destination: "/workflow/dashboard",
  },
  {
    id: "executive",
    label: "Executive Council",
    description: "View concise, statewide academic readiness.",
    icon: Users,
    destination: "/executive/dashboard",
  },
];

export function LoginExperience() {
  const [selected, setSelected] = useState(roles[0].id);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const current = roles.find((role) => role.id === selected) ?? roles[0];

  function enterPrototype() {
    setLoading(true);
    window.localStorage.setItem("vidyachakra-demo-role", selected);
    window.setTimeout(() => router.push(current.destination), 450);
  }

  return (
    <main className="login-page">
      <section className="login-scene">
        <div className="login-scene-top">
          <Brand inverse />
          <span className="login-year">ACADEMIC YEAR 2026–27</span>
        </div>
        <div className="login-message">
          <p className="eyebrow">A shared calendar for a shared purpose</p>
          <h1>Academic coordination, from council chamber to classroom.</h1>
          <p>
            Explore how each participant in Kerala&apos;s higher education
            ecosystem sees the same academic rhythm through a purpose-built lens.
          </p>
          <div className="login-benefits">
            <span>
              <Check size={15} /> Statewide calendar baseline
            </span>
            <span>
              <Check size={15} /> Transparent review workflows
            </span>
            <span>
              <Check size={15} /> Actionable compliance signals
            </span>
          </div>
        </div>
        <Image
          src="/brand/kerala-academic-landscape.svg"
          alt=""
          className="login-landscape"
          width={1200}
          height={760}
        />
      </section>
      <section className="login-panel">
        <Link className="login-back" href="/">
          ← Return to public site
        </Link>
        <div className="login-form">
          <p className="eyebrow">Interactive demonstration</p>
          <h2>Choose your workspace</h2>
          <p className="login-intro">
            No account is required. Select a role to enter its simulated workspace.
          </p>
          <div className="role-options">
            {roles.map((role) => {
              const Icon = role.icon;
              const active = selected === role.id;
              return (
                <button
                  key={role.id}
                  className={`role-option ${active ? "active" : ""}`}
                  onClick={() => setSelected(role.id)}
                  aria-pressed={active}
                >
                  <span className="role-option-icon">
                    <Icon size={20} />
                  </span>
                  <span>
                    <strong>{role.label}</strong>
                    <small>{role.description}</small>
                  </span>
                  <span className="role-radio">{active ? <Check size={13} /> : null}</span>
                </button>
              );
            })}
          </div>
          <button className="button button-primary login-submit" onClick={enterPrototype}>
            {loading ? "Preparing workspace…" : `Continue as ${current.label}`}
            {!loading ? <ArrowRight size={17} /> : null}
          </button>
          <p className="login-assurance">
            This sign-in is simulated. No personal information is collected.
          </p>
        </div>
      </section>
    </main>
  );
}
