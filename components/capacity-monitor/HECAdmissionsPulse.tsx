"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  GraduationCap,
  MailWarning,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  aggregateAdmissionMetrics,
  buildAllCapacityOfferingMetrics,
  reportingStatusLabel,
} from "@/lib/capacity-monitor";
import { useDemoState } from "@/lib/demo-state";
import { unitTypeLabels } from "@/lib/institution-structure";
import { SeatUtilisationBadge } from "./SeatUtilisationBadge";

export function HECAdmissionsPulse() {
  const state = useDemoState();
  const [academicYear, setAcademicYear] = useState("ay-2026-27");
  const [cohortYear, setCohortYear] = useState("all");
  const [university, setUniversity] = useState("all");
  const [unit, setUnit] = useState("all");
  const [unitType, setUnitType] = useState("all");
  const [district, setDistrict] = useState("all");
  const [course, setCourse] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [admissionStatus, setAdmissionStatus] = useState("all");
  const [showAllFilters, setShowAllFilters] = useState(false);

  const allMetrics = useMemo(
    () =>
      buildAllCapacityOfferingMetrics({
        offerings: state.courseOfferings,
        courses: state.courseMasters,
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        academicYears: state.academicYears,
        cohorts: state.studentCohorts,
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
      allMetrics
        .filter(
          (item) =>
            academicYear === "all" ||
            item.offering.academicYearId === academicYear,
        )
        .filter(
          (item) =>
            cohortYear === "all" ||
            item.cohort?.admissionAcademicYearId === cohortYear,
        )
        .filter(
          (item) =>
            university === "all" ||
            item.offering.universityId === university,
        )
        .filter((item) => unit === "all" || item.unit.id === unit)
        .filter(
          (item) => unitType === "all" || item.unit.unitType === unitType,
        )
        .filter(
          (item) => district === "all" || item.unit.district === district,
        )
        .filter((item) => course === "all" || item.course.id === course)
        .filter(
          (item) =>
            discipline === "all" ||
            item.course.discipline === discipline,
        )
        .filter(
          (item) =>
            admissionStatus === "all" ||
            item.cohort?.admissionStatus === admissionStatus,
        ),
    [
      academicYear,
      admissionStatus,
      allMetrics,
      cohortYear,
      course,
      discipline,
      district,
      unit,
      unitType,
      university,
    ],
  );
  const summary = aggregateAdmissionMetrics(visible);
  const fill = Math.min(100, summary.fillRate ?? 0);
  const unitReporting = Array.from(
    new Set(visible.map((item) => item.unit.id)),
  ).map((unitId) => {
    const records = visible.filter((item) => item.unit.id === unitId);
    const fullyReported = records.every(
      (item) => item.reportingStatus === "fully_reported",
    );
    const notReported = records.every(
      (item) => item.reportingStatus === "not_reported",
    );
    return {
      unitId,
      status: fullyReported
        ? ("fully_reported" as const)
        : notReported
          ? ("not_reported" as const)
          : ("partially_reported" as const),
      overdue: records.some((item) => item.overdue),
    };
  });
  const unitsNotReporting = unitReporting.filter(
    (item) => item.status === "not_reported",
  ).length;
  const highVacancyCourses = new Set(
    visible
      .filter(
        (item) =>
          item.utilisationStatus === "red" &&
          item.actualIntake !== null &&
          item.actualIntake <= item.sanctionedCapacity,
      )
      .map((item) => item.course.id),
  ).size;
  const aboveCapacityCourses = new Set(
    visible
      .filter(
        (item) =>
          item.actualIntake !== null &&
          item.actualIntake > item.sanctionedCapacity,
      )
      .map((item) => item.course.id),
  ).size;
  const reportingGroups = [
    {
      label: "Fully reported",
      count: unitReporting.filter(
        (item) => item.status === "fully_reported",
      ).length,
      icon: CheckCircle2,
      tone: "complete",
    },
    {
      label: "Partially reported",
      count: unitReporting.filter(
        (item) => item.status === "partially_reported",
      ).length,
      icon: Clock3,
      tone: "partial",
    },
    {
      label: "Not reported",
      count: unitReporting.filter(
        (item) => item.status === "not_reported",
      ).length,
      icon: AlertTriangle,
      tone: "missing",
    },
    {
      label: "Reports overdue",
      count: unitReporting.filter((item) => item.overdue).length,
      icon: MailWarning,
      tone: "overdue",
    },
  ];
  const attention = visible
    .filter(
      (item) =>
        item.utilisationStatus === "red" ||
        item.utilisationStatus === "amber" ||
        item.reportingStatus !== "fully_reported",
    )
    .sort((a, b) => {
      const rank = { red: 0, grey: 1, amber: 2, green: 3 };
      return rank[a.utilisationStatus] - rank[b.utilisationStatus];
    })
    .slice(0, 7);
  const districts = Array.from(
    new Set(state.academicDeliveryUnits.map((item) => item.district)),
  ).sort();
  const disciplines = Array.from(
    new Set(state.courseMasters.map((item) => item.discipline)),
  ).sort();
  const filteredUnits = state.academicDeliveryUnits.filter(
    (item) => university === "all" || item.universityId === university,
  );

  return (
    <div className="capacity-page">
      <header className="capacity-page-header">
        <div>
          <p className="capacity-kicker">Statewide intake assurance</p>
          <h1>Admission Capacity Pulse</h1>
          <p>
            Semester 1 sanctioned seats, actual admissions and vacancies
            reported across university teaching units and colleges.
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Admission pulse exported",
                "The filtered Semester 1 capacity and intake brief is ready.",
              )
            }
          >
            <Download size={15} /> Export Pulse
          </button>
          <Link className="button button-primary" href="/hec/vacancies">
            <GraduationCap size={15} /> Explore by Course
          </Link>
        </div>
      </header>

      <nav className="capacity-mode-switch" aria-label="Capacity monitor mode">
        <span className="active">
          <strong>Mode 1</strong>
          <b>Semester 1 Admission Vacancy</b>
          <small>Sanctioned capacity − actual admitted students</small>
        </span>
        <Link href="/hec/student-strength">
          <strong>Mode 2</strong>
          <b>Semester 2–8 Current Strength Gap</b>
          <small>Sanctioned capacity − current reported strength</small>
        </Link>
      </nav>

      <section className="admission-pulse-visual">
        <div className="admission-pulse-gauge">
          <div
            className="admission-fill-ring"
            style={{ "--pulse-fill": `${fill * 3.6}deg` } as React.CSSProperties}
          >
            <span>
              <strong>{summary.fillRate === null ? "—" : `${summary.fillRate}%`}</strong>
              <small>overall fill rate</small>
            </span>
          </div>
          <div>
            <p className="capacity-kicker">Reported seat base</p>
            <h2>
              {summary.actualIntake.toLocaleString("en-IN")} admissions
              reported
            </h2>
            <p>
              Fill rate uses {summary.reportedCapacity.toLocaleString("en-IN")}{" "}
              seats with complete intake reports. The statewide sanctioned
              total remains {summary.sanctionedCapacity.toLocaleString("en-IN")}.
            </p>
          </div>
        </div>
        <div className="admission-pulse-track">
          <div>
            <small>Total sanctioned Semester 1 seats</small>
            <strong>{summary.sanctionedCapacity.toLocaleString("en-IN")}</strong>
          </div>
          <ArrowRight size={16} />
          <div>
            <small>Actual admissions reported</small>
            <strong>{summary.actualIntake.toLocaleString("en-IN")}</strong>
          </div>
          <ArrowRight size={16} />
          <div className="vacancy">
            <small>Current admission vacancies</small>
            <strong>{summary.admissionVacancy.toLocaleString("en-IN")}</strong>
            <span>Across fully reported offerings only</span>
          </div>
        </div>
        <div className="admission-pulse-signals">
          <span>
            <Building2 size={17} />
            <strong>{unitsNotReporting}</strong>
            <small>institutions not yet reporting</small>
          </span>
          <span>
            <AlertTriangle size={17} />
            <strong>{highVacancyCourses}</strong>
            <small>courses with high vacancy</small>
          </span>
          <span>
            <Users size={17} />
            <strong>{aboveCapacityCourses}</strong>
            <small>above approved capacity</small>
          </span>
        </div>
      </section>

      <section className="capacity-filter-panel">
        <header>
          <div>
            <Filter size={15} />
            <strong>Filter the Admission Capacity Pulse</strong>
          </div>
          <button onClick={() => setShowAllFilters((current) => !current)}>
            {showAllFilters ? "Show essential filters" : "Show all filters"}
          </button>
        </header>
        <div className="capacity-filter-grid">
          <label>
            <span>Academic year</span>
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            >
              <option value="all">All academic years</option>
              {state.academicYears.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Admission cohort</span>
            <select
              value={cohortYear}
              onChange={(event) => setCohortYear(event.target.value)}
            >
              <option value="all">All cohorts</option>
              {state.academicYears.map((item) => (
                <option key={item.id} value={item.id}>{item.admissionYear}</option>
              ))}
            </select>
          </label>
          <label>
            <span>University</span>
            <select
              value={university}
              onChange={(event) => {
                setUniversity(event.target.value);
                setUnit("all");
              }}
            >
              <option value="all">All universities</option>
              {state.universityProfiles.map((item) => (
                <option key={item.id} value={item.id}>{item.shortName}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Academic delivery unit</span>
            <select value={unit} onChange={(event) => setUnit(event.target.value)}>
              <option value="all">All delivery units</option>
              {filteredUnits.map((item) => (
                <option key={item.id} value={item.id}>{item.shortName}</option>
              ))}
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
          {showAllFilters ? (
            <>
              <label>
                <span>Unit type</span>
                <select
                  value={unitType}
                  onChange={(event) => setUnitType(event.target.value)}
                >
                  <option value="all">All unit types</option>
                  {Object.entries(unitTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>District</span>
                <select
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                >
                  <option value="all">All districts</option>
                  {districts.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Discipline</span>
                <select
                  value={discipline}
                  onChange={(event) => setDiscipline(event.target.value)}
                >
                  <option value="all">All disciplines</option>
                  {disciplines.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Admission status</span>
                <select
                  value={admissionStatus}
                  onChange={(event) => setAdmissionStatus(event.target.value)}
                >
                  <option value="all">All admission statuses</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">Admission in Progress</option>
                  <option value="finalised">Admission Finalised</option>
                </select>
              </label>
            </>
          ) : null}
        </div>
      </section>

      <div className="capacity-lower-grid">
        <section className="capacity-attention-list">
          <header>
            <div>
              <p className="capacity-kicker">Courses requiring attention</p>
              <h2>Seat position watchlist</h2>
            </div>
            <span>{attention.length} visible</span>
          </header>
          {attention.map((item) => (
            <article key={item.offering.id}>
              <div className="capacity-course-mark">
                <GraduationCap size={17} />
              </div>
              <div>
                <strong>{item.course.courseName}</strong>
                <p>
                  {item.unit.name} · {item.university.shortName}
                </p>
                <span>
                  {item.sanctionedCapacity} sanctioned ·{" "}
                  {item.actualIntake ?? "Intake not reported"} ·{" "}
                  {item.admissionVacancy ?? "Vacancy pending"}
                </span>
              </div>
              <SeatUtilisationBadge
                status={item.utilisationStatus}
                label={item.utilisationLabel}
                reason={item.attentionReason}
                showReason
              />
              <Link href={`/hec/courses/${item.course.id}/monitor`}>
                <ArrowRight size={15} />
              </Link>
            </article>
          ))}
        </section>

        <section className="reporting-completeness">
          <header>
            <p className="capacity-kicker">Reporting completeness</p>
            <h2>Institution submissions</h2>
          </header>
          <div className="reporting-status-stack">
            {reportingGroups.map((item) => {
              const Icon = item.icon;
              return (
                <div className={item.tone} key={item.label}>
                  <span><Icon size={16} /></span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>
                      {item.count} institution{item.count === 1 ? "" : "s"}
                    </small>
                  </div>
                  <b>{item.count}</b>
                </div>
              );
            })}
          </div>
          <div className="reporting-actions">
            <button
              onClick={() =>
                state.toast(
                  "Admission reminder sent",
                  "University nodal officers with missing or overdue reports have been notified.",
                )
              }
            >
              <MailWarning size={14} /> Send Reminder
            </button>
            <button
              onClick={() =>
                state.toast(
                  "Course report exported",
                  "The filtered admission capacity report is ready.",
                )
              }
            >
              <Download size={14} /> Export Course Report
            </button>
            <button
              onClick={() =>
                state.toast(
                  "University contact opened",
                  "Nodal officer contacts are available in the institution registry.",
                )
              }
            >
              <Building2 size={14} /> View University Contact
            </button>
          </div>
          <p className="reporting-note">
            {unitReporting.filter((item) => item.status !== "fully_reported")
              .length}{" "}
            of {unitReporting.length} institutions need reporting completion. Status:
            {" "}
            {visible.length
              ? reportingStatusLabel(
                  visible.some(
                    (item) => item.reportingStatus === "not_reported",
                  )
                    ? "not_reported"
                    : visible.some(
                          (item) =>
                            item.reportingStatus === "partially_reported",
                        )
                      ? "partially_reported"
                      : "fully_reported",
                )
              : "No matching reports"}
            .
          </p>
        </section>
      </div>
    </div>
  );
}
