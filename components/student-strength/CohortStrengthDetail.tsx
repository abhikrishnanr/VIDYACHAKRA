"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  History,
  Info,
  LockKeyhole,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  buildStudentCohortMetrics,
  formatStrengthDate,
  formatStrengthUpdated,
  strengthStatusLabel,
  type StudentCohortMetrics,
} from "@/lib/student-strength";
import type {
  SemesterNumber,
  SemesterStrengthSnapshot,
} from "@/lib/types";

type BatchDraft = {
  batchId: string;
  value: string;
};

function SemesterReportPanel({
  metric,
  semester,
}: {
  metric: StudentCohortMetrics;
  semester: SemesterNumber;
}) {
  const state = useDemoState();
  const existing = metric.batches.map((batch) => {
    const snapshot = metric.snapshots.find(
      (item) =>
        item.courseBatchId === batch.id && item.semesterNumber === semester,
    );
    const value =
      semester === 1 ? snapshot?.admissionIntake : snapshot?.currentStrength;
    return {
      batchId: batch.id,
      value: value === null || value === undefined ? "" : String(value),
    };
  });
  const snapshots = metric.snapshots.filter(
    (snapshot) => snapshot.semesterNumber === semester,
  );
  const [rows, setRows] = useState<BatchDraft[]>(existing);
  const [reportingDate, setReportingDate] = useState(
    snapshots.find((snapshot) => snapshot.reportingDate)?.reportingDate ||
      "2026-07-27",
  );
  const [remarks, setRemarks] = useState(
    snapshots.find((snapshot) => snapshot.remarks)?.remarks ?? "",
  );
  const finalised =
    semester === 1 && metric.cohort.admissionStatus === "finalised";

  const parsed = rows.map((row) => ({
    ...row,
    number:
      row.value.trim() === "" ? null : Number.parseInt(row.value, 10),
  }));
  const invalid = parsed.some(
    (row) =>
      row.number !== null &&
      (!Number.isInteger(row.number) || row.number < 0),
  );
  const total =
    parsed.some((row) => row.number === null) || invalid
      ? null
      : parsed.reduce((sum, row) => sum + (row.number ?? 0), 0);
  const gap =
    total === null ? null : Math.max(0, metric.totalCapacity - total);
  const above = total !== null && total > metric.totalCapacity;

  function save(status: SemesterStrengthSnapshot["reportingStatus"]) {
    if (invalid) {
      state.toast(
        "Correct the highlighted values",
        "Student strength must be a whole, non-negative number. Blank remains not reported.",
      );
      return;
    }
    state.saveStrengthReports(
      parsed.map((row) => ({
        cohortId: metric.cohort.id,
        courseBatchId: row.batchId,
        semesterNumber: semester,
        reportedStrength: row.number,
        reportingDate,
        reportingStatus: row.number === null ? "not_started" : status,
        remarks,
      })),
    );
  }

  return (
    <section className="semester-report-card">
      <header>
        <div>
          <p className="strength-kicker">
            {semester === 1 ? "Admission intake reporting" : "Active strength reporting"}
          </p>
          <h2>Semester {semester} batch figures</h2>
          <p>
            {semester === 1
              ? "Enter actual students admitted against each approved batch."
              : "Report students currently active in this cohort for the selected semester."}
          </p>
        </div>
        <span className={`strength-status ${metric.journey[semester - 1]?.reportingStatus}`}>
          {strengthStatusLabel(metric.journey[semester - 1]?.reportingStatus)}
        </span>
      </header>

      {semester > 1 ? (
        <div className="strength-helper">
          <Info size={16} />
          <div>
            <strong>Current Strength Gap</strong>
            <p>
              This indicates the difference from approved capacity. It does
              not automatically imply that fresh admission is permitted in
              this semester.
            </p>
          </div>
        </div>
      ) : null}
      {finalised ? (
        <div className="strength-locked-note">
          <LockKeyhole size={17} />
          <div>
            <strong>Semester 1 admission is finalised</strong>
            <p>
              A reason must be recorded before these final figures can be
              reopened or changed.
            </p>
          </div>
        </div>
      ) : null}

      <div className="batch-strength-grid">
        <div className="batch-strength-head">
          <span>Approved batch</span>
          <span>Sanctioned</span>
          <span>{semester === 1 ? "Actual admitted" : "Active strength"}</span>
          <span>{semester === 1 ? "Admission vacancy" : "Strength gap"}</span>
        </div>
        {metric.batches.map((batch) => {
          const row = parsed.find((item) => item.batchId === batch.id)!;
          const rowGap =
            row.number === null
              ? null
              : Math.max(0, batch.sanctionedCapacity - row.number);
          const rowAbove =
            row.number !== null && row.number > batch.sanctionedCapacity;
          return (
            <div className="batch-strength-row" key={batch.id}>
              <strong>{batch.batchLabel}</strong>
              <span>{batch.sanctionedCapacity}</span>
              <label>
                <span className="sr-only">
                  Reported strength for {batch.batchLabel}
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  disabled={finalised}
                  value={rows.find((item) => item.batchId === batch.id)?.value}
                  onChange={(event) =>
                    setRows((current) =>
                      current.map((item) =>
                        item.batchId === batch.id
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    )
                  }
                  className={
                    row.number !== null &&
                    (!Number.isInteger(row.number) || row.number < 0)
                      ? "field-error"
                      : ""
                  }
                  placeholder="Blank"
                />
              </label>
              <span className={rowAbove ? "strength-warning" : ""}>
                {rowAbove ? (
                  <><AlertTriangle size={13} /> Above by {row.number! - batch.sanctionedCapacity}</>
                ) : rowGap === null ? (
                  "Not reported"
                ) : (
                  rowGap
                )}
              </span>
            </div>
          );
        })}
        <div className="batch-strength-total">
          <strong>Offering total</strong>
          <strong>{metric.totalCapacity}</strong>
          <strong>{total === null ? "Blank" : total}</strong>
          <strong className={above ? "strength-warning" : ""}>
            {above ? (
              <><AlertTriangle size={13} /> Above Approved Capacity by {total! - metric.totalCapacity}</>
            ) : gap === null ? (
              "Not reported"
            ) : (
              gap
            )}
          </strong>
        </div>
      </div>

      {above ? (
        <div className="above-capacity-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Above Approved Capacity</strong>
            <p>
              The value remains visible and can be submitted, but HEC
              monitoring will flag it for verification.
            </p>
          </div>
        </div>
      ) : null}

      <div className="strength-report-fields">
        <label>
          <span>Reporting date</span>
          <input
            type="date"
            disabled={finalised}
            value={reportingDate}
            onChange={(event) => setReportingDate(event.target.value)}
          />
        </label>
        <label>
          <span>Remarks</span>
          <textarea
            disabled={finalised}
            value={remarks}
            onChange={(event) => setRemarks(event.target.value)}
            placeholder={
              semester === 1
                ? "Admission progress or vacancy remarks"
                : "Explain any significant reduction from the previous semester"
            }
          />
        </label>
      </div>

      {!finalised ? (
        <footer>
          <button className="button button-secondary" onClick={() => save("draft")}>
            <Save size={15} /> Save Draft
          </button>
          <button className="button button-primary" onClick={() => save("submitted")}>
            <Send size={15} /> Submit Semester Report
          </button>
        </footer>
      ) : null}
    </section>
  );
}

export function CohortStrengthDetail({ cohortId }: { cohortId: string }) {
  const state = useDemoState();
  const cohort = state.studentCohorts.find((item) => item.id === cohortId);
  const metric = useMemo(
    () =>
      cohort
        ? buildStudentCohortMetrics({
            cohort,
            offerings: state.courseOfferings,
            universities: state.universityProfiles,
            units: state.academicDeliveryUnits,
            courses: state.courseMasters,
            academicYears: state.academicYears,
            batches: state.courseBatches,
            snapshots: state.semesterStrengthSnapshots,
          })
        : null,
    [
      cohort,
      state.academicDeliveryUnits,
      state.academicYears,
      state.courseBatches,
      state.courseMasters,
      state.courseOfferings,
      state.semesterStrengthSnapshots,
      state.universityProfiles,
    ],
  );
  const [selectedSemester, setSelectedSemester] = useState<SemesterNumber>(
    metric?.currentSemester ?? 1,
  );
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

  if (!metric) {
    return (
      <div className="strength-page">
        <div className="strength-empty">
          <AlertTriangle size={24} />
          <strong>Cohort not found</strong>
          <Link className="button button-primary" href="/university/student-strength">
            Return to Student Strength
          </Link>
        </div>
      </div>
    );
  }

  const auditEntries = state.demoAuditEntries.filter(
    (entry) =>
      entry.reference?.startsWith(metric.cohort.id) ||
      entry.scope.includes(metric.course?.courseName ?? "__none__"),
  ).slice(0, 6);
  const resolvedCohortId = metric.cohort.id;

  function finaliseAdmission() {
    state.setCohortAdmissionStatus(resolvedCohortId, "finalised");
  }

  function reopenAdmission() {
    if (
      state.setCohortAdmissionStatus(
        resolvedCohortId,
        "in_progress",
        reopenReason,
      )
    ) {
      setReopenOpen(false);
      setReopenReason("");
    }
  }

  return (
    <div className="strength-page strength-detail-page">
      <Link className="strength-back" href="/university/student-strength">
        <ArrowLeft size={14} /> Student Strength Register
      </Link>
      <header className="strength-detail-header">
        <div className="strength-detail-icon"><Users size={25} /></div>
        <div>
          <p className="strength-kicker">{metric.unit?.name}</p>
          <h1>{metric.course?.courseName}</h1>
          <p>
            {metric.cohort.cohortLabel} · {metric.batches.length} approved
            batch{metric.batches.length === 1 ? "" : "es"} ·{" "}
            {metric.totalCapacity} sanctioned capacity
          </p>
        </div>
        <div className="strength-detail-actions">
          <span className={`admission-state ${metric.cohort.admissionStatus}`}>
            {metric.cohort.admissionStatus === "finalised" ? (
              <LockKeyhole size={13} />
            ) : (
              <ClipboardCheck size={13} />
            )}
            Admission {metric.cohort.admissionStatus.replace("_", " ")}
          </span>
          {metric.cohort.admissionStatus === "finalised" ? (
            <button
              className="button button-secondary"
              onClick={() => setReopenOpen(true)}
            >
              <RotateCcw size={14} /> Reopen with Reason
            </button>
          ) : (
            <button className="button button-secondary" onClick={finaliseAdmission}>
              <ShieldCheck size={14} /> Finalise Admission
            </button>
          )}
        </div>
      </header>

      <section className="cohort-facts">
        <div>
          <small>Current semester</small>
          <strong>Semester {metric.currentSemester}</strong>
        </div>
        <div>
          <small>Reported strength</small>
          <strong>{metric.reportedStrength ?? "Blank"}</strong>
        </div>
        <div>
          <small>
            {metric.currentSemester === 1
              ? "Admission vacancy"
              : "Current strength gap"}
          </small>
          <strong>{metric.gap ?? "—"}</strong>
        </div>
        <div>
          <small>Latest activity</small>
          <strong>{formatStrengthUpdated(metric.lastUpdatedAt)}</strong>
        </div>
      </section>

      <section className="semester-journey-section">
        <header>
          <div>
            <p className="strength-kicker">Eight-semester cohort view</p>
            <h2>Semester journey</h2>
          </div>
          <span>Choose a semester to inspect or update its batch report.</span>
        </header>
        <div className="semester-journey">
          {metric.journey.map((point, index) => (
            <button
              key={point.semester}
              className={`semester-node ${
                selectedSemester === point.semester ? "active" : ""
              } ${point.reportingStatus} ${point.aboveCapacity ? "above" : ""}`}
              onClick={() => setSelectedSemester(point.semester)}
            >
              <span className="semester-node-index">{point.semester}</span>
              <div>
                <small>Semester {point.semester}</small>
                <strong>
                  {point.reportedStrength === null
                    ? "Not reported"
                    : `${point.reportedStrength} students`}
                </strong>
                <span>
                  {point.gap === null ? "Gap —" : `Gap ${point.gap}`} ·{" "}
                  {point.reportingDate
                    ? formatStrengthDate(point.reportingDate)
                    : "No date"}
                </span>
                <span>
                  {point.changeFromPrevious === null
                    ? "No prior comparison"
                    : `${point.changeFromPrevious > 0 ? "+" : ""}${point.changeFromPrevious} from previous`}
                </span>
              </div>
              {index < metric.journey.length - 1 ? (
                <ChevronRight className="semester-node-arrow" size={14} />
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <div className="strength-detail-grid">
        <SemesterReportPanel
          key={`${selectedSemester}-${metric.cohort.lastUpdatedAt}`}
          metric={metric}
          semester={selectedSemester}
        />
        <aside className="strength-audit-card">
          <header>
            <History size={17} />
            <div>
              <p className="strength-kicker">Immutable local history</p>
              <h2>Reporting audit</h2>
            </div>
          </header>
          {auditEntries.length ? (
            auditEntries.map((entry) => (
              <article key={entry.id}>
                <span><CalendarDays size={13} /></span>
                <div>
                  <strong>{entry.action}</strong>
                  <p>{entry.detail}</p>
                  <small>
                    {entry.previousValue} <ChevronRight size={10} />{" "}
                    {entry.newValue}
                  </small>
                  <time>{entry.timestamp} · {entry.actor}</time>
                </div>
              </article>
            ))
          ) : (
            <div className="strength-audit-empty">
              <History size={19} />
              <p>New batch updates will appear here with old and new values.</p>
            </div>
          )}
        </aside>
      </div>

      {reopenOpen ? (
        <div className="strength-modal-backdrop" role="presentation">
          <section
            className="strength-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reopen-title"
          >
            <span className="strength-modal-icon"><RotateCcw size={20} /></span>
            <h2 id="reopen-title">Reopen final Semester 1 intake?</h2>
            <p>
              The reason will be permanently visible in the local audit trail
              before the protected figure can be changed.
            </p>
            <label>
              <span>Reason for reopening</span>
              <textarea
                autoFocus
                value={reopenReason}
                onChange={(event) => setReopenReason(event.target.value)}
                placeholder="Explain the correction or late admission update"
              />
            </label>
            <footer>
              <button
                className="button button-ghost"
                onClick={() => setReopenOpen(false)}
              >
                Keep Finalised
              </button>
              <button className="button button-primary" onClick={reopenAdmission}>
                <CheckCircle2 size={14} /> Record Reason &amp; Reopen
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
