"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Filter,
  GraduationCap,
  Search,
  Sheet,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  isCollegeDeliveryUnit,
  isDirectDeliveryUnit,
  unitTypeLabels,
} from "@/lib/institution-structure";
import {
  buildAllStudentCohortMetrics,
  formatStrengthUpdated,
  strengthStatusLabel,
} from "@/lib/student-strength";

export function StudentStrengthOverview() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("all");
  const [admissionCohort, setAdmissionCohort] = useState("all");
  const [semester, setSemester] = useState("all");
  const [ownership, setOwnership] = useState("all");
  const [course, setCourse] = useState("all");
  const [reportingStatus, setReportingStatus] = useState("all");
  const [highVacancy, setHighVacancy] = useState(false);
  const [aboveCapacity, setAboveCapacity] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const visible = useMemo(
    () =>
      metrics
        .filter(
          (metric) =>
            academicYear === "all" ||
            metric.offering.academicYearId === academicYear,
        )
        .filter(
          (metric) =>
            admissionCohort === "all" ||
            metric.cohort.admissionAcademicYearId === admissionCohort,
        )
        .filter(
          (metric) =>
            semester === "all" ||
            metric.currentSemester === Number(semester),
        )
        .filter((metric) => {
          if (ownership === "university") {
            return metric.unit ? isDirectDeliveryUnit(metric.unit) : false;
          }
          if (ownership === "college") {
            return metric.unit ? isCollegeDeliveryUnit(metric.unit) : false;
          }
          return true;
        })
        .filter(
          (metric) =>
            course === "all" || metric.course?.id === course,
        )
        .filter(
          (metric) =>
            reportingStatus === "all" ||
            metric.reportingStatus === reportingStatus,
        )
        .filter((metric) => !highVacancy || metric.highVacancy)
        .filter((metric) => !aboveCapacity || metric.aboveCapacity)
        .filter((metric) =>
          `${metric.unit?.name} ${metric.course?.courseName} ${metric.course?.courseCode} ${metric.cohort.cohortLabel}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [
      aboveCapacity,
      academicYear,
      admissionCohort,
      course,
      highVacancy,
      metrics,
      ownership,
      query,
      reportingStatus,
      semester,
    ],
  );

  const totalCapacity = visible.reduce(
    (total, metric) => total + metric.totalCapacity,
    0,
  );
  const reported = visible.reduce(
    (total, metric) => total + (metric.reportedStrength ?? 0),
    0,
  );
  const incomplete = visible.filter(
    (metric) => metric.reportingStatus === "not_started",
  ).length;
  const grouped = useMemo(() => {
    const map = new Map<string, typeof visible>();
    visible.forEach((metric) => {
      const key = metric.unit?.id ?? "unknown";
      map.set(key, [...(map.get(key) ?? []), metric]);
    });
    return Array.from(map.values()).sort((a, b) =>
      (a[0]?.unit?.name ?? "").localeCompare(b[0]?.unit?.name ?? ""),
    );
  }, [visible]);

  return (
    <div className="strength-page">
      <header className="strength-page-header">
        <div>
          <p className="strength-kicker">Aggregate cohort reporting</p>
          <h1>Student intake &amp; semester strength</h1>
          <p>
            Report batch-level admission intake and current active strength
            against approved course-offering capacity. No individual student
            records are collected.
          </p>
        </div>
        <div>
          <Link
            className="button button-secondary"
            href="/university/course-offerings"
          >
            <GraduationCap size={15} /> View Course Offerings
          </Link>
          <Link
            className="button button-primary"
            href="/university/student-strength/bulk-update"
          >
            <Sheet size={15} /> Bulk Update
          </Link>
        </div>
      </header>

      <section className="strength-pulse" aria-label="Reporting summary">
        <div className="strength-pulse-lead">
          <span><Users size={23} /></span>
          <div>
            <small>Current filtered register</small>
            <strong>
              {reported} students reported across {visible.length} cohorts
            </strong>
            <p>
              Figures are aggregate batch and semester reports tied to
              authoritative HEC course offerings.
            </p>
          </div>
        </div>
        <div>
          <small>Sanctioned capacity</small>
          <strong>{totalCapacity}</strong>
        </div>
        <div>
          <small>Not yet reported</small>
          <strong>{incomplete}</strong>
        </div>
      </section>

      <section className="strength-filter-panel" aria-label="Strength filters">
        <div className="strength-primary-filters">
          <label className="strength-search">
            <span>Search delivery unit, course or cohort</span>
            <div>
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search student strength register"
              />
            </div>
          </label>
          <label>
            <span>Academic year</span>
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            >
              <option value="all">All academic years</option>
              {state.academicYears.map((year) => (
                <option key={year.id} value={year.id}>{year.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Admission cohort</span>
            <select
              value={admissionCohort}
              onChange={(event) => setAdmissionCohort(event.target.value)}
            >
              <option value="all">All cohorts</option>
              {state.academicYears.map((year) => (
                <option key={year.id} value={year.id}>{year.admissionYear}</option>
              ))}
            </select>
          </label>
          <button
            className="button button-ghost"
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={14} /> {showFilters ? "Fewer Filters" : "More Filters"}
          </button>
        </div>
        {showFilters ? (
          <div className="strength-secondary-filters">
            <label>
              <span>Current semester</span>
              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
              >
                <option value="all">Semester 1 to 8</option>
                {Array.from({ length: 8 }, (_, index) => index + 1).map(
                  (item) => (
                    <option key={item} value={item}>Semester {item}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              <span>Delivery unit</span>
              <select
                value={ownership}
                onChange={(event) => setOwnership(event.target.value)}
              >
                <option value="all">University units &amp; colleges</option>
                <option value="university">University teaching units</option>
                <option value="college">Colleges</option>
              </select>
            </label>
            <label>
              <span>Course</span>
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
              >
                <option value="all">All courses</option>
                {state.courseMasters.map((item) => (
                  <option key={item.id} value={item.id}>{item.shortName}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Reporting status</span>
              <select
                value={reportingStatus}
                onChange={(event) => setReportingStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="not_started">Not reported</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
              </select>
            </label>
            <label className="strength-toggle">
              <input
                type="checkbox"
                checked={highVacancy}
                onChange={(event) => setHighVacancy(event.target.checked)}
              />
              <span>High vacancy / gap</span>
            </label>
            <label className="strength-toggle">
              <input
                type="checkbox"
                checked={aboveCapacity}
                onChange={(event) => setAboveCapacity(event.target.checked)}
              />
              <span>Above capacity</span>
            </label>
          </div>
        ) : null}
      </section>

      <div className="strength-register">
        {grouped.map((group) => {
          const unit = group[0]?.unit;
          return (
            <section className="strength-unit-group" key={unit?.id}>
              <header>
                <span className="strength-unit-icon"><Building2 size={16} /></span>
                <div>
                  <strong>{unit?.name}</strong>
                  <p>
                    {unit ? unitTypeLabels[unit.unitType] : "Delivery unit"} ·{" "}
                    {unit?.district}
                  </p>
                </div>
                <span>{group.length} cohort{group.length === 1 ? "" : "s"}</span>
              </header>
              <div className="strength-table-wrap">
                <table className="strength-table">
                  <thead>
                    <tr>
                      <th>Course &amp; admission cohort</th>
                      <th>Current semester</th>
                      <th>Sanctioned</th>
                      <th>Reported strength</th>
                      <th>Vacancy / strength gap</th>
                      <th>Fill rate</th>
                      <th>Reporting status</th>
                      <th>Last updated</th>
                      <th><span className="sr-only">Open</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((metric) => (
                      <tr key={metric.cohort.id}>
                        <td>
                          <strong>{metric.course?.courseName}</strong>
                          <span>
                            {metric.course?.courseCode} ·{" "}
                            {metric.academicYear?.admissionYear} admission
                          </span>
                        </td>
                        <td><span className="semester-chip">Semester {metric.currentSemester}</span></td>
                        <td><strong>{metric.totalCapacity}</strong></td>
                        <td>
                          <strong>
                            {metric.reportedStrength === null
                              ? "Blank"
                              : metric.reportedStrength}
                          </strong>
                          {metric.reportedStrength === 0 ? (
                            <span>Deliberate zero report</span>
                          ) : null}
                        </td>
                        <td>
                          {metric.aboveCapacity ? (
                            <span className="strength-warning">
                              <AlertTriangle size={13} /> Above capacity by{" "}
                              {(metric.reportedStrength ?? 0) -
                                metric.totalCapacity}
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
                        <td>
                          <strong>
                            {metric.fillRate === null
                              ? "—"
                              : `${metric.fillRate}%`}
                          </strong>
                        </td>
                        <td>
                          <span className={`strength-status ${metric.reportingStatus}`}>
                            {metric.reportingStatus === "verified" ? (
                              <CheckCircle2 size={12} />
                            ) : metric.reportingStatus === "not_started" ? (
                              <ClipboardList size={12} />
                            ) : (
                              <Users size={12} />
                            )}
                            {strengthStatusLabel(metric.reportingStatus)}
                          </span>
                        </td>
                        <td><span>{formatStrengthUpdated(metric.lastUpdatedAt)}</span></td>
                        <td>
                          <Link
                            className="strength-row-link"
                            href={`/university/student-strength/${metric.cohort.id}`}
                            aria-label={`Open ${metric.course?.courseName} cohort`}
                          >
                            <ArrowRight size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
        {!visible.length ? (
          <div className="strength-empty">
            <Search size={23} />
            <strong>No cohort reports match these filters</strong>
            <p>Clear one or more filters to return to the reporting register.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
