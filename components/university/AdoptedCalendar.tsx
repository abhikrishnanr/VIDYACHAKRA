"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileUp,
  Info,
  LockKeyhole,
  MessageSquareWarning,
  Paperclip,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { buildMatrixCells } from "@/lib/compliance-matrix-data";
import { useDemoState } from "@/lib/demo-state";
import { universityCalendarSections } from "@/lib/university-data";
import type { AcademicMilestone, RagStatus } from "@/lib/types";

const lockedMessage =
  "This event belongs to a published calendar and cannot be edited directly. Submit a formal change request for consideration through the approved workflow.";

const statusMeta: Record<
  RagStatus,
  { label: string; Icon: typeof CheckCircle2 }
> = {
  green: { label: "Aligned", Icon: CheckCircle2 },
  amber: { label: "Needs attention", Icon: Clock3 },
  red: { label: "Unauthorised deviation", Icon: XCircle },
  grey: { label: "Not yet due", Icon: CircleHelp },
};

const eventTypeLabels: Record<AcademicMilestone["eventType"], string> = {
  publication: "Official publication",
  admission: "Admission",
  instruction: "Academic activity",
  registration: "Registration",
  assessment: "Assessment",
  feedback: "Academic activity",
  examination: "Examination",
  valuation: "Valuation",
  result: "Result",
};

