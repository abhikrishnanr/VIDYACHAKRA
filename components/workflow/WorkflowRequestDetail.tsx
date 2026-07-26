"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Gavel,
  History,
  Landmark,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  Scale,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { WorkflowStepTracker } from "@/components/workflow/WorkflowStepTracker";
import { useDemoState } from "@/lib/demo-state";
import {
  baseWorkflowAudit,
  buildWorkflowStages,
  relatedWorkflowRequests,
  requestStageLabel,
  supportingEvidence,
} from "@/lib/workflow-data";

const defaultCondition =
  "University must complete centralised valuation without altering the statewide result publication window.";

export function WorkflowRequestDetail({ id }: { id: string }) {
  const state = useDemoState();
  const [officerNote, setOfficerNote] = useState(
    state.officerNote ||
      "Evidence confirms disruption across all 18 colleges. The proposed exception is institution-specific and does not alter the statewide examination baseline.",
  );
  const [committeeCondition, setCommitteeCondition] = useState(
    state.committeeCondition || defaultCondition,
  );
  const [meetingNote, setMeetingNote] = useState(
    state.committeeMeetingNote ||
      "The committee reviewed the monsoon impact evidence and downstream safeguards.",
  );
  const stages = buildWorkflowStages(state);
  const auditEntries = useMemo(
    () => [...state.demoAuditEntries, ...baseWorkflowAudit].slice(0, 8),
    [state.demoAuditEntries],
  );

  if (id.toLowerCase() !== "cr-2026-014") {
    return (
      <section className="gov-not-found">
        <FileText size={29} />
        <h1>Request record not found</h1>
        <p>This workflow demonstration currently provides full detail for CR-2026-014.</p>
        <Link className="button button-primary" href="/workflow/dashboard">Return to workflow dashboard</Link>
      </section>
    );
  }

  const hecCanAct =
    state.requestStatus === "submitted" || state.requestStatus === "screening";
  const committeeCanAct = state.requestStatus === "committee-review";
  const approved = state.requestStatus === "approved";
  const published = state.requestStatus === "published";

  return (
    <div className="gov-page gov-request-detail-page">
      <Link className="gov-back-link" href="/workflow/dashboard">
        <ArrowLeft size={15} /> Back to governance queue
      </Link>

      <header className="gov-request-header">
        <div>
          <div className="gov-request-title-line">
            <span>CR-2026-014</span>
            <span className="gov-priority critical"><AlertTriangle size={13} /> Critical priority</span>
          </div>
          <h1>Semester 1 Theory Examination</h1>
          <p>Sahya Higher Studies University · FYUGP Semester 1 · 18 affiliated colleges</p>
        </div>
        <div className={`gov-request-stage state-${state.requestStatus}`}>
          {published ? <CheckCircle2 size={19} /> : <Clock3 size={19} />}
          <span><small>Current workflow stage</small><strong>{requestStageLabel(state)}</strong></span>
        </div>
      </header>

      <section className="gov-baseline-protection">
        <span><LockKeyhole size={21} /></span>
        <div>
          <strong>Published Version 1.0 remains immutable</strong>
          <p>
            The request records a proposed revision beside the official value.
            No review or decision directly edits the published calendar.
          </p>
        </div>
        <b>KSHEC/ACAD/CAL/2026/01</b>
      </section>

      <section className="gov-comparison">
        <article className="current">
          <header>
            <span><ShieldCheck size={18} /></span>
            <div><p>Left · Official record</p><h2>Current Approved Calendar</h2></div>
            <span className="gov-lock-label"><LockKeyhole size={13} /> Locked</span>
          </header>
          <div className="gov-comparison-date">
            <small>Semester 1 Theory Examination</small>
            <strong>05</strong>
            <span>December 2026</span>
          </div>
          <dl>
            <div><dt>Calendar version</dt><dd>Version 1.0</dd></div>
            <div><dt>Publication state</dt><dd>Published and locked</dd></div>
            <div><dt>Applicable scope</dt><dd>Statewide FYUGP baseline</dd></div>
            <div><dt>Authority</dt><dd>KSHEC/ACAD/CAL/2026/01</dd></div>
          </dl>
        </article>

        <div className="gov-comparison-arrow">
          <ArrowRight size={23} />
          <span>+7 days</span>
          <small>Proposed only</small>
        </div>

        <article className="proposed">
          <header>
            <span><CalendarDays size={18} /></span>
            <div><p>Right · Change request</p><h2>Proposed Revision</h2></div>
            <span className="gov-proposed-label"><FileText size={13} /> CR-2026-014</span>
          </header>
          <div className="gov-comparison-date">
            <small>Semester 1 Theory Examination</small>
            <strong>12</strong>
            <span>December 2026</span>
          </div>
          <dl>
            <div><dt>Requested by</dt><dd>Sahya Higher Studies University</dd></div>
            <div><dt>Applicable scope</dt><dd>18 affiliated colleges only</dd></div>
            <div><dt>Estimated students</dt><dd>11,460</dd></div>
            <div><dt>Current effect</dt><dd>{published ? "Official exception" : "No public effect"}</dd></div>
          </dl>
        </article>
      </section>

      <div className="gov-detail-layout">
        <main>
          <section className="gov-detail-section gov-explanation">
            <div className="gov-section-heading">
              <div><p>University submission</p><h2>Explanation and evidence</h2></div>
              <span><Building2 size={15} /> Sahya Higher Studies University</span>
            </div>
            <blockquote>
              “Severe monsoon disruption affected scheduled academic activities
              across 18 affiliated colleges.”
            </blockquote>
            <div className="gov-evidence-list">
              {supportingEvidence.map((evidence) => (
                <article key={evidence.reference}>
                  <span><FileCheck2 size={18} /></span>
                  <div><strong>{evidence.name}</strong><small>{evidence.type} · {evidence.reference}</small></div>
                  <button onClick={() => state.toast("Evidence opened", `${evidence.reference} is available in demonstration mode.`)}>View</button>
                </article>
              ))}
            </div>
          </section>

          <section className="gov-detail-section">
            <div className="gov-section-heading">
              <div><p>Academic consequence</p><h2>Downstream impact</h2></div>
              <span><Scale size={15} /> Institution-specific controls</span>
            </div>
            <div className="gov-impact-chain">
              <article>
                <span>01</span>
                <div><small>Practical examinations</small><strong>28 Nov 2026</strong><p>Centre readiness continues; no further change requested.</p></div>
                <CheckCircle2 size={17} />
              </article>
              <ArrowRight size={18} />
              <article className="attention">
                <span>02</span>
                <div><small>Valuation commencement</small><strong>26 Dec 2026</strong><p>Seven-day local shift requires accelerated valuation.</p></div>
                <Clock3 size={17} />
              </article>
              <ArrowRight size={18} />
              <article>
                <span>03</span>
                <div><small>Result publication</small><strong>20 Jan 2027</strong><p>Statewide result publication window must remain unchanged.</p></div>
                <ShieldCheck size={17} />
              </article>
            </div>
          </section>

          <section className="gov-detail-section">
            <div className="gov-section-heading">
              <div><p>Accountability context</p><h2>Previous compliance history</h2></div>
              <span><History size={15} /> Last 12 governed milestones</span>
            </div>
            <div className="gov-history-summary">
              <div><strong>10</strong><span><CheckCircle2 size={13} /> Aligned milestones</span></div>
              <div><strong>1</strong><span><Clock3 size={13} /> Evidence follow-up</span></div>
              <div><strong>1</strong><span><AlertTriangle size={13} /> Current critical deviation</span></div>
            </div>
            <p className="gov-history-note">
              The single critical examination deviation remains prominent; it is
              not averaged away by the university’s otherwise aligned history.
            </p>
          </section>

          <section className="gov-detail-section">
            <div className="gov-section-heading">
              <div><p>Comparable demand</p><h2>Similar pending requests</h2></div>
              <span>{relatedWorkflowRequests.length} related records</span>
            </div>
            <div className="gov-similar-list">
              {relatedWorkflowRequests.slice(0, 3).map((request) => (
                <button
                  key={request.id}
                  onClick={() =>
                    state.toast(
                      `${request.id} compared`,
                      "The related request does not change the decision authority for CR-2026-014.",
                    )
                  }
                >
                  <span>{request.id}</span>
                  <div><strong>{request.event}</strong><small>{request.university}</small></div>
                  <b>{request.variance}</b>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside className="gov-decision-column">
          <section className="gov-permission-card">
            <header>
              <span><Landmark size={19} /></span>
              <div><p>Role permission</p><h2>HEC Academic Officer</h2></div>
              {hecCanAct ? <b>Action available</b> : <b className="muted">Read only</b>}
            </header>
            {hecCanAct ? (
              <>
                <label>
                  <span>Officer scrutiny note</span>
                  <textarea rows={5} value={officerNote} onChange={(event) => setOfficerNote(event.target.value)} />
                </label>
                <button className="button button-secondary gov-full-button" onClick={() => state.saveOfficerNote(officerNote)}>
                  <MessageSquareText size={15} /> Add Officer Note
                </button>
                <div className="gov-action-stack">
                  <button className="approve" onClick={() => state.recordHecRecommendation("approval", officerNote)}><CheckCircle2 size={16} /> Recommend Approval</button>
                  <button className="reject" onClick={() => state.recordHecRecommendation("rejection", officerNote)}><XCircle size={16} /> Recommend Rejection</button>
                  <button className="return" onClick={() => state.recordHecRecommendation("clarification", officerNote)}><RotateCcw size={16} /> Return for Clarification</button>
                </div>
              </>
            ) : (
              <div className="gov-permission-message">
                <LockKeyhole size={19} />
                <p>
                  {state.requestStatus === "draft"
                    ? "The HEC officer cannot act until Sahya University formally submits the request."
                    : state.hecRecommendation !== "pending"
                      ? `Recommendation recorded: ${state.hecRecommendation.replace("-", " ")}.`
                      : "HEC scrutiny actions are unavailable at the current workflow stage."}
                </p>
                {state.requestStatus === "draft" || state.requestStatus === "returned" ? (
                  <Link href="/university/change-requests/new">Open university submission <ArrowRight size={14} /></Link>
                ) : null}
              </div>
            )}
          </section>

          <section className="gov-permission-card committee">
            <header>
              <span><Gavel size={19} /></span>
              <div><p>Role permission</p><h2>Empowered Committee</h2></div>
              {committeeCanAct ? <b>Action available</b> : <b className="muted">Read only</b>}
            </header>
            {committeeCanAct ? (
              <>
                <label>
                  <span>Approval condition</span>
                  <textarea rows={4} value={committeeCondition} onChange={(event) => setCommitteeCondition(event.target.value)} />
                </label>
                <label>
                  <span>Meeting note</span>
                  <textarea rows={3} value={meetingNote} onChange={(event) => setMeetingNote(event.target.value)} />
                </label>
                <button className="button button-secondary gov-full-button" onClick={() => state.saveCommitteeMeetingNote(meetingNote)}>
                  <MessageSquareText size={15} /> Record Meeting Note
                </button>
                <div className="gov-action-stack">
                  <button className="approve" onClick={() => state.recordCommitteeOutcome("approved", "", meetingNote)}><CheckCircle2 size={16} /> Approve</button>
                  <button className="approve-conditions" onClick={() => state.recordCommitteeOutcome("approved-with-conditions", committeeCondition, meetingNote)}><ClipboardCheck size={16} /> Approve with Conditions</button>
                  <button className="reject" onClick={() => state.recordCommitteeOutcome("rejected", "", meetingNote)}><XCircle size={16} /> Reject</button>
                  <button className="return" onClick={() => state.recordCommitteeOutcome("returned", "", meetingNote)}><RotateCcw size={16} /> Return for Clarification</button>
                </div>
              </>
            ) : (
              <div className="gov-permission-message">
                <LockKeyhole size={19} />
                <p>
                  {approved || published
                    ? `Decision recorded: ${state.committeeDecision.replaceAll("-", " ")}.`
                    : "Committee actions unlock only after the HEC officer records a recommendation."}
                </p>
                {approved ? <Link href="/hec/publication">Open publication task <ArrowRight size={14} /></Link> : null}
              </div>
            )}
          </section>
        </aside>
      </div>

      <section className="gov-lifecycle-panel detailed">
        <div className="gov-section-heading">
          <div><p>Authoritative progression</p><h2>Workflow and audit stages</h2></div>
          <span><LockKeyhole size={15} /> Previous values retained</span>
        </div>
        <WorkflowStepTracker stages={stages} />
      </section>

      <section className="gov-detail-section gov-audit-preview">
        <div className="gov-section-heading">
          <div><p>Immutable history</p><h2>Request audit timeline</h2></div>
          <Link href="/audit">Open full audit trail <ArrowRight size={14} /></Link>
        </div>
        <div className="gov-audit-preview-list">
          {auditEntries.map((entry) => (
            <article key={entry.id}>
              <span><FileText size={15} /></span>
              <time>{entry.timestamp}</time>
              <div><strong>{entry.action}</strong><p>{entry.detail}</p><small>{entry.actorRole ?? entry.actor} · {entry.reference ?? entry.scope}</small></div>
              <LockKeyhole size={14} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
