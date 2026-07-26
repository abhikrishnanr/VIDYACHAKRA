"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Download,
  MailWarning,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  buildAllStudentCohortMetrics,
  formatStrengthUpdated,
  strengthStatusLabel,
} from "@/lib/student-strength";

export function HECStudentStrengthMonitor() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("all");
  const [semester, setSemester] = useState("all");
  const [status, setStatus] = useState("all");
  const [issue, setIssue] = useState("all");

  const metrics = useMemo(
    () =>
      buildAllStudentCohortMetrics({
        cohorts: state.studentCohorts,
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
  const visible = useMemo(
    () =>
      metrics
        .filter(
          (metric) =>
            university === "all" ||
            metric.offering.universityId === university,
        )
        .filter(
          (metric) =>
            semester === "all" ||
            metric.currentSemester === Number(semester),
        )
        .filter(
          (metric) =>
            status === "all" || metric.reportingStatus === status,
        )
        .filter((metric) => {
          if (issue === "missing") return metric.reportedStrength === null;
          if (issue === "high_gap") return metric.highVacancy;
          if (issue === "above") return metric.aboveCapacity;
          return true;
        })
        .filter((metric) =>
          `${metric.university?.name} ${metric.unit?.name} ${metric.course?.courseName}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [issue, metrics, query, semester, status, university],
  );
  const reported = visible.filter(
    (metric) => metric.reportedStrength !== null,
  ).length;
  const missing = visible.length - reported;
  const attention = visible.filter(
    (metric) => metric.highVacancy || metric.aboveCapacity,
  ).length;

  return (
    <div className="strength-page hec-strength-page">
      <header className="strength-page-header">
        <div>
          <p className="strength-kicker">Statewide aggregate monitoring</p>
          <h1>Student strength reporting</h1>
          <p>
            Read-only monitoring of university-reported cohort and semester
            figures. HEC can identify gaps and send reminders, but cannot
            change institutional numbers.
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Monitoring report exported",
                "The filtered aggregate student-strength report is ready for download.",
              )
            }
          >
            <Download size={15} /> Export Report
          </button>
          <button
            className="button button-primary"
            onClick={() =>
              state.toast(
                "Reporting reminder sent",
                `${missing || 1} institution reporting gap${missing === 1 ? "" : "s"} received a reminder notification.`,
              )
            }
          >
            <MailWarning size={15} /> Send Reminder
          </button>
        </div>
      </header>

      <section className="hec-strength-pulse">
        <div>
          <span><ShieldCheck size={22} /></span>
          <div>
            <small>HEC read-only assurance</small>
            <strong>{reported} of {visible.length} current cohort reports received</strong>
            <p>
              University source values remain immutable from this monitoring
              workspace.
            </p>
          </div>
        </div>
        <div><small>Reporting gaps</small><strong>{missing}</strong></div>
        <div><small>Capacity / gap attention</small><strong>{attention}</strong></div>
      </section>

      <section className="hec-strength-filters">
        <label className="strength-search">
          <span>Search</span>
          <div>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="University, delivery unit or course"
            />
          </div>
        </label>
        <label>
          <span>University</span>
          <select
            value={university}
            onChange={(event) => setUniversity(event.target.value)}
          >
            <option value="all">All universities</option>
            {state.universityProfiles.map((item) => (
              <option key={item.id} value={item.id}>{item.shortName}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Current semester</span>
          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
          >
            <option value="all">Semester 1 to 8</option>
            {Array.from({ length: 8 }, (_, index) => index + 1).map(
              (item) => <option key={item} value={item}>Semester {item}</option>,
            )}
          </select>
        </label>
        <label>
          <span>Reporting status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="not_started">Not reported</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
          </select>
        </label>
        <label>
          <span>Attention</span>
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="all">All records</option>
            <option value="missing">Reporting gaps</option>
            <option value="high_gap">High vacancy / gap</option>
            <option value="above">Above capacity</option>
          </select>
        </label>
      </section>

      <section className="hec-strength-table-card">
        <header>
          <div>
            <Building2 size={17} />
            <div>
              <strong>Institution reporting register</strong>
              <p>{visible.length} aggregate cohort records match the current filters.</p>
            </div>
          </div>
          <span className="read-only-badge"><ShieldCheck size={12} /> Read only</span>
        </header>
        <div className="strength-table-wrap">
          <table className="strength-table hec-strength-table">
            <thead>
              <tr>
                <th>University &amp; delivery unit</th>
                <th>Course / cohort</th>
                <th>Semester</th>
                <th>Sanctioned</th>
                <th>Reported</th>
                <th>Vacancy / gap</th>
                <th>Fill rate</th>
                <th>Reporting</th>
                <th>Last updated</th>
                <th>Institution</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((metric) => (
                <tr key={metric.cohort.id}>
                  <td>
                    <strong>{metric.university?.shortName}</strong>
                    <span>{metric.unit?.name}</span>
                  </td>
                  <td>
                    <strong>{metric.course?.shortName}</strong>
                    <span>{metric.academicYear?.admissionYear} admission cohort</span>
                  </td>
                  <td><span className="semester-chip">Semester {metric.currentSemester}</span></td>
                  <td><strong>{metric.totalCapacity}</strong></td>
                  <td>
                    <strong>{metric.reportedStrength === null ? "Blank" : metric.reportedStrength}</strong>
                    {metric.reportedStrength === 0 ? <span>Deliberate zero</span> : null}
                  </td>
                  <td>
                    {metric.aboveCapacity ? (
                      <span className="strength-warning">
                        <AlertTriangle size={12} /> Above by{" "}
                        {(metric.reportedStrength ?? 0) - metric.totalCapacity}
                      </span>
                    ) : (
                      <>
                        <strong>{metric.gap ?? "—"}</strong>
                        <span>
                          {metric.currentSemester === 1
                            ? "Admission vacancy"
                            : "Current strength gap"}
                        </span>
                      </>
                    )}
                  </td>
                  <td><strong>{metric.fillRate === null ? "—" : `${metric.fillRate}%`}</strong></td>
                  <td>
                    <span className={`strength-status ${metric.reportingStatus}`}>
                      <Users size={12} /> {strengthStatusLabel(metric.reportingStatus)}
                    </span>
                  </td>
                  <td><span>{formatStrengthUpdated(metric.lastUpdatedAt)}</span></td>
                  <td>
                    <Link
                      className="strength-row-link"
                      href={`/hec/institutions/${metric.offering.universityId}`}
                      aria-label={`Open ${metric.university?.name}`}
                    >
                      <ArrowUpRight size={15} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
