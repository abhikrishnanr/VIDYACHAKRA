"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Download,
  FileSearch2,
  LockKeyhole,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  countSubmissionStatuses,
  formatCalendarDate,
  scopeLabel,
  submissionStatusLabel,
} from "@/lib/calendar-submissions";
import { useDemoState } from "@/lib/demo-state";

export function HECCalendarSubmissionQueue() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("action");
  const [year, setYear] = useState("ay-2026-27");
  const [programme, setProgramme] = useState("FYUGP");

  const rows = useMemo(
    () =>
      state.universityCalendarSubmissions
        .map((submission) => {
          const university = state.universityProfiles.find(
            (item) => item.id === submission.universityId,
          );
          const entries = state.universityCalendarEntries.filter(
            (entry) => entry.submissionId === submission.id,
          );
          return {
            submission,
            university,
            counts: countSubmissionStatuses(entries),
          };
        })
        .filter(
          ({ submission }) =>
            year === "all" || submission.academicYearId === year,
        )
        .filter(
          ({ submission }) =>
            programme === "all" || submission.programmeType === programme,
        )
        .filter(({ submission }) =>
          status === "all"
            ? true
            : status === "action"
              ? ["submitted", "under_review"].includes(submission.status)
              : submission.status === status,
        )
        .filter(({ submission, university }) =>
          `${university?.name} ${submission.title} ${submission.id}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const priority = (value: string) =>
            value === "under_review" ? 0 : value === "submitted" ? 1 : 2;
          return (
            priority(a.submission.status) - priority(b.submission.status) ||
            (b.submission.submittedAt ?? b.submission.createdAt).localeCompare(
              a.submission.submittedAt ?? a.submission.createdAt,
            )
          );
        }),
    [
      programme,
      query,
      state.universityCalendarEntries,
      state.universityCalendarSubmissions,
      state.universityProfiles,
      status,
      year,
    ],
  );

  const awaitingReview = state.universityCalendarSubmissions.filter((item) =>
    ["submitted", "under_review"].includes(item.status),
  ).length;
  const locked = state.universityCalendarSubmissions.filter(
    (item) => item.status === "locked",
  ).length;
  const returned = state.universityCalendarSubmissions.filter(
    (item) => item.status === "returned",
  ).length;

  return (
    <div className="cal-sub-page hec-cal-queue-page">
      <header className="cal-sub-page-header">
        <div>
          <p className="cal-sub-kicker">Structured calendar control</p>
          <h1>University calendar submissions</h1>
          <p>
            Review university-entered milestone dates against the active HEC
            definitions before accepting and locking the annual calendar.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            state.toast(
              "Queue exported",
              "The current structured submission queue has been prepared.",
            )
          }
        >
          <Download size={15} /> Export Queue
        </button>
      </header>

      <section className="hec-queue-pulse">
        <div className="lead">
          <span><CalendarClock size={21} /></span>
          <div>
            <small>Calendar review pulse</small>
            <strong>
              {awaitingReview
                ? `${awaitingReview} submission${awaitingReview === 1 ? "" : "s"} require HEC action`
                : "No university calendars are waiting for review"}
            </strong>
            <p>
              Structured dates remain reviewable; supporting PDFs never replace
              the submission record.
            </p>
          </div>
        </div>
        <div>
          <span>Awaiting review</span>
          <strong>{awaitingReview}</strong>
        </div>
        <div>
          <span>Locked calendars</span>
          <strong>{locked}</strong>
        </div>
        <div>
          <span>Returned</span>
          <strong>{returned}</strong>
        </div>
      </section>

      <section className="cal-sub-filterbar hec-queue-filters">
        <label className="cal-queue-search">
          <span>Search submissions</span>
          <div>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="University, title or reference"
            />
          </div>
        </label>
        <label>
          <span>Academic year</span>
          <select
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="all">All years</option>
            {state.academicYears.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Programme</span>
          <select
            value={programme}
            onChange={(event) => setProgramme(event.target.value)}
          >
            <option value="all">All programmes</option>
            <option value="FYUGP">FYUGP</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Postgraduate">Postgraduate</option>
          </select>
        </label>
        <label>
          <span>Review status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="action">Requires HEC action</option>
            <option value="all">All submissions</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under HEC Review</option>
            <option value="returned">Returned</option>
            <option value="locked">Locked</option>
          </select>
        </label>
      </section>

      <section className="hec-queue-panel">
        <div className="hec-queue-head hec-queue-grid">
          <span>University & submission</span>
          <span>Academic context</span>
          <span>Scope</span>
          <span>Submission date</span>
          <span>Deviations</span>
          <span>Review status</span>
          <span />
        </div>
        {rows.map(({ submission, university, counts }) => (
          <article className="hec-queue-row hec-queue-grid" key={submission.id}>
            <div>
              <span className="hec-queue-university-mark">
                {university?.shortName.slice(0, 2)}
              </span>
              <div>
                <strong>{university?.name}</strong>
                <small>{submission.title}</small>
                <span>{submission.id}</span>
              </div>
            </div>
            <div>
              <strong>
                {
                  state.academicYears.find(
                    (item) => item.id === submission.academicYearId,
                  )?.label
                }
              </strong>
              <small>
                {submission.programmeType} · Semester{" "}
                {submission.applicableSemesters.join(" & ")}
              </small>
            </div>
            <div>
              <strong>{scopeLabel(submission.scopeType)}</strong>
              <small>Version {submission.version}</small>
            </div>
            <div>
              <strong>
                {submission.submittedAt
                  ? formatCalendarDate(submission.submittedAt.slice(0, 10))
                  : "Not submitted"}
              </strong>
              <small>{counts.incomplete} missing milestones</small>
            </div>
            <div className="hec-deviation-counts">
              <span className="red">
                <AlertTriangle size={12} /> {counts.red} red
              </span>
              <span className="amber">
                <CircleAlert size={12} /> {counts.amber} amber
              </span>
              <span className="green">
                <CheckCircle2 size={12} /> {counts.green} aligned
              </span>
            </div>
            <div>
              <span className={`cal-sub-status status-${submission.status}`}>
                {submission.status === "locked" ? (
                  <LockKeyhole size={13} />
                ) : (
                  <FileSearch2 size={13} />
                )}
                {submissionStatusLabel(submission.status)}
              </span>
              <small>{submission.reviewNote || "No review note"}</small>
            </div>
            <Link href={`/hec/calendar-submissions/${submission.id}`}>
              Review <ArrowRight size={13} />
            </Link>
          </article>
        ))}
        {!rows.length ? (
          <div className="cal-sub-empty">
            <CheckCircle2 size={28} />
            <h2>No submissions match this queue view</h2>
            <p>Change the review status or filters to see other records.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
