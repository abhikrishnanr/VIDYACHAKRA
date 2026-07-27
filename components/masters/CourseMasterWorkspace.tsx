"use client";

import {
  ArrowRight,
  Building2,
  Edit3,
  GraduationCap,
  LockKeyhole,
  Power,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Modal } from "@/components/shared/Modal";
import { useDemoState } from "@/lib/demo-state";
import type { CourseMaster, ProgrammeType, SemesterNumber } from "@/lib/types";
import {
  MasterDetailDrawer,
  MasterEmpty,
  MasterStatus,
  MasterWorkspaceShell,
} from "./MasterWorkspaceShell";

const blankCourse: CourseMaster = {
  id: "",
  courseCode: "",
  courseName: "",
  shortName: "",
  qualificationLevel: "Undergraduate",
  discipline: "",
  programmeType: "Undergraduate",
  durationYears: 4,
  totalSemesters: 8,
  active: true,
  effectiveFromAcademicYear: "ay-2027-28",
  description: "",
};

export function CourseMasterWorkspace() {
  const state = useDemoState();
  const canEdit = true;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>("cm-bsc-cs");
  const [editor, setEditor] = useState<CourseMaster | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [statusCandidate, setStatusCandidate] = useState<CourseMaster | null>(null);

  const records = useMemo(
    () =>
      [...state.courseMasters]
        .filter((item) =>
          status === "all"
            ? true
            : status === "active"
              ? item.active
              : !item.active,
        )
        .filter((item) =>
          `${item.courseCode} ${item.courseName} ${item.shortName} ${item.discipline}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => a.courseName.localeCompare(b.courseName)),
    [search, state.courseMasters, status],
  );

  const selected = state.courseMasters.find((item) => item.id === selectedId) ?? null;
  const selectedOfferings = selected
    ? state.courseOfferings.filter(
        (offering) => offering.courseMasterId === selected.id,
      )
    : [];
  const selectedUniversityIds = new Set(
    selectedOfferings.map((offering) => offering.universityId),
  );
  const selectedUniversities = state.universityProfiles.filter((university) =>
    selectedUniversityIds.has(university.id),
  );

  function usageCount(id: string) {
    return state.courseOfferings.filter((item) => item.courseMasterId === id).length;
  }

  function startCreate() {
    setEditorMode("create");
    setEditor({
      ...blankCourse,
      id: `cm-${Date.now()}`,
      effectiveFromAcademicYear: state.defaultAcademicYearId,
    });
  }

  function startEdit(record: CourseMaster) {
    setEditorMode("edit");
    setEditor({ ...record });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    if (
      !editor.courseCode ||
      !editor.courseName ||
      !editor.shortName ||
      !editor.discipline ||
      !editor.description
    ) {
      state.toast(
        "Complete the course record",
        "Code, names, discipline and description are required.",
      );
      return;
    }
    if (state.saveCourseMaster(editor, editorMode)) {
      setSelectedId(editor.id);
      setEditor(null);
    }
  }

  return (
    <>
      <MasterWorkspaceShell
        active="courses"
        title="Official Course Master"
        description="Maintain the authoritative HEC catalogue from which universities select courses for academic delivery units."
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ]}
        actionLabel="Add official course"
        onAction={startCreate}
        resultLabel={`${records.length} courses`}
      >
        <div className="master-records course-master-records">
          <div className="master-list-head course-grid">
            <span>Official course</span>
            <span>Classification</span>
            <span>Duration</span>
            <span>Institutional use</span>
            <span />
          </div>
          {records.map((record) => {
            const effectiveYear = state.academicYears.find(
              (year) => year.id === record.effectiveFromAcademicYear,
            );
            return (
              <button
                className={`master-record course-grid ${
                  selectedId === record.id ? "selected" : ""
                }`}
                key={record.id}
                onClick={() => setSelectedId(record.id)}
              >
                <span className="master-primary-cell">
                  <GraduationCap size={18} aria-hidden="true" />
                  <span>
                    <strong>{record.courseName}</strong>
                    <small>
                      {record.courseCode} · {record.shortName}
                    </small>
                  </span>
                </span>
                <span className="master-course-class">
                  <strong>{record.discipline}</strong>
                  <small>
                    {record.qualificationLevel} · {record.programmeType}
                  </small>
                </span>
                <span className="master-date-type">
                  <strong>
                    {record.durationYears} years · {record.totalSemesters} semesters
                  </strong>
                  <small>Effective {effectiveYear?.label ?? "Not specified"}</small>
                </span>
                <span className="master-usage">
                  <strong>{usageCount(record.id)}</strong>
                  <small>institutional offerings</small>
                </span>
                <span className="master-row-end">
                  <MasterStatus active={record.active} />
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </button>
            );
          })}
          {records.length === 0 ? (
            <MasterEmpty>Try another course name, code, discipline or status.</MasterEmpty>
          ) : null}
        </div>
      </MasterWorkspaceShell>

      <MasterDetailDrawer
        open={Boolean(selected)}
        title={selected?.courseName ?? ""}
        subtitle={selected ? `${selected.courseCode} · ${selected.shortName}` : ""}
        onClose={() => setSelectedId(null)}
        footer={
          selected && canEdit ? (
            <div className="master-drawer-actions">
              <button className="button button-secondary" onClick={() => startEdit(selected)}>
                <Edit3 size={15} /> Edit metadata
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
              <GraduationCap size={24} />
              <div>
                <span>{selected.discipline}</span>
                <strong>
                  {selected.durationYears} years · {selected.totalSemesters} semesters
                </strong>
              </div>
              <MasterStatus active={selected.active} />
            </div>
            <p className="master-detail-description">{selected.description}</p>
            <dl className="master-detail-list">
              <div>
                <dt>Qualification level</dt>
                <dd>{selected.qualificationLevel}</dd>
              </div>
              <div>
                <dt>Programme type</dt>
                <dd>{selected.programmeType}</dd>
              </div>
              <div>
                <dt>Effective academic year</dt>
                <dd>
                  {state.academicYears.find(
                    (year) => year.id === selected.effectiveFromAcademicYear,
                  )?.label ?? "Not specified"}
                </dd>
              </div>
              <div>
                <dt>Institutional offerings</dt>
                <dd>{selectedOfferings.length}</dd>
              </div>
            </dl>
            <section className="master-institution-usage">
              <div>
                <Building2 size={17} />
                <h3>Institutions offering this course</h3>
              </div>
              {selectedUniversities.length ? (
                selectedUniversities.map((university) => (
                  <p key={university.id}>
                    <strong>{university.name}</strong>
                    <span>
                      {
                        selectedOfferings.filter(
                          (offering) => offering.universityId === university.id,
                        ).length
                      }{" "}
                      offerings
                    </span>
                  </p>
                ))
              ) : (
                <p>No institutional offerings currently reference this course.</p>
              )}
            </section>
            {selectedOfferings.length > 0 ? (
              <div className="master-protected-notice">
                <LockKeyhole size={17} />
                <p>
                  This course is used by institutional offerings and cannot be deleted.
                  Deactivate it to prevent future selection.
                </p>
              </div>
            ) : null}
          </>
        ) : null}
      </MasterDetailDrawer>

      <Modal
        open={Boolean(editor)}
        title={editorMode === "create" ? "Add official course" : "Edit course metadata"}
        onClose={() => setEditor(null)}
      >
        {editor ? (
          <form className="master-form master-form-wide" onSubmit={save}>
            <div className="modal-body">
              <p>
                Universities will see this authoritative record in their course
                selectors. Free-text course creation is not permitted.
              </p>
              <div className="form-grid">
                <label className="form-field">
                  <span>Course code</span>
                  <input
                    value={editor.courseCode}
                    placeholder="HEC-UG-HIS-013"
                    onChange={(event) =>
                      setEditor({ ...editor, courseCode: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Short name</span>
                  <input
                    value={editor.shortName}
                    placeholder="BA History"
                    onChange={(event) =>
                      setEditor({ ...editor, shortName: event.target.value })
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Official course name</span>
                  <input
                    value={editor.courseName}
                    placeholder="B.A. History"
                    onChange={(event) =>
                      setEditor({ ...editor, courseName: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Discipline</span>
                  <input
                    value={editor.discipline}
                    placeholder="Humanities"
                    onChange={(event) =>
                      setEditor({ ...editor, discipline: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Qualification level</span>
                  <select
                    value={editor.qualificationLevel}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        qualificationLevel:
                          event.target.value as CourseMaster["qualificationLevel"],
                      })
                    }
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </label>
                <label className="form-field">
                  <span>Programme type</span>
                  <select
                    value={editor.programmeType}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        programmeType: event.target.value as ProgrammeType,
                      })
                    }
                  >
                    {[
                      "FYUGP",
                      "Undergraduate",
                      "Postgraduate",
                      "Professional",
                      "Vocational",
                    ].map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Effective academic year</span>
                  <select
                    value={editor.effectiveFromAcademicYear}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        effectiveFromAcademicYear: event.target.value,
                      })
                    }
                  >
                    {state.academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Duration in years</span>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={editor.durationYears}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        durationYears: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Total semesters</span>
                  <select
                    value={editor.totalSemesters}
                    onChange={(event) =>
                      setEditor({
                        ...editor,
                        totalSemesters: Number(event.target.value) as SemesterNumber,
                      })
                    }
                  >
                    {[2, 4, 6, 8].map((semesterCount) => (
                      <option key={semesterCount} value={semesterCount}>
                        {semesterCount}
                      </option>
                    ))}
                  </select>
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
                <label className="master-check form-field-wide">
                  <input
                    type="checkbox"
                    checked={editor.active}
                    onChange={(event) =>
                      setEditor({ ...editor, active: event.target.checked })
                    }
                  />
                  <span>Active for university course selectors</span>
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-quiet" onClick={() => setEditor(null)}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                {editorMode === "create" ? "Add to course master" : "Save metadata"}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(statusCandidate)}
        title={statusCandidate?.active ? "Deactivate official course?" : "Reactivate official course?"}
        onClose={() => setStatusCandidate(null)}
      >
        <div className="modal-body master-confirmation">
          <Power size={25} />
          <p>
            {statusCandidate?.active
              ? `${statusCandidate.courseName} will no longer appear in new university course selectors. Existing offerings remain linked and visible.`
              : `${statusCandidate?.courseName} will become selectable for new institutional offerings again.`}
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
                state.setCourseMasterActive(statusCandidate.id, !statusCandidate.active)
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
