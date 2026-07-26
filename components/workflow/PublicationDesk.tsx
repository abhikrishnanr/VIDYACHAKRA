"use client";

import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  History,
  LockKeyhole,
  RotateCcw,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";

const conditionText =
  "University must complete centralised valuation without altering the statewide result publication window.";

export function PublicationDesk() {
  const state = useDemoState();
  const [schedule, setSchedule] = useState("2026-08-02T10:00");
  const [returnNote, setReturnNote] = useState(
    "Please clarify the authority reference before publication.",
  );
  const approved =
    state.committeeDecision === "approved" ||
    state.committeeDecision === "approved-with-conditions";
  const ready = approved && state.revisionPublicationState === "ready";
  const published = state.revisionPublicationState === "published";

  function schedulePublication() {
    const date = new Date(schedule);
    const formatted = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
    state.scheduleRevisionPublication(formatted);
  }

  if (published) {
    return (
      <div className="gov-page">
        <section className="gov-publication-success">
          <span className="gov-success-seal"><CheckCircle2 size={34} /></span>
          <p className="gov-kicker">Controlled publication complete</p>
          <h1>Calendar Version 1.1 is now official</h1>
          <p>
            The approved Sahya institution-specific exception has been published
            without removing or overwriting the Version 1.0 record.
          </p>
          <div className="gov-success-release">
            <div><small>Published version</small><strong>1.1 · Locked</strong></div>
            <div><small>Authority reference</small><strong>KSHEC/ACAD/CAL/2026/01-R1</strong></div>
            <div><small>Published by</small><strong>Leela Krishnan · HEC Calendar Administrator</strong></div>
            <div><small>Publication time</small><strong>02 Aug 2026 · 10:00</strong></div>
          </div>
          <div className="gov-release-effects">
            <span><Check size={14} /> Compliance matrix is green · Approved Exception</span>
            <span><Check size={14} /> 18 affected colleges and all institutions notified</span>
            <span><Check size={14} /> Public calendar and approved revisions updated</span>
            <span><Check size={14} /> Version 1.0 remains visible in audit history</span>
          </div>
          <div className="gov-success-actions">
            <Link className="button button-primary" href="/calendar?view=agenda&event=semester-1-theory-examination">View public calendar <ArrowRight size={15} /></Link>
            <Link className="button button-secondary" href="/hec/compliance">Verify compliance matrix</Link>
            <Link className="button button-secondary" href="/audit">Open audit trail</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="gov-page">
      <header className="gov-page-header">
        <div>
          <p className="gov-kicker">HEC Calendar Administration · Permissioned publication</p>
          <h1>Calendar publication desk</h1>
          <p>
            Convert an approved committee decision into a new locked version,
            notify institutions and update the public record in one controlled action.
          </p>
        </div>
        <div className={`gov-publication-readiness ${ready ? "ready" : ""}`}>
          {ready ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
          <span><small>Publication authority</small><strong>{ready ? "Approved revision ready" : "Awaiting committee approval"}</strong></span>
        </div>
      </header>

      <section className="gov-publication-control">
        <span><LockKeyhole size={21} /></span>
        <div>
          <strong>Only approved decisions can create an official calendar version</strong>
          <p>Scheduling and preview actions do not alter the public calendar.</p>
        </div>
        <b>Administrator: Leela Krishnan</b>
      </section>

      <div className="gov-publication-layout">
        <main>
          <section className="gov-publication-card approved-revision">
            <div className="gov-section-heading">
              <div><p>Publication task · CR-2026-014</p><h2>Approved revision</h2></div>
              <span className={`gov-stage-chip ${ready ? "ready" : ""}`}><ShieldCheck size={13} /> {ready ? "Approved · Publishable" : "Decision required"}</span>
            </div>
            <div className="gov-approved-change">
              <div>
                <small>Event</small>
                <strong>Semester 1 Theory Examination</strong>
                <span>Sahya Higher Studies University · 18 affiliated colleges</span>
              </div>
              <div className="gov-date-delta">
                <span><small>Version 1.0</small><strong>05 Dec 2026</strong></span>
                <ArrowRight size={18} />
                <span><small>Version 1.1</small><strong>12 Dec 2026</strong></span>
                <b>+7 days</b>
              </div>
            </div>
            <dl className="gov-publication-meta">
              <div><dt>Committee reference</dt><dd>EC/FYUGP/2026/08</dd></div>
              <div><dt>Decision</dt><dd>{state.committeeDecision === "approved-with-conditions" ? "Approved with conditions" : approved ? "Approved" : "Pending"}</dd></div>
              <div><dt>Affected institutions</dt><dd>Sahya Higher Studies University</dd></div>
              <div><dt>Existing version</dt><dd>1.0 · Published and locked</dd></div>
            </dl>
            {state.committeeDecision === "approved-with-conditions" ? (
              <div className="gov-publication-condition">
                <FileCheck2 size={17} />
                <div><strong>Committee condition</strong><p>{state.committeeCondition || conditionText}</p></div>
              </div>
            ) : null}
          </section>

          <section className="gov-publication-card">
            <div className="gov-section-heading">
              <div><p>Before and after</p><h2>Version comparison</h2></div>
              <span><History size={14} /> Old value retained</span>
            </div>
            <div className="gov-version-comparison">
              <header><span>Field</span><strong>Version 1.0 · Current</strong><strong>Version 1.1 · Proposed</strong></header>
              <div><span>Theory examination date</span><strong>05 Dec 2026</strong><strong className="changed">12 Dec 2026</strong></div>
              <div><span>Applicable institutions</span><strong>Statewide baseline</strong><strong>Sahya only · 18 colleges</strong></div>
              <div><span>Authority reference</span><strong>KSHEC/ACAD/CAL/2026/01</strong><strong>KSHEC/ACAD/CAL/2026/01-R1</strong></div>
              <div><span>Statewide result window</span><strong>20 Jan 2027</strong><strong className="unchanged">20 Jan 2027 · Unchanged</strong></div>
            </div>
          </section>

          <section className="gov-preview-grid">
            <article>
              <header><FileText size={18} /><div><p>Public notice preview</p><h2>Approved calendar revision</h2></div></header>
              <p>
                Calendar Version 1.1 records an approved institution-specific
                exception for Sahya Higher Studies University. The Semester 1 Theory
                Examination will be held on 12 December 2026 for its 18 affiliated colleges.
              </p>
              <footer>Authority: KSHEC/ACAD/CAL/2026/01-R1 · Effective upon publication</footer>
            </article>
            <article>
              <header><BellRing size={18} /><div><p>Notification preview</p><h2>Version 1.1 published</h2></div></header>
              <p>
                A revised FYUGP calendar version is available. Institutions should
                review the Sahya-specific theory examination exception; all other
                governed dates remain unchanged.
              </p>
              <footer><UsersRound size={13} /> Universities · 18 affected colleges · HEC officers</footer>
            </article>
          </section>
        </main>

        <aside className="gov-publication-actions">
          <section>
            <header><BookOpenCheck size={20} /><div><p>Release control</p><h2>Publish Version 1.1</h2></div></header>
            <p>
              This action creates a new locked official version, publishes the
              revision notice and notifies institutions.
            </p>
            <button className="button button-primary gov-full-button" onClick={state.publishRevision}>
              <Send size={16} /> Publish Version 1.1
            </button>
            {!ready ? <small><LockKeyhole size={12} /> Locked until committee approval is recorded.</small> : null}
          </section>

          <section>
            <header><CalendarClock size={19} /><div><p>Controlled release</p><h2>Schedule publication</h2></div></header>
            <label><span>Date and time</span><input type="datetime-local" value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label>
            <button className="button button-secondary gov-full-button" onClick={schedulePublication}>Schedule Publication</button>
            {state.publicationSchedule ? <small><CheckCircle2 size={12} /> Scheduled: {state.publicationSchedule}</small> : null}
          </section>

          <section>
            <header><RotateCcw size={19} /><div><p>Secretariat return</p><h2>Request clarification</h2></div></header>
            <label><span>Return note</span><textarea rows={3} value={returnNote} onChange={(event) => setReturnNote(event.target.value)} /></label>
            <button
              className="button button-secondary gov-full-button"
              onClick={() =>
                ready
                  ? state.returnPublicationToCommittee(returnNote)
                  : state.toast(
                      "No publication task to return",
                      "A committee-approved revision is required before this action becomes available.",
                    )
              }
            >
              Return to Committee Secretariat
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

