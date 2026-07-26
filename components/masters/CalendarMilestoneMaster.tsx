"use client";

import {
  ArrowRight,
  CalendarClock,
  CalendarRange,
  Check,
  Edit3,
  Eye,
  Power,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Modal } from "@/components/shared/Modal";
import { useDemoState } from "@/lib/demo-state";
import type {
  CalendarAlignmentRule,
  CalendarDateInputType,
  CalendarMilestoneDefinition,
  SemesterNumber,
} from "@/lib/types";
import {
  MasterDetailDrawer,
  MasterEmpty,
  MasterStatus,
  MasterWorkspaceShell,
} from "./MasterWorkspaceShell";

const semesters: SemesterNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

const blankMilestone: CalendarMilestoneDefinition = {
  id: "",
  code: "",
  title: "",
  description: "",
  category: "Academic activity",
  dateInputType: "single_date",
  applicableSemesters: [1],
  applicableProgrammeTypes: ["FYUGP", "Undergraduate"],
  alignmentRule: "exact_date",
  toleranceBeforeDays: 0,
  toleranceAfterDays: 0,
  mandatory: true,
  displayOrder: 180,
  active: true,
};

function readable(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function FieldPreview({
  type,
  compact = false,
}: {
  type: CalendarDateInputType;
  compact?: boolean;
}) {
  return (
    <div className={`milestone-field-preview ${compact ? "compact" : ""}`}>
      <div>
        <Eye size={14} aria-hidden="true" />
        University submission preview
      </div>
      <label>
        <span>
          {type === "deadline"
            ? "Official deadline"
            : type === "date_range"
              ? "Approved period"
              : "Official date"}
        </span>
        <div className={type === "date_range" ? "preview-date-range" : ""}>
          <span>{type === "deadline" ? "Due date" : "Select date"}</span>
          {type === "date_range" ? <span>End date</span> : null}
        </div>
      </label>
      <small>
        {type === "single_date"
          ? "One calendar field"
          : type === "date_range"
            ? "Start and end calendar fields"
            : "One date with deadline language"}
      </small>
    </div>
  );
}

export function CalendarMilestoneMaster() {
  const state = useDemoState();
  const canEdit = state.activeRole === "administrator";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>("cmd-theory");
  const [editor, setEditor] = useState<CalendarMilestoneDefinition | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [statusCandidate, setStatusCandidate] =
    useState<CalendarMilestoneDefinition | null>(null);

  const records = useMemo(
    () =>
      [...state.calendarMilestoneDefinitions]
        .filter((item) =>
          status === "all"
            ? true
            : status === "active"
              ? item.active
              : !item.active,
        )
        .filter((item) =>
          `${item.title} ${item.code} ${item.category}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [search, state.calendarMilestoneDefinitions, status],
  );

  const selected =
    state.calendarMilestoneDefinitions.find((item) => item.id === selectedId) ??
    null;

  function institutionUsage(id: string) {
    const submissionIds = new Set(
      state.universityCalendarEntries
        .filter((entry) => entry.milestoneDefinitionId === id)
        .map((entry) => entry.submissionId),
    );
    return new Set(
      state.universityCalendarSubmissions
        .filter((submission) => submissionIds.has(submission.id))
        .map((submission) => submission.universityId),
    ).size;
  }

  function startCreate() {
    setEditorMode("create");
    setEditor({
      ...blankMilestone,
      id: `cmd-${Date.now()}`,
      displayOrder:
        Math.max(
          0,
          ...state.calendarMilestoneDefinitions.map((item) => item.displayOrder),
        ) + 10,
    });
  }

  function startEdit(record: CalendarMilestoneDefinition) {
    setEditorMode("edit");
    setEditor({ ...record, applicableSemesters: [...record.applicableSemesters] });
  }

  function toggleSemester(semester: SemesterNumber) {
    if (!editor) return;
    const exists = editor.applicableSemesters.includes(semester);
    const applicableSemesters = exists
      ? editor.applicableSemesters.filter((item) => item !== semester)
      : [...editor.applicableSemesters, semester].sort(
          (a, b) => a - b,
        ) as SemesterNumber[];
    setEditor({ ...editor, applicableSemesters });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (
      !editor.title ||
      !editor.code ||
      !editor.description ||
      editor.applicableSemesters.length === 0
    ) {
      state.toast(
        "Complete the milestone definition",
        "Code, title, description and at least one semester are required.",
      );
      return;
    }
    if (state.saveCalendarMilestone(editor, editorMode)) {
      setSelectedId(editor.id);
      setEditor(null);
    }
  }

  return (
    <>
      <MasterWorkspaceShell
        active="calendar-milestones"
        title="Calendar Milestone Master"
        description="Define the official fields, date behaviour and alignment rules that structure every university calendar submission."
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        actionLabel="Create milestone"
        onAction={startCreate}
        resultLabel={`${records.length} definitions`}
      >
        <div className="master-records milestone-master-records">
          <div className="master-list-head milestone-grid">
            <span>Milestone definition</span>
            <span>Field behaviour</span>
            <span>Governance rule</span>
            <span>Usage</span>
            <span />
          </div>
          {records.map((record) => (
            <button
              className={`master-record milestone-grid ${
                selectedId === record.id ? "selected" : ""
              }`}
              key={record.id}
              onClick={() => setSelectedId(record.id)}
            >
              <span className="master-primary-cell">
                <CalendarClock size={18} aria-hidden="true" />
                <span>
                  <strong>{record.title}</strong>
                  <small>
                    {record.code} · {record.category}
                  </small>
                </span>
                {record.mandatory ? <b>Mandatory</b> : null}
              </span>
              <span className="master-date-type">
                <strong>{readable(record.dateInputType)}</strong>
                <small>Semester {record.applicableSemesters.join(", ")}</small>
              </span>
              <span className="master-rule-cell">
                <strong>{readable(record.alignmentRule)}</strong>
                <small>
                  −{record.toleranceBeforeDays} / +{record.toleranceAfterDays} days
                </small>
              </span>
              <span className="master-usage">
                <strong>{institutionUsage(record.id)}</strong>
                <small>institutions use this field</small>
              </span>
              <span className="master-row-end">
                <MasterStatus active={record.active} />
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            </button>
          ))}
          {records.length === 0 ? (
            <MasterEmpty>Try a milestone title, code, category or different status.</MasterEmpty>
          ) : null}
        </div>
      </MasterWorkspaceShell>

      <MasterDetailDrawer
        open={Boolean(selected)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.code} · Display order ${selected.displayOrder}` : ""}
        onClose={() => setSelectedId(null)}
        footer={
          selected && canEdit ? (
            <div className="master-drawer-actions">
              <button className="button button-secondary" onClick={() => startEdit(selected)}>
                <Edit3 size={15} /> Edit definition
              </button>
              <button
                className="button button-quiet"
                onClick={() => setStatusCandidate(selected)}
              >
                <Power size={15} />
                {selected.active ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <>
            <div className="master-detail-hero">
              <CalendarRange size={24} />
              <div>
                <span>{selected.category}</span>
                <strong>{readable(selected.dateInputType)}</strong>
              </div>
              <MasterStatus active={selected.active} />
            </div>
            <p className="master-detail-description">{selected.description}</p>
            <dl className="master-detail-list">
              <div>
                <dt>Applicable semesters</dt>
                <dd>{selected.applicableSemesters.join(", ")}</dd>
              </div>
              <div>
                <dt>Programme scope</dt>
                <dd>{selected.applicableProgrammeTypes.join(", ")}</dd>
              </div>
              <div>
                <dt>Alignment rule</dt>
                <dd>{readable(selected.alignmentRule)}</dd>
              </div>
              <div>
                <dt>Tolerance window</dt>
                <dd>
                  {selected.toleranceBeforeDays} days before ·{" "}
                  {selected.toleranceAfterDays} days after
                </dd>
              </div>
              <div>
                <dt>Institution usage</dt>
                <dd>{institutionUsage(selected.id)} universities</dd>
              </div>
              <div>
                <dt>Requirement</dt>
                <dd>{selected.mandatory ? "Mandatory" : "Optional"}</dd>
              </div>
            </dl>
            <FieldPreview type={selected.dateInputType} compact />
          </>
        ) : null}
      </MasterDetailDrawer>

      <Modal
        open={Boolean(editor)}
        title={editorMode === "create" ? "Create milestone definition" : "Edit milestone definition"}
        onClose={() => setEditor(null)}
      >
        {editor ? (
          <form className="master-form master-form-wide" onSubmit={save}>
            <div className="modal-body master-modal-columns">
              <div className="master-form-fields">
                <p>
                  Configure the official field a university will complete in its
                  academic calendar submission.
                </p>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Milestone code</span>
                    <input
                      value={editor.code}
                      placeholder="EXAM-REG-018"
                      onChange={(event) =>
                        setEditor({ ...editor, code: event.target.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span>Display order</span>
                    <input
                      type="number"
                      min="1"
                      value={editor.displayOrder}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          displayOrder: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Milestone title</span>
                    <input
                      value={editor.title}
                      placeholder="Admission Period"
                      onChange={(event) =>
                        setEditor({ ...editor, title: event.target.value })
                      }
                    />
                  </label>
                  <label className="form-field form-field-wide">
                    <span>Description</span>
                    <textarea
                      value={editor.description}
                      onChange={(event) =>
                        setEditor({ ...editor, description: event.target.value })
                      }
                    />
                  </label>
                  <label className="form-field">
                    <span>Category</span>
                    <select
                      value={editor.category}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          category:
                            event.target.value as CalendarMilestoneDefinition["category"],
                        })
                      }
                    >
                      {[
                        "Admission",
                        "Academic activity",
                        "Assessment",
                        "Examination",
                        "Valuation",
                        "Result",
                        "Governance",
                      ].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Date input type</span>
                    <select
                      value={editor.dateInputType}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          dateInputType: event.target.value as CalendarDateInputType,
                        })
                      }
                    >
                      <option value="single_date">Single date</option>
                      <option value="date_range">Date range</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Alignment rule</span>
                    <select
                      value={editor.alignmentRule}
                      onChange={(event) =>
                        setEditor({
                          ...editor,
                          alignmentRule: event.target.value as CalendarAlignmentRule,
                        })
                      }
                    >
                      <option value="exact_date">Exact date</option>
                      <option value="permitted_window">Permitted window</option>
                      <option value="reporting_only">Reporting only</option>
                    </select>
                  </label>
                  <div className="form-field tolerance-fields">
                    <span>Tolerance window</span>
                    <div>
                      <label>
                        <small>Before</small>
                        <input
                          type="number"
                          min="0"
                          value={editor.toleranceBeforeDays}
                          onChange={(event) =>
                            setEditor({
                              ...editor,
                              toleranceBeforeDays: Math.max(
                                0,
                                Number(event.target.value),
                              ),
                            })
                          }
                        />
                      </label>
                      <label>
                        <small>After</small>
                        <input
                          type="number"
                          min="0"
                          value={editor.toleranceAfterDays}
                          onChange={(event) =>
                            setEditor({
                              ...editor,
                              toleranceAfterDays: Math.max(
                                0,
                                Number(event.target.value),
                              ),
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                  <fieldset className="master-semester-field form-field-wide">
                    <legend>Applicable semesters</legend>
                    <div>
                      {semesters.map((semester) => (
                        <button
                          type="button"
                          className={
                            editor.applicableSemesters.includes(semester)
                              ? "selected"
                              : ""
                          }
                          onClick={() => toggleSemester(semester)}
                          key={semester}
                        >
                          {editor.applicableSemesters.includes(semester) ? (
                            <Check size={13} />
                          ) : null}
                          S{semester}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <label className="master-check">
                    <input
                      type="checkbox"
                      checked={editor.mandatory}
                      onChange={(event) =>
                        setEditor({ ...editor, mandatory: event.target.checked })
                      }
                    />
                    <span>Mandatory in submissions</span>
                  </label>
                  <label className="master-check">
                    <input
                      type="checkbox"
                      checked={editor.active}
                      onChange={(event) =>
                        setEditor({ ...editor, active: event.target.checked })
                      }
                    />
                    <span>Active for future use</span>
                  </label>
                </div>
              </div>
              <aside>
                <FieldPreview type={editor.dateInputType} />
                <div className="milestone-rule-preview">
                  <ShieldCheck size={17} />
                  <div>
                    <strong>{readable(editor.alignmentRule)}</strong>
                    <span>
                      Tolerance −{editor.toleranceBeforeDays} / +
                      {editor.toleranceAfterDays} days
                    </span>
                  </div>
                </div>
              </aside>
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-quiet" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {editorMode === "create" ? "Create milestone" : "Save definition"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(statusCandidate)}
        title={statusCandidate?.active ? "Deactivate milestone?" : "Reactivate milestone?"}
        onClose={() => setStatusCandidate(null)}
      >
        <div className="modal-body master-confirmation">
          <Power size={25} />
          <p>
            {statusCandidate?.active
              ? `${statusCandidate.title} will disappear from future calendar templates. Existing university entries remain unchanged.`
              : `${statusCandidate?.title} will become available to future university submissions again.`}
          </p>
        </div>
        <div className="modal-actions">
          <button className="button button-quiet" onClick={() => setStatusCandidate(null)}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              if (
                statusCandidate &&
                state.setCalendarMilestoneActive(
                  statusCandidate.id,
                  !statusCandidate.active,
                )
              ) {
                setStatusCandidate(null);
              }
            }}
          >
            Confirm {statusCandidate?.active ? "deactivation" : "reactivation"}
          </button>
        </div>
      </Modal>
    </>
  );
}
