"use client";

import {
  ArrowUpRight,
  Download,
  Mail,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { Modal } from "@/components/shared/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { institutions } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

export function ComplianceView() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [reminderOpen, setReminderOpen] = useState(false);
  const { toast } = useDemoState();
  const results = useMemo(
    () =>
      institutions.filter((item) => {
        const matchesSearch = `${item.name} ${item.region}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesSearch && (status === "all" || item.status === status);
      }),
    [query, status],
  );

  return (
    <>
      <PageHeader
        eyebrow="HEC Secretariat · Academic year 2026–27"
        title="Institutional alignment"
        description="Track how university calendars align with the statewide academic baseline, while keeping exceptions visible and explainable."
        actions={
          <>
            <button
              className="button button-secondary"
              onClick={() =>
                toast(
                  "Compliance report prepared",
                  "The demonstration summary is ready for download.",
                )
              }
            >
              <Download size={16} /> Export summary
            </button>
            <button
              className="button button-primary"
              onClick={() => setReminderOpen(true)}
            >
              <Mail size={16} /> Send reminder
            </button>
          </>
        }
      />

      <section className="compliance-overview">
        <div className="compliance-lead">
          <div className="readiness-ring" style={{ "--progress": "86%" } as CSSProperties}>
            <span>86%</span>
          </div>
          <div>
            <p className="eyebrow">Statewide readiness</p>
            <h2>31 of 36 universities have submitted</h2>
            <p>
              Two submissions require clarification and one institution has crossed
              the coordination deadline.
            </p>
          </div>
        </div>
        <div className="status-summary">
          <div>
            <StatusBadge status="on-track" />
            <strong>27</strong>
            <span>Aligned</span>
          </div>
          <div>
            <StatusBadge status="attention" />
            <strong>4</strong>
            <span>In review</span>
          </div>
          <div>
            <StatusBadge status="overdue" />
            <strong>1</strong>
            <span>Past due</span>
          </div>
          <div>
            <StatusBadge status="not-reported" />
            <strong>4</strong>
            <span>Not submitted</span>
          </div>
        </div>
      </section>

      <section className="data-panel">
        <div className="data-toolbar">
          <div className="search-field">
            <Search size={17} />
            <label className="sr-only" htmlFor="institution-search">
              Search institutions
            </label>
            <input
              id="institution-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search university or region"
            />
          </div>
          <label className="filter-select">
            <SlidersHorizontal size={16} />
            <span className="sr-only">Compliance status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="on-track">On track</option>
              <option value="attention">Needs attention</option>
              <option value="overdue">Overdue</option>
              <option value="not-reported">Not reported</option>
            </select>
          </label>
        </div>
        {results.length ? (
          <div className="institution-list">
            <div className="institution-row institution-row-head">
              <span>Institution</span>
              <span>Submission</span>
              <span>Alignment note</span>
              <span>Status</span>
              <span />
            </div>
            {results.map((institution) => (
              <div className="institution-row" key={institution.id}>
                <div>
                  <strong>{institution.name}</strong>
                  <small>{institution.region} region</small>
                </div>
                <span>{institution.submission}</span>
                <span>{institution.variance}</span>
                <StatusBadge status={institution.status} />
                <button
                  className="row-action"
                  aria-label={`Open ${institution.name}`}
                  onClick={() =>
                    toast(
                      institution.name,
                      "The institutional compliance detail drawer is simulated.",
                    )
                  }
                >
                  Review <ArrowUpRight size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No institutions match this view"
            onReset={() => {
              setQuery("");
              setStatus("all");
            }}
          />
        )}
      </section>

      <Modal
        open={reminderOpen}
        onClose={() => setReminderOpen(false)}
        title="Send a coordination reminder"
      >
        <div className="modal-body">
          <p>
            This will simulate a reminder to the five institutions with incomplete
            academic calendar submissions.
          </p>
          <label className="form-field">
            <span>Message</span>
            <textarea defaultValue="Please complete your academic calendar submission for 2026–27, including any requested variations, by 29 July." />
          </label>
          <div className="modal-actions">
            <button className="button button-secondary" onClick={() => setReminderOpen(false)}>
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setReminderOpen(false);
                toast(
                  "Reminder logged",
                  "A simulated reminder was recorded for five institutions.",
                );
              }}
            >
              Confirm reminder
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
