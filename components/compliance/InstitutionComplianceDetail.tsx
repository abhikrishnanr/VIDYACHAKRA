"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileClock,
  History,
  Landmark,
  XCircle,
} from "lucide-react";
import {
  buildMatrixCells,
  getInstitutionById,
  matrixMilestones,
  type MatrixStatus,
} from "@/lib/compliance-matrix-data";
import { useDemoState } from "@/lib/demo-state";

const statusMeta = {
  green: { label: "Aligned", Icon: CheckCircle2 },
  amber: { label: "Attention", Icon: AlertTriangle },
  red: { label: "Critical deviation", Icon: XCircle },
  grey: { label: "Not applicable", Icon: Clock3 },
};

export function InstitutionComplianceDetail({ id }: { id: string }) {
  const {
    requestStatus,
    committeeDecision,
    revisionPublicationState,
    completedEventConfirmations,
    toast,
  } = useDemoState();
  const institution = getInstitutionById(id);

  if (!institution) {
    return (
      <section className="institution-not-found">
        <Landmark size={30} />
        <h1>Institution not found</h1>
        <p>This fictional institution is not part of the current demonstration network.</p>
        <Link href="/hec/compliance" className="button button-primary">Return to Compliance Matrix</Link>
      </section>
    );
  }

  const cells = buildMatrixCells({
    requestStatus,
    committeeDecision,
    revisionPublicationState,
  }).filter((cell) => cell.universityId === institution.id);
  const issues = cells.filter((cell) => cell.status === "red" || cell.status === "amber");
  const critical = cells.some((cell) => cell.status === "red");
  const attention = cells.some((cell) => cell.status === "amber");
  const status: MatrixStatus = critical ? "red" : attention ? "amber" : "green";
  const StatusIcon = statusMeta[status].Icon;
  const theoryCell = cells.find((cell) => cell.milestoneId === "theory")!;

  return (
    <>
      <header className="institution-detail-header">
        <Link href="/hec/compliance"><ArrowLeft size={15} /> Back to Compliance Matrix</Link>
        <div className="institution-identity">
          <span><Landmark size={25} /></span>
          <div>
            <p>{institution.region} Kerala · Participating FYUGP institution</p>
            <h1>{institution.name}</h1>
            <small>Institution code {institution.id.toUpperCase()}-2026 · {institution.colleges.length} sample colleges shown</small>
          </div>
          <div className={`institution-overall-status ${status}`}>
            <StatusIcon size={20} />
            <span>
              <small>Overall compliance</small>
              <strong>{statusMeta[status].label}</strong>
            </span>
          </div>
        </div>
      </header>

      {institution.id === "sahya" ? (
        <section className={`institution-critical-banner ${theoryCell.status}`}>
          {theoryCell.status === "green" ? <CheckCircle2 size={23} /> : theoryCell.status === "amber" ? <AlertTriangle size={23} /> : <XCircle size={23} />}
          <div>
            <p>Semester 1 Theory Examination · Council date 05 December</p>
            <h2>
              {theoryCell.status === "green"
                ? "Approved institution-specific exception published"
                : theoryCell.status === "amber"
                  ? theoryCell.statusLabel
                  : "Critical +7 day examination deviation remains visible"}
            </h2>
            <span>{theoryCell.reason}</span>
          </div>
          <div>
            <strong>12 DEC</strong>
            <small>University date</small>
          </div>
          <Link href="/workflow/agenda?request=CR-2026-014">Open CR-2026-014 <ArrowRight size={15} /></Link>
        </section>
      ) : null}

      <section className="institution-milestone-section">
        <div className="institution-section-heading">
          <div><p className="eyebrow">Calendar-wide view</p><h2>Major Academic Milestones</h2></div>
          <span>{cells.filter((cell) => cell.status === "green").length} aligned · {issues.length} requiring context</span>
        </div>
        <div className="institution-milestone-rail">
          {cells.map((cell) => {
            const milestone = matrixMilestones.find((item) => item.id === cell.milestoneId)!;
            const { Icon, label } = statusMeta[cell.status];
            return (
              <button
                type="button"
                className={cell.status}
                onClick={() => toast(milestone.label, `${label} · ${cell.reason}`)}
                key={cell.milestoneId}
              >
                <Icon size={15} />
                <strong>{milestone.shortLabel}</strong>
                <small>{cell.variance}</small>
              </button>
            );
          })}
        </div>
      </section>

      <div className="institution-detail-grid">
        <section className="institution-issues">
          <div className="institution-section-heading compact">
            <div><p className="eyebrow">Exceptions stay visible</p><h2>Red and Amber Issues</h2></div>
            <span>{issues.length}</span>
          </div>
          {issues.length ? issues.map((cell) => {
            const milestone = matrixMilestones.find((item) => item.id === cell.milestoneId)!;
            const { Icon, label } = statusMeta[cell.status];
            return (
              <article className={cell.status} key={cell.milestoneId}>
                <Icon size={18} />
                <div>
                  <strong>{milestone.label}</strong>
                  <span>{label} · {cell.statusLabel} · {cell.variance}</span>
                  <p>{cell.reason}</p>
                </div>
                {cell.requestId ? <Link href={`/workflow/agenda?request=${cell.requestId}`}>{cell.requestId}<ChevronRight size={14} /></Link> : null}
              </article>
            );
          }) : (
            <div className="institution-aligned-empty"><CheckCircle2 size={24} /><strong>No Red or Amber issues</strong><span>All applicable milestones are aligned.</span></div>
          )}
        </section>

        <section className="institution-adoption">
          <div className="institution-section-heading compact">
            <div><p className="eyebrow">Official baseline</p><h2>Calendar Adoption</h2></div>
            <CalendarCheck2 size={19} />
          </div>
          <div className="adoption-state">
            <span><Check size={17} /></span>
            <div><strong>Version 1.0 adopted</strong><small>Academic council confirmation · 18 July 2026</small></div>
          </div>
          <dl>
            <div><dt>Adoption reference</dt><dd>{institution.id.toUpperCase()}/ACAD/CAL/2026/18</dd></div>
            <div><dt>Current published version</dt><dd>{revisionPublicationState === "published" ? "Version 1.1" : "Version 1.0"}</dd></div>
            <div><dt>Local calendar status</dt><dd>{institution.submission}</dd></div>
          </dl>
        </section>

        <section className="institution-colleges">
          <div className="institution-section-heading compact">
            <div><p className="eyebrow">Affiliated network</p><h2>Affiliated Colleges</h2></div>
            <Building2 size={19} />
          </div>
          {institution.colleges.map((college, index) => (
            <button type="button" onClick={() => toast(college, "College-level milestone reporting is inherited from the university calendar in this demonstration.")} key={college}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{college}</strong><small>FYUGP calendar reporting active</small></div>
              <ChevronRight size={15} />
            </button>
          ))}
          <p>{institution.id === "sahya" ? "15 additional affiliated colleges are affected by the open theory-examination request." : "Three representative colleges are shown for this fictional institution."}</p>
        </section>

        <section className="institution-completions">
          <div className="institution-section-heading compact">
            <div><p className="eyebrow">Evidence trail</p><h2>Actual Completion Reporting</h2></div>
            <CheckCircle2 size={19} />
          </div>
          {cells.slice(0, 4).map((cell) => {
            const milestone = matrixMilestones.find((item) => item.id === cell.milestoneId)!;
            const confirmed = cell.actualCompletionDate || completedEventConfirmations.includes(cell.milestoneId);
            return (
              <div key={cell.milestoneId}>
                <span className={confirmed ? "confirmed" : "pending"}>{confirmed ? <Check size={13} /> : <Clock3 size={13} />}</span>
                <div><strong>{milestone.label}</strong><small>{confirmed ? `Reported · ${cell.actualCompletionDate ?? "evidence received"}` : "Actual completion not yet due"}</small></div>
              </div>
            );
          })}
        </section>

        <section className="institution-requests">
          <div className="institution-section-heading compact">
            <div><p className="eyebrow">Governance record</p><h2>Change Request History</h2></div>
            <FileClock size={19} />
          </div>
          {institution.id === "sahya" ? (
            <div className="request-history">
              <span className="request-history-line" />
              <article className="complete"><span><Check size={12} /></span><div><strong>Draft opened</strong><small>26 July · Monsoon evidence assembled</small></div></article>
              <article className={requestStatus !== "draft" ? "complete" : "current"}><span>{requestStatus !== "draft" ? <Check size={12} /> : <Clock3 size={12} />}</span><div><strong>Request submitted</strong><small>{requestStatus === "draft" ? "Awaiting university submission" : "Submission recorded"}</small></div></article>
              <article className={committeeDecision === "approved" || committeeDecision === "approved-with-conditions" ? "complete" : "current"}><span>{committeeDecision === "approved" || committeeDecision === "approved-with-conditions" ? <Check size={12} /> : <Clock3 size={12} />}</span><div><strong>Committee decision</strong><small>{committeeDecision === "approved" || committeeDecision === "approved-with-conditions" ? "Exception approved" : "Decision pending"}</small></div></article>
              <article className={revisionPublicationState === "published" ? "complete" : "current"}><span>{revisionPublicationState === "published" ? <Check size={12} /> : <Clock3 size={12} />}</span><div><strong>Version 1.1 publication</strong><small>{revisionPublicationState === "published" ? "Published and locked" : "Not yet official"}</small></div></article>
            </div>
          ) : (
            <div className="institution-aligned-empty"><History size={23} /><strong>No material change requests</strong><span>Routine clarifications are recorded in recent activity.</span></div>
          )}
        </section>
      </div>

      <div className="institution-lower-grid">
        <section>
          <div className="institution-section-heading compact"><div><p className="eyebrow">Latest trail</p><h2>Recent Activity</h2></div></div>
          {[
            ["26 Jul · 11:30", "Monitoring impact note updated"],
            ["24 Jul · 17:05", "Admission closure completion confirmed"],
            ["18 Jul · 14:10", "FYUGP calendar adoption recorded"],
          ].map(([time, activity]) => <p key={activity}><time>{time}</time><span>{activity}</span></p>)}
        </section>
        <section>
          <div className="institution-section-heading compact"><div><p className="eyebrow">Forward obligations</p><h2>Upcoming Obligations</h2></div></div>
          {[
            ["31 JUL", "Confirm Semester 1 teaching readiness"],
            ["03 AUG", "Report classes commencement"],
            ["14 AUG", "Close course registration confirmation"],
          ].map(([date, obligation]) => <button type="button" onClick={() => toast("Obligation reminder", `${obligation} is due ${date}.`)} key={date}><time>{date}</time><span>{obligation}</span><ChevronRight size={14} /></button>)}
        </section>
      </div>
    </>
  );
}
