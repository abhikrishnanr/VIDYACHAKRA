"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Copy,
  FileText,
  Layers3,
  RotateCcw,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  calendarSubmissionGroups,
  countSubmissionStatuses,
  formatCalendarDateRange,
  formatVariance,
  getMilestoneGroup,
  inheritanceSummary,
} from "@/lib/calendar-submissions";
import { calculateCalendarCompliance } from "@/lib/domain-calculations";
import { domainCalendarBaselineDates } from "@/lib/domain-data";
import { useDemoState } from "@/lib/demo-state";
import type {
  CalendarMilestoneDefinition,
  ProgrammeType,
  SemesterNumber,
  UniversityCalendarEntry,
  UniversityCalendarSubmission,
} from "@/lib/types";

type EntryDraft = {
  startDate: string;
  endDate: string;
  reason: string;
};

const steps = [
  "Academic Context",
  "Calendar Scope",
  "Enter Milestone Dates",
  "Review Deviations",
  "Preview and Submit",
];

function draftKey(milestoneId: string, semester: SemesterNumber) {
  return `${milestoneId}::${semester}`;
}

function createEmptyDrafts(
  definitions: CalendarMilestoneDefinition[],
  semesters: SemesterNumber[],
  existingEntries: UniversityCalendarEntry[] = [],
) {
  const result: Record<string, EntryDraft> = {};
  definitions.forEach((definition) => {
    semesters
      .filter((semester) =>
        definition.applicableSemesters.includes(semester),
      )
      .forEach((semester) => {
        const existing = existingEntries.find(
          (entry) =>
            entry.milestoneDefinitionId === definition.id &&
            entry.semester === semester,
        );
        result[draftKey(definition.id, semester)] = {
          startDate: existing?.universityStartDate ?? "",
          endDate: existing?.universityEndDate ?? "",
          reason: existing?.deviationReason ?? "",
        };
      });
  });
  return result;
}

