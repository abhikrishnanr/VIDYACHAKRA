"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  GraduationCap,
  MailWarning,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  aggregateAdmissionMetrics,
  buildAllCapacityOfferingMetrics,
  reportingStatusLabel,
  type CapacityOfferingMetric,
} from "@/lib/capacity-monitor";
import { useDemoState } from "@/lib/demo-state";
import { unitTypeLabels } from "@/lib/institution-structure";
import { SeatUtilisationBadge } from "./SeatUtilisationBadge";

export function CourseVacancyExplorer() {
  const state = useDemoState();
  const [selectedCourseId, setSelectedCourseId] = useState("cm-bsc-cs");
  const [courseQuery, setCourseQuery] = useState("B.Sc. Computer Science");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedRow, setSelectedRow] =
    useState<CapacityOfferingMetric | null>(null);

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
  const selectedCourse = state.courseMasters.find(
    (item) => item.id === selectedCourseId,
  );
  const courseMetrics = allMetrics.filter(
    (item) => item.course.id === selectedCourseId,
  );
  const summary = aggregateAdmissionMetrics(courseMetrics);
  const offeringUniversities = new Set(
    courseMetrics.map((item) => item.university.id),
  ).size;
  const universitiesNotReporting = new Set(
    courseMetrics
      .filter((item) => item.reportingStatus !== "fully_reported")
      .map((item) => item.university.id),
  ).size;
  const matches = state.courseMasters.filter((course) =>
    `${course.courseName} ${course.shortName} ${course.courseCode}`
      .toLowerCase()
      .includes(courseQuery.toLowerCase()),
  );

  function chooseCourse(id: string) {
    const course = state.courseMasters.find((item) => item.id === id);
    if (!course) return;
    setSelectedCourseId(id);
    setCourseQuery(course.courseName);
    setSearchOpen(false);
  }

  return (
    <div className="capacity-page vacancy-explorer-page">
      <header className="capacity-page-header">
        <div>
          <p className="capacity-kicker">Course-first statewide view</p>
          <h1>Course Vacancy Explorer</h1>
          <p>
            Compare Semester 1 approved capacity, actual intake and admission
            vacancy across every university teaching unit and college offering
            the selected HEC course.
          </p>
        </div>
        <Link className="button button-secondary" href="/hec/admissions">
          Admission Capacity Pulse <ArrowRight size={15} />
        </Link>
      </header>

      <nav className="capacity-mode-switch compact" aria-label="Capacity terminology">
        <span className="active">
          <strong>Mode 1</strong>
          <b>Semester 1 Admission Vacancy</b>
          <small>Sanctioned capacity − actual admitted students</small>
        </span>
        <Link href="/hec/student-strength">
          <strong>Mode 2</strong>
          <b>Semester 2–8 Current Strength Gap</b>
          <small>Tracked separately in student-strength monitoring</small>
        </Link>
      </nav>

      <section className="course-search-stage">
        <div className="course-search-copy">
          <span><GraduationCap size={24} /></span>
          <div>
            <p className="capacity-kicker">Primary course control</p>
            <h2>Select a course to view statewide seat position</h2>
            <p>Search by course name, short name or official HEC code.</p>
          </div>
        </div>
        <div className="course-search-combobox">
          <label htmlFor="course-seat-search">Official HEC Course Master</label>
          <div>
            <Search size={17} />
            <input
              id="course-seat-search"
              value={courseQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setCourseQuery(event.target.value);
                setSearchOpen(true);
              }}
              autoComplete="off"
              placeholder="Select a course to view statewide seat position"
              role="combobox"
              aria-expanded={searchOpen}
              aria-controls="course-seat-search-results"
              aria-haspopup="listbox"
            />
            <button
              aria-label="Show course options"
              onClick={() => setSearchOpen((current) => !current)}
            >
              <ChevronDown size={16} />
            </button>
          </div>
          {searchOpen ? (
            <div
              className="course-search-results"
              id="course-seat-search-results"
              role="listbox"
            >
              {matches.map((course) => (
                <button
                  key={course.id}
                  role="option"
                  aria-selected={course.id === selectedCourseId}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseCourse(course.id)}
                >
                  <span>
                    <strong>{course.courseName}</strong>
                    <small>{course.courseCode} · {course.discipline}</small>
                  </span>
                  {course.id === selectedCourseId ? (
                    <CheckCircle2 size={15} />
                  ) : null}
                </button>
              ))}
              {!matches.length ? (
                <p>No official course matches this search.</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {selectedCourse ? (
        <>
          <section className="course-seat-summary">
            <div className="course-seat-identity">
              <span><GraduationCap size={21} /></span>
              <div>
                <small>{selectedCourse.courseCode}</small>
                <strong>{selectedCourse.courseName}</strong>
                <p>{selectedCourse.discipline} · {selectedCourse.durationYears} years</p>
              </div>
              <Link href={`/hec/courses/${selectedCourse.id}/monitor`}>
                Open Course Monitor <ExternalLink size={13} />
              </Link>
            </div>
            <div>
              <small>Institutions offering</small>
              <strong>{courseMetrics.length}</strong>
              <span>{offeringUniversities} universities</span>
            </div>
            <div>
              <small>Sanctioned capacity</small>
              <strong>{summary.sanctionedCapacity}</strong>
            </div>
            <div>
              <small>Actual intake</small>
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
              <small>Universities not reporting</small>
              <strong>{universitiesNotReporting}</strong>
            </div>
          </section>

          <section className="seat-legend">
            <div>
              <p className="capacity-kicker">Separate monitoring legend</p>
              <h2>Seat Utilisation Status</h2>
            </div>
            <SeatUtilisationBadge
              status="green"
              label="High utilisation"
              reason="90% to 100% fill"
              showReason
            />
            <SeatUtilisationBadge
              status="amber"
              label="Moderate vacancy"
              reason="70% to below 90% fill"
              showReason
            />
            <SeatUtilisationBadge
              status="red"
              label="Attention required"
              reason="Below 70% or above capacity"
              showReason
            />
            <SeatUtilisationBadge
              status="grey"
              label="Not reported"
              reason="Admission intake unavailable"
              showReason
            />
          </section>

          <section className="institution-seat-matrix">
            <header>
              <div>
                <p className="capacity-kicker">Institution comparison</p>
                <h2>{selectedCourse.shortName} seat position</h2>
              </div>
              <button
                onClick={() =>
                  state.toast(
                    "Course vacancy report exported",
                    `${selectedCourse.courseName} institution comparison is ready.`,
                  )
                }
              >
                <Download size={14} /> Export Course Report
              </button>
            </header>
            <div className="institution-seat-table-wrap">
              <table className="institution-seat-table">
                <thead>
                  <tr>
                    <th>University</th>
                    <th>Delivery unit</th>
                    <th>Unit type</th>
                    <th>District</th>
                    <th>Batches</th>
                    <th>Sanctioned</th>
                    <th>Actual intake</th>
                    <th>Vacancy</th>
                    <th>Fill rate</th>
                    <th>Reporting</th>
                    <th>Attention reason</th>
                  </tr>
                </thead>
                <tbody>
                  {courseMetrics.map((item) => (
                    <tr
                      key={item.offering.id}
                      onClick={() => setSelectedRow(item)}
                    >
                      <td><strong>{item.university.shortName}</strong></td>
                      <td><strong>{item.unit.name}</strong></td>
                      <td><span>{unitTypeLabels[item.unit.unitType]}</span></td>
                      <td><span>{item.unit.district}</span></td>
                      <td><strong>{item.batches.length}</strong></td>
                      <td><strong>{item.sanctionedCapacity}</strong></td>
                      <td><strong>{item.actualIntake ?? "Blank"}</strong></td>
                      <td><strong>{item.admissionVacancy ?? "—"}</strong></td>
                      <td><strong>{item.fillRate === null ? "—" : `${item.fillRate}%`}</strong></td>
                      <td>
                        <span className={`capacity-reporting ${item.reportingStatus}`}>
                          {reportingStatusLabel(item.reportingStatus)}
                        </span>
                      </td>
                      <td>
                        <SeatUtilisationBadge
                          status={item.utilisationStatus}
                          label={item.utilisationLabel}
                          reason={item.attentionReason}
                          showReason
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="institution-seat-mobile">
              {courseMetrics.map((item) => (
                <details key={item.offering.id}>
                  <summary>
                    <span>
                      <strong>{item.unit.name}</strong>
                      <small>{item.university.shortName} · {item.unit.district}</small>
                    </span>
                    <SeatUtilisationBadge
                      status={item.utilisationStatus}
                      label={item.utilisationLabel}
                      reason={item.attentionReason}
                    />
                  </summary>
                  <div>
                    <span><small>Sanctioned</small><strong>{item.sanctionedCapacity}</strong></span>
                    <span><small>Actual intake</small><strong>{item.actualIntake ?? "Blank"}</strong></span>
                    <span><small>Vacancy</small><strong>{item.admissionVacancy ?? "—"}</strong></span>
                    <span><small>Fill rate</small><strong>{item.fillRate === null ? "—" : `${item.fillRate}%`}</strong></span>
                  </div>
                  <p>{item.attentionReason}</p>
                  <button onClick={() => setSelectedRow(item)}>
                    Open institution seat detail <ArrowRight size={13} />
                  </button>
                </details>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {selectedRow ? (
        <div className="capacity-drawer-backdrop" onClick={() => setSelectedRow(null)}>
          <aside
            className="capacity-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="seat-drawer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <span><Building2 size={20} /></span>
              <div>
                <p className="capacity-kicker">Institution seat detail</p>
                <h2 id="seat-drawer-title">{selectedRow.unit.name}</h2>
                <p>{selectedRow.university.name}</p>
              </div>
              <button onClick={() => setSelectedRow(null)} aria-label="Close detail">
                <X size={18} />
              </button>
            </header>
            <div className="capacity-drawer-body">
              <SeatUtilisationBadge
                status={selectedRow.utilisationStatus}
                label={selectedRow.utilisationLabel}
                reason={selectedRow.attentionReason}
                showReason
              />
              <div className="drawer-identity-list">
                <span><GraduationCap size={14} /><b>{selectedRow.course.courseName}</b></span>
                <span><MapPin size={14} /><b>{selectedRow.unit.district}</b></span>
                <span><Building2 size={14} /><b>{unitTypeLabels[selectedRow.unit.unitType]}</b></span>
                <span><CalendarDays size={14} /><b>{selectedRow.academicYear?.label}</b></span>
              </div>
              <section>
                <h3>Semester 1 Admission Vacancy</h3>
                <p>Sanctioned capacity − actual admitted students</p>
                <div className="drawer-seat-numbers">
                  <span><small>Approved batches</small><strong>{selectedRow.batches.length}</strong></span>
                  <span><small>Sanctioned</small><strong>{selectedRow.sanctionedCapacity}</strong></span>
                  <span><small>Actual intake</small><strong>{selectedRow.actualIntake ?? "Blank"}</strong></span>
                  <span><small>Vacancy</small><strong>{selectedRow.admissionVacancy ?? "—"}</strong></span>
                </div>
              </section>
              <section>
                <h3>Batch position</h3>
                {selectedRow.batches.map((batch) => {
                  const snapshot = selectedRow.snapshots.find(
                    (item) =>
                      item.courseBatchId === batch.id &&
                      item.semesterNumber === 1,
                  );
                  return (
                    <div className="drawer-batch-row" key={batch.id}>
                      <strong>{batch.batchLabel}</strong>
                      <span>{batch.sanctionedCapacity} sanctioned</span>
                      <span>{snapshot?.admissionIntake ?? "Not reported"} admitted</span>
                    </div>
                  );
                })}
              </section>
              <section className="drawer-reporting-note">
                {selectedRow.reportingStatus === "fully_reported" ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertTriangle size={17} />
                )}
                <div>
                  <strong>{reportingStatusLabel(selectedRow.reportingStatus)}</strong>
                  <p>{selectedRow.attentionReason}</p>
                </div>
              </section>
            </div>
            <footer>
              {selectedRow.reportingStatus !== "fully_reported" ? (
                <button
                  onClick={() =>
                    state.toast(
                      "Reporting reminder sent",
                      `${selectedRow.university.shortName} has been reminded to complete Semester 1 intake reporting.`,
                    )
                  }
                >
                  <MailWarning size={14} /> Send Reminder
                </button>
              ) : null}
              <Link href={`/hec/institutions/${selectedRow.university.id}/capacity`}>
                Institution Capacity <ExternalLink size={13} />
              </Link>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
