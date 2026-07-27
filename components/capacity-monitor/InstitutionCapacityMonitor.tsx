"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Download,
  GraduationCap,
  Landmark,
  MailWarning,
  MapPin,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import {
  aggregateAdmissionMetrics,
  buildAllCapacityOfferingMetrics,
  reportingStatusLabel,
} from "@/lib/capacity-monitor";
import { useDemoState } from "@/lib/demo-state";
import {
  isCollegeDeliveryUnit,
  isDirectDeliveryUnit,
  operatingModelLabels,
  unitTypeLabels,
} from "@/lib/institution-structure";
import type { AcademicDeliveryUnit } from "@/lib/types";
import { SeatUtilisationBadge } from "./SeatUtilisationBadge";

export function InstitutionCapacityMonitor({ id }: { id: string }) {
  const state = useDemoState();
  const university = state.universityProfiles.find((item) => item.id === id);
  const metrics = useMemo(
    () =>
      buildAllCapacityOfferingMetrics({
        offerings: state.courseOfferings.filter(
          (item) => item.universityId === id,
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
      id,
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

  if (!university) {
    return (
      <div className="capacity-page">
        <section className="capacity-not-found">
          <AlertTriangle size={25} />
          <h1>Institution capacity record not found</h1>
          <Link className="button button-primary" href="/hec/institutions">
            Return to Institution Directory
          </Link>
        </section>
      </div>
    );
  }

  const units = state.academicDeliveryUnits.filter(
    (item) => item.universityId === university.id && item.active,
  );
  const summary = aggregateAdmissionMetrics(metrics);
  const directUnits = units.filter(isDirectDeliveryUnit);
  const constituentUnits = units.filter(
    (item) => item.unitType === "constituent_college",
  );
  const affiliatedUnits = units.filter(
    (item) => item.unitType === "affiliated_college",
  );
  const missingReports = metrics.filter(
    (item) => item.reportingStatus !== "fully_reported",
  ).length;
  const currentGapTotal = metrics
    .filter(
      (item) =>
        item.currentSemester > 1 && item.currentStrengthGap !== null,
    )
    .reduce((total, item) => total + (item.currentStrengthGap ?? 0), 0);

  function renderGroup(
    title: string,
    description: string,
    groupUnits: AcademicDeliveryUnit[],
    Icon: typeof Landmark,
  ) {
    if (!groupUnits.length) return null;
    const unitIds = new Set(groupUnits.map((item) => item.id));
    const groupMetrics = metrics.filter((item) => unitIds.has(item.unit.id));
    return (
      <section className="institution-capacity-group">
        <header>
          <span><Icon size={18} /></span>
          <div>
            <p className="capacity-kicker">{description}</p>
            <h2>{title}</h2>
          </div>
          <b>{groupUnits.length}</b>
        </header>
        <div>
          {groupUnits.map((unit) => {
            const offerings = groupMetrics.filter(
              (item) => item.unit.id === unit.id,
            );
            return (
              <article className="unit-capacity-card" key={unit.id}>
                <header>
                  <div>
                    <span className={`unit-capacity-icon ${isCollegeDeliveryUnit(unit) ? "college" : "direct"}`}>
                      {isCollegeDeliveryUnit(unit) ? (
                        <Building2 size={17} />
                      ) : (
                        <Landmark size={17} />
                      )}
                    </span>
                    <div>
                      <strong>{unit.name}</strong>
                      <p>
                        {unitTypeLabels[unit.unitType]} · <MapPin size={10} />{" "}
                        {unit.district}
                      </p>
                    </div>
                  </div>
                  <span>
                    {offerings.length} course offering
                    {offerings.length === 1 ? "" : "s"}
                  </span>
                </header>
                {offerings.length ? (
                  <div className="unit-offering-table-wrap">
                    <table className="unit-offering-table">
                      <thead>
                        <tr>
                          <th>Course</th>
                          <th>Approved batches</th>
                          <th>Sanctioned</th>
                          <th>Actual intake</th>
                          <th>Admission vacancy</th>
                          <th>Current strength gap</th>
                          <th>Reporting</th>
                          <th>Seat utilisation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {offerings.map((item) => (
                          <tr key={item.offering.id}>
                            <td>
                              <Link href={`/hec/courses/${item.course.id}/monitor`}>
                                <strong>{item.course.shortName}</strong>
                                <span>{item.course.courseCode}</span>
                              </Link>
                            </td>
                            <td>
                              <strong>
                                {item.batches
                                  .map(
                                    (batch) =>
                                      `${batch.batchLabel}: ${batch.sanctionedCapacity}`,
                                  )
                                  .join(" · ")}
                              </strong>
                            </td>
                            <td><strong>{item.sanctionedCapacity}</strong></td>
                            <td><strong>{item.actualIntake ?? "Blank"}</strong></td>
                            <td>
                              <strong>{item.admissionVacancy ?? "—"}</strong>
                              <span>Semester 1 only</span>
                            </td>
                            <td>
                              {item.currentSemester === 1 ? (
                                <span>Starts from Semester 2</span>
                              ) : (
                                <>
                                  <strong>{item.currentStrengthGap ?? "—"}</strong>
                                  <span>Semester {item.currentSemester}</span>
                                </>
                              )}
                            </td>
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
                ) : (
                  <div className="unit-capacity-empty">
                    <GraduationCap size={18} />
                    <span>No active course offering is registered for this unit.</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="capacity-page institution-capacity-page">
      <Link className="capacity-back" href={`/hec/institutions/${university.id}`}>
        <ArrowLeft size={14} /> {university.shortName} Structure
      </Link>
      <header className="institution-capacity-header">
        <span>
          {university.operatingModel === "hybrid" ? (
            <Network size={27} />
          ) : university.operatingModel === "teaching_only" ? (
            <Landmark size={27} />
          ) : (
            <Building2 size={27} />
          )}
        </span>
        <div>
          <p className="capacity-kicker">Institution capacity assurance</p>
          <h1>{university.name}</h1>
          <p>
            {operatingModelLabels[university.operatingModel]} ·{" "}
            {university.district} · {metrics.length} course offerings
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Institution capacity report exported",
                `${university.shortName} course capacity, intake and strength report is ready.`,
              )
            }
          >
            <Download size={15} /> Export Capacity Report
          </button>
          {missingReports ? (
            <button
              className="button button-primary"
              onClick={() =>
                state.toast(
                  "Reporting reminder sent",
                  `${university.shortName} has been asked to complete ${missingReports} aggregate report${missingReports === 1 ? "" : "s"}.`,
                )
              }
            >
              <MailWarning size={15} /> Send Reminder
            </button>
          ) : null}
        </div>
      </header>

      <section className="institution-capacity-overview">
        <div className="institution-overview-lead">
          <span><ShieldCheck size={22} /></span>
          <div>
            <small>Complete institutional delivery picture</small>
            <strong>
              {summary.actualIntake} Semester 1 admissions reported against{" "}
              {summary.reportedCapacity} reported seats
            </strong>
            <p>
              Direct university units and colleges use the same course-offering
              and approved batch-capacity model.
            </p>
          </div>
        </div>
        <div><small>Direct teaching units</small><strong>{directUnits.length}</strong></div>
        <div><small>Constituent colleges</small><strong>{constituentUnits.length}</strong></div>
        <div><small>Affiliated colleges</small><strong>{affiliatedUnits.length}</strong></div>
      </section>

      <section className="institution-capacity-modes">
        <article>
          <span className="mode-number">1</span>
          <div>
            <p className="capacity-kicker">Semester 1</p>
            <h2>Admission Vacancy</h2>
            <p>Sanctioned capacity − actual admitted students</p>
          </div>
          <div>
            <span><small>Sanctioned</small><strong>{summary.sanctionedCapacity}</strong></span>
            <span><small>Actual intake</small><strong>{summary.actualIntake}</strong></span>
            <span><small>Vacancy</small><strong>{summary.admissionVacancy}</strong></span>
            <span><small>Fill rate</small><strong>{summary.fillRate ?? "—"}%</strong></span>
          </div>
        </article>
        <article>
          <span className="mode-number">2</span>
          <div>
            <p className="capacity-kicker">Semesters 2 to 8</p>
            <h2>Current Strength Gap</h2>
            <p>Sanctioned capacity − current reported strength</p>
          </div>
          <div>
            <span><small>Current gap total</small><strong>{currentGapTotal}</strong></span>
            <span><small>Missing reports</small><strong>{missingReports}</strong></span>
          </div>
        </article>
      </section>

      <div className="institution-capacity-groups">
        {renderGroup(
          "Direct university teaching units",
          "University-owned academic delivery",
          directUnits,
          Landmark,
        )}
        {renderGroup(
          "Constituent colleges",
          "University-owned colleges",
          constituentUnits,
          Building2,
        )}
        {renderGroup(
          "Affiliated colleges",
          "Affiliated academic delivery",
          affiliatedUnits,
          Building2,
        )}
        {!units.length ? (
          <section className="capacity-not-found">
            <Users size={24} />
            <h2>No active academic delivery units</h2>
            <p>Capacity monitoring begins after an institution structure is registered.</p>
          </section>
        ) : null}
      </div>

      <section className="institution-reporting-summary">
        <div>
          {missingReports ? (
            <AlertTriangle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <div>
            <strong>
              {missingReports
                ? `${missingReports} course report${missingReports === 1 ? "" : "s"} need completion`
                : "All institution capacity reports are complete"}
            </strong>
            <p>
              HEC monitoring remains read only; reported student numbers can
              only be changed from the university workspace.
            </p>
          </div>
        </div>
        <button
          onClick={() =>
            state.toast(
              "University contact opened",
              `${university.shortName} nodal officer and registrar contacts are available.`,
            )
          }
        >
          View University Contact
        </button>
      </section>
    </div>
  );
}
