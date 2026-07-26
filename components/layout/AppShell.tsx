"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  FileClock,
  HelpCircle,
  LayoutDashboard,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/brand/Brand";
import { academicYears, navigationByRole } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

type RoleKey = keyof typeof navigationByRole;

const roleLabels: Record<RoleKey, string> = {
  hec: "HEC Secretariat",
  university: "University Nodal Office",
  workflow: "Governance Secretariat",
  executive: "Executive Council",
};

const navIcons: Record<string, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Compliance: ClipboardCheck,
  "State calendar": CalendarDays,
  "Audit trail": FileClock,
  "Calendar workspace": CalendarDays,
  "Governance queue": ShieldCheck,
  "Executive view": LayoutDashboard,
};

export function AppShell({
  role,
  children,
}: {
  role: RoleKey;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const {
    academicYear,
    setAcademicYear,
    notificationsRead,
    setNotificationsRead,
    toast,
  } = useDemoState();
  const crumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1));

  const sidebar = (
    <>
      <div className="sidebar-brand">
        <Brand compact inverse href={`/${role}/dashboard`} />
        <button
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
      </div>
      <div className="role-block">
        <span>Current workspace</span>
        <strong>{roleLabels[role]}</strong>
      </div>
      <nav className="app-nav" aria-label="Application navigation">
        {navigationByRole[role].map((item) => {
          const Icon = navIcons[item.label] ?? LayoutDashboard;
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
            <label className="year-select">
              <CalendarDays size={16} />
              <span className="sr-only">Academic year</span>
              <select
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
              >
                {academicYears.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <button
              className="icon-button notification-button"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
              onClick={() => {
                setNotificationsOpen((value) => !value);
                setProfileOpen(false);
              }}
            >
              <Bell size={19} />
              {!notificationsRead ? <span className="unread-dot" /> : null}
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
              <span className="avatar">MN</span>
              <span className="profile-copy">
                <strong>Meera Nair</strong>
                <small>{roleLabels[role]}</small>
              </span>
              <ChevronDown size={15} />
            </button>
          </div>
          {notificationsOpen ? (
            <section className="utility-popover notifications-popover">
              <div className="popover-title">
                <div>
                  <span className="eyebrow">Updates</span>
                  <h2>Notifications</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setNotificationsRead(true)}
                >
                  <CheckCheck size={15} /> Mark read
                </button>
              </div>
              <div className="notification-item">
                <span className="notification-icon">
                  <CalendarDays size={17} />
                </span>
                <div>
                  <strong>State calendar version 1.4 is live</strong>
                  <p>Published today at 10:42 by the HEC Secretariat.</p>
                </div>
              </div>
              <div className="notification-item">
                <span className="notification-icon terracotta">
                  <ClipboardCheck size={17} />
                </span>
                <div>
                  <strong>Three submissions need review</strong>
                  <p>One item has crossed its coordination deadline.</p>
                </div>
              </div>
            </section>
          ) : null}
          {profileOpen ? (
            <section className="utility-popover profile-popover">
              <div className="profile-popover-head">
                <CircleUserRound size={28} />
                <div>
                  <strong>Dr. Meera Nair</strong>
                  <span>State coordination officer</span>
                </div>
              </div>
              <button
                onClick={() =>
                  toast("Profile preview", "Profile settings are simulated in this prototype.")
                }
              >
                Account preferences
              </button>
              <Link href="/login">Switch demonstration role</Link>
            </section>
          ) : null}
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