function formatDate(value: string | null) {
  if (!value) return "Not reported";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function dateVariance(baseline: string, scheduled: string) {
  const difference =
    (new Date(`${scheduled}T12:00:00`).getTime() -
      new Date(`${baseline}T12:00:00`).getTime()) /
    86_400_000;
  if (difference === 0) return "No variance";
  return `${difference > 0 ? "+" : ""}${difference} days`;
}

export function AdoptedCalendar() {
  const {
    requestStatus,
    committeeDecision,
    revisionPublicationState,
    completionReports,
    submitCompletionReport,
    toast,
  } = useDemoState();
  const [detailEvent, setDetailEvent] = useState<AcademicMilestone | null>(null);
  const [completionEvent, setCompletionEvent] =
    useState<AcademicMilestone | null>(null);
  const [lockedEvent, setLockedEvent] = useState<AcademicMilestone | null>(null);
  const [actualDate, setActualDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [evidenceType, setEvidenceType] = useState("College consolidated report");
  const [attachmentName, setAttachmentName] = useState("");

  const theoryCell = useMemo(
    () =>
      buildMatrixCells({
        requestStatus,
        committeeDecision,
        revisionPublicationState,
      }).find(
        (cell) =>
          cell.universityId === "sahya" && cell.milestoneId === "theory",
      )!,
    [committeeDecision, requestStatus, revisionPublicationState],
  );

  function effectiveStatus(event: AcademicMilestone): {
    status: RagStatus;
    label: string;
    reason: string;
  } {
    if (completionReports[event.id]) {
      return {
        status: "green",
        label: "Completion confirmed",
        reason: "An actual completion date and evidence reference have been recorded.",
      };
    }
    if (event.id === "semester-1-theory-examination") {
      return {
        status: theoryCell.status,
        label: theoryCell.statusLabel,
        reason: theoryCell.reason,
      };
    }
    const meta = statusMeta[event.ragStatus];
    return { status: event.ragStatus, label: meta.label, reason: event.ragReason };
  }

  function beginCompletion(event: AcademicMilestone) {
    setCompletionEvent(event);
    setActualDate(event.actualCompletionDate ?? event.councilBaselineDate);
    setRemarks("");
    setEvidenceType("College consolidated report");
    setAttachmentName("");
  }

  function saveCompletion() {
    if (!completionEvent || !actualDate || !remarks.trim() || !attachmentName) {
      toast(
        "Complete the report",
        "Add the actual date, remarks and a simulated evidence attachment.",
      );
      return;
    }
    submitCompletionReport(completionEvent.id, {
      actualDate,
      remarks: remarks.trim(),
      evidenceType,
      attachmentName,
    });
    setCompletionEvent(null);
  }

  return (
    <div className="uni-page uni-calendar-page">
      <header className="uni-page-header">
        <div>
          <p className="uni-kicker">FYUGP 2026–27 · Adopted institutional calendar</p>
          <h1>Calendar implementation register</h1>
          <p>
            Compare every Council baseline with Sahya’s schedule and report actual
            completion against the locked official version.
          </p>
        </div>
        <div className="uni-header-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "Calendar register prepared",
                "A demonstration PDF of the adopted calendar is ready.",
              )
            }
          >
            <FileCheck2 size={16} /> Export register
          </button>
          <Link className="button button-primary" href="/university/change-requests/new">
            Request date change <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="uni-calendar-lock">
        <span className="uni-lock-seal"><ShieldCheck size={22} /></span>
        <div>
          <p>Official control baseline</p>
          <strong>FYUGP Academic Calendar 2026–27 · Version 1.0</strong>
          <small>Published and locked · 15 June 2026 · KSHEC/ACAD/CAL/2026/01</small>
        </div>
        <span className="uni-locked-label"><LockKeyhole size={15} /> Direct editing disabled</span>
      </section>

      <section className="uni-calendar-help">
        <Info size={17} />
        <p>
          The Council baseline is authoritative. University and actual dates remain
          visible beside it for a clear implementation record.
        </p>
        <button onClick={() => toast("Status guide", "Green is aligned, amber requires attention, red is an unauthorised deviation and grey is not yet due.")}>
          View status guide
        </button>
      </section>

      <section className="uni-table-panel">
        <div className="uni-table-scroll">
          <table className="uni-calendar-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Event category</th>
                <th className="council-column">Council baseline</th>
                <th>University schedule</th>
                <th>Actual completion</th>
                <th>Variance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            {universityCalendarSections.map((section) => (
              <tbody key={section.title}>
                <tr className="uni-table-group">
                  <th colSpan={8}>
                    <strong>{section.title}</strong>
                    <span>{section.description}</span>
                  </th>
                </tr>
                {section.events.map((event) => {
                  const currentStatus = effectiveStatus(event);
                  const StatusIcon = statusMeta[currentStatus.status].Icon;
                  const report = completionReports[event.id];
                  return (
                    <tr key={event.id} className={event.id === "semester-1-theory-examination" ? "priority-row" : ""}>
                      <td>
                        <strong>{event.title}</strong>
                        <span>{event.semester}</span>
                      </td>
                      <td><span className={`uni-event-type ${event.eventType}`}>{eventTypeLabels[event.eventType]}</span></td>
                      <td className="council-column">
                        <span className="uni-baseline-date">
                          <LockKeyhole size={14} />
                          <strong>{formatDate(event.councilBaselineDate)}</strong>
                        </span>
                        <small>Version {event.version}</small>
                      </td>
                      <td>
                        <strong>{formatDate(event.institutionScheduledDate)}</strong>
                        {event.institutionScheduledDate !== event.councilBaselineDate ? <small>Local schedule</small> : <small>Matches baseline</small>}
                      </td>
                      <td>
                        <strong className={report || event.actualCompletionDate ? "" : "muted-value"}>
                          {formatDate(report?.actualDate ?? event.actualCompletionDate)}
                        </strong>
                        {report ? <small><FileCheck2 size={12} /> Evidence recorded</small> : <small>Awaiting report</small>}
                      </td>
                      <td>
                        <span className={`uni-variance-text ${currentStatus.status}`}>
                          {dateVariance(event.councilBaselineDate, event.institutionScheduledDate)}
                        </span>
                      </td>
                      <td>
                        <span className={`uni-state-chip ${currentStatus.status}`}>
                          <StatusIcon size={14} />
                          {currentStatus.label}
                        </span>
                      </td>
                      <td>
                        <div className="uni-row-actions">
                          <button onClick={() => setDetailEvent(event)}>View details</button>
                          <details>
                            <summary aria-label={`More actions for ${event.title}`}>
                              Actions <ChevronDown size={14} />
                            </summary>
                            <div>
                              <button onClick={() => beginCompletion(event)}>
                                <CalendarCheck2 size={15} /> Confirm completion
                              </button>
                              <button
                                onClick={() =>
                                  toast(
                                    "Evidence upload simulated",
                                    `A file placeholder was attached to ${event.title}.`,
                                  )
                                }
                              >
                                <FileUp size={15} /> Upload evidence
                              </button>
                              <button
                                onClick={() =>
                                  toast(
                                    "Implementation issue recorded",
                                    `The nodal office can now follow up on ${event.title}.`,
                                  )
                                }
                              >
                                <MessageSquareWarning size={15} /> Report implementation issue
                              </button>
                              <button onClick={() => setLockedEvent(event)}>
                                <LockKeyhole size={15} /> Request date change
                              </button>
                            </div>
                          </details>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ))}
          </table>
        </div>
      </section>

      <Modal
        open={Boolean(detailEvent)}
        title={detailEvent?.title ?? "Event details"}
        onClose={() => setDetailEvent(null)}
      >
        {detailEvent ? (() => {
          const currentStatus = effectiveStatus(detailEvent);
          const StatusIcon = statusMeta[currentStatus.status].Icon;
          return (
            <div className="uni-modal-content">
              <div className="uni-detail-status">
                <span className={`uni-state-chip ${currentStatus.status}`}>
                  <StatusIcon size={15} /> {currentStatus.label}
                </span>
                <span><LockKeyhole size={14} /> Official baseline locked</span>
              </div>
              <dl className="uni-detail-grid">
                <div><dt>Event category</dt><dd>{eventTypeLabels[detailEvent.eventType]}</dd></div>
                <div><dt>Applicable semester</dt><dd>{detailEvent.semester}</dd></div>
                <div><dt>Council baseline</dt><dd>{formatDate(detailEvent.councilBaselineDate)}</dd></div>
                <div><dt>University schedule</dt><dd>{formatDate(detailEvent.institutionScheduledDate)}</dd></div>
                <div><dt>Variance</dt><dd>{dateVariance(detailEvent.councilBaselineDate, detailEvent.institutionScheduledDate)}</dd></div>
                <div><dt>Authority reference</dt><dd>{detailEvent.authorityReference}</dd></div>
              </dl>
              <div className="uni-detail-reason">
                <strong>Implementation position</strong>
                <p>{currentStatus.reason}</p>
              </div>
              <div className="uni-modal-actions">
                <button className="button button-secondary" onClick={() => setDetailEvent(null)}>Close</button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setDetailEvent(null);
                    beginCompletion(detailEvent);
                  }}
                >
                  Confirm completion
                </button>
              </div>
            </div>
          );
        })() : null}
      </Modal>

      <Modal
        open={Boolean(completionEvent)}
        title={`Confirm completion · ${completionEvent?.title ?? ""}`}
        onClose={() => setCompletionEvent(null)}
      >
        <div className="uni-modal-content">
          <div className="uni-form-note">
            <ShieldCheck size={17} />
            <p>The official date remains locked. This report records when Sahya completed the milestone.</p>
          </div>
          <label className="uni-field">
            <span>Actual completion date</span>
            <input type="date" value={actualDate} onChange={(event) => setActualDate(event.target.value)} />
          </label>
          <label className="uni-field">
            <span>Short remarks</span>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Describe the completion position and any relevant context"
              rows={3}
            />
          </label>
          <label className="uni-field">
            <span>Evidence type</span>
            <select value={evidenceType} onChange={(event) => setEvidenceType(event.target.value)}>
              <option>College consolidated report</option>
              <option>University proceedings</option>
              <option>Examination branch certification</option>
              <option>Academic monitoring note</option>
            </select>
          </label>
          <button
            className={`uni-attachment-control ${attachmentName ? "attached" : ""}`}
            onClick={() => setAttachmentName("SHSU-completion-evidence.pdf")}
          >
            {attachmentName ? <FileCheck2 size={19} /> : <Paperclip size={19} />}
            <span>
              <strong>{attachmentName || "Attach supporting evidence"}</strong>
              <small>{attachmentName ? "1.8 MB · Simulated attachment" : "PDF, image or office document · Demonstration"}</small>
            </span>
          </button>
          <div className="uni-modal-actions">
            <button className="button button-secondary" onClick={() => setCompletionEvent(null)}>Cancel</button>
            <button className="button button-primary" onClick={saveCompletion}>Confirm submission</button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(lockedEvent)}
        title="Published calendar control"
        onClose={() => setLockedEvent(null)}
      >
        <div className="uni-modal-content">
          <div className="uni-locked-warning">
            <AlertTriangle size={22} />
            <div>
              <strong>Direct date changes are disabled</strong>
              <p>{lockedMessage}</p>
            </div>
          </div>
          <div className="uni-detail-reason">
            <strong>{lockedEvent?.title}</strong>
            <p>Council baseline: {formatDate(lockedEvent?.councilBaselineDate ?? null)}</p>
          </div>
          <div className="uni-modal-actions">
            <button className="button button-secondary" onClick={() => setLockedEvent(null)}>Keep official date</button>
            <Link className="button button-primary" href="/university/change-requests/new">
              Start formal request <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

