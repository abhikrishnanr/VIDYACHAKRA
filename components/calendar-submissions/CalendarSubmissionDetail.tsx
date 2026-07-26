"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  FileText,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  calendarSubmissionGroups,
  countSubmissionStatuses,
  formatCalendarDate,
  formatCalendarDateRange,
  formatVariance,
  getMilestoneGroup,
  getSubmissionUnits,
  inheritanceSummary,
  scopeLabel,
  submissionStatusLabel,
} from "@/lib/calendar-submissions";
import { useDemoState } from "@/lib/demo-state";

export function CalendarSubmissionDetail({
  submissionId,
  workspace,
}: {
  submissionId: string;
  workspace: "university" | "hec";
}) {
  const state = useDemoState();
  const [reviewNote, setReviewNote] = useState("");
  const submission = state.universityCalendarSubmissions.find(
    (item) => item.id === submissionId,
  );

  const entries = useMemo(
    () =>
      state.universityCalendarEntries
        .filter((entry) => entry.submissionId === submissionId)
        .sort((a, b) => {
          const definitionA = state.calendarMilestoneDefinitions.find(
            (item) => item.id === a.milestoneDefinitionId,
          );
          const definitionB = state.calendarMilestoneDefinitions.find(
            (item) => item.id === b.milestoneDefinitionId,
          );
          return (
            (definitionA?.displayOrder ?? 0) -
              (definitionB?.displayOrder ?? 0) ||
            a.semester - b.semester
          );
        }),
    [
      state.calendarMilestoneDefinitions,
      state.universityCalendarEntries,
      submissionId,
    ],
  );

  if (!submission) {
    return (
      <div className="cal-sub-page">
        <section className="cal-sub-not-found">
          <FileText size={28} />
          <h1>Calendar submission not found</h1>
          <p>The requested local demonstration record is not available.</p>
          <Link
            className="button button-primary"
            href={
              workspace === "hec"
                ? "/hec/calendar-submissions"
                : "/university/calendar-submissions"
            }
          >
            Return to submissions
          </Link>
        </section>
      </div>
    );
  }

  const university = state.universityProfiles.find(
    (item) => item.id === submission.universityId,
  );
  const year = state.academicYears.find(
    (item) => item.id === submission.academicYearId,
  );
  const counts = countSubmissionStatuses(entries);
  const units = getSubmissionUnits(submission, state.academicDeliveryUnits);
  const reviewable =
    submission.status === "submitted" ||
    submission.status === "under_review";
  const editable =
    submission.status === "draft" || submission.status === "returned";
  const currentSubmissionId = submission.id;

  function addReviewNote() {
    if (state.addUniversityCalendarReviewNote(currentSubmissionId, reviewNote)) {
      setReviewNote("");
    }
  }

  function decide(decision: "lock" | "return") {
    if (decision === "return" && !reviewNote.trim()) {
      state.toast(
        "Correction note required",
        "Explain what the university must correct before resubmission.",
      );
      return;
    }
    if (
      state.reviewUniversityCalendarSubmission(
        currentSubmissionId,
        decision,
        reviewNote,
      )
    ) {
      setReviewNote("");
    }
  }

  return (
    <div className="cal-sub-page cal-sub-detail-page">
      <header className="cal-detail-header">
        <Link
          href={
            workspace === "hec"
              ? "/hec/calendar-submissions"
              : "/university/calendar-submissions"
          }
        >
          <ArrowLeft size={14} /> Submission queue
        </Link>
        <div className="cal-detail-title">
          <span className="cal-detail-seal">
            {submission.status === "locked" ? (
              <LockKeyhole size={22} />
            ) : (
              <CalendarCheck2 size={22} />
            )}
          </span>
          <div>
            <p className="cal-sub-kicker">
              {year?.label} · {submission.programmeType} · Version{" "}
              {submission.version}
            </p>
            <h1>{submission.title}</h1>
            <p>
              {workspace === "hec" ? `${university?.name} · ` : ""}
              Semester {submission.applicableSemesters.join(" and ")} ·{" "}
              {scopeLabel(submission.scopeType)}
            </p>
          </div>
          <span className={`cal-sub-status status-${submission.status}`}>
            {submission.status === "locked" ? (
              <LockKeyhole size={13} />
            ) : submission.status === "returned" ? (
              <RotateCcw size={13} />
            ) : (
              <ShieldCheck size={13} />
            )}
            {submissionStatusLabel(submission.status)}
          </span>
        </div>
        <div className="cal-detail-actions">
          {workspace === "university" && editable ? (
            <Link
              className="button button-primary"
              href={`/university/calendar-submissions/new?submission=${submission.id}`}
            >
              Continue Draft <ArrowRight size={14} />
            </Link>
          ) : null}
          {workspace === "university" && submission.status === "locked" ? (
            <Link
              className="button button-primary"
              href="/university/change-requests/new"
            >
              Request Date Change <ArrowRight size={14} />
            </Link>
          ) : null}
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Preview prepared",
                "A read-only structured calendar preview is ready. Supporting documents are not treated as the calendar.",
              )
            }
          >
            <FileCheck2 size={15} /> Preview
          </button>
        </div>
      </header>

      {submission.status === "locked" ? (
        <section className="cal-locked-banner">
          <LockKeyhole size={19} />
          <div>
            <strong>Accepted calendar · Direct date editing disabled</strong>
            <p>
              Actual completion and supporting evidence may be reported. Any
              future scheduled-date modification must use formal change control.
            </p>
          </div>
          <span>
            Locked{" "}
            {submission.lockedAt
              ? formatCalendarDate(submission.lockedAt.slice(0, 10))
              : ""}
          </span>
        </section>
      ) : null}

      <section className="cal-detail-overview">
        <div className="cal-coverage-card">
          <span><LayersIcon /></span>
          <div>
            <small>Inherited calendar coverage</small>
            <strong>
              {inheritanceSummary(
                submission,
                state.academicDeliveryUnits,
              )}
            </strong>
            <p>
              {units.slice(0, 4).map((unit) => unit.name).join(" · ")}
              {units.length > 4 ? ` · +${units.length - 4} more` : ""}
            </p>
          </div>
        </div>
        <div className="cal-detail-stat">
          <span>Structured milestones</span>
          <strong>{entries.length}</strong>
          <small>No duplicated college rows</small>
        </div>
        <div className="cal-detail-stat green">
          <span>Aligned</span>
          <strong>{counts.green}</strong>
          <small>Inside HEC rule</small>
        </div>
        <div className="cal-detail-stat amber">
          <span>Amber</span>
          <strong>{counts.amber}</strong>
          <small>Incomplete or under review</small>
        </div>
        <div className="cal-detail-stat red">
          <span>Red</span>
          <strong>{counts.red}</strong>
          <small>Unauthorised differences</small>
        </div>
      </section>

      {workspace === "hec" && reviewable ? (
        <section className="cal-hec-review-desk">
          <div>
            <p>HEC Academic Monitoring Officer</p>
            <h2>Review and control decision</h2>
            <small>
              Accepting locks the university dates. Returning reopens the
              structured record for correction.
            </small>
          </div>
          <textarea
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="Add an officer review note or correction instruction"
          />
          <div>
            <button onClick={addReviewNote}>
              <MessageSquareText size={14} /> Add Review Note
            </button>
            <button className="return" onClick={() => decide("return")}>
              <RotateCcw size={14} /> Return for Correction
            </button>
            <button className="accept" onClick={() => decide("lock")}>
              <LockKeyhole size={14} /> Accept and Lock
            </button>
          </div>
        </section>
      ) : null}

      {submission.reviewNote ? (
        <section className="cal-review-note">
          <MessageSquareText size={17} />
          <div>
            <strong>HEC review note</strong>
            <p>{submission.reviewNote}</p>
          </div>
        </section>
      ) : null}

      <section className="cal-comparison-panel">
        <header>
          <div>
            <p>Structured milestone comparison</p>
            <h2>HEC baseline and university dates</h2>
          </div>
          <span>
            <ShieldCheck size={14} /> HEC definitions remain authoritative
          </span>
        </header>
        {calendarSubmissionGroups.map((group) => {
          const groupEntries = entries.filter((entry) => {
            const definition = state.calendarMilestoneDefinitions.find(
              (item) => item.id === entry.milestoneDefinitionId,
            );
            return definition && getMilestoneGroup(definition) === group;
          });
          if (!groupEntries.length) return null;
          return (
            <section className="cal-comparison-group" key={group}>
              <h3>{group}</h3>
              <div className="cal-comparison-head cal-comparison-grid">
                <span>Milestone</span>
                <span>HEC baseline</span>
                <span>University submitted date</span>
                <span>Variance</span>
                <span>Reason and scope</span>
                <span>Status</span>
              </div>
              {groupEntries.map((entry) => {
                const definition = state.calendarMilestoneDefinitions.find(
                  (item) => item.id === entry.milestoneDefinitionId,
                );
                if (!definition) return null;
                return (
                  <article
                    className={`cal-comparison-row cal-comparison-grid ${
                      entry.changeRequestId ? "principal-deviation" : ""
                    }`}
                    key={entry.id}
                  >
                    <div>
                      <strong>{definition.title}</strong>
                      <small>
                        {definition.code} · Semester {entry.semester}
                      </small>
                    </div>
                    <div>
                      <strong>
                        {formatCalendarDateRange(
                          entry.councilBaselineStartDate,
                          entry.councilBaselineEndDate,
                        )}
                      </strong>
                      <small>
                        {definition.alignmentRule.replaceAll("_", " ")}
                      </small>
                    </div>
                    <div>
                      <strong>
                        {formatCalendarDateRange(
                          entry.universityStartDate,
                          entry.universityEndDate,
                        )}
                      </strong>
                      <small>
                        {submission.status === "locked"
                          ? "Locked university date"
                          : "Submitted university date"}
                      </small>
                    </div>
                    <div>
                      <strong>{formatVariance(entry.varianceDays)}</strong>
                      {entry.changeRequestId ? (
                        <Link href={`/workflow/requests/${entry.changeRequestId}`}>
                          {entry.changeRequestId}
                        </Link>
                      ) : null}
                    </div>
                    <div>
                      <p>
                        {entry.deviationReason ||
                          "No deviation reason required."}
                      </p>
                      <small>{units.length} affected delivery units</small>
                    </div>
                    <div>
                      <span
                        className={`cal-alignment-chip ${entry.ragStatus}`}
                      >
                        {entry.ragStatus === "green" ? (
                          <CheckCircle2 size={13} />
                        ) : entry.ragStatus === "red" ? (
                          <AlertTriangle size={13} />
                        ) : (
                          <CircleAlert size={13} />
                        )}
                        {entry.ragStatus === "green"
                          ? entry.changeRequestId
                            ? "Approved Exception"
                            : "Aligned"
                          : entry.ragStatus === "red"
                            ? "Unauthorised deviation"
                            : "Under review"}
                      </span>
                      {workspace === "hec" && entry.ragStatus !== "green" ? (
                        <Link href="/hec/compliance">
                          Open in Matrix <ArrowRight size={11} />
                        </Link>
                      ) : null}
                      {workspace === "university" &&
                      submission.status === "locked" ? (
                        <Link href="/university/calendar">
                          Report completion
                        </Link>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </section>

      <section className="cal-authority-note">
        <FileText size={18} />
        <div>
          <strong>Documents are supporting references only</strong>
          <p>
            The dates above—not an uploaded PDF—form the authoritative university
            calendar record reviewed by HEC.
          </p>
        </div>
        <button
          onClick={() =>
            state.toast(
              "Supporting references opened",
              "Academic Council minutes extract and implementation note are available as simulated references.",
            )
          }
        >
          View supporting references
        </button>
      </section>
    </div>
  );
}

function LayersIcon() {
  return <Send size={18} />;
}
