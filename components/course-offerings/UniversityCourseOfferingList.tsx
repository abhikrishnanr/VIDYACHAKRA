"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  Download,
  GraduationCap,
  Landmark,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildAllCourseOfferingMetrics,
  formatOfferingDate,
  offeringStatusLabel,
} from "@/lib/course-offerings";
import { useDemoState } from "@/lib/demo-state";
import {
  isCollegeDeliveryUnit,
  isDirectDeliveryUnit,
  unitTypeLabels,
} from "@/lib/institution-structure";

export function UniversityCourseOfferingList() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("ay-2026-27");
  const [unitType, setUnitType] = useState("all");
  const [ownership, setOwnership] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [status, setStatus] = useState("all");
  const [vacancyOnly, setVacancyOnly] = useState(false);
  const [incompleteOnly, setIncompleteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const allMetrics = useMemo(
    () =>
      buildAllCourseOfferingMetrics({
        offerings: state.courseOfferings.filter(
          (offering) => offering.universityId === "sahya",
        ),
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        courses: state.courseMasters,
        batches: state.courseBatches,
        cohorts: state.studentCohorts,
        snapshots: state.semesterStrengthSnapshots,
      }),
    [
      state.academicDeliveryUnits,
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
          (metric) =>
            academicYear === "all" ||
            metric.offering.academicYearId === academicYear,
        )
        .filter(
          (metric) =>
            unitType === "all" || metric.unit?.unitType === unitType,
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
            courseId === "all" ||
            metric.offering.courseMasterId === courseId,
        )
        .filter(
          (metric) =>
            discipline === "all" ||
            metric.course?.discipline === discipline,
        )
        .filter(
          (metric) =>
            status === "all" || metric.offering.offeringStatus === status,
        )
        .filter(
          (metric) =>
            !vacancyOnly ||
            (metric.admissionVacancy !== null &&
              metric.admissionVacancy > 0),
        )
        .filter((metric) => !incompleteOnly || metric.reportingIncomplete)
        .filter((metric) =>
          `${metric.unit?.name} ${metric.course?.courseName} ${metric.course?.courseCode}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [
      academicYear,
      allMetrics,
      courseId,
      discipline,
      incompleteOnly,
      ownership,
      query,
      status,
      unitType,
      vacancyOnly,
    ],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof visible>();
    visible.forEach((metric) => {
      const key = metric.unit?.id ?? "unknown";
      groups.set(key, [...(groups.get(key) ?? []), metric]);
    });
    return Array.from(groups.entries())
      .map(([unitId, metrics]) => ({
        unitId,
        unit: metrics[0]?.unit,
        metrics,
      }))
      .sort((a, b) => (a.unit?.name ?? "").localeCompare(b.unit?.name ?? ""));
  }, [visible]);

  const totalCapacity = visible.reduce(
    (total, metric) => total + metric.totalCapacity,
    0,
  );
  const totalIntake = visible.reduce(
    (total, metric) => total + (metric.firstSemesterIntake ?? 0),
    0,
  );
  const reportedCapacity = visible
    .filter((metric) => metric.firstSemesterIntake !== null)
    .reduce((total, metric) => total + metric.totalCapacity, 0);
  const vacancies = visible.reduce(
    (total, metric) => total + (metric.admissionVacancy ?? 0),
    0,
  );
  const disciplines = Array.from(
    new Set(
      state.courseMasters.map((course) => course.discipline).filter(Boolean),
    ),
  ).sort();

  return (
    <div className="offering-page">
      <header className="offering-page-header">
        <div>
          <p className="offering-kicker">Academic delivery and approved capacity</p>
          <h1>Course offerings</h1>
          <p>
            One official HEC course, delivered by one academic delivery unit
            during one academic year—with sanctioned capacity calculated only
            from approved batches.
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Offering register exported",
                "The filtered course-offering and capacity register is ready.",
              )
            }
          >
            <Download size={15} /> Export Register
          </button>
          <Link
            className="button button-primary"
            href="/university/course-offerings/new"
          >
            <Plus size={15} /> Create Course Offering
          </Link>
        </div>
      </header>

      <section className="offering-pulse">
        <div className="lead">
          <span><Layers3 size={22} /></span>
          <div>
            <small>Approved capacity register</small>
            <strong>
              {visible.length} offering{visible.length === 1 ? "" : "s"} across{" "}
              {grouped.length} delivery unit{grouped.length === 1 ? "" : "s"}
            </strong>
            <p>
              {totalCapacity} sanctioned seats · {totalIntake} Semester 1
              intake reported against {reportedCapacity} seats · {vacancies}{" "}
              admission vacancies.
            </p>
          </div>
        </div>
        <div>
          <span>Total sanctioned capacity</span>
          <strong>{totalCapacity}</strong>
        </div>
        <div>
          <span>Reporting incomplete</span>
          <strong>
            {visible.filter((metric) => metric.reportingIncomplete).length}
          </strong>
        </div>
      </section>

      <section className="offering-filter-panel">
        <div className="offering-primary-filters">
          <label className="offering-search">
            <span>Search offerings</span>
            <div>
              <Search size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Delivery unit, course or code"
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
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>College or university unit</span>
            <select
              value={ownership}
              onChange={(event) => setOwnership(event.target.value)}
            >
              <option value="all">All delivery units</option>
              <option value="university">University teaching units</option>
              <option value="college">Colleges</option>
            </select>
          </label>
          <button onClick={() => setShowFilters((current) => !current)}>
            {showFilters ? "Hide detailed filters" : "More filters"}
          </button>
        </div>
        {showFilters ? (
          <div className="offering-secondary-filters">
            <label>
              <span>Delivery-unit type</span>
              <select
                value={unitType}
                onChange={(event) => setUnitType(event.target.value)}
              >
                <option value="all">All unit types</option>
                {Object.entries(unitTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Course</span>
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
              >
                <option value="all">All courses</option>
                {state.courseMasters
                  .filter((course) => course.active)
                  .sort((a, b) => a.courseName.localeCompare(b.courseName))
                  .map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.shortName}
                    </option>
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
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Offering status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Awaiting HEC verification</option>
                <option value="returned">Returned</option>
                <option value="verified">HEC verified</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="offering-toggle">
              <input
                type="checkbox"
                checked={vacancyOnly}
                onChange={(event) => setVacancyOnly(event.target.checked)}
              />
              <span>Has admission vacancy</span>
            </label>
            <label className="offering-toggle">
              <input
                type="checkbox"
                checked={incompleteOnly}
                onChange={(event) => setIncompleteOnly(event.target.checked)}
              />
              <span>Reporting incomplete</span>
            </label>
          </div>
        ) : null}
      </section>

      <section className="offering-groups">
        {grouped.map(({ unitId, unit, metrics }) => (
          <section className="offering-unit-group" key={unitId}>
            <header>
              <span>
                {unit && isCollegeDeliveryUnit(unit) ? (
                  <Building2 size={19} />
                ) : (
                  <Landmark size={19} />
                )}
              </span>
              <div>
                <p>{unit ? unitTypeLabels[unit.unitType] : "Delivery unit"}</p>
                <h2>{unit?.name ?? "Unknown delivery unit"}</h2>
                <small>
                  {unit?.institutionCode} · {unit?.district} · {metrics.length}{" "}
                  offering{metrics.length === 1 ? "" : "s"}
                </small>
              </div>
              <strong>
                {metrics.reduce(
                  (total, metric) => total + metric.totalCapacity,
                  0,
                )}{" "}
                sanctioned seats
              </strong>
            </header>
            <div className="offering-list-head offering-list-grid">
              <span>Course</span>
              <span>Academic year</span>
              <span>Approved batches</span>
              <span>Semester 1 intake</span>
              <span>Admission vacancy</span>
              <span>Offering status</span>
              <span>Last updated</span>
              <span />
            </div>
            {metrics.map((metric) => (
              <article className="offering-list-row offering-list-grid" key={metric.offering.id}>
                <div>
                  <span className="offering-course-mark">
                    <GraduationCap size={16} />
                  </span>
                  <div>
                    <strong>{metric.course?.courseName}</strong>
                    <small>
                      {metric.course?.courseCode} · {metric.course?.discipline}
                    </small>
                  </div>
                </div>
                <div>
                  <strong>
                    {
                      state.academicYears.find(
                        (year) => year.id === metric.offering.academicYearId,
                      )?.label
                    }
                  </strong>
                  <small>
                    {metric.offering.mode.replaceAll("_", " ")} ·{" "}
                    {metric.offering.shift}
                  </small>
                </div>
                <div>
                  <strong>
                    {metric.batches.length} batch
                    {metric.batches.length === 1 ? "" : "es"}
                  </strong>
                  <small>{metric.totalCapacity} sanctioned seats</small>
                </div>
                <div>
                  {metric.firstSemesterIntake === null ? (
                    <span className="reporting-label incomplete">
                      <CircleAlert size={12} /> Not reported
                    </span>
                  ) : (
                    <>
                      <strong>{metric.firstSemesterIntake}</strong>
                      <small>{metric.fillRate}% filled</small>
                    </>
                  )}
                </div>
                <div>
                  {metric.admissionVacancy === null ? (
                    <span className="vacancy-label muted">
                      <Users size={12} /> Awaiting report
                    </span>
                  ) : metric.admissionVacancy > 0 ? (
                    <span className="vacancy-label open">
                      <Users size={12} /> {metric.admissionVacancy} seats
                    </span>
                  ) : (
                    <span className="vacancy-label full">
                      <CheckCircle2 size={12} /> Fully admitted
                    </span>
                  )}
                </div>
                <div>
                  <span
                    className={`offering-status status-${metric.offering.offeringStatus}`}
                  >
                    {metric.offering.offeringStatus === "verified" ? (
                      <ShieldCheck size={12} />
                    ) : metric.offering.offeringStatus === "submitted" ? (
                      <BookOpenCheck size={12} />
                    ) : (
                      <CircleAlert size={12} />
                    )}
                    {offeringStatusLabel(metric.offering.offeringStatus)}
                  </span>
                </div>
                <div>
                  <strong>
                    {formatOfferingDate(metric.offering.lastUpdatedAt)}
                  </strong>
                  <small>{metric.offering.approvalReference || "Approval reference missing"}</small>
                </div>
                <Link href={`/university/course-offerings/${metric.offering.id}`}>
                  View <ArrowRight size={13} />
                </Link>
              </article>
            ))}
          </section>
        ))}
        {!grouped.length ? (
          <div className="offering-empty">
            <Search size={27} />
            <h2>No course offerings match these filters</h2>
            <p>Adjust the selected year, unit, course or reporting filters.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
