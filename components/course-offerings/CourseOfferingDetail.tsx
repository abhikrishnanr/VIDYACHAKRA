"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CircleAlert,
  ClipboardCheck,
  Copy,
  FileCheck2,
  GraduationCap,
  Landmark,
  Pencil,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  buildCourseOfferingDetails,
  formatOfferingDate,
  offeringStatusLabel,
} from "@/lib/course-offerings";
import { useDemoState } from "@/lib/demo-state";
import { unitTypeLabels } from "@/lib/institution-structure";

export function CourseOfferingDetail({ offeringId }: { offeringId: string }) {
  const state = useDemoState();
  const router = useRouter();
  const offering = state.courseOfferings.find((item) => item.id === offeringId);

  if (!offering) {
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

  const details = buildCourseOfferingDetails({
    offering,
    universities: state.universityProfiles,
    units: state.academicDeliveryUnits,
    courses: state.courseMasters,
  });
  const academicYear = state.academicYears.find(
    (year) => year.id === offering.academicYearId,
  );
  const editable =
    offering.offeringStatus === "draft" ||
    offering.offeringStatus === "returned";
  const audit = state.demoAuditEntries.filter(
    (entry) =>
      entry.reference === offering.id ||
      entry.scope.includes(offering.id) ||
      entry.scope.includes(details.course?.courseName ?? "__none__"),
  );

  function copyNextYear() {
    const copiedId = state.copyCourseOfferingToNextYear(offering.id);
    if (copiedId) {
      window.setTimeout(
        () => router.push(`/university/course-offerings/${copiedId}`),
        0,
      );
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
              {academicYear?.label} · {details.course?.courseCode}
            </p>
            <h1>{details.course?.courseName}</h1>
            <p>
              {details.unit?.name} · {offering.mode.replaceAll("_", " ")} ·{" "}
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
          <button className="button button-secondary" onClick={copyNextYear}>
            <Copy size={14} /> Copy to Next Academic Year
          </button>
        </div>
      </header>

      {offering.offeringStatus === "verified" ? (
        <section className="verified-offering-banner">
          <ShieldCheck size={18} />
          <div>
            <strong>HEC-verified course offering</strong>
            <p>
              The official course, delivery unit and approval reference have
              been verified for this academic year.
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
            <strong>{details.unit?.name}</strong>
            <p>
              {details.unit ? unitTypeLabels[details.unit.unitType] : ""} ·{" "}
              {details.unit?.institutionCode} · {details.unit?.district}
            </p>
          </div>
        </div>
        <div>
          <small>Official course</small>
          <strong>{details.course?.courseCode}</strong>
          <p>{details.course?.discipline}</p>
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
          <section className="offering-detail-panel offering-definition-panel">
            <header>
              <div>
                <p>Course delivery definition</p>
                <h2>Offering details</h2>
              </div>
              <BookOpenCheck size={17} />
            </header>
            <dl className="offering-detail-definition">
              <div><dt>Course name</dt><dd>{details.course?.courseName}</dd></div>
              <div><dt>Course code</dt><dd>{details.course?.courseCode}</dd></div>
              <div><dt>Delivery unit</dt><dd>{details.unit?.name}</dd></div>
              <div><dt>Academic year</dt><dd>{academicYear?.label}</dd></div>
              <div><dt>Mode</dt><dd>{offering.mode.replaceAll("_", " ")}</dd></div>
              <div><dt>Shift</dt><dd>{offering.shift}</dd></div>
              <div><dt>Effective from</dt><dd>{formatOfferingDate(offering.effectiveFrom)}</dd></div>
              <div><dt>Effective to</dt><dd>{formatOfferingDate(offering.effectiveTo)}</dd></div>
            </dl>
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
                          ? "Course offering verified"
                          : "Course offering created",
                      detail:
                        offering.approvalReference ||
                        "Approval reference awaiting confirmation.",
                      timestamp: "26 Jul 2026 · 12:30",
                      actor: "University Academic Administration",
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
          <section className="offering-course-profile">
            <span><GraduationCap size={19} /></span>
            <p>Course Master profile</p>
            <h3>{details.course?.shortName}</h3>
            <dl>
              <div><dt>Duration</dt><dd>{details.course?.durationYears} years</dd></div>
              <div><dt>Total semesters</dt><dd>{details.course?.totalSemesters}</dd></div>
              <div><dt>Programme type</dt><dd>{details.course?.programmeType}</dd></div>
              <div><dt>Qualification</dt><dd>{details.course?.qualificationLevel}</dd></div>
              <div><dt>Discipline</dt><dd>{details.course?.discipline}</dd></div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