export function CalendarSubmissionWizard() {
  const state = useDemoState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("submission");
  const existing = requestedId
    ? state.universityCalendarSubmissions.find(
        (submission) => submission.id === requestedId,
      )
    : undefined;
  const loadedExistingRef = useRef<string | null>(null);
  const activeDefinitions = useMemo(
    () =>
      state.calendarMilestoneDefinitions
        .filter(
          (definition) =>
            definition.active &&
            definition.applicableProgrammeTypes.includes("FYUGP"),
        )
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [state.calendarMilestoneDefinitions],
  );

  const [step, setStep] = useState(0);
  const [academicYearId, setAcademicYearId] = useState("ay-2026-27");
  const [programmeType, setProgrammeType] =
    useState<ProgrammeType>("FYUGP");
  const [semesters, setSemesters] = useState<SemesterNumber[]>([1, 3]);
  const [title, setTitle] = useState(
    "FYUGP Annual Academic Calendar 2026–27",
  );
  const [scopeType, setScopeType] =
    useState<UniversityCalendarSubmission["scopeType"]>(
      "all_delivery_units",
    );
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, EntryDraft>>(() =>
    createEmptyDrafts(activeDefinitions, [1, 3]),
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Admissions",
  ]);
  const [showDeviationsOnly, setShowDeviationsOnly] = useState(false);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [supportingReference, setSupportingReference] = useState("");

  const sahyaUnits = useMemo(
    () =>
      state.academicDeliveryUnits.filter(
        (unit) => unit.universityId === "sahya" && unit.active,
      ),
    [state.academicDeliveryUnits],
  );
  const sahya = state.universityProfiles.find(
    (university) => university.id === "sahya",
  );

  useEffect(() => {
    if (
      !state.hydrated ||
      !existing ||
      loadedExistingRef.current === existing.id
    ) {
      return;
    }
    loadedExistingRef.current = existing.id;
    const entries = state.universityCalendarEntries.filter(
      (entry) => entry.submissionId === existing.id,
    );
    setAcademicYearId(existing.academicYearId);
    setProgrammeType(existing.programmeType);
    setSemesters(existing.applicableSemesters);
    setTitle(existing.title);
    setScopeType(existing.scopeType);
    setSelectedUnitIds(existing.selectedDeliveryUnitIds);
    setDrafts(
      createEmptyDrafts(
        activeDefinitions,
        existing.applicableSemesters,
        entries,
      ),
    );
    setDeclarationAccepted(existing.declarationAccepted);
  }, [
    activeDefinitions,
    existing,
    state.hydrated,
    state.universityCalendarEntries,
  ]);

  const resolvedScopeType =
    sahya?.operatingModel === "teaching_only"
      ? ("university_teaching_only" as const)
      : scopeType;

  const entryRows = useMemo(
    () =>
      activeDefinitions.flatMap((definition) =>
        semesters
          .filter((semester) =>
            definition.applicableSemesters.includes(semester),
          )
          .map((semester) => {
            const draft = drafts[draftKey(definition.id, semester)] ?? {
              startDate: "",
              endDate: "",
              reason: "",
            };
            const baseline = domainCalendarBaselineDates[definition.id];
            const missing =
              !draft.startDate ||
              (definition.dateInputType === "date_range" && !draft.endDate);
            const startCompliance = missing
              ? null
              : calculateCalendarCompliance({
                  definition,
                  councilBaselineDate: baseline.start,
                  universityDate: draft.startDate,
                });
            const endCompliance =
              !missing &&
              definition.dateInputType === "date_range" &&
              baseline.end &&
              draft.endDate
                ? calculateCalendarCompliance({
                    definition,
                    councilBaselineDate: baseline.end,
                    universityDate: draft.endDate,
                  })
                : null;
            const compliance = missing
              ? {
                  ragStatus: "amber" as const,
                  varianceDays: 0,
                  reason: "Required structured date is incomplete.",
                }
              : endCompliance?.ragStatus === "red"
                ? {
                    ...endCompliance,
                    reason:
                      "The submitted date range falls outside the approved Council rule.",
                  }
                : startCompliance!;
            const needsReason =
              compliance.ragStatus === "red" && !draft.reason.trim();
            return {
              definition,
              semester,
              draft,
              baseline,
              missing,
              needsReason,
              ...compliance,
            };
          }),
      ),
    [activeDefinitions, drafts, semesters],
  );

  const previewEntries = useMemo(
    () =>
      entryRows.map(
        (row): UniversityCalendarEntry => ({
          id: `preview-${row.definition.id}-${row.semester}`,
          submissionId: existing?.id ?? "preview",
          milestoneDefinitionId: row.definition.id,
          semester: row.semester,
          councilBaselineStartDate: row.baseline.start,
          councilBaselineEndDate: row.baseline.end,
          universityStartDate: row.draft.startDate,
          universityEndDate: row.draft.endDate || null,
          actualStartDate: null,
          actualEndDate: null,
          varianceDays: row.varianceDays,
          ragStatus: row.ragStatus,
          ragReason: row.reason,
          deviationReason: row.draft.reason.trim(),
          evidenceStatus:
            row.ragStatus === "red" ? "pending" : "not_required",
          changeRequestId: null,
        }),
      ),
    [entryRows, existing?.id],
  );

  const counts = countSubmissionStatuses(previewEntries);
  const selectedAcademicYear = state.academicYears.find(
    (year) => year.id === academicYearId,
  );

  function toggleSemester(semester: SemesterNumber) {
    setSemesters((current) =>
      current.includes(semester)
        ? current.filter((item) => item !== semester)
        : [...current, semester].sort((a, b) => a - b),
    );
  }

  function updateDraft(
    definitionId: string,
    semester: SemesterNumber,
    patch: Partial<EntryDraft>,
  ) {
    const key = draftKey(definitionId, semester);
    setDrafts((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  }

  function copyBaseline(group?: string) {
    setDrafts((current) => {
      const next = { ...current };
      entryRows.forEach((row) => {
        if (group && getMilestoneGroup(row.definition) !== group) return;
        next[draftKey(row.definition.id, row.semester)] = {
          ...next[draftKey(row.definition.id, row.semester)],
          startDate: row.baseline.start,
          endDate: row.baseline.end ?? "",
        };
      });
      return next;
    });
    state.toast(
      group ? `${group} baseline copied` : "All HEC dates adopted",
      "The official baseline dates remain editable until the submission is locked.",
    );
  }

  function clearDates() {
    setDrafts(createEmptyDrafts(activeDefinitions, semesters));
    state.toast(
      "Draft dates cleared",
      "The HEC baselines remain visible for comparison.",
    );
  }

  function toggleUnit(id: string) {
    setSelectedUnitIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function validateCurrentStep() {
    if (step === 0 && (!title.trim() || semesters.length === 0)) {
      state.toast(
        "Complete the academic context",
        "Add a title and select at least one applicable semester.",
      );
      return false;
    }
    if (
      step === 1 &&
      resolvedScopeType === "selected_delivery_units" &&
      selectedUnitIds.length === 0
    ) {
      state.toast(
        "Select delivery units",
        "Choose at least one teaching unit or college for this scope.",
      );
      return false;
    }
    if (
      step === 3 &&
      entryRows.some((row) => row.missing || row.needsReason)
    ) {
      state.toast(
        "Resolve review items",
        "Complete missing dates and provide a reason for every unauthorised difference.",
      );
      return false;
    }
    return true;
  }

  function nextStep() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(steps.length - 1, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function buildRecord(
    status: UniversityCalendarSubmission["status"] = "draft",
  ) {
    const id =
      existing?.id ??
      `cal-sub-sahya-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
    const record: UniversityCalendarSubmission = {
      id,
      universityId: "sahya",
      academicYearId,
      programmeType,
      title: title.trim(),
      version: existing?.version ?? "0.1",
      applicableSemesters: semesters,
      status,
      scopeType: resolvedScopeType,
      selectedDeliveryUnitIds:
        resolvedScopeType === "selected_delivery_units" ? selectedUnitIds : [],
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      submittedAt: existing?.submittedAt ?? null,
      reviewedAt: existing?.reviewedAt ?? null,
      lockedAt: existing?.lockedAt ?? null,
      reviewNote: existing?.reviewNote ?? "",
      declarationAccepted,
    };
    const entries = previewEntries.map((entry) => ({
      ...entry,
      id: `${id}-${entry.milestoneDefinitionId}-s${entry.semester}`,
      submissionId: id,
    }));
    return { record, entries };
  }

  function saveDraft() {
    const { record, entries } = buildRecord("draft");
    if (state.saveUniversityCalendarSubmission(record, entries)) {
      router.replace(
        `/university/calendar-submissions/new?submission=${record.id}`,
      );
    }
  }

  function submit() {
    if (
      entryRows.some((row) => row.missing || row.needsReason) ||
      !declarationAccepted
    ) {
      state.toast(
        "Submission is not ready",
        "Resolve all review items and accept the formal declaration.",
      );
      return;
    }
    const { record, entries } = buildRecord("draft");
    if (
      state.submitUniversityCalendarSubmission(record.id, {
        record,
        entries,
      })
    ) {
      router.push(`/university/calendar-submissions/${record.id}`);
    }
  }

  const scopePreview: UniversityCalendarSubmission = {
    id: "scope-preview",
    universityId: "sahya",
    academicYearId,
    programmeType,
    title,
    version: existing?.version ?? "0.1",
    applicableSemesters: semesters,
    status: "draft",
    scopeType: resolvedScopeType,
    selectedDeliveryUnitIds:
      resolvedScopeType === "selected_delivery_units" ? selectedUnitIds : [],
    createdAt: existing?.createdAt ?? "",
    submittedAt: null,
    reviewedAt: null,
    lockedAt: null,
    reviewNote: "",
    declarationAccepted,
  };

  return (
    <div className="cal-sub-page calendar-wizard-page">
      <header className="cal-wizard-header">
        <button
          className="cal-wizard-back"
          onClick={() => router.push("/university/calendar-submissions")}
        >
          <ArrowLeft size={15} /> Calendar submissions
        </button>
        <div>
          <p className="cal-sub-kicker">Guided annual submission</p>
          <h1>{existing ? "Continue calendar draft" : "New calendar submission"}</h1>
          <p>
            Enter the dates that will govern the selected delivery units. A
            supporting document cannot replace these structured fields.
          </p>
        </div>
        <button className="button button-secondary" onClick={saveDraft}>
          <Save size={15} /> Save Draft
        </button>
      </header>

      <nav className="cal-wizard-steps" aria-label="Submission progress">
        {steps.map((label, index) => (
          <button
            className={`${index === step ? "active" : ""} ${
              index < step ? "complete" : ""
            }`}
            key={label}
            onClick={() => {
              if (index <= step) setStep(index);
            }}
          >
            <span>{index < step ? <Check size={13} /> : index + 1}</span>
            <strong>{label}</strong>
          </button>
        ))}
      </nav>

      <main className="cal-wizard-shell">
        {step === 0 ? (
          <section className="cal-wizard-card">
            <div className="cal-wizard-section-head">
              <span><CalendarCheck2 size={18} /></span>
              <div>
                <p>Step 1</p>
                <h2>Academic Context</h2>
                <small>Identify the annual calendar and its semester coverage.</small>
              </div>
            </div>
            <div className="cal-wizard-form-grid">
              <label>
                <span>Academic year</span>
                <select
                  value={academicYearId}
                  onChange={(event) => setAcademicYearId(event.target.value)}
                >
                  {state.academicYears
                    .filter((year) => year.status !== "closed")
                    .map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.label} · {year.status}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                <span>Programme type</span>
                <select
                  value={programmeType}
                  onChange={(event) =>
                    setProgrammeType(event.target.value as ProgrammeType)
                  }
                >
                  <option value="FYUGP">FYUGP</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </label>
              <label className="wide">
                <span>Submission title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Annual academic calendar title"
                />
              </label>
              <fieldset className="wide cal-semester-picker">
                <legend>Applicable semesters</legend>
                <div>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <button
                      className={
                        semesters.includes(semester as SemesterNumber)
                          ? "selected"
                          : ""
                      }
                      key={semester}
                      onClick={() =>
                        toggleSemester(semester as SemesterNumber)
                      }
                      type="button"
                    >
                      {semesters.includes(semester as SemesterNumber) ? (
                        <Check size={12} />
                      ) : null}
                      Semester {semester}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>
        ) : null}

        {step === 1 ? (
          <section className="cal-wizard-card">
            <div className="cal-wizard-section-head">
              <span><Layers3 size={18} /></span>
              <div>
                <p>Step 2</p>
                <h2>Calendar Scope</h2>
                <small>Choose the delivery units that inherit this calendar.</small>
              </div>
            </div>
            <div className="cal-scope-note">
              <ShieldCheck size={17} />
              <p>
                The submitted university calendar is inherited by selected
                delivery units. Unit-specific changes require an approved exception.
              </p>
            </div>
            <div className="cal-scope-options">
              {[
                {
                  id: "all_delivery_units",
                  title: "All academic delivery units",
                  copy: "University teaching units, constituent colleges and affiliated colleges.",
                },
                {
                  id: "university_teaching_only",
                  title: "Direct university teaching units only",
                  copy: "Campus, departments and university centres only.",
                },
                {
                  id: "selected_delivery_units",
                  title: "Selected colleges or teaching units",
                  copy: "Choose an explicit set of delivery units below.",
                },
              ].map((option) => (
                <button
                  className={resolvedScopeType === option.id ? "selected" : ""}
                  key={option.id}
                  onClick={() =>
                    setScopeType(
                      option.id as UniversityCalendarSubmission["scopeType"],
                    )
                  }
                >
                  <span>
                    {resolvedScopeType === option.id ? <Check size={13} /> : null}
                  </span>
                  <div>
                    <strong>{option.title}</strong>
                    <small>{option.copy}</small>
                  </div>
                </button>
              ))}
            </div>
            {resolvedScopeType === "selected_delivery_units" ? (
              <div className="cal-unit-checklist">
                <div>
                  <strong>Select delivery units</strong>
                  <small>{selectedUnitIds.length} selected</small>
                </div>
                {sahyaUnits.map((unit) => (
                  <label key={unit.id}>
                    <input
                      checked={selectedUnitIds.includes(unit.id)}
                      onChange={() => toggleUnit(unit.id)}
                      type="checkbox"
                    />
                    <span>
                      <strong>{unit.name}</strong>
                      <small>
                        {unit.unitType.replaceAll("_", " ")} · {unit.district}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            ) : null}
            <div className="cal-inheritance-preview">
              <strong>Inherited coverage</strong>
              <p>
                {inheritanceSummary(scopePreview, state.academicDeliveryUnits)}
              </p>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="cal-wizard-card milestone-entry-card">
            <div className="cal-wizard-section-head milestone-entry-heading">
              <span><CalendarCheck2 size={18} /></span>
              <div>
                <p>Step 3</p>
                <h2>Enter Milestone Dates</h2>
                <small>
                  Fields adapt to the active HEC milestone definition.
                </small>
              </div>
              <div className="milestone-entry-actions">
                <button onClick={() => copyBaseline()}>
                  <CheckCircle2 size={14} /> Adopt All HEC Dates
                </button>
                <button onClick={clearDates}>
                  <RotateCcw size={14} /> Clear Draft Dates
                </button>
                <button
                  onClick={() =>
                    setExpandedGroups(
                      expandedGroups.length === calendarSubmissionGroups.length
                        ? []
                        : [...calendarSubmissionGroups],
                    )
                  }
                >
                  {expandedGroups.length === calendarSubmissionGroups.length ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  {expandedGroups.length === calendarSubmissionGroups.length
                    ? "Collapse All"
                    : "Expand All"}
                </button>
                <button
                  className={showDeviationsOnly ? "active" : ""}
                  onClick={() => setShowDeviationsOnly((current) => !current)}
                >
                  <CircleAlert size={14} /> Show Deviations Only
                </button>
              </div>
            </div>
            <div className="milestone-section-list">
              {calendarSubmissionGroups.map((group) => {
                const groupRows = entryRows.filter(
                  (row) =>
                    getMilestoneGroup(row.definition) === group &&
                    (!showDeviationsOnly ||
                      row.ragStatus !== "green" ||
                      row.missing),
                );
                const expanded = expandedGroups.includes(group);
                return (
                  <section className="milestone-section" key={group}>
                    <header>
                      <button
                        onClick={() =>
                          setExpandedGroups((current) =>
                            current.includes(group)
                              ? current.filter((item) => item !== group)
                              : [...current, group],
                          )
                        }
                      >
                        {expanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        <span>
                          <strong>{group}</strong>
                          <small>
                            {groupRows.length} structured field
                            {groupRows.length === 1 ? "" : "s"}
                          </small>
                        </span>
                      </button>
                      <button onClick={() => copyBaseline(group)}>
                        <Copy size={13} /> Copy Baseline Date for this Section
                      </button>
                    </header>
                    {expanded ? (
                      <div className="milestone-entry-list">
                        {groupRows.map((row) => (
                          <article
                            className={`milestone-entry-row ${row.ragStatus}`}
                            key={`${row.definition.id}-${row.semester}`}
                          >
                            <div className="milestone-definition-copy">
                              <span>{row.definition.code}</span>
                              <h3>{row.definition.title}</h3>
                              <p>{row.definition.description}</p>
                              <small>
                                Semester {row.semester} ·{" "}
                                {row.definition.dateInputType.replaceAll("_", " ")} ·{" "}
                                {resolvedScopeType.replaceAll("_", " ")}
                              </small>
                            </div>
                            <div className="milestone-baseline">
                              <span>HEC baseline / permitted window</span>
                              <strong>
                                {formatCalendarDateRange(
                                  row.baseline.start,
                                  row.baseline.end,
                                )}
                              </strong>
                              <small>
                                {row.definition.alignmentRule === "exact_date"
                                  ? "Exact date required"
                                  : row.definition.alignmentRule ===
                                      "reporting_only"
                                    ? "Reporting milestone"
                                    : `Tolerance −${row.definition.toleranceBeforeDays} / +${row.definition.toleranceAfterDays} days`}
                              </small>
                            </div>
                            <div className="milestone-date-fields">
                              <label>
                                <span>
                                  {row.definition.dateInputType === "deadline"
                                    ? "University deadline"
                                    : row.definition.dateInputType ===
                                        "date_range"
                                      ? "From"
                                      : "University proposed date"}
                                </span>
                                <input
                                  type="date"
                                  value={row.draft.startDate}
                                  onChange={(event) =>
                                    updateDraft(
                                      row.definition.id,
                                      row.semester,
                                      { startDate: event.target.value },
                                    )
                                  }
                                />
                              </label>
                              {row.definition.dateInputType === "date_range" ? (
                                <label>
                                  <span>To</span>
                                  <input
                                    type="date"
                                    value={row.draft.endDate}
                                    onChange={(event) =>
                                      updateDraft(
                                        row.definition.id,
                                        row.semester,
                                        { endDate: event.target.value },
                                      )
                                    }
                                  />
                                </label>
                              ) : null}
                            </div>
                            <div className="milestone-alignment">
                              <span
                                className={`cal-alignment-chip ${row.ragStatus}`}
                              >
                                {row.ragStatus === "green" ? (
                                  <CheckCircle2 size={13} />
                                ) : row.ragStatus === "red" ? (
                                  <AlertTriangle size={13} />
                                ) : (
                                  <CircleAlert size={13} />
                                )}
                                {row.ragStatus === "green"
                                  ? "Aligned"
                                  : row.ragStatus === "red"
                                    ? "Outside rule"
                                    : "Incomplete"}
                              </span>
                              <strong>{formatVariance(row.varianceDays)}</strong>
                            </div>
                            {(row.ragStatus === "red" ||
                              Boolean(row.draft.reason)) && (
                              <label className="milestone-reason">
                                <span>
                                  Reason for difference{" "}
                                  {row.ragStatus === "red" ? "(required)" : ""}
                                </span>
                                <textarea
                                  value={row.draft.reason}
                                  onChange={(event) =>
                                    updateDraft(
                                      row.definition.id,
                                      row.semester,
                                      { reason: event.target.value },
                                    )
                                  }
                                  placeholder="Explain the operational reason and affected units"
                                />
                              </label>
                            )}
                          </article>
                        ))}
                        {!groupRows.length ? (
                          <div className="milestone-no-deviations">
                            <CheckCircle2 size={17} />
                            No deviations in this section.
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="cal-wizard-card">
            <div className="cal-wizard-section-head">
              <span><CircleAlert size={18} /></span>
              <div>
                <p>Step 4</p>
                <h2>Review Deviations</h2>
                <small>
                  Resolve incomplete fields and explain every date outside the
                  permitted HEC rule.
                </small>
              </div>
            </div>
            <div className="cal-review-summary">
              <span className="green">
                <CheckCircle2 size={15} /> {counts.green} aligned
              </span>
              <span className="amber">
                <CircleAlert size={15} /> {counts.amber} incomplete
              </span>
              <span className="red">
                <AlertTriangle size={15} /> {counts.red} outside rule
              </span>
            </div>
            <div className="cal-review-list">
              {entryRows
                .filter(
                  (row) =>
                    row.ragStatus !== "green" ||
                    row.missing ||
                    row.needsReason ||
                    Boolean(row.draft.reason),
                )
                .map((row) => (
                  <article key={`${row.definition.id}-${row.semester}`}>
                    <span
                      className={`cal-alignment-icon ${row.ragStatus}`}
                    >
                      {row.ragStatus === "red" ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <CircleAlert size={16} />
                      )}
                    </span>
                    <div>
                      <strong>
                        {row.definition.title} · Semester {row.semester}
                      </strong>
                      <small>
                        HEC:{" "}
                        {formatCalendarDateRange(
                          row.baseline.start,
                          row.baseline.end,
                        )}{" "}
                        · University:{" "}
                        {formatCalendarDateRange(
                          row.draft.startDate,
                          row.draft.endDate || null,
                        )}
                      </small>
                      <p>
                        {row.missing
                          ? "A required structured date is incomplete."
                          : row.needsReason
                            ? "This unauthorised difference requires a reason."
                            : row.draft.reason || row.reason}
                      </p>
                    </div>
                    <button onClick={() => setStep(2)}>Edit milestone</button>
                  </article>
                ))}
              {!entryRows.some(
                (row) =>
                  row.ragStatus !== "green" ||
                  row.missing ||
                  row.needsReason ||
                  Boolean(row.draft.reason),
              ) ? (
                <div className="cal-review-clear">
                  <CheckCircle2 size={24} />
                  <h3>Every milestone is aligned</h3>
                  <p>No deviations or missing structured dates require review.</p>
                </div>
              ) : null}
            </div>
            <div className="cal-supporting-reference">
              <FileText size={18} />
              <div>
                <strong>Optional supporting reference</strong>
                <p>
                  Simulate a document reference for context. It does not become
                  the authoritative calendar.
                </p>
              </div>
              <input
                value={supportingReference}
                onChange={(event) =>
                  setSupportingReference(event.target.value)
                }
                placeholder="e.g. Academic Council minutes extract"
              />
              <button
                onClick={() =>
                  state.toast(
                    "Supporting reference noted",
                    supportingReference.trim()
                      ? "The reference is attached as supporting context only."
                      : "Enter a reference description before attaching.",
                  )
                }
              >
                Simulate attachment
              </button>
            </div>
          </section>
        ) : null}

        {step === 4 ? (
          <section className="cal-wizard-card">
            <div className="cal-wizard-section-head">
              <span><ShieldCheck size={18} /></span>
              <div>
                <p>Step 5</p>
                <h2>Preview and Submit</h2>
                <small>
                  Confirm the structured record that HEC will review.
                </small>
              </div>
            </div>
            <div className="cal-preview-hero">
              <div>
                <span>{programmeType} · {selectedAcademicYear?.label}</span>
                <h2>{title}</h2>
                <p>
                  Semester {semesters.join(" and ")} ·{" "}
                  {inheritanceSummary(
                    scopePreview,
                    state.academicDeliveryUnits,
                  )}
                </p>
              </div>
              <strong>Version {existing?.version ?? "0.1"}</strong>
            </div>
            <div className="cal-preview-counts">
              <div>
                <span>Structured milestones</span>
                <strong>{entryRows.length}</strong>
              </div>
              <div className="green">
                <span>Aligned</span>
                <strong>{counts.green}</strong>
              </div>
              <div className="amber">
                <span>Amber</span>
                <strong>{counts.amber}</strong>
              </div>
              <div className="red">
                <span>Red</span>
                <strong>{counts.red}</strong>
              </div>
            </div>
            <label className="cal-declaration">
              <input
                checked={declarationAccepted}
                onChange={(event) =>
                  setDeclarationAccepted(event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>University declaration</strong>
                <small>
                  I confirm that these structured milestone dates constitute the
                  university calendar submitted for HEC review, and that all
                  differences have been declared with reasons.
                </small>
              </span>
            </label>
            <div className="cal-submit-callout">
              <LockKeyholeMessage />
              <button className="button button-primary" onClick={submit}>
                <Send size={15} /> Submit to HEC
              </button>
            </div>
          </section>
        ) : null}
      </main>

      <footer className="cal-wizard-footer">
        <button
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <ArrowLeft size={14} /> Previous
        </button>
        <span>
          Step {step + 1} of {steps.length}
        </span>
        {step < steps.length - 1 ? (
          <button className="next" onClick={nextStep}>
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={saveDraft}>
            <Save size={14} /> Save without submitting
          </button>
        )}
      </footer>
    </div>
  );
}

function LockKeyholeMessage() {
  return (
    <div>
      <ShieldCheck size={18} />
      <p>
        Once HEC accepts and locks this calendar, direct date editing is removed.
        Future revisions must use the formal change-request workflow.
      </p>
    </div>
  );
}
