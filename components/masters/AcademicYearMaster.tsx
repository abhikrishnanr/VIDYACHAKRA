"use client";

import {
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Edit3,
  Link2,
  LockKeyhole,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Modal } from "@/components/shared/Modal";
import { useDemoState } from "@/lib/demo-state";
import type { AcademicYear, AcademicYearStatus } from "@/lib/types";
import {
  MasterDetailDrawer,
  MasterEmpty,
  MasterStatus,
  MasterWorkspaceShell,
} from "./MasterWorkspaceShell";

const blankYear: AcademicYear = {
  id: "",
  label: "",
  startDate: "",
  endDate: "",
  admissionYear: 2028,
  status: "planned",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function AcademicYearMaster() {
  const state = useDemoState();
  const canEdit = true;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>("ay-2026-27");
  const [editor, setEditor] = useState<AcademicYear | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [closeCandidate, setCloseCandidate] = useState<AcademicYear | null>(null);

  const records = useMemo(
    () =>
      [...state.academicYears]
        .filter((item) => status === "all" || item.status === status)
        .filter((item) =>
          `${item.label} ${item.admissionYear}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [search, state.academicYears, status],
  );

  const selected = state.academicYears.find((item) => item.id === selectedId) ?? null;
  const submissionCount = selected
    ? state.universityCalendarSubmissions.filter(
        (item) => item.academicYearId === selected.id,
      ).length
    : 0;
  const offeringCount = selected
    ? state.courseOfferings.filter((item) => item.academicYearId === selected.id).length
    : 0;

  function startCreate() {
    setEditorMode("create");
    setEditor({
      ...blankYear,
      id: `ay-${Date.now()}`,
      admissionYear: new Date().getFullYear() + 2,
    });
  }

  function startEdit(record: AcademicYear) {
    setEditorMode("edit");
    setEditor({ ...record });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (!editor.label || !editor.startDate || !editor.endDate) {
      state.toast("Complete the academic year", "Label, start date and end date are required.");
      return;
    }
    if (editor.endDate <= editor.startDate) {
      state.toast("Check the date range", "The end date must be after the start date.");
      return;
    }
    if (state.saveAcademicYear(editor, editorMode)) {
      setSelectedId(editor.id);
      setEditor(null);
    }
  }

  return (
    <>
      <MasterWorkspaceShell
        active="academic-years"
        title="Academic Year Registry"
        description="Control the planning horizon shared by calendar submissions and official course offerings."
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "planned", label: "Planned" },
          { value: "active", label: "Active" },
          { value: "closed", label: "Closed" },
        ]}
        actionLabel="Create academic year"
        onAction={startCreate}
        resultLabel={`${records.length} academic years`}
      >
        <div className="master-records year-master-records">
          <div className="master-list-head year-grid">
            <span>Academic year</span>
            <span>Official dates</span>
            <span>Linked use</span>
            <span>Status</span>
            <span />
          </div>
          {records.map((record) => {
            const linkedSubmissions = state.universityCalendarSubmissions.filter(
              (item) => item.academicYearId === record.id,
            ).length;
            const linkedOfferings = state.courseOfferings.filter(
              (item) => item.academicYearId === record.id,
            ).length;
            const isDefault = record.id === state.defaultAcademicYearId;
            return (
              <button
                className={`master-record year-grid ${
                  selectedId === record.id ? "selected" : ""
                }`}
                key={record.id}
                onClick={() => setSelectedId(record.id)}
              >
                <span className="master-primary-cell">
                  <CalendarRange size={18} aria-hidden="true" />
                  <span>
                    <strong>{record.label}</strong>
                    <small>Admission year {record.admissionYear}</small>
                  </span>
                  {isDefault ? <b>Default</b> : null}
                </span>
                <span className="master-date-pair">
                  <strong>{formatDate(record.startDate)}</strong>
                  <small>to {formatDate(record.endDate)}</small>
                </span>
                <span className="master-usage">
                  <strong>{linkedSubmissions + linkedOfferings}</strong>
                  <small>
                    {linkedSubmissions} submissions · {linkedOfferings} offerings
                  </small>
                </span>
                <MasterStatus
                  active={record.status === "active"}
                  activeLabel="Active"
                  inactiveLabel={
                    record.status === "planned" ? "Planned" : "Closed"
                  }
                />
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            );
          })}
          {records.length === 0 ? (
            <MasterEmpty>Try a different year label or status filter.</MasterEmpty>
          ) : null}
        </div>
      </MasterWorkspaceShell>

      <MasterDetailDrawer
        open={Boolean(selected)}
        title={selected?.label ?? ""}
        subtitle="Official academic-year boundary"
        onClose={() => setSelectedId(null)}
        footer={
          selected && canEdit ? (
            <div className="master-drawer-actions">
              <button className="button button-secondary" onClick={() => startEdit(selected)}>
                <Edit3 size={15} /> Edit metadata
              </button>
              {selected.id !== state.defaultAcademicYearId &&
              selected.status !== "closed" ? (
                <button
                  className="button button-quiet"
                  onClick={() => setCloseCandidate(selected)}
                >
                  <LockKeyhole size={15} /> Close year
                </button>
              ) : null}
            </div>
          ) : null
        }
      >
        {selected ? (
          <>
            <div className="master-detail-hero">
              <CalendarRange size={24} />
              <div>
                <span>Official duration</span>
                <strong>
                  {formatDate(selected.startDate)} — {formatDate(selected.endDate)}
                </strong>
              </div>
              <MasterStatus
                active={selected.status === "active"}
                activeLabel="Active"
                inactiveLabel={
                  selected.status === "planned" ? "Planned" : "Closed"
                }
              />
            </div>
            <dl className="master-detail-list">
              <div>
                <dt>Admission year</dt>
                <dd>{selected.admissionYear}</dd>
              </div>
              <div>
                <dt>Current default</dt>
                <dd>
                  {selected.id === state.defaultAcademicYearId
                    ? "Yes · selected across workspaces"
                    : "No"}
                </dd>
              </div>
              <div>
                <dt>Calendar submissions</dt>
                <dd>{submissionCount} linked university records</dd>
              </div>
              <div>
                <dt>Course offerings</dt>
                <dd>{offeringCount} linked institutional offerings</dd>
              </div>
            </dl>
            {selected.id !== state.defaultAcademicYearId && canEdit ? (
              <button
                className="master-inline-action"
                onClick={() => state.setDefaultAcademicYear(selected.id)}
              >
                <CheckCircle2 size={16} />
                Select as default current academic year
              </button>
            ) : (
              <div className="master-linked-note">
                <Link2 size={16} />
                Linked submissions and offerings remain historically traceable.
              </div>
            )}
          </>
        ) : null}
      </MasterDetailDrawer>

      <Modal
        open={Boolean(editor)}
        title={editorMode === "create" ? "Create academic year" : "Edit academic year"}
        onClose={() => setEditor(null)}
      >
        {editor ? (
          <form className="master-form" onSubmit={save}>
            <div className="modal-body">
              <p>
                Define the official boundary used by every downstream calendar and
                offering record.
              </p>
              <div className="form-grid">
                <label className="form-field">
                  <span>Academic year label</span>
                  <input
                    value={editor.label}
                    placeholder="2028–29"
                    onChange={(event) =>
                      setEditor({ ...editor, label: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Admission year</span>
                  <input
                    type="number"
                    min="2020"
                    max="2040"
                    value={editor.admissionYear}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        admissionYear: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Start date</span>
                  <input
                    type="date"
                    value={editor.startDate}
                    onChange={(event) =>
                      setEditor({ ...editor, startDate: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>End date</span>
                  <input
                    type="date"
                    value={editor.endDate}
                    onChange={(event) =>
                      setEditor({ ...editor, endDate: event.target.value })
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Status</span>
                  <select
                    value={editor.status}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        status: event.target.value as AcademicYearStatus,
                      })
                    }
                  >
                    <option value="planned">Planned</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-quiet" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {editorMode === "create" ? "Create academic year" : "Save changes"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(closeCandidate)}
        title="Close academic year?"
        onClose={() => setCloseCandidate(null)}
      >
        <div className="modal-body master-confirmation">
          <LockKeyhole size={25} />
          <p>
            {closeCandidate?.label} will remain visible with all linked submissions
            and offerings, but it cannot receive new records.
          </p>
        </div>
        <div className="modal-actions">
          <button className="button button-quiet" onClick={() => setCloseCandidate(null)}>
            Keep open
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              if (closeCandidate && state.closeAcademicYear(closeCandidate.id)) {
                setCloseCandidate(null);
              }
            }}
          >
            Confirm closure
          </button>
        </div>
      </Modal>
    </>
  );
}
