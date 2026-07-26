"use client";

import {
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  MessageSquareText,
  Plus,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { institutions, statewideEvents } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

export function HECDashboard() {
  const [noteOpen, setNoteOpen] = useState(false);
  const { toast } = useDemoState();
  return (
    <>
      <PageHeader
        eyebrow="HEC Secretariat · Sunday, 26 July 2026"
        title="Good evening, Dr. Nair"
        description="The 2026–27 statewide calendar is published. Five institutional submissions still need coordination before the review window closes."
        actions={
          <button className="button button-primary" onClick={() => setNoteOpen(true)}>
            <Plus size={16} /> Add coordination note
          </button>
        }
      />

      <section className="briefing-panel">
        <div className="briefing-main">
          <div className="briefing-head">
            <span className="section-icon">
              <CalendarCheck2 size={21} />
            </span>
            <div>
              <p className="eyebrow">State calendar readiness</p>
              <h2>The academic baseline is in motion</h2>
            </div>
          </div>
          <div className="progress-track" aria-label="86 percent of universities submitted">
            <span style={{ width: "86%" }} />
          </div>
          <div className="progress-meta">
            <strong>31 of 36</strong>
            <span>university calendars submitted</span>
            <a href="/hec/compliance">
              Review alignment <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <div className="briefing-side">
          <span className="briefing-number">08</span>
          <div>
            <strong>days to enrolment data freeze</strong>
            <p>14 August 2026 · statewide governance milestone</p>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="dashboard-panel timeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Coming into view</p>
              <h2>Academic rhythm</h2>
            </div>
            <button
              className="text-button"
              onClick={() =>
                toast("Calendar view", "The complete public calendar is available from the sidebar.")
              }
            >
              View calendar <ChevronRight size={15} />
            </button>
          </div>
          <div className="milestone-list">
            {statewideEvents.slice(0, 4).map((event, index) => (
              <div className="milestone" key={event.id}>
                <span className={`milestone-marker marker-${index + 1}`}>
                  {index === 0 ? <Check size={14} /> : index + 1}
                </span>
                <div>
                  <small>{event.start.slice(5).split("-").reverse().join(" · ")}</small>
                  <strong>{event.title}</strong>
                  <span>{event.audience}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel signal-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Institutional signals</p>
              <h2>Where attention is needed</h2>
            </div>
            <StatusBadge status="attention" />
          </div>
          <div className="signal-list">
            {institutions.slice(1, 5).map((institution) => (
              <button
                key={institution.id}
                onClick={() =>
                  toast(
                    institution.name,
                    "The institutional review drawer is simulated in this prototype.",
                  )
                }
              >
                <span className={`signal-dot status-${institution.status}`} />
                <span>
                  <strong>{institution.name}</strong>
                  <small>{institution.submission}</small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-panel activity-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Latest governance activity</p>
              <h2>Decisions and submissions</h2>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon">
              <FileCheck2 size={18} />
            </span>
            <div>
              <strong>Calendar version 1.0 published</strong>
              <p>Released to participating universities by Dr. Meera Nair.</p>
            </div>
            <time>10:42</time>
          </div>
          <div className="activity-row">
            <span className="activity-icon gold">
              <MessageSquareText size={18} />
            </span>
            <div>
              <strong>Clarification received from Periyar Valley</strong>
              <p>Syndicate meeting date added to the submission.</p>
            </div>
            <time>Yesterday</time>
          </div>
        </section>
      </div>

      <Modal open={noteOpen} title="Add a coordination note" onClose={() => setNoteOpen(false)}>
        <div className="modal-body">
          <label className="form-field">
            <span>Note for the academic coordination team</span>
            <textarea placeholder="Record an observation, follow-up or decision…" />
          </label>
          <div className="modal-actions">
            <button className="button button-secondary" onClick={() => setNoteOpen(false)}>
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setNoteOpen(false);
                toast(
                  "Coordination note saved",
                  "The note was added to the demonstration activity trail.",
                );
              }}
            >
              Save note
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function UniversityDashboard() {
  const [tasks, setTasks] = useState([true, false, false]);
  const { toast } = useDemoState();
  const taskLabels = [
    "Map university holidays to the state baseline",
    "Confirm first internal assessment window",
    "Submit calendar for syndicate ratification",
  ];

  return (
    <>
      <PageHeader
        eyebrow="Sahya Higher Studies University · Academic Planning Office"
        title="Your calendar is nearly aligned"
        description="Three focused actions will prepare the institutional calendar for final ratification and statewide publication."
        actions={
          <button
            className="button button-primary"
            onClick={() =>
              toast(
                "Draft saved",
                "The university calendar draft has been saved to this device.",
              )
            }
          >
            <FileText size={16} /> Save current draft
          </button>
        }
      />

      <section className="alignment-banner">
        <div className="alignment-score">
          <span>92</span>
          <small>% aligned</small>
        </div>
        <div>
          <p className="eyebrow">Institutional readiness</p>
          <h2>29 of 31 state milestones are matched</h2>
          <p>
            Two local variations are documented and ready for academic council review.
          </p>
        </div>
        <StatusBadge status="on-track" />
      </section>

      <div className="university-grid">
        <section className="dashboard-panel teaching-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Odd semester · 2026</p>
              <h2>Teaching rhythm</h2>
            </div>
            <span className="week-count">16 weeks</span>
          </div>
          <div className="teaching-track">
            <span className="teaching-block block-teach">Instruction · 7 weeks</span>
            <span className="teaching-block block-assess">Assessment</span>
            <span className="teaching-block block-teach">Instruction · 7 weeks</span>
            <span className="teaching-block block-exam">Exams</span>
          </div>
          <div className="teaching-dates">
            <span>03 Aug</span>
            <span>21 Sep</span>
            <span>28 Sep</span>
            <span>23 Nov</span>
          </div>
          <div className="teaching-summary">
            <div>
              <strong>89</strong>
              <span>planned teaching days</span>
            </div>
            <div>
              <strong>02</strong>
              <span>documented variations</span>
            </div>
            <div>
              <strong>13 Nov</strong>
              <span>last instructional day</span>
            </div>
          </div>
        </section>

        <section className="dashboard-panel task-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Before submission</p>
              <h2>Planning checklist</h2>
            </div>
            <span>{tasks.filter(Boolean).length}/3</span>
          </div>
          <div className="task-list">
            {taskLabels.map((label, index) => (
              <button
                key={label}
                className={tasks[index] ? "complete" : ""}
                onClick={() =>
                  setTasks((current) =>
                    current.map((value, taskIndex) =>
                      taskIndex === index ? !value : value,
                    ),
                  )
                }
              >
                <span className="task-check">{tasks[index] ? <Check size={14} /> : null}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
          <a href="/university/calendar" className="button button-secondary panel-action">
            Open calendar workspace <ArrowRight size={16} />
          </a>
        </section>
      </div>

      <section className="deadline-band">
        <span className="deadline-icon">
          <CalendarClock size={22} />
        </span>
        <div>
          <p className="eyebrow">Next coordination deadline</p>
          <h2>Calendar ratification is due 31 July</h2>
        </div>
        <p>
          Academic council meeting scheduled for 29 July · 11:00 in Senate Hall.
        </p>
        <button
          className="text-button"
          onClick={() =>
            toast(
              "Reminder added",
              "A local reminder for 29 July has been saved to this device.",
            )
          }
        >
          Add reminder <ChevronRight size={15} />
        </button>
      </section>
    </>
  );
}

type WorkflowItem = {
  id: number;
  title: string;
  institution: string;
  received: string;
  type: string;
  detail: string;
};

const initialQueue: WorkflowItem[] = [
  {
    id: 1,
    title: "Monsoon contingency buffer",
    institution: "Kuttanad Knowledge University",
    received: "Received 23 Jul",
    type: "Calendar variation",
    detail: "Requests a two-day instructional buffer during the southwest monsoon period.",
  },
  {
    id: 2,
    title: "Syndicate ratification schedule",
    institution: "Periyar Valley University",
    received: "Received 25 Jul",
    type: "Clarification response",
    detail: "Confirms the final calendar will be tabled at the 28 July syndicate meeting.",
  },
  {
    id: 3,
    title: "Inter-collegiate arts festival",
    institution: "Ananthapuri University of Studies",
    received: "Received 24 Jul",
    type: "Protected activity",
    detail: "Seeks a protected three-day window without reducing planned teaching days.",
  },
];

export function WorkflowDashboard() {
  const [queue, setQueue] = useState(initialQueue);
  const [selected, setSelected] = useState<WorkflowItem | null>(initialQueue[0]);
  const { toast } = useDemoState();

  function resolve(action: "approve" | "return") {
    if (!selected) return;
    setQueue((items) => items.filter((item) => item.id !== selected.id));
    setSelected(null);
    toast(
      action === "approve" ? "Item approved" : "Clarification requested",
      `${selected.institution} has been notified in the demonstration workflow.`,
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Empowered Committee · Review workspace"
        title="Three decisions are ready for review"
        description="Move calendar variations and clarifications through a transparent, time-bound academic governance process."
        actions={
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "Queue refreshed",
                "The demonstration queue is already showing the latest submissions.",
              )
            }
          >
            <Sparkles size={16} /> Refresh queue
          </button>
        }
      />

      <section className="workflow-summary">
        <div>
          <strong>{queue.length}</strong>
          <span>Awaiting decision</span>
        </div>
        <div>
          <strong>1.6 days</strong>
          <span>Median review time</span>
        </div>
        <div>
          <StatusBadge status="on-track" />
          <span>All reviews within service window</span>
        </div>
      </section>

      <div className="workflow-layout">
        <section className="workflow-queue">
          <div className="queue-head">
            <div>
              <p className="eyebrow">Review queue</p>
              <h2>Open submissions</h2>
            </div>
            <span>{queue.length}</span>
          </div>
          {queue.length ? (
            <div className="queue-items">
              {queue.map((item) => (
                <button
                  key={item.id}
                  className={selected?.id === item.id ? "active" : ""}
                  onClick={() => setSelected(item)}
                >
                  <span className="queue-type">{item.type}</span>
                  <strong>{item.title}</strong>
                  <span>{item.institution}</span>
                  <small>{item.received}</small>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          ) : (
            <div className="queue-complete">
              <CheckCircle2 size={28} />
              <h3>Review queue complete</h3>
              <p>All current submissions have a recorded decision.</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setQueue(initialQueue);
                  setSelected(initialQueue[0]);
                }}
              >
                Reset demonstration
              </button>
            </div>
          )}
        </section>

        <section className="workflow-detail">
          {selected ? (
            <>
              <div className="workflow-detail-head">
                <span className="section-icon gold">
                  <ClipboardCheck size={21} />
                </span>
                <div>
                  <p className="eyebrow">{selected.type}</p>
                  <h2>{selected.title}</h2>
                  <span>{selected.institution}</span>
                </div>
              </div>
              <div className="submission-detail">
                <span>Submission context</span>
                <p>{selected.detail}</p>
              </div>
              <dl className="review-facts">
                <div>
                  <dt>Academic impact</dt>
                  <dd>No reduction in minimum teaching days</dd>
                </div>
                <div>
                  <dt>Institutional authority</dt>
                  <dd>Academic council resolution attached</dd>
                </div>
                <div>
                  <dt>Statewide dependency</dt>
                  <dd>No examination window conflict</dd>
                </div>
              </dl>
              <label className="form-field">
                <span>Decision note</span>
                <textarea defaultValue="The proposed variation preserves the statewide examination baseline and minimum instructional requirement." />
              </label>
              <div className="workflow-actions">
                <button className="button button-secondary" onClick={() => resolve("return")}>
                  <MessageSquareText size={16} /> Request clarification
                </button>
                <button className="button button-primary" onClick={() => resolve("approve")}>
                  <CheckCircle2 size={16} /> Approve variation
                </button>
              </div>
            </>
          ) : (
            <div className="workflow-placeholder">
              <ShieldCheck size={30} />
              <h2>Select a submission</h2>
              <p>Choose an open item to review its academic context and record a decision.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export function ExecutiveDashboard() {
  const { toast } = useDemoState();
  return (
    <>
      <PageHeader
        eyebrow="Executive Viewer · Statewide view"
        title="Academic year 2026–27 is on course"
        description="A concise view of statewide readiness, institutional alignment and the next decisions that may need executive attention."
        actions={
          <button
            className="button button-primary"
            onClick={() =>
              toast(
                "Briefing prepared",
                "The demonstration executive briefing has been prepared.",
              )
            }
          >
            <FileText size={16} /> Prepare briefing
          </button>
        }
      />

      <section className="executive-hero">
        <div className="executive-score">
          <div className="executive-ring">
            <span>86%</span>
          </div>
          <div>
            <p className="eyebrow">Submission readiness</p>
            <h2>31 of 36 university calendars received</h2>
            <p>
              Statewide academic milestones remain stable. One overdue submission
              requires direct coordination.
            </p>
          </div>
        </div>
        <div className="executive-signal">
          <StatusBadge status="attention" />
          <strong>Focused follow-up</strong>
          <p>
            Sahya Higher Studies University has one unauthorised examination deviation.
          </p>
          <button
            className="text-button"
            onClick={() =>
              toast(
                "Follow-up assigned",
                "A simulated follow-up was assigned to the Academic Coordination Cell.",
              )
            }
          >
            Assign follow-up <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <div className="executive-grid">
        <section className="dashboard-panel executive-calendar">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Next 120 days</p>
              <h2>Statewide academic passage</h2>
            </div>
          </div>
          <div className="executive-timeline">
            <div className="executive-phase phase-active">
              <span>03 AUG</span>
              <strong>Instruction begins</strong>
              <small>All undergraduate institutions</small>
            </div>
            <div className="executive-phase">
              <span>21 SEP</span>
              <strong>Internal assessment</strong>
              <small>First common window</small>
            </div>
            <div className="executive-phase">
              <span>13 NOV</span>
              <strong>Instruction closes</strong>
              <small>Odd semester baseline</small>
            </div>
            <div className="executive-phase">
              <span>23 NOV</span>
              <strong>Examinations begin</strong>
              <small>Statewide window</small>
            </div>
          </div>
        </section>

        <section className="dashboard-panel decision-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Council attention</p>
              <h2>Decision horizon</h2>
            </div>
          </div>
          <div className="decision-item">
            <span className="decision-date">29 JUL</span>
            <div>
              <strong>Calendar exception protocol</strong>
              <p>Confirm a common threshold for monsoon-related variation requests.</p>
            </div>
          </div>
          <div className="decision-item">
            <span className="decision-date">07 AUG</span>
            <div>
              <strong>First-year transition review</strong>
              <p>Consider the onboarding readiness note across five universities.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="principle-note">
        <span className="section-icon">
          <UsersRound size={20} />
        </span>
        <div>
          <p className="eyebrow">System perspective</p>
          <h2>Alignment is strongest when local context remains visible.</h2>
          <p>
            The statewide calendar sets a dependable rhythm while documented
            variations protect institutional autonomy and academic quality.
          </p>
        </div>
      </section>
    </>
  );
}
