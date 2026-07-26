"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FilterX,
  Save,
  Send,
  Sheet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  buildAllStudentCohortMetrics,
  type StudentCohortMetrics,
} from "@/lib/student-strength";
import type { SemesterNumber } from "@/lib/types";

type BulkRow = {
  id: string;
  selected: boolean;
  metric: StudentCohortMetrics;
  batchId: string;
  semester: SemesterNumber;
  value: string;
  reportingStatus: "draft" | "submitted";
};

function rowError(row: BulkRow) {
  if (row.semester > (row.metric.course?.totalSemesters ?? 8)) {
    return "Semester exceeds the official course duration.";
  }
  if (row.value.trim() === "") return "";
  const number = Number(row.value);
  if (!Number.isInteger(number) || number < 0) {
    return "Enter a whole, non-negative number.";
  }
  return "";
}

export function BulkStrengthUpdate() {
  const state = useDemoState();
  const metrics = useMemo(
    () =>
      buildAllStudentCohortMetrics({
        cohorts: state.studentCohorts.filter((cohort) => {
          const offering = state.courseOfferings.find(
            (item) => item.id === cohort.courseOfferingId,
          );
          return offering?.universityId === "sahya";
        }),
        offerings: state.courseOfferings,
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        courses: state.courseMasters,
        academicYears: state.academicYears,
        batches: state.courseBatches,
        snapshots: state.semesterStrengthSnapshots,
      }),
    [
      state.academicDeliveryUnits,
      state.academicYears,
      state.courseBatches,
      state.courseMasters,
      state.courseOfferings,
      state.semesterStrengthSnapshots,
      state.studentCohorts,
      state.universityProfiles,
    ],
  );
  const initialRows = metrics.flatMap((metric) =>
    metric.batches.map((batch) => {
      const snapshot = metric.snapshots.find(
        (item) =>
          item.courseBatchId === batch.id &&
          item.semesterNumber === metric.currentSemester,
      );
      const reported =
        metric.currentSemester === 1
          ? snapshot?.admissionIntake
          : snapshot?.currentStrength;
      return {
        id: `${metric.cohort.id}-${batch.id}`,
        selected: false,
        metric,
        batchId: batch.id,
        semester: metric.currentSemester,
        value:
          reported === null || reported === undefined ? "" : String(reported),
        reportingStatus: "draft" as const,
      };
    }),
  );
  const [rows, setRows] = useState<BulkRow[]>(initialRows);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [validated, setValidated] = useState(false);

  const visible = showErrorsOnly
    ? rows.filter((row) => Boolean(rowError(row)))
    : rows;
  const selectedCount = rows.filter((row) => row.selected).length;
  const errorCount = rows.filter((row) => Boolean(rowError(row))).length;

  function updateSemester(rowId: string, semester: SemesterNumber) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;
        const snapshot = row.metric.snapshots.find(
          (item) =>
            item.courseBatchId === row.batchId &&
            item.semesterNumber === semester,
        );
        const value =
          semester === 1
            ? snapshot?.admissionIntake
            : snapshot?.currentStrength;
        return {
          ...row,
          semester,
          value:
            value === null || value === undefined ? "" : String(value),
        };
      }),
    );
  }

  function validate() {
    setValidated(true);
    state.toast(
      errorCount ? "Validation found issues" : "All entries are valid",
      errorCount
        ? `${errorCount} row${errorCount === 1 ? "" : "s"} need correction before saving.`
        : "Blank values remain not reported; zero values are preserved as deliberate reports.",
    );
  }

  function save(submit: boolean) {
    const selected = rows.filter((row) => row.selected);
    if (!selected.length) {
      state.toast(
        "Select reporting rows",
        "Choose at least one batch row before saving or submitting.",
      );
      return;
    }
    const invalid = selected.filter((row) => Boolean(rowError(row)));
    if (invalid.length) {
      setValidated(true);
      setShowErrorsOnly(true);
      state.toast(
        "Selected rows need correction",
        "Resolve whole-number and semester-duration errors before saving.",
      );
      return;
    }
    const saved = state.saveStrengthReports(
      selected.map((row) => ({
        cohortId: row.metric.cohort.id,
        courseBatchId: row.batchId,
        semesterNumber: row.semester,
        reportedStrength:
          row.value.trim() === "" ? null : Number(row.value),
        reportingDate: "2026-07-27",
        reportingStatus: submit
          ? row.value.trim() === ""
            ? "not_started"
            : "submitted"
          : row.value.trim() === ""
            ? "not_started"
            : "draft",
        remarks: submit
          ? "Submitted through the aggregate bulk strength workspace."
          : "Saved through the aggregate bulk strength workspace.",
      })),
    );
    if (saved) {
      setRows((current) =>
        current.map((row) =>
          row.selected
            ? {
                ...row,
                selected: false,
                reportingStatus: submit ? "submitted" : "draft",
              }
            : row,
        ),
      );
    }
  }

  return (
    <div className="strength-page bulk-strength-page">
      <Link className="strength-back" href="/university/student-strength">
        <ArrowLeft size={14} /> Student Strength Register
      </Link>
      <header className="strength-page-header">
        <div>
          <p className="strength-kicker">Multi-unit reporting workspace</p>
          <h1>Bulk semester strength update</h1>
          <p>
            Enter aggregate batch figures across delivery units. Blank means
            not reported; a numeric zero is retained as a deliberate report.
          </p>
        </div>
        <div>
          <button
            className={`button ${showErrorsOnly ? "button-primary" : "button-secondary"}`}
            onClick={() => setShowErrorsOnly((current) => !current)}
          >
            <FilterX size={14} /> {showErrorsOnly ? "Show All Rows" : "Show Errors Only"}
          </button>
          <button className="button button-secondary" onClick={validate}>
            <CheckCircle2 size={14} /> Validate Entries
          </button>
        </div>
      </header>

      <section className="bulk-strength-summary">
        <div>
          <span><Sheet size={21} /></span>
          <div>
            <small>Spreadsheet-style aggregate entry</small>
            <strong>{rows.length} batch rows available</strong>
            <p>No file import or individual student identifiers are used.</p>
          </div>
        </div>
        <div><small>Selected</small><strong>{selectedCount}</strong></div>
        <div className={errorCount ? "has-error" : ""}>
          <small>Validation issues</small><strong>{errorCount}</strong>
        </div>
      </section>

      <div className="bulk-table-wrap">
        <table className="bulk-strength-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="Select all visible rows"
                  checked={
                    visible.length > 0 &&
                    visible.every((row) => row.selected)
                  }
                  onChange={(event) => {
                    const visibleIds = new Set(visible.map((row) => row.id));
                    setRows((current) =>
                      current.map((row) =>
                        visibleIds.has(row.id)
                          ? { ...row, selected: event.target.checked }
                          : row,
                      ),
                    );
                  }}
                />
              </th>
              <th>Delivery Unit</th>
              <th>Course</th>
              <th>Cohort</th>
              <th>Batch</th>
              <th>Semester</th>
              <th>Sanctioned</th>
              <th>Reported Strength</th>
              <th>Gap</th>
              <th>Reporting Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const batch = row.metric.batches.find(
                (item) => item.id === row.batchId,
              )!;
              const error = rowError(row);
              const number =
                row.value.trim() === "" ? null : Number(row.value);
              const gap =
                number === null || !Number.isFinite(number)
                  ? null
                  : Math.max(0, batch.sanctionedCapacity - number);
              const above =
                number !== null &&
                Number.isFinite(number) &&
                number > batch.sanctionedCapacity;
              return (
                <tr
                  key={row.id}
                  className={`${row.selected ? "selected" : ""} ${error ? "error" : ""}`}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, selected: event.target.checked }
                              : item,
                          ),
                        )
                      }
                      aria-label={`Select ${row.metric.course?.courseName} ${batch.batchLabel}`}
                    />
                  </td>
                  <td>
                    <strong>{row.metric.unit?.name}</strong>
                    <span>{row.metric.unit?.district}</span>
                  </td>
                  <td>
                    <strong>{row.metric.course?.shortName}</strong>
                    <span>{row.metric.course?.courseCode}</span>
                  </td>
                  <td>{row.metric.academicYear?.admissionYear}</td>
                  <td>{batch.batchLabel}</td>
                  <td>
                    <select
                      value={row.semester}
                      onChange={(event) =>
                        updateSemester(
                          row.id,
                          Number(event.target.value) as SemesterNumber,
                        )
                      }
                    >
                      {Array.from(
                        { length: row.metric.course?.totalSemesters ?? 8 },
                        (_, index) => index + 1,
                      ).map((semester) => (
                        <option key={semester} value={semester}>S{semester}</option>
                      ))}
                    </select>
                  </td>
                  <td><strong>{batch.sanctionedCapacity}</strong></td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={row.value}
                      placeholder="Blank"
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, value: event.target.value }
                              : item,
                          ),
                        )
                      }
                      aria-invalid={Boolean(error)}
                    />
                    {validated && error ? <small>{error}</small> : null}
                    {row.value === "0" ? <small>Deliberate zero</small> : null}
                  </td>
                  <td>
                    {above ? (
                      <span className="strength-warning">
                        <AlertTriangle size={12} /> Above by{" "}
                        {number! - batch.sanctionedCapacity}
                      </span>
                    ) : gap === null ? (
                      <span>Not reported</span>
                    ) : (
                      <strong>{gap}</strong>
                    )}
                  </td>
                  <td>
                    <select
                      value={row.reportingStatus}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? {
                                  ...item,
                                  reportingStatus: event.target.value as
                                    | "draft"
                                    | "submitted",
                                }
                              : item,
                          ),
                        )
                      }
                    >
                      <option value="draft">Draft</option>
                      <option value="submitted">Ready to submit</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!visible.length ? (
          <div className="strength-empty">
            <CheckCircle2 size={22} />
            <strong>No validation errors</strong>
            <p>All current aggregate entry rows passed validation.</p>
          </div>
        ) : null}
      </div>

      <footer className="bulk-action-bar">
        <div>
          <strong>{selectedCount} row{selectedCount === 1 ? "" : "s"} selected</strong>
          <span>Each saved row creates an old-value/new-value audit event.</span>
        </div>
        <button className="button button-secondary" onClick={() => save(false)}>
          <Save size={14} /> Save Draft
        </button>
        <button className="button button-primary" onClick={() => save(true)}>
          <Send size={14} /> Submit Selected Rows
        </button>
      </footer>
    </div>
  );
}
