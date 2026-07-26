"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  Gavel,
  LockKeyhole,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import { requestStageLabel } from "@/lib/workflow-data";

const defaultCondition =
  "University must complete centralised valuation without altering the statewide result publication window.";

export function CommitteeDecisionWorkspace() {
  const state = useDemoState();
  const [condition, setCondition] = useState(
    state.committeeCondition || defaultCondition,
  );
  const [meetingNote, setMeetingNote] = useState(
    state.committeeMeetingNote ||
      "The committee reviewed the monsoon disruption evidence and safeguards for valuation and results.",
  );
  const canDecide = state.requestStatus === "committee-review";
  const approved = state.requestStatus === "approved";

  return (
    <div className="gov-page">
      <header className="gov-page-header">
        <div>
          <p className="gov-kicker">Empowered Committee · Decision authority</p>
          <h1>Committee decision register</h1>
          <p>
            Record a formal outcome while retaining the original calendar value,
            HEC recommendation and complete meeting context.
          </p>
        </div>
        <span className="gov-role-authority"><Gavel size={18} /> Committee action only</span>
      </header>

      <section className="gov-decision-hero">
        <div className="gov-decision-summary">
          <span className="gov-stage-chip"><Clock3 size={13} /> {requestStageLabel(state)}</span>
          <p>CR-2026-014 · Sahya Higher Studies University</p>
          <h2>Semester 1 Theory Examination</h2>
          <div className="gov-date-delta">
            <span><small>Approved baseline</small><strong>05 Dec 2026</strong></span>
            <ArrowRight size={19} />
            <span><small>Proposed exception</small><strong>12 Dec 2026</strong></span>
            <b>+7 days</b>
          </div>
          <blockquote>
            {state.officerNote ||
              "HEC recommendation has not yet been recorded. Committee decision controls remain locked."}
          </blockquote>
          <Link href="/workflow/requests/CR-2026-014">Review complete request record <ArrowRight size={14} /></Link>
        </div>

        <div className="gov-decision-form">
          <header>
            <span><ShieldCheck size={20} /></span>
            <div><p>Permissioned decision</p><h2>Empowered Committee Member</h2></div>
            <b>{canDecide ? "Available" : "Locked"}</b>
          </header>
          {canDecide ? (
            <>
              <label>
                <span>Approval condition</span>
                <textarea rows={4} value={condition} onChange={(event) => setCondition(event.target.value)} />
              </label>
              <label>
                <span>Meeting note</span>
                <textarea rows={3} value={meetingNote} onChange={(event) => setMeetingNote(event.target.value)} />
              </label>
              <button className="button button-secondary gov-full-button" onClick={() => state.saveCommitteeMeetingNote(meetingNote)}>
                <MessageSquareText size={15} /> Record Meeting Note
              </button>
              <div className="gov-decision-buttons">
                <button className="approve" onClick={() => state.recordCommitteeOutcome("approved", "", meetingNote)}><CheckCircle2 size={16} /> Approve</button>
                <button className="conditions" onClick={() => state.recordCommitteeOutcome("approved-with-conditions", condition, meetingNote)}><ClipboardCheck size={16} /> Approve with Conditions</button>
                <button className="reject" onClick={() => state.recordCommitteeOutcome("rejected", "", meetingNote)}><XCircle size={16} /> Reject</button>
                <button className="return" onClick={() => state.recordCommitteeOutcome("returned", "", meetingNote)}><RotateCcw size={16} /> Return for Clarification</button>
              </div>
            </>
          ) : (
            <div className="gov-decision-locked">
              <LockKeyhole size={24} />
              <strong>
                {approved
                  ? "Committee approval has been recorded"
                  : "Awaiting HEC recommendation"}
              </strong>
              <p>
                {approved
                  ? "The request remains amber until the Calendar Administrator publishes Version 1.1."
                  : "Decision controls become available only after HEC scrutiny and recommendation."}
              </p>
              {approved ? (
                <Link className="button button-primary" href="/hec/publication">Open publication task <ArrowRight size={15} /></Link>
              ) : (
                <Link className="button button-secondary" href="/workflow/requests/CR-2026-014">Open request record</Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="gov-decision-register">
        <div className="gov-section-heading">
          <div><p>Retained outcomes</p><h2>Recent committee decisions</h2></div>
          <button onClick={() => state.toast("Decision register prepared", "A demonstration decision extract is ready.")}>Export register</button>
        </div>
        <div>
          {[
            ["CR-2026-006", "Ananthapuri University of Studies", "Practical Examination", "Approved with conditions", "25 Jul 2026"],
            ["CR-2026-003", "Periyar Valley University", "Classes Commence", "Returned for clarification", "23 Jul 2026"],
            ["CR-2026-002", "Kuttanad Knowledge University", "Result Publication", "Rejected", "21 Jul 2026"],
          ].map(([id, university, event, decision, date]) => (
            <article key={id}>
              <span><FileText size={17} /></span>
              <div><strong>{id} · {event}</strong><small>{university}</small></div>
              <b>{decision}</b>
              <time>{date}</time>
              <button onClick={() => state.toast(`${id} opened`, "The signed decision record is shown in demonstration mode.")}>View</button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

