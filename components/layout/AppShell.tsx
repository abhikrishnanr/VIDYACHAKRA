"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  FileClock,
  FileText,
  Gavel,
  HelpCircle,
  Landmark,
  LibraryBig,
  LayoutDashboard,
  Menu,
  Network,
  RotateCcw,
  Scale,
  ShieldCheck,
  SignpostBig,
  UsersRound,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/brand/Brand";
import { AcademicYearSelector } from "@/components/shared/AcademicYearSelector";
import { CalendarVersionBadge } from "@/components/shared/CalendarVersionBadge";
import { DemoResetDialog } from "@/components/shared/DemoResetDialog";
import { NotificationDrawer } from "@/components/shared/NotificationDrawer";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { WorkspaceSwitcher } from "@/components/shared/WorkspaceSwitcher";
import { roleDefinitions } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";
import type { RoleNavigationItem, WorkspaceRole } from "@/lib/types";

const navIcons: Record<RoleNavigationItem["icon"], typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  calendar: CalendarDays,
  compliance: ClipboardCheck,
  institution: Building2,
  request: FileText,
  version: BookOpenCheck,
  report: FileText,
  agenda: SignpostBig,
  decision: Gavel,
  impact: Scale,
  publication: ShieldCheck,
  alert: AlertTriangle,
  audit: FileClock,
  master: LibraryBig,
  course: Landmark,
  structure: Network,
};

const profiles: Record<
  WorkspaceRole,
  { name: string; initials: string; title: string }
> = {
  university: {
    name: "Anjali Menon",
    initials: "AM",
    title: "University nodal officer",
  },
  monitoring: {
    name: "Meera Nair",
    initials: "MN",
    title: "Academic monitoring officer",
  },
  committee: {
    name: "Ravi Varma",
    initials: "RV",
    title: "Empowered committee member",
  },
  administrator: {
    name: "Leela Krishnan",
    initials: "LK",
    title: "Calendar administrator",
  },
  executive: {
    name: "Susan Joseph",
    initials: "SJ",
    title: "Executive viewer",
  },
};

export function AppShell({
  role,
  children,
}: {
  role: WorkspaceRole;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const { notificationCount, masterCalendarVersion, publicationStatus, signOut, toast } =
    useDemoState();
  const definition = roleDefinitions[role];
  const profile = profiles[role];
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace("-", " "));

  function handleSignOut() {
    signOut();
    setProfileOpen(false);
    router.push("/login");
  }

  const sidebar = (
    <>
      <div className="sidebar-brand">
        <Brand compact inverse href={definition.destination} />
        <button
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      <div className="role-block role-block-detailed">
        <span>Current workspace</span>
        <RoleBadge role={role} compact />
        <small>{definition.identity}</small>
        <CalendarVersionBadge
          version={masterCalendarVersion}
          status={publicationStatus}
        />
      </div>
      <nav className="app-nav" aria-label={`${definition.shortLabel} navigation`}>
        {definition.navigation.map((item) => {
          const Icon = navIcons[item.icon];
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "active" : ""}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-help">
        <HelpCircle size={19} />
        <div>
          <strong>Coordination support</strong>
          <span>Weekdays · 09:30–17:30</span>
        </div>
        <button
          onClick={() =>
            toast(
              "Support request noted",
              "A demonstration support request has been added to your activity.",
            )
          }
        >
          Ask for help
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{sidebar}</aside>
      {mobileOpen ? (
        <div className="mobile-sidebar-backdrop" onClick={() => setMobileOpen(false)}>
          <aside className="mobile-sidebar" onClick={(event) => event.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      ) : null}
      <div className="app-frame">
        <header className="utility-bar">
          <div className="utility-left">
            <button
              className="icon-button app-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumbs" aria-label="Breadcrumbs">
              <span>VIDYACHAKRA</span>
              {crumbs.map((crumb) => (
                <span key={crumb}>{crumb}</span>
              ))}
            </div>
          </div>
          <div className="utility-actions">
            <WorkspaceSwitcher role={role} />
            <AcademicYearSelector />
            <button
              className="icon-button notification-button"
              aria-label={`Open notifications${notificationCount ? `, ${notificationCount} unread` : ""}`}
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen(true);
                setProfileOpen(false);
              }}
            >
              <Bell size={19} />
              {notificationCount ? (
                <span className="notification-count">{notificationCount}</span>
              ) : null}
            </button>
            <button
              className="profile-button"
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationsOpen(false);
              }}
            >
              <span className="avatar">{profile.initials}</span>
              <span className="profile-copy">
                <strong>{profile.name}</strong>
                <small>{profile.title}</small>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>
          {profileOpen ? (
            <section className="utility-popover profile-popover">
              <div className="profile-popover-head">
                <CircleUserRound size={28} />
                <div>
                  <strong>{profile.name}</strong>
                  <span>{definition.identity}</span>
                </div>
              </div>
              <Link href="/login" onClick={() => setProfileOpen(false)}>
                <UsersRound size={15} /> Switch workspace
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setResetOpen(true);
                }}
              >
                <RotateCcw size={15} /> Reset demo
              </button>
              <button onClick={handleSignOut}>
                <Landmark size={15} /> Sign out
              </button>
            </section>
          ) : null}
        </header>
        <main className="app-content">{children}</main>
      </div>
      <NotificationDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <DemoResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </div>
  );
}
