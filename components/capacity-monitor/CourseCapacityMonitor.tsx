"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  GraduationCap,
  LineChart,
  MailWarning,
  TimerReset,
  TrendingDown,
} from "lucide-react";
import { useMemo } from "react";
import {
  aggregateAdmissionMetrics,
  buildAllCapacityOfferingMetrics,
  reportingStatusLabel,
} from "@/lib/capacity-monitor";
import { useDemoState } from "@/lib/demo-state";
import { SeatUtilisationBadge } from "./SeatUtilisationBadge";

export function CourseCapacityMonitor({ courseId }: { courseId: string }) {
  const state = useDemoState();
  const course = state.courseMasters.find((item) => item.id === courseId);
  const metrics = useMemo(
    () =>
      buildAllCapacityOfferingMetrics({
        offerings: state.courseOfferings.filter(
          (item) => item.courseMasterId === courseId,
        ),
        courses: state.courseMasters,
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        academicYears: state.academicYears,
        cohorts: state.studentCohorts,
        batches: state.courseBatches,
        snapshots: state.semesterStrengthSnapshots,
      }),
    [
      courseId,
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

  if (!course) {
    return (
      <div className="capacity-page">
        <section className="capacity-not-found">
          <AlertTriangle size={25} />
          <h1>Course monitor not found</h1>
          <p>The requested record is not in the official HEC Course Master.</p>
          <Link className="button button-primary" href="/hec/vacancies">
            Return to Course Vacancy Explorer
          </Link>
        </section>
      </div>
    );
  }

  const summary = aggregateAdmissionMetrics(metrics);
  const universities = new Set(metrics.map((item) => item.university.id)).size;
  const semesterTotals = Array.from(
    { length: course.totalSemesters },
    (_, index) => index + 1,
  ).map((semester) => {
    const reporting = metrics
      .map((metric) => metric.semesterStrengths[semester - 1])
      .filter((item) => item?.strength !== null);
    return {
      semester,
      strength: reporting.reduce(
        (total, item) => total + (item?.strength ?? 0),
        0,
      ),
      reportingInstitutions: reporting.length,
    };
  });
  const chartPoints = semesterTotals.filter(
    (item) => item.reportingInstitutions > 0,
  );
  const maxStrength = Math.max(
    ...chartPoints.map((item) => item.strength),
    1,
  );
  const pointFor = (item: (typeof semesterTotals)[number]) => ({
    x:
      course.totalSemesters === 1
        ? 50
        : 44 + ((item.semester - 1) / (course.totalSemesters - 1)) * 672,
    y: 198 - (item.strength / maxStrength) * 145,
  });
  const linePath = chartPoints
    .map((item, index) => {
      const point = pointFor(item);
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");
  const firstStrength = semesterTotals[0]?.strength ?? 0;
  const latestPoint = chartPoints.at(-1);
  const decline =
    latestPoint && latestPoint.semester > 1
      ? firstStrength - latestPoint.strength
      : 0;
  const fullyReported = metrics.filter(
    (item) => item.reportingStatus === "fully_reported",
  ).length;

  return (
    <div className="capacity-page course-monitor-page">
      <Link className="capacity-back" href="/hec/vacancies">
        <ArrowLeft size={14} /> Course Vacancy Explorer
      </Link>
      <header className="course-monitor-header">
        <span><GraduationCap size={27} /></span>
        <div>
          <p className="capacity-kicker">Official HEC Course Monitor</p>
          <h1>{course.courseName}</h1>
          <p>
            {course.courseCode} · {course.discipline} · {course.durationYears}{" "}
            years · {course.totalSemesters} semesters
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            state.toast(
              "Course monitoring brief exported",
              `${course.courseName} capacity, intake and semester-strength report is ready.`,
            )
          }
        >
          <Download size={15} /> Export Course Report
        </button>
      </header>

      <section className="course-capacity-band">
        <div className="course-capacity-narrative">
          <small>Statewide course position</small>
          <strong>
            {summary.actualIntake} admissions reported against{" "}
            {summary.reportedCapacity} reported seats
          </strong>
          <p>
            {metrics.length} delivery units across {universities} universities
            offer this course. Total sanctioned capacity is{" "}
            {summary.sanctionedCapacity}.
          </p>
        </div>
        <div>
          <small>Semester 1 intake</small>
          <strong>{summary.actualIntake}</strong>
        </div>
        <div>
          <small>Admission vacancy</small>
          <strong>{summary.admissionVacancy}</strong>
        </div>
        <div>
          <small>Fill rate</small>
          <strong>{summary.fillRate ?? "—"}%</strong>
        </div>
        <div>
          <small>Reporting completeness</small>
          <strong>{fullyReported}/{metrics.length}</strong>
        </div>
      </section>

      <div className="course-monitor-grid">
        <section className="course-strength-chart">
          <header>
            <div>
              <p className="capacity-kicker">One cohort-strength view</p>
              <h2>Aggregate strength across Semester 1 to {course.totalSemesters}</h2>
              <p>
                Each point totals currently reported institutional cohorts;
                the reporting count below the chart keeps partial coverage
                visible.
              </p>
            </div>
            <span><LineChart size={19} /></span>
          </header>
          <div className="course-line-chart">
            <svg
              viewBox="0 0 760 240"
              role="img"
              aria-label={`Aggregate reported cohort strength for ${course.courseName}`}
            >
              {[53, 101, 150, 198].map((y) => (
                <line
                  key={y}
                  x1="44"
                  y1={y}
                  x2="716"
                  y2={y}
                  className="chart-grid-line"
                />
              ))}
              {linePath ? <path d={linePath} className="chart-strength-line" /> : null}
              {chartPoints.map((item) => {
                const point = pointFor(item);
                return (
                  <g key={item.semester}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      className="chart-strength-point"
                    />
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      className="chart-value"
                    >
                      {item.strength}
                    </text>
                  </g>
                );
              })}
              {semesterTotals.map((item) => {
                const point = pointFor(item);
                return (
                  <text
                    key={item.semester}
                    x={point.x}
                    y="222"
                    textAnchor="middle"
                    className="chart-axis-label"
                  >
                    S{item.semester}
                  </text>
                );
              })}
            </svg>
          </div>
          <div className="chart-report-counts">
            {semesterTotals.map((item) => (
              <span key={item.semester}>
                <strong>S{item.semester}</strong>
                <small>{item.reportingInstitutions} reporting</small>
              </span>
            ))}
          </div>
          <div className="course-decline-note">
            <TrendingDown size={18} />
            <div>
              <strong>
                {latestPoint?.semester === 1
                  ? "Later-semester reports are not yet available"
                  : `${Math.max(0, decline)} fewer reported students by Semester ${latestPoint?.semester}`}
              </strong>
              <p>
                Strength decline is reported independently from admission
                vacancy and may reflect progression, discontinuation or
                incomplete semester reporting.
              </p>
            </div>
          </div>
        </section>

        <aside className="course-reporting-panel">
          <header>
            <p className="capacity-kicker">Reporting completeness</p>
            <h2>Institution coverage</h2>
          </header>
          <div className="course-reporting-meter">
            <span style={{ width: `${metrics.length ? (fullyReported / metrics.length) * 100 : 0}%` }} />
          </div>
          <strong>{fullyReported} of {metrics.length} fully reported</strong>
          <p>
            {summary.notReporting} not reported · {summary.partiallyReporting}{" "}
            partially reported · {summary.overdue} overdue
          </p>
          <div>
            <button
              onClick={() =>
                state.toast(
                  "Course reminder sent",
                  `Reporting reminders for ${course.shortName} were sent to incomplete institutions.`,
                )
              }
            >
              <MailWarning size={14} /> Send Reminder
            </button>
            <button
              onClick={() =>
                state.toast(
                  "University contacts opened",
                  "Nodal officer contact information is available in the institution registry.",
                )
              }
            >
              <Building2 size={14} /> View University Contact
            </button>
          </div>
        </aside>
      </div>

      <section className="course-semester-strip">
        <header>
          <div>
            <p className="capacity-kicker">Cohort-wise strength</p>
            <h2>Semester reporting journey</h2>
          </div>
          <span>
            Semester 1 uses admission intake; later semesters use current
            active strength.
          </span>
        </header>
        <div>
          {semesterTotals.map((item) => (
            <article key={item.semester}>
              <span>{item.semester}</span>
              <small>Semester {item.semester}</small>
              <strong>
                {item.reportingInstitutions ? item.strength : "Not reported"}
              </strong>
              <p>
                {item.reportingInstitutions} institution
                {item.reportingInstitutions === 1 ? "" : "s"} reporting
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="course-institution-comparison">
        <header>
          <div>
            <p className="capacity-kicker">Institution comparison</p>
            <h2>Capacity, intake and current cohort position</h2>
          </div>
          <Link href="/hec/institutions">
            Institution Directory <ArrowRight size={13} />
          </Link>
        </header>
        <div className="course-comparison-list">
          {metrics.map((item) => (
            <article key={item.offering.id}>
              <div className="course-comparison-unit">
                <span><Building2 size={16} /></span>
                <div>
                  <strong>{item.unit.name}</strong>
                  <small>{item.university.shortName} · {item.unit.district}</small>
                </div>
              </div>
              <span><small>Sanctioned</small><strong>{item.sanctionedCapacity}</strong></span>
              <span><small>Semester 1 intake</small><strong>{item.actualIntake ?? "Blank"}</strong></span>
              <span><small>Admission vacancy</small><strong>{item.admissionVacancy ?? "—"}</strong></span>
              <span>
                <small>Current strength gap</small>
                <strong>
                  {item.currentSemester === 1
                    ? "Starts after S1"
                    : (item.currentStrengthGap ?? "—")}
                </strong>
              </span>
              <SeatUtilisationBadge
                status={item.utilisationStatus}
                label={item.utilisationLabel}
                reason={item.attentionReason}
                showReason
              />
              <Link href={`/hec/institutions/${item.university.id}/capacity`}>
                <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {metrics.some((item) => item.reportingStatus !== "fully_reported") ? (
        <section className="course-monitor-alert">
          <TimerReset size={18} />
          <div>
            <strong>Course reporting is not yet complete statewide</strong>
            <p>
              {metrics
                .filter((item) => item.reportingStatus !== "fully_reported")
                .map((item) => `${item.unit.shortName}: ${reportingStatusLabel(item.reportingStatus)}`)
                .join(" · ")}
            </p>
          </div>
          <CheckCircle2 size={18} />
        </section>
      ) : null}
    </div>
  );
}
