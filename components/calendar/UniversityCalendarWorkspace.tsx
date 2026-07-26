"use client";

import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ChevronRight,
  GripVertical,
  Info,
  Plus,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { statewideEvents } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

const localDates = [
  {
    date: "18 SEP",
    title: "College union election",
    note: "Protected institutional activity",
    type: "local",
  },
  {
    date: "05 OCT",
    title: "Sahya academic colloquium",
    note: "No teaching-day impact",
    type: "local",
  },
];

export function UniversityCalendarWorkspace() {
  const [variationOpen, setVariationOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useDemoState();
  return (
    <>
      <PageHeader
        eyebrow="Sahya Higher Studies University · Calendar workspace"
        title="Shape the institutional calendar"
        description="Map local academic activity against the statewide baseline and document every material variation before ratification."
        actions={
          <>
            <button
              className="button button-secondary"
              onClick={() => setVariationOpen(true)}
            >
              <Plus size={16} /> Add local date
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setSubmitted(true);
                toast(
                  "Calendar submitted",
                  "The simulated calendar has moved to academic council review.",
                );
              }}
            >
              <Send size={16} /> {submitted ? "Submitted for review" : "Submit for review"}
            </button>
          </>
        }
      />

      <section className="workspace-status">
        <div>
          <span className="section-icon">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <strong>State baseline synchronised</strong>
            <p>Version 1.0 · published 26 July at 10:42</p>
          </div>
        </div>
        <div className="workspace-legend">
          <span><i className="legend-state" /> State milestone</span>
          <span><i className="legend-local" /> Institutional date</span>
        </div>
      </section>

      <div className="calendar-workspace-grid">
        <aside className="workspace-weeks">
          <p className="eyebrow">Odd semester 2026</p>
          <h2>16 teaching weeks</h2>
          <div className="week-stack">
            {Array.from({ length: 16 }).map((_, index) => (
              <button
                key={index}
                className={index === 0 ? "active" : ""}
                onClick={() =>
                  toast(
                    `Teaching week ${index + 1}`,
                    "The timeline has focused on this demonstration week.",
                  )
                }
              >
                <span>W{index + 1}</span>
                <i />
              </button>
            ))}
          </div>
          <div className="workspace-count">
            <strong>89</strong>
            <span>planned teaching days</span>
          </div>
        </aside>

        <section className="workspace-timeline">
          <div className="workspace-month">
            <span>AUGUST</span>
            <small>2026</small>
          </div>
          <div className="workspace-events">
            {statewideEvents.slice(0, 3).map((event) => (
              <article className="workspace-event state-event" key={event.id}>
                <span className="event-handle"><GripVertical size={17} /></span>
                <div className="workspace-event-date">
                  <strong>{event.start.slice(-2)}</strong>
                  <span>{event.start === "2026-08-03" ? "MON" : "FRI"}</span>
                </div>
                <div>
                  <span className="event-type academic">
                    {event.category === "Holiday" ? "State recess" : `State ${event.category}`}
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.audience}</p>
                </div>
                <button
                  className="row-action"
                  onClick={() =>
                    toast(
                      event.title,
                      "Statewide milestones are locked in the institutional workspace.",
                    )
                  }
                >
                  Details <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>

          <div className="workspace-month">
            <span>SEPTEMBER</span>
            <small>2026</small>
          </div>
          <div className="workspace-events">
            {localDates.map((event) => (
              <article className="workspace-event local-event" key={event.title}>
                <span className="event-handle"><GripVertical size={17} /></span>
                <div className="workspace-event-date">
                  <strong>{event.date.split(" ")[0]}</strong>
                  <span>{event.date.split(" ")[1]}</span>
                </div>
                <div>
                  <span className="event-type local">Institutional date</span>
                  <h3>{event.title}</h3>
                  <p>{event.note}</p>
                </div>
                <button
                  className="row-action"
                  onClick={() =>
                    toast(
                      "Local date opened",
                      "Editing is simulated for this institutional milestone.",
                    )
                  }
                >
                  Edit <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <aside className="workspace-inspector">
          <p className="eyebrow">Alignment inspector</p>
          <h2>Calendar integrity</h2>
          <div className="integrity-score">
            <strong>92%</strong>
            <span>aligned to state baseline</span>
          </div>
          <div className="inspector-item complete">
            <CheckCircle2 size={17} />
            <div>
              <strong>Teaching days</strong>
              <span>Minimum requirement met</span>
            </div>
          </div>
          <div className="inspector-item complete">
            <CheckCircle2 size={17} />
            <div>
              <strong>Examination window</strong>
              <span>No scheduling conflict</span>
            </div>
          </div>
          <div className="inspector-item attention">
            <Info size={17} />
            <div>
              <strong>Two local variations</strong>
              <span>Ready for council review</span>
            </div>
          </div>
          <button
            className="button button-secondary inspector-action"
            onClick={() =>
              toast(
                "Alignment review opened",
                "The prototype has highlighted both documented variations.",
              )
            }
          >
            Review variations <ArrowRight size={16} />
          </button>
        </aside>
      </div>

      <Modal
        open={variationOpen}
        onClose={() => setVariationOpen(false)}
        title="Add an institutional date"
      >
        <div className="modal-body">
          <div className="form-grid">
            <label className="form-field">
              <span>Date</span>
              <input type="date" defaultValue="2026-09-18" />
            </label>
            <label className="form-field">
              <span>Category</span>
              <select defaultValue="Academic">
                <option>Academic</option>
                <option>Assessment</option>
                <option>Institutional activity</option>
              </select>
            </label>
          </div>
          <label className="form-field">
            <span>Title</span>
            <input placeholder="Name this institutional milestone" />
          </label>
          <label className="form-field">
            <span>Academic note</span>
            <textarea placeholder="Explain the purpose and any impact on teaching days…" />
          </label>
          <div className="modal-actions">
            <button className="button button-secondary" onClick={() => setVariationOpen(false)}>
              Cancel
            </button>
            <button
              className="button button-primary"
              onClick={() => {
                setVariationOpen(false);
                toast(
                  "Institutional date added",
                  "The new date has been added to the demonstration calendar.",
                );
              }}
            >
              <CalendarPlus size={16} /> Add to calendar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
