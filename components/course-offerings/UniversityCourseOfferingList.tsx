"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CircleAlert,
  Download,
  GraduationCap,
  Landmark,
  Layers3,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildAllCourseOfferingDetails,
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
  const [ownership, setOwnership] = useState("all");
  const [courseId, setCourseId] = useState("all");
  const [discipline, setDiscipline] = useState("all");
  const [status, setStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const allOfferings = useMemo(
    () =>
      buildAllCourseOfferingDetails({
        offerings: state.courseOfferings.filter(
          (offering) => offering.universityId === "sahya",
        ),
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        courses: state.courseMasters,
      }),
    [
      state.academicDeliveryUnits,
      state.courseMasters,
      state.courseOfferings,
      state.universityProfiles,
    ],
  );

  const visible = useMemo(
    () =>
      allOfferings
        .filter(
          (item) =>
            academicYear === "all" ||
            item.offering.academicYearId === academicYear,
        )
        .filter((item) => {
          if (ownership === "university") {
            return item.unit ? isDirectDeliveryUnit(item.unit) : false;
          }
          if (ownership === "college") {
            return item.unit ? isCollegeDeliveryUnit(item.unit) : false;
          }
          return true;
        })
        .filter(
          (item) =>
            courseId === "all" || item.offering.courseMasterId === courseId,
        )
        .filter(
          (item) =>
            discipline === "all" || item.course?.discipline === discipline,
        )
        .filter(
          (item) =>
            status === "all" || item.offering.offeringStatus === status,
        )
        .filter((item) =>
          `${item.unit?.name} ${item.course?.courseName} ${item.course?.courseCode}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [
      academicYear,
      allOfferings,
      courseId,
      discipline,
      ownership,
      query,
      status,
    ],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, typeof visible>();
    visible.forEach((item) => {
      const key = item.unit?.id ?? "unknown";
      groups.set(key, [...(groups.get(key) ?? []), item]);
    });
    return Array.from(groups.entries())
      .map(([unitId, offerings]) => ({
        unitId,
        unit: offerings[0]?.unit,
        offerings,
      }))
      .sort((a, b) => (a.unit?.name ?? "").localeCompare(b.unit?.name ?? ""));
  }, [visible]);

  const disciplines = Array.from(
    new Set(state.courseMasters.map((course) => course.discipline)),
  ).sort();
  const verified = visible.filter(
    (item) => item.offering.offeringStatus === "verified",
  ).length;
  const awaiting = visible.filter((item) =>
    ["draft", "submitted", "returned"].includes(item.offering.offeringStatus),
  ).length;

  return (
    <div className="offering-page">
      <header className="offering-page-header">
        <div>
          <p className="offering-kicker">Official course delivery register</p>
          <h1>Course offerings</h1>
          <p>
            Link active HEC Course Master records to the university campuses,
            schools and colleges where each course is delivered.
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Offering register exported",
                "The filtered course-offering register is ready.",
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
            <small>University course register</small>
            <strong>
              {visible.length} offering{visible.length === 1 ? "" : "s"} across{" "}
              {grouped.length} delivery unit{grouped.length === 1 ? "" : "s"}
            </strong>
            <p>Every course name comes from the active HEC Course Master.</p>
          </div>
        </div>
        <div>
          <span>HEC verified</span>
          <strong>{verified}</strong>
        </div>
        <div>
          <span>Awaiting action</span>
          <strong>{awaiting}</strong>
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
            <span>Delivery ownership</span>
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
              <span>Course</span>
              <select value={courseId} onChange={(event) => setCourseId(event.target.value)}>
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
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Offering status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="all">All statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Awaiting HEC verification</option>
                <option value="returned">Returned</option>
                <option value="verified">HEC verified</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
        ) : null}
      </section>

      <section className="offering-groups">
        {grouped.map(({ unitId, unit, offerings }) => (
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
                <small>{unit?.institutionCode} · {unit?.district}</small>
              </div>
              <strong>
                {offerings.length} course{offerings.length === 1 ? "" : "s"}
              </strong>
            </header>
            <div className="offering-list-head offering-list-grid">
              <span>Official course</span>
              <span>Academic year</span>
              <span>Delivery</span>
              <span>Approval reference</span>
              <span>Status</span>
              <span>Last updated</span>
              <span />
            </div>
            {offerings.map((item) => (
              <article
                className="offering-list-row offering-list-grid"
                key={item.offering.id}
              >
                <div>
                  <span className="offering-course-mark">
                    <GraduationCap size={16} />
                  </span>
                  <div>
                    <strong>{item.course?.courseName}</strong>
                    <small>{item.course?.courseCode} · {item.course?.discipline}</small>
                  </div>
                </div>
                <div>
                  <strong>
                    {state.academicYears.find(
                      (year) => year.id === item.offering.academicYearId,
                    )?.label}
                  </strong>
                  <small>{item.course?.programmeType}</small>
                </div>
                <div>
                  <strong>{item.offering.mode.replaceAll("_", " ")}</strong>
                  <small>{item.offering.shift} shift</small>
                </div>
                <div>
                  <strong>{item.offering.approvalReference || "Not recorded"}</strong>
                  <small>{item.offering.effectiveFrom} onward</small>
                </div>
                <div>
                  <span className={`offering-status status-${item.offering.offeringStatus}`}>
                    {item.offering.offeringStatus === "verified" ? (
                      <ShieldCheck size={12} />
                    ) : item.offering.offeringStatus === "submitted" ? (
                      <BookOpenCheck size={12} />
                    ) : (
                      <CircleAlert size={12} />
                    )}
                    {offeringStatusLabel(item.offering.offeringStatus)}
                  </span>
                </div>
                <div>
                  <strong>{formatOfferingDate(item.offering.lastUpdatedAt)}</strong>
                  <small>{item.offering.id}</small>
                </div>
                <Link href={`/university/course-offerings/${item.offering.id}`}>
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
            <p>Adjust the selected year, unit, course, discipline or status.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
