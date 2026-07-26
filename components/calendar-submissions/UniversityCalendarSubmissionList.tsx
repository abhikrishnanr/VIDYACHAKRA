"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  FilePlus2,
  FileSearch2,
  LockKeyhole,
  RotateCcw,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  countSubmissionStatuses,
  formatCalendarDate,
  scopeLabel,
  submissionStatusLabel,
} from "@/lib/calendar-submissions";
import { useDemoState } from "@/lib/demo-state";

const statusIcons = {
  draft: FilePlus2,
  submitted: Send,
  under_review: FileSearch2,
  returned: RotateCcw,
  accepted: CheckCircle2,
  locked: LockKeyhole,
};

export function UniversityCalendarSubmissionList() {
  const state = useDemoState();
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");

  const submissions = useMemo(
    () =>
      state.universityCalendarSubmissions
        .filter((item) => item.universityId === "sahya")
        .filter((item) => year === "all" || item.academicYearId === year)
        .filter((item) => status === "all" || item.status === status)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.universityCalendarSubmissions, status, year],
  );

  return (
    <div className="cal-sub-page">
      <header className="cal-sub-page-header">
        <div>
          <p className="cal-sub-kicker">University calendar governance</p>
          <h1>Annual calendar submissions</h1>
          <p>
            Prepare university calendars as structured milestone data, declare
            deviations and submit them to HEC for controlled review and locking.
          </p>
        </div>
        <Link
          className="button button-primary cal-sub-primary"
          href="/university/calendar-submissions/new"
        >
          <FilePlus2 size={16} /> Start New Submission
        </Link>
      </header>

      <section className="cal-sub-guardrail">
        <LockKeyhole size={18} />
        <div>
          <strong>Structured dates are the authoritative record</strong>
          <p>
            Documents may be referenced as supporting material, but a PDF cannot
            replace the milestone dates entered in VIDYACHAKRA.
          </p>
        </div>
      </section>

      <section className="cal-sub-filterbar">
        <div>
          <label htmlFor="submission-year">Academic year</label>
          <select
            id="submission-year"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="all">All academic years</option>
            {state.academicYears.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="submission-status">Submission status</label>
          <select
            id="submission-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under HEC Review</option>
            <option value="returned">Returned</option>
            <option value="locked">Locked</option>
          </select>
        </div>
        <span>
          <CalendarRange size={15} />
          {submissions.length} annual record{submissions.length === 1 ? "" : "s"}
        </span>
      </section>

      <section className="cal-sub-list-panel">
        <div className="cal-sub-list-head cal-sub-list-grid">
          <span>Academic calendar</span>
          <span>Version & scope</span>
          <span>Submission</span>
          <span>HEC review</span>
          <span>Milestone alignment</span>
          <span>Actions</span>
        </div>
        {submissions.map((submission) => {
          const academicYear = state.academicYears.find(
            (item) => item.id === submission.academicYearId,
          );
          const entries = state.universityCalendarEntries.filter(
            (entry) => entry.submissionId === submission.id,
          );
          const counts = countSubmissionStatuses(entries);
          const StatusIcon = statusIcons[submission.status];
          const editable =
            submission.status === "draft" || submission.status === "returned";
          return (
            <article
              className="cal-sub-list-row cal-sub-list-grid"
              key={submission.id}
            >
              <div>
                <span className="cal-sub-record-icon">
                  <CalendarRange size={18} />
                </span>
                <div>
                  <strong>{submission.title}</strong>
                  <small>
                    {academicYear?.label} · {submission.programmeType} · Semester{" "}
                    {submission.applicableSemesters.join(" & ")}
                  </small>
                </div>
              </div>
              <div>
                <strong>Version {submission.version}</strong>
                <small>{scopeLabel(submission.scopeType)}</small>
              </div>
              <div>
                <span className={`cal-sub-status status-${submission.status}`}>
                  <StatusIcon size={13} />
                  {submissionStatusLabel(submission.status)}
                </span>
                <small>
                  {submission.submittedAt
                    ? `Submitted ${formatCalendarDate(
                        submission.submittedAt.slice(0, 10),
                      )}`
                    : "Not yet submitted"}
                </small>
              </div>
              <div>
                <strong>
                  {submission.status === "returned"
                    ? "Correction required"
                    : submission.status === "locked"
                      ? "Accepted and locked"
                      : submission.status === "under_review"
                        ? "Officer review in progress"
                        : submission.status === "submitted"
                          ? "Awaiting review"
                          : "Not started"}
                </strong>
                <small>{submission.reviewNote || "No review note"}</small>
              </div>
              <div className="cal-sub-rag-counts">
                <span className="green">
                  <CheckCircle2 size={12} /> {counts.green} aligned
                </span>
                <span className="amber">
                  <Clock3 size={12} /> {counts.amber} amber
                </span>
                <span className="red">
                  <RotateCcw size={12} /> {counts.red} red
                </span>
              </div>
              <div className="cal-sub-row-actions">
                {editable ? (
                  <Link
                    href={`/university/calendar-submissions/new?submission=${submission.id}`}
                  >
                    Continue Draft
                  </Link>
                ) : null}
                <Link
                  href={`/university/calendar-submissions/${submission.id}`}
                >
                  {submission.status === "locked"
                    ? "View Locked Calendar"
                    : "Preview"}
                </Link>
                {submission.status === "draft" ? (
                  <button
                    onClick={() =>
                      state.submitUniversityCalendarSubmission(submission.id)
                    }
                  >
                    Submit to HEC
                  </button>
                ) : null}
                {submission.status === "locked" ? (
                  <Link href="/university/change-requests/new">
                    Request Change <ArrowRight size={12} />
                  </Link>
                ) : null}
              </div>
            </article>
          );
        })}
        {!submissions.length ? (
          <div className="cal-sub-empty">
            <FileSearch2 size={28} />
            <h2>No submissions match these filters</h2>
            <p>Adjust the academic year or status to restore the list.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
