"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  FileClock,
  FilePlus2,
  History,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";

const statusCopy = {
  draft: {
    label: "Draft",
    tone: "red",
    description: "Complete the impact statement and submit for screening.",
  },
  submitted: {
    label: "Submitted",
    tone: "amber",
    description: "Received by the HEC Academic Monitoring Cell for screening.",
  },
  screening: {
    label: "Screening",
    tone: "amber",
    description: "The monitoring officer is checking completeness and impact.",
  },
  "committee-review": {
    label: "Committee review",
    tone: "amber",
    description: "The request is with the Empowered Committee for decision.",
  },
  returned: {
    label: "Information requested",
    tone: "amber",
    description: "Additional information is required from the university.",
  },
  approved: {
    label: "Approved pending publication",
    tone: "amber",
    description: "The decision is recorded but does not take effect until publication.",
  },
  rejected: {
    label: "Decision recorded",
    tone: "red",
    description: "The university must retain or restore the approved baseline.",
  },
  published: {
    label: "Published · Official",
    tone: "green",
    description: "The approved exception is part of Calendar Version 1.1.",
  },
} as const;

export function ChangeRequestList() {
  const { requestStatus, toast } = useDemoState();
  const [query, setQuery] = useState("");
  const current = statusCopy[requestStatus];
  const visible = "CR-2026-014 Semester 1 Theory Examination".toLowerCase().includes(query.toLowerCase());

  return (
    <div className="uni-page">
      <header className="uni-page-header">
        <div>
          <p className="uni-kicker">Controlled calendar change workflow</p>
          <h1>Change requests</h1>
          <p>
            Prepare and track formal requests without changing the published Council
            baseline directly.
          </p>
        </div>
        <Link className="button button-primary" href="/university/change-requests/new">
          <FilePlus2 size={16} /> New change request
        </Link>
      </header>

      <section className="uni-request-rule">
        <ShieldCheck size={21} />
        <div>
          <strong>Published milestones remain locked throughout review</strong>
          <p>
            A proposed date becomes official only after committee approval and
            publication in a new calendar version.
          </p>
        </div>
      </section>

      <div className="uni-request-toolbar">
        <label>
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search request number or event"
          />
        </label>
        <button
          className="button button-secondary"
          onClick={() =>
            toast(
              "Request register prepared",
              "A demonstration request register has been prepared.",
            )
          }
        >
          Export register
        </button>
      </div>

      {visible ? (
        <article className="uni-request-card">
          <div className="uni-request-card-head">
            <div>
              <span className={`uni-state-chip ${current.tone}`}>
                {current.tone === "green" ? (
                  <CheckCircle2 size={14} />
                ) : current.tone === "red" ? (
                  <AlertTriangle size={14} />
                ) : (
                  <Clock3 size={14} />
                )}
                {current.label}
              </span>
              <p>CR-2026-014 · Created 26 July 2026</p>
              <h2>Semester 1 Theory Examination</h2>
            </div>
            <Link
              className="button button-secondary"
              href={
                requestStatus === "draft"
                  ? "/university/change-requests/new"
                  : "/university/change-requests/new?view=review"
              }
            >
              {requestStatus === "draft" ? "Continue request" : "View request"}
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="uni-request-date-line">
            <span>
              <small>Council baseline</small>
              <strong><CalendarRange size={16} /> 05 Dec 2026</strong>
            </span>
            <ArrowRight size={19} />
            <span>
              <small>Proposed revision</small>
              <strong><CalendarRange size={16} /> 12 Dec 2026</strong>
            </span>
            <span className="uni-variance">+7 days</span>
          </div>
          <p className="uni-request-description">
            Severe monsoon disruption affected scheduled academic activities across
            18 affiliated colleges.
          </p>
          <div className="uni-request-meta">
            <span><strong>18</strong> affected colleges</span>
            <span><strong>11,460</strong> students estimated</span>
            <span><strong>3</strong> downstream milestones</span>
          </div>
          <div className="uni-request-progress">
            <div className="complete"><CheckCircle2 size={15} /><span>Draft prepared<small>26 Jul · 09:05</small></span></div>
            <i className={requestStatus === "draft" ? "" : "active"} />
            <div className={requestStatus === "draft" ? "current" : "complete"}>
              {requestStatus === "draft" ? <FileClock size={15} /> : <CheckCircle2 size={15} />}
              <span>Submitted<small>{requestStatus === "draft" ? "Awaiting university" : "26 Jul · 15:08"}</small></span>
            </div>
            <i className={["committee-review", "approved", "published"].includes(requestStatus) ? "active" : ""} />
            <div className={["committee-review", "approved", "published"].includes(requestStatus) ? "complete" : ""}><History size={15} /><span>Committee decision<small>{requestStatus === "approved" || requestStatus === "published" ? "Approved" : "Pending"}</small></span></div>
            <i className={requestStatus === "published" ? "active" : ""} />
            <div className={requestStatus === "published" ? "complete" : ""}><ShieldCheck size={15} /><span>Publication<small>{requestStatus === "published" ? "Version 1.1" : "Not yet official"}</small></span></div>
          </div>
          <div className={`uni-request-position ${current.tone}`}>
            <FileClock size={17} />
            <span><strong>Current position</strong>{current.description}</span>
          </div>
        </article>
      ) : (
        <section className="uni-empty-request">
          <Search size={25} />
          <h2>No request matches “{query}”</h2>
          <button onClick={() => setQuery("")}>Clear search</button>
        </section>
      )}
    </div>
  );
}

