"use client";

import { CalendarSearch } from "lucide-react";

export function EmptyState({
  onReset,
  title = "No dates match this view",
}: {
  onReset: () => void;
  title?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <CalendarSearch size={24} />
      </span>
      <h3>{title}</h3>
      <p>Adjust the current filters to bring academic milestones back into view.</p>
      <button className="button button-secondary" onClick={onReset}>
        Clear filters
      </button>
    </div>
  );
}
