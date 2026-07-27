"use client";

import Link from "next/link";
import {
  BookOpenCheck,
  CalendarRange,
  Eye,
  GraduationCap,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useDemoState } from "@/lib/demo-state";
import type { ReactNode } from "react";

export type MasterKind = "academic-years" | "calendar-milestones" | "courses";

const masterLinks = [
  {
    id: "academic-years" as const,
    label: "Academic years",
    description: "Planning horizon",
    href: "/hec/masters/academic-years",
    icon: CalendarRange,
  },
  {
    id: "calendar-milestones" as const,
    label: "Milestone definitions",
    description: "Submission fields",
    href: "/hec/masters/calendar-milestones",
    icon: BookOpenCheck,
  },
  {
    id: "courses" as const,
    label: "Official course master",
    description: "Authoritative catalogue",
    href: "/hec/masters/courses",
    icon: GraduationCap,
  },
];

export function MasterWorkspaceShell({
  active,
  title,
  description,
  search,
  onSearch,
  status,
  onStatus,
  statusOptions,
  actionLabel,
  onAction,
  resultLabel,
  children,
}: {
  active: MasterKind;
  title: string;
  description: string;
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  statusOptions: Array<{ value: string; label: string }>;
  actionLabel: string;
  onAction: () => void;
  resultLabel: string;
  children: ReactNode;
}) {
  const { academicYears, calendarMilestoneDefinitions, courseMasters } =
    useDemoState();
  const canEdit = true;
  const counts: Record<MasterKind, number> = {
    "academic-years": academicYears.length,
    "calendar-milestones": calendarMilestoneDefinitions.length,
    courses: courseMasters.length,
  };

  return (
    <div className="master-workspace">
      <PageHeader
        eyebrow="HEC Master Data"
        title={title}
        description={description}
        actions={
          canEdit ? (
            <button className="button button-primary" onClick={onAction}>
              <Plus size={16} aria-hidden="true" />
              {actionLabel}
            </button>
          ) : (
            <span className="master-readonly-badge">
              <Eye size={15} aria-hidden="true" />
              Monitoring view · read only
            </span>
          )
        }
      />

      <div className="master-workspace-grid">
        <aside className="master-category-nav" aria-label="Master data categories">
          <div className="master-category-heading">
            <ShieldCheck size={17} aria-hidden="true" />
            <div>
              <strong>Authoritative masters</strong>
              <span>HEC governed records</span>
            </div>
          </div>
          {masterLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                className={item.id === active ? "active" : ""}
                key={item.id}
              >
                <Icon size={17} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <b>{counts[item.id]}</b>
              </Link>
            );
          })}
          <p>
            Changes here affect future university selections. Existing published
            calendar and offering records retain their references.
          </p>
        </aside>

        <main className="master-main">
          <section className="master-permission-note">
            <div>
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <strong>
                  {canEdit
                    ? "Administrator controls enabled"
                    : "Authoritative records are protected"}
                </strong>
                <span>
                  {canEdit
                    ? "Creates, edits and status changes are saved locally and added to the audit trail."
                    : "Switch to the HEC Calendar Administrator workspace to manage these records."}
                </span>
              </div>
            </div>
            <small>Local-state governance</small>
          </section>

          <section className="master-list-panel">
            <div className="master-toolbar">
              <label className="master-search">
                <span className="sr-only">Search records</span>
                <input
                  value={search}
                  onChange={(event) => onSearch(event.target.value)}
                  placeholder="Search name, code or discipline"
                />
              </label>
              <label className="master-filter">
                <span>Status</span>
                <select value={status} onChange={(event) => onStatus(event.target.value)}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="master-result-count">{resultLabel}</span>
            </div>
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}

export function MasterDetailDrawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="master-drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="master-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="master-drawer-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>Master record</span>
            <h2 id="master-drawer-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close details">
            <X size={19} />
          </button>
        </header>
        <div className="master-drawer-body">{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function MasterStatus({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}: {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}) {
  return (
    <span className={`master-status ${active ? "is-active" : "is-inactive"}`}>
      <span aria-hidden="true" />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

export function MasterEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="master-empty">
      <BookOpenCheck size={25} aria-hidden="true" />
      <strong>No matching master records</strong>
      <p>{children}</p>
    </div>
  );
}
