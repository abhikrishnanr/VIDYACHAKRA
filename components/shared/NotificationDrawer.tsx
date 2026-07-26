"use client";

import { AlertTriangle, CalendarDays, CheckCheck, X } from "lucide-react";
import { useDemoState } from "@/lib/demo-state";

export function NotificationDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { notificationCount, setNotificationsRead, requestStatus } = useDemoState();
  if (!open) return null;

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        className="notification-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p className="eyebrow">Workspace updates</p>
            <h2 id="notifications-title">Notifications</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close notifications">
            <X size={18} />
          </button>
        </header>
        <button
          className="drawer-mark-read"
          onClick={() => setNotificationsRead(true)}
          disabled={notificationCount === 0}
        >
          <CheckCheck size={15} /> Mark all as read
        </button>
        <div className="drawer-notification urgent">
          <span><AlertTriangle size={18} /></span>
          <div>
            <strong>CR-2026-014 needs action</strong>
            <p>
              The Semester 1 Theory Examination is seven days beyond the council
              baseline. Current stage: {requestStatus.replace("-", " ")}.
            </p>
            <small>Today · 11:30</small>
          </div>
        </div>
        <div className="drawer-notification">
          <span><CalendarDays size={18} /></span>
          <div>
            <strong>Version 1.0 remains the active baseline</strong>
            <p>No approved revision has been published for the examination window.</p>
            <small>Today · 10:42</small>
          </div>
        </div>
      </aside>
    </div>
  );
}
