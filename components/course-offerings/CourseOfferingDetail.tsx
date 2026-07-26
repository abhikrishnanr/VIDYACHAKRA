"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Copy,
  FileCheck2,
  GraduationCap,
  Landmark,
  Layers3,
  LockKeyhole,
  Pencil,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import {
  buildCourseOfferingMetrics,
  formatOfferingDate,
  offeringStatusLabel,
} from "@/lib/course-offerings";
import { useDemoState } from "@/lib/demo-state";
import { unitTypeLabels } from "@/lib/institution-structure";

export function CourseOfferingDetail({ offeringId }: { offeringId: string }) {
  const state = useDemoState();
  const router = useRouter();
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [capacityReason, setCapacityReason] = useState("");
  const offering = state.courseOfferings.find((item) => item.id === offeringId);

  const metric = useMemo(
    () =>
      offering
        ? buildCourseOfferingMetrics({
            offering,
            universities: state.universityProfiles,
            units: state.academicDeliveryUnits,
            courses: state.courseMasters,
            batches: state.courseBatches,
            cohorts: state.studentCohorts,
            snapshots: state.semesterStrengthSnapshots,
          })
        : null,
    [
      offering,
      state.academicDeliveryUnits,
      state.courseBatches,
      state.courseMasters,
      state.semesterStrengthSnapshots,
      state.studentCohorts,
      state.universityProfiles,
    ],
  );

  if (!offering || !metric) {
    return (
      <div className="offering-page">
        <section className="offering-not-found">
          <GraduationCap size={29} />
          <h1>Course offering not found</h1>
          <p>The requested local offering record is not available.</p>
          <Link className="button button-primary" href="/university/course-offerings">
            Return to offerings
          </Link>
        </section>
      </div>
    );
  }

  const academicYear = state.academicYears.find(
    (year) => year.id === offering.academicYearId,
  );
  const editable =
    offering.offeringStatus === "draft" ||
    offering.offeringStatus === "returned";
  const currentOfferingId = offering.id;
  const audit = state.demoAuditEntries.filter(
    (entry) =>
      entry.reference === offering.id ||
      entry.scope.includes(offering.id) ||
      entry.scope.includes(metric.course?.courseName ?? "__none__"),
  );

  function copyNextYear() {
    const copiedId = state.copyCourseOfferingToNextYear(currentOfferingId);
    if (copiedId) {
      window.setTimeout(
        () => router.push(`/university/course-offerings/${copiedId}`),
        0,
      );
    }
  }

  function recordCapacityReason() {
    if (
      state.requestVerifiedCapacityChange(currentOfferingId, capacityReason)
    ) {
      setCapacityReason("");
      setCapacityDialogOpen(false);
    }
  }

  return (
    <div className="offering-page offering-detail-page">
      <header className="offering-detail-header">
        <Link href="/university/course-offerings">
          <ArrowLeft size={14} /> Course offerings
        </Link>
        <div className="offering-detail-title">
          <span><GraduationCap size={22} /></span>
          <div>
            <p className="offering-kicker">
              {academicYear?.label} · {metric.course?.courseCode}
            </p>
            <h1>{metric.course?.courseName}</h1>
            <p>
              {metric.unit?.name} · {offering.mode.replaceAll("_", " ")} ·{" "}
              {offering.shift} shift
            </p>
          </div>
          <span className={`offering-status status-${offering.offeringStatus}`}>
            {offering.offeringStatus === "verified" ? (
              <ShieldCheck size={13} />
            ) : offering.offeringStatus === "submitted" ? (
              <Send size={13} />
            ) : (
              <CircleAlert size={13} />
            )}
            {offeringStatusLabel(offering.offeringStatus)}
          </span>
        </div>
        <div className="offering-detail-actions">
          {editable ? (
            <>
              <Link
                className="button button-secondary"
                href={`/university/course-offerings/new?offering=${offering.id}`}
              >
                <Pencil size={14} /> Update Draft
              </Link>
              <button
                className="button button-primary"
                onClick={() => state.submitCourseOffering(offering.id)}
              >
                <Send size={14} /> Submit Offering
              </button>
            </>
          ) : null}
          {offering.offeringStatus === "verified" ? (
            <button
              className="button button-secondary"
              onClick={() => setCapacityDialogOpen(true)}
            >
              <LockKeyhole size={14} /> Request Capacity Update
            </button>
          ) : null}
          <Link
            className="button button-secondary"
            href="/university/student-strength"
          >
            <Users size={14} /> View Student Strength
          </Link>
          <button className="button button-secondary" onClick={copyNextYear}>
            <Copy size={14} /> Copy to Next Academic Year
          </button>
        </div>
      </header>

      {offering.offeringStatus === "verified" ? (
        <section className="verified-capacity-banner">
          <LockKeyhole size={18} />
          <div>
            <strong>HEC-verified sanctioned capacity</strong>
            <p>
              Batch capacities cannot be altered as an ordinary draft edit.
              Record a reason for simulated HEC reconsideration.
            </p>
          </div>
          <span>{offering.approvalReference}</span>
        </section>
      ) : null}

      {offering.reviewNote ? (
        <section className="offering-review-note">
          <ClipboardCheck size={17} />
          <div>
            <strong>HEC verification note</strong>
            <p>{offering.reviewNote}</p>
          </div>
        </section>
      ) : null}

      <section className="offering-identity-band">
        <div className="unit">
          <span><Landmark size={19} /></span>
          <div>
            <small>Academic delivery unit</small>
            <strong>{metric.unit?.name}</strong>
            <p>
              {metric.unit ? unitTypeLabels[metric.unit.unitType] : ""} ·{" "}
              {metric.unit?.institutionCode} · {metric.unit?.district}
            </p>
          </div>
        </div>
        <div>
          <small>Official course</small>
          <strong>{metric.course?.courseCode}</strong>
          <p>{metric.course?.discipline}</p>
        </div>
        <div>
          <small>Academic-year offering</small>
          <strong>{academicYear?.label}</strong>
          <p>{formatOfferingDate(offering.effectiveFrom)} onward</p>
        </div>
        <div>
          <small>Approval reference</small>
          <strong>{offering.approvalReference || "Missing"}</strong>
          <p>Last updated {formatOfferingDate(offering.lastUpdatedAt)}</p>
        </div>
      </section>

      <div className="offering-detail-layout">
        <main>
          <section className="offering-detail-panel batch-capacity-panel">
            <header>
              <div>
                <p>Approved capacity</p>
                <h2>Batch-level sanctioned seats</h2>
              </div>
              <span><Layers3 size={15} /> {metric.batches.length} active batch{metric.batches.length === 1 ? "" : "es"}</span>
            </header>
            <div className="detail-batch-head detail-batch-grid">
              <span>Batch</span>
              <span>Status</span>
              <span>Sanctioned capacity</span>
            </div>
            {state.courseBatches
              .filter((batch) => batch.courseOfferingId === offering.id)
              .map((batch) => (
                <div className="detail-batch-row detail-batch-grid" key={batch.id}>
                  <div>
                    <strong>{batch.batchLabel}</strong>
                    <small>{batch.id}</small>
                  </div>
                  <span className={`batch-active-label ${batch.active ? "" : "inactive"}`}>
                    {batch.active ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}
                    {batch.active ? "Active approved batch" : "Inactive batch"}
                  </span>
                  <strong>{batch.sanctionedCapacity}</strong>
                </div>
              ))}
            <footer>
              <span>Total sanctioned seats</span>
              <strong>{metric.totalCapacity}</strong>
              <small>Calculated from active batch rows</small>
            </footer>
          </section>

          <section className="offering-detail-panel semester-strength-panel">
            <header>
              <div>
                <p>Student reporting</p>
                <h2>Semester strength summary</h2>
              </div>
              <Link href="/university/student-strength">
                Open reporting workspace <ArrowRight size={13} />
              </Link>
            </header>
            {metric.semesterSummaries.length ? (
              <div className="semester-summary-grid">
                {metric.semesterSummaries.map((summary) => (
                  <article key={summary.semester}>
                    <span>Semester {summary.semester}</span>
                    <strong>
                      {summary.reportedStrength === null
                        ? "Not reported"
                        : `${summary.reportedStrength} students`}
                    </strong>
                    <small>
                      {summary.sanctionedCapacity} sanctioned ·{" "}
                      {summary.reportingStatus}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <div className="offering-report-empty">
                <CircleAlert size={20} />
                <strong>No semester strength submitted</strong>
                <p>The offering exists, but batch-level reporting has not started.</p>
              </div>
            )}
          </section>

          <section className="offering-detail-panel offering-audit-panel">
            <header>
              <div>
                <p>Immutable-looking record</p>
                <h2>Audit activity</h2>
              </div>
              <FileCheck2 size={17} />
            </header>
            <div>
              {(audit.length
                ? audit.slice(0, 5)
                : [
                    {
                      id: "default-verified",
                      action:
                        offering.offeringStatus === "verified"
                          ? "Offering verified against HEC approval"
                          : "Course offering record created",
                      detail:
                        offering.approvalReference ||
                        "Approval reference awaiting confirmation.",
                      timestamp: "26 Jul 2026 · 12:30",
                      actor: "University Academic Administration",
                    },
                    {
                      id: "default-capacity",
                      action: "Batch capacity recorded",
                      detail: `${metric.batches.length} batch rows · ${metric.totalCapacity} sanctioned seats.`,
                      timestamp: "24 Jul 2026 · 15:10",
                      actor: "University Nodal Office",
                    },
                  ]
              ).map((entry) => (
                <article key={entry.id}>
                  <span />
                  <div>
                    <strong>{entry.action}</strong>
                    <p>{entry.detail}</p>
                    <small>{entry.actor} · {entry.timestamp}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside>
          <section className="admission-progress-card">
            <span><Users size={20} /></span>
            <p>Semester 1 admission progress</p>
            <h2>
              {metric.firstSemesterIntake === null
                ? "Reporting incomplete"
                : `${metric.firstSemesterIntake} of ${metric.totalCapacity}`}
            </h2>
            <div>
              <span
                style={{
                  width: `${Math.min(100, metric.fillRate ?? 0)}%`,
                }}
              />
            </div>
            <dl>
              <div><dt>Sanctioned seats</dt><dd>{metric.totalCapacity}</dd></div>
              <div><dt>Actual first-semester intake</dt><dd>{metric.firstSemesterIntake ?? "Not reported"}</dd></div>
              <div><dt>Admission vacancy</dt><dd>{metric.admissionVacancy ?? "Pending report"}</dd></div>
            </dl>
            <span className={`seat-utilisation-label ${metric.reportingIncomplete ? "incomplete" : metric.admissionVacancy ? "vacancy" : "full"}`}>
              {metric.reportingIncomplete ? (
                <CircleAlert size={13} />
              ) : metric.admissionVacancy ? (
                <AlertTriangle size={13} />
              ) : (
                <CheckCircle2 size={13} />
              )}
              {metric.reportingIncomplete
                ? "Student reporting incomplete"
                : metric.admissionVacancy
                  ? `${metric.admissionVacancy} admission vacancies`
                  : "Fully admitted"}
            </span>
          </section>

          <section className="offering-course-profile">
            <span><GraduationCap size={19} /></span>
            <p>Course Master profile</p>
            <h3>{metric.course?.shortName}</h3>
            <dl>
              <div><dt>Duration</dt><dd>{metric.course?.durationYears} years</dd></div>
              <div><dt>Total semesters</dt><dd>{metric.course?.totalSemesters}</dd></div>
              <div><dt>Programme type</dt><dd>{metric.course?.programmeType}</dd></div>
              <div><dt>Qualification</dt><dd>{metric.course?.qualificationLevel}</dd></div>
            </dl>
          </section>
        </aside>
      </div>

      <Modal
        open={capacityDialogOpen}
        title="Verified capacity is protected"
        onClose={() => setCapacityDialogOpen(false)}
      >
        <div className="modal-body capacity-change-dialog">
          <LockKeyhole size={27} />
          <div>
            <strong>Sanctioned batch capacity cannot be edited directly.</strong>
            <p>
              Record a reason for HEC reconsideration. This prototype keeps the
              verified values unchanged while adding the reason to the audit trail.
            </p>
            <label>
              <span>Reason for capacity change</span>
              <textarea
                value={capacityReason}
                onChange={(event) => setCapacityReason(event.target.value)}
                placeholder="Explain the approval or operational basis"
              />
            </label>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="button button-secondary"
            onClick={() => setCapacityDialogOpen(false)}
          >
            Cancel
          </button>
          <button className="button button-primary" onClick={recordCapacityReason}>
            Record Reason
          </button>
        </div>
      </Modal>
    </div>
  );
}
