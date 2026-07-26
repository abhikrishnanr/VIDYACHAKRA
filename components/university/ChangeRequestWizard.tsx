"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  FileText,
  FileUp,
  Landmark,
  LockKeyhole,
  Paperclip,
  Send,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";

const steps = [
  "Select Event",
  "Proposed Revision",
  "Reason and Impact",
  "Supporting Evidence",
  "Review and Submit",
];

const defaultReason =
  "Severe monsoon disruption affected scheduled academic activities across 18 affiliated colleges.";

const downstreamOptions = [
  "Practical examinations",
  "Valuation commencement",
  "Expected result date",
];

export function ChangeRequestWizard() {
  const {
    requestStatus,
    submitChangeRequest,
    toast,
    universityCalendarEntries,
    universityCalendarSubmissions,
  } = useDemoState();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [eventId, setEventId] = useState("semester-1-theory-examination");
  const [proposedDate, setProposedDate] = useState("2026-12-12");
  const [reason, setReason] = useState(defaultReason);
  const [affectedColleges, setAffectedColleges] = useState("18");
  const [studentsAffected, setStudentsAffected] = useState("11460");
  const [downstream, setDownstream] = useState(downstreamOptions);
  const [attachments, setAttachments] = useState([
    "District disruption assessment.pdf",
    "Consolidated college impact note.pdf",
  ]);
  const [declaration, setDeclaration] = useState(false);
  const theoryEntry = universityCalendarEntries.find(
    (entry) =>
      entry.changeRequestId === "CR-2026-014" &&
      entry.milestoneDefinitionId === "cmd-theory",
  );
  const lockedSubmission = universityCalendarSubmissions.find(
    (submission) =>
      submission.id === theoryEntry?.submissionId &&
      submission.status === "locked",
  );

  function toggleDownstream(item: string) {
    setDownstream((current) =>
      current.includes(item)
        ? current.filter((value) => value !== item)
        : [...current, item],
    );
  }

  function next() {
    if (step === 2 && !proposedDate) {
      toast("Proposed date required", "Select a proposed revision before continuing.");
      return;
    }
    if (step === 3 && (!reason.trim() || !affectedColleges || !studentsAffected)) {
      toast("Impact details required", "Complete the reason and impact fields before continuing.");
      return;
    }
    setStep((current) => Math.min(5, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    if (!declaration) {
      toast(
        "Confirm the declaration",
        "The authorised officer must confirm the request record before submission.",
      );
      return;
    }
    submitChangeRequest();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="uni-page">
        <section className="uni-request-success">
          <span className="uni-success-mark"><CheckCircle2 size={34} /></span>
          <p className="uni-kicker">Submission complete</p>
          <h1>CR-2026-014 is now with the HEC Monitoring Cell</h1>
          <p className="uni-success-lead">
            The request is recorded as Submitted. Until an approved revision is
            published, 5 December 2026 remains the official Council date.
          </p>
          <div className="uni-success-reference">
            <div><span>Request number</span><strong>CR-2026-014</strong></div>
            <div><span>Submitted by</span><strong>Prof. Anjali Menon</strong></div>
            <div><span>Submitted at</span><strong>26 Jul 2026 · 15:08</strong></div>
            <div><span>Current stage</span><strong>HEC screening queue</strong></div>
          </div>
          <div className="uni-success-effects">
            <span><Check size={15} /> Compliance status is now amber · Under review</span>
            <span><Check size={15} /> Monitoring queue and notification counts updated</span>
            <span><Check size={15} /> Submission added to the audit trail</span>
          </div>
          <div className="uni-success-actions">
            <Link className="button button-primary" href="/university/change-requests">
              Track request <ArrowRight size={16} />
            </Link>
            <Link className="button button-secondary" href="/university/dashboard">
              Return to dashboard
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="uni-page uni-wizard-page">
      <Link className="uni-back-link" href="/university/change-requests">
        <ArrowLeft size={15} /> Back to change requests
      </Link>
      <header className="uni-page-header">
        <div>
          <p className="uni-kicker">Formal change control · CR-2026-014</p>
          <h1>Request an approved date revision</h1>
          <p>
            Explain the institutional need, record downstream impact and submit
            supporting evidence for Council consideration.
          </p>
        </div>
        <span className="uni-draft-state">
          <FileText size={16} /> {requestStatus === "draft" ? "Draft saved locally" : "Existing request · View and resubmit demo"}
        </span>
      </header>

      <nav className="uni-wizard-steps" aria-label="Change request steps">
        {steps.map((label, index) => {
          const number = index + 1;
          return (
            <button
              key={label}
              className={number === step ? "active" : number < step ? "complete" : ""}
              onClick={() => number <= step && setStep(number)}
              aria-current={number === step ? "step" : undefined}
            >
              <span>{number < step ? <Check size={15} /> : number}</span>
              <small>Step {number}</small>
              <strong>{label}</strong>
            </button>
          );
        })}
      </nav>

      <div className="uni-wizard-layout">
        <section className="uni-wizard-panel">
          {step === 1 ? (
            <>
              <div className="uni-step-heading">
                <span><CalendarDays size={20} /></span>
                <div><p>Step 1 of 5</p><h2>Select the published event</h2><small>Only events from the adopted FYUGP calendar can be selected.</small></div>
              </div>
              <label className="uni-field">
                <span>Calendar event</span>
                <select value={eventId} onChange={(event) => setEventId(event.target.value)}>
                  <option value="semester-1-theory-examination">Semester 1 Theory Examination</option>
                  <option value="practical-examination">Practical examination</option>
                  <option value="centralised-valuation">Centralised valuation</option>
                  <option value="result-publication">Result publication</option>
                </select>
              </label>
              <div className="uni-selected-event">
                <div><span className="uni-event-type examination">Examination</span><h3>Semester 1 Theory Examination</h3><p>Four Year Undergraduate Programme (FYUGP) · Semester 1</p></div>
                <div>
                  <small>Official Council date</small>
                  <strong><LockKeyhole size={15} /> 05 Dec 2026</strong>
                  <span>Version 1.0 · Locked UniversityCalendarEntry</span>
                  {lockedSubmission ? (
                    <Link href={`/university/calendar-submissions/${lockedSubmission.id}`}>
                      Open locked calendar record
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="uni-step-heading">
                <span><CalendarDays size={20} /></span>
                <div><p>Step 2 of 5</p><h2>Record the proposed revision</h2><small>The published baseline is shown for comparison and cannot be edited.</small></div>
              </div>
              <div className="uni-date-revision">
                <div className="locked"><small>Council baseline</small><strong><LockKeyhole size={16} /> 05 December 2026</strong><span>Version 1.0 · Published and locked</span></div>
                <ChevronRight size={22} />
                <label><span>Proposed university date</span><input type="date" value={proposedDate} onChange={(event) => setProposedDate(event.target.value)} /><small>Requested variance: +7 days</small></label>
              </div>
              <div className="uni-locked-warning compact">
                <AlertTriangle size={19} />
                <div><strong>The baseline remains in force</strong><p>This request does not alter the approved date until a new version is officially published.</p></div>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div className="uni-step-heading">
                <span><UsersRound size={20} /></span>
                <div><p>Step 3 of 5</p><h2>Explain the reason and institutional impact</h2><small>Give reviewers enough evidence to assess urgency and proportionality.</small></div>
              </div>
              <label className="uni-field">
                <span>Reason for proposed revision</span>
                <textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} />
                <small>{reason.length} characters · Be specific about the disruption and affected scope.</small>
              </label>
              <div className="uni-form-grid">
                <label className="uni-field"><span>Affected colleges</span><input type="number" min="1" max="18" value={affectedColleges} onChange={(event) => setAffectedColleges(event.target.value)} /></label>
                <label className="uni-field"><span>Estimated students affected</span><input type="number" min="1" value={studentsAffected} onChange={(event) => setStudentsAffected(event.target.value)} /></label>
              </div>
              <fieldset className="uni-checkbox-group">
                <legend>Downstream impact</legend>
                <p>Select the milestones that may shift if this request is approved.</p>
                {downstreamOptions.map((item) => (
                  <label key={item}><input type="checkbox" checked={downstream.includes(item)} onChange={() => toggleDownstream(item)} /><span><Check size={14} /></span>{item}</label>
                ))}
              </fieldset>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div className="uni-step-heading">
                <span><FileUp size={20} /></span>
                <div><p>Step 4 of 5</p><h2>Add supporting evidence</h2><small>Attachments are simulated in this frontend demonstration.</small></div>
              </div>
              <div className="uni-upload-area">
                <FileUp size={27} />
                <strong>Attach disruption and impact evidence</strong>
                <p>PDF, JPG, PNG or office documents · Up to 10 MB each</p>
                <button
                  className="button button-secondary"
                  onClick={() =>
                    setAttachments((current) =>
                      current.includes("Academic Council proceedings.pdf")
                        ? current
                        : [...current, "Academic Council proceedings.pdf"],
                    )
                  }
                >
                  Choose simulated file
                </button>
              </div>
              <div className="uni-file-list">
                {attachments.map((attachment) => (
                  <div key={attachment}>
                    <span><FileCheck2 size={18} /></span>
                    <div><strong>{attachment}</strong><small>PDF · Evidence record ready</small></div>
                    <button onClick={() => setAttachments((current) => current.filter((item) => item !== attachment))}>Remove</button>
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <div className="uni-step-heading">
                <span><ShieldCheck size={20} /></span>
                <div><p>Step 5 of 5</p><h2>Review and submit</h2><small>Confirm the record before it enters the HEC screening queue.</small></div>
              </div>
              <div className="uni-review-block">
                <header><span>Event and revision</span><button onClick={() => setStep(1)}>Edit</button></header>
                <dl>
                  <div><dt>Event</dt><dd>Semester 1 Theory Examination</dd></div>
                  <div><dt>Council baseline</dt><dd><LockKeyhole size={13} /> 05 Dec 2026</dd></div>
                  <div><dt>Proposed date</dt><dd>12 Dec 2026 · +7 days</dd></div>
                </dl>
              </div>
              <div className="uni-review-block">
                <header><span>Reason and impact</span><button onClick={() => setStep(3)}>Edit</button></header>
                <p>{reason}</p>
                <div className="uni-review-stats"><span><strong>{affectedColleges}</strong> colleges</span><span><strong>{Number(studentsAffected).toLocaleString("en-IN")}</strong> students</span><span><strong>{downstream.length}</strong> downstream milestones</span></div>
                <ul>{downstream.map((item) => <li key={item}><Check size={13} /> {item}</li>)}</ul>
              </div>
              <div className="uni-review-block">
                <header><span>Supporting evidence</span><button onClick={() => setStep(4)}>Edit</button></header>
                <div className="uni-review-files">{attachments.map((item) => <span key={item}><Paperclip size={13} /> {item}</span>)}</div>
              </div>
              <label className="uni-declaration">
                <input type="checkbox" checked={declaration} onChange={(event) => setDeclaration(event.target.checked)} />
                <span><Check size={14} /></span>
                <p>I confirm that this request is authorised by Sahya Higher Studies University and that the impact information provided is accurate for this demonstration record.</p>
              </label>
            </>
          ) : null}

          <footer className="uni-wizard-actions">
            <button
              className="button button-secondary"
              onClick={() => (step === 1 ? null : setStep((current) => current - 1))}
              disabled={step === 1}
            >
              <ArrowLeft size={15} /> Previous
            </button>
            {step < 5 ? (
              <button className="button button-primary" onClick={next}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button className="button button-primary" onClick={submit}>
                <Send size={15} /> Submit CR-2026-014
              </button>
            )}
          </footer>
        </section>

        <aside className="uni-wizard-aside">
          <div className="uni-aside-card authoritative">
            <span><Landmark size={18} /></span>
            <p>Governing authority</p>
            <strong>Kerala Higher Education Council</strong>
            <small>KSHEC/ACAD/CAL/2026/01</small>
          </div>
          <div className="uni-aside-card">
            <p>Request summary</p>
            <dl>
              <div><dt>Reference</dt><dd>CR-2026-014</dd></div>
              <div><dt>Institution</dt><dd>Sahya H.S. University</dd></div>
              <div><dt>Variance</dt><dd>+7 days</dd></div>
              <div><dt>Colleges</dt><dd>18</dd></div>
              <div><dt>Students</dt><dd>11,460</dd></div>
            </dl>
          </div>
          <div className="uni-aside-help">
            <ShieldCheck size={18} />
            <div><strong>What happens after submission?</strong><p>HEC screens the request, records impact, and routes eligible requests to the Empowered Committee.</p></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

