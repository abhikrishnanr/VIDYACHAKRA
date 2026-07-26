"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CircleAlert,
  Copy,
  GraduationCap,
  Layers3,
  Minus,
  Plus,
  Save,
  ShieldCheck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AcademicDeliveryUnitSelector } from "@/components/domain/AcademicDeliveryUnitSelector";
import { CourseMasterCombobox } from "@/components/domain/CourseMasterCombobox";
import { Modal } from "@/components/shared/Modal";
import { findDuplicateOffering } from "@/lib/course-offerings";
import { useDemoState } from "@/lib/demo-state";
import type {
  CourseBatch,
  CourseOffering,
} from "@/lib/types";

type BatchDraft = {
  clientKey: string;
  label: string;
  capacity: string;
  active: boolean;
};

const emptyBatch = (): BatchDraft => ({
  clientKey: `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
  label: "Batch A",
  capacity: "40",
  active: true,
});

export function CourseOfferingForm() {
  const state = useDemoState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get("offering");
  const existing = requestedId
    ? state.courseOfferings.find((offering) => offering.id === requestedId)
    : undefined;
  const loadedRef = useRef<string | null>(null);

  const [academicYearId, setAcademicYearId] = useState("ay-2026-27");
  const [deliveryUnitId, setDeliveryUnitId] = useState<string | null>(null);
  const [courseMasterId, setCourseMasterId] = useState<string | null>(null);
  const [mode, setMode] = useState<CourseOffering["mode"]>("in_person");
  const [shift, setShift] = useState<CourseOffering["shift"]>("day");
  const [approvalReference, setApprovalReference] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("2026-06-01");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [offeringStatus, setOfferingStatus] =
    useState<CourseOffering["offeringStatus"]>("draft");
  const [batches, setBatches] = useState<BatchDraft[]>(() => [emptyBatch()]);
  const [courseHelpOpen, setCourseHelpOpen] = useState(false);

  useEffect(() => {
    if (
      !state.hydrated ||
      !existing ||
      loadedRef.current === existing.id
    ) {
      return;
    }
    loadedRef.current = existing.id;
    setAcademicYearId(existing.academicYearId);
    setDeliveryUnitId(existing.deliveryUnitId);
    setCourseMasterId(existing.courseMasterId);
    setMode(existing.mode);
    setShift(existing.shift);
    setApprovalReference(existing.approvalReference);
    setEffectiveFrom(existing.effectiveFrom);
    setEffectiveTo(existing.effectiveTo ?? "");
    setOfferingStatus(existing.offeringStatus);
    setBatches(
      state.courseBatches
        .filter((batch) => batch.courseOfferingId === existing.id)
        .map((batch) => ({
          clientKey: batch.id,
          label: batch.batchLabel,
          capacity: String(batch.sanctionedCapacity),
          active: batch.active,
        })),
    );
  }, [existing, state.courseBatches, state.hydrated]);

  const selectedCourse = state.courseMasters.find(
    (course) => course.id === courseMasterId,
  );
  const selectedUnit = state.academicDeliveryUnits.find(
    (unit) => unit.id === deliveryUnitId,
  );
  const selectedYear = state.academicYears.find(
    (year) => year.id === academicYearId,
  );
  const totalCapacity = batches
    .filter((batch) => batch.active)
    .reduce(
      (total, batch) => total + (Number(batch.capacity) || 0),
      0,
    );
  const duplicate = useMemo(() => {
    if (!deliveryUnitId || !courseMasterId) return undefined;
    return findDuplicateOffering(
      {
        id: existing?.id ?? "new-course-offering",
        academicYearId,
        deliveryUnitId,
        courseMasterId,
        mode,
        shift,
      },
      state.courseOfferings,
    );
  }, [
    academicYearId,
    courseMasterId,
    deliveryUnitId,
    existing?.id,
    mode,
    shift,
    state.courseOfferings,
  ]);

  function updateBatch(
    key: string,
    patch: Partial<Omit<BatchDraft, "clientKey">>,
  ) {
    setBatches((current) =>
      current.map((batch) =>
        batch.clientKey === key ? { ...batch, ...patch } : batch,
      ),
    );
  }

  function addBatch() {
    setBatches((current) => [
      ...current,
      {
        clientKey: `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        label: `Batch ${String.fromCharCode(65 + current.length)}`,
        capacity: "40",
        active: true,
      },
    ]);
  }

  function removeBatch(key: string) {
    if (batches.length === 1) {
      state.toast(
        "One batch is required",
        "An offering must retain at least one approved batch row.",
      );
      return;
    }
    setBatches((current) =>
      current.filter((batch) => batch.clientKey !== key),
    );
  }

  function copyPreviousCapacity() {
    if (!deliveryUnitId || !courseMasterId) {
      state.toast(
        "Select the academic context",
        "Choose a delivery unit and official course before copying capacity.",
      );
      return;
    }
    const years = [...state.academicYears].sort((a, b) =>
      a.startDate.localeCompare(b.startDate),
    );
    const yearIndex = years.findIndex((year) => year.id === academicYearId);
    const previousYear = years[yearIndex - 1];
    if (!previousYear) {
      state.toast(
        "No previous academic year",
        "The selected academic year has no earlier offering to copy.",
      );
      return;
    }
    const previousOffering = state.courseOfferings.find(
      (offering) =>
        offering.academicYearId === previousYear.id &&
        offering.deliveryUnitId === deliveryUnitId &&
        offering.courseMasterId === courseMasterId &&
        offering.mode === mode &&
        offering.shift === shift,
    );
    if (!previousOffering) {
      state.toast(
        "Previous offering not found",
        "No matching delivery unit, course, mode and shift combination exists in the previous year.",
      );
      return;
    }
    const previousBatches = state.courseBatches.filter(
      (batch) => batch.courseOfferingId === previousOffering.id,
    );
    setBatches(
      previousBatches.map((batch, index) => ({
        clientKey: `copy-${index}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        label: batch.batchLabel,
        capacity: String(batch.sanctionedCapacity),
        active: batch.active,
      })),
    );
    state.toast(
      "Previous capacity copied",
      `${previousBatches.length} batch row${previousBatches.length === 1 ? "" : "s"} copied from ${previousYear.label}.`,
    );
  }

  function save() {
    if (!deliveryUnitId || !courseMasterId || !effectiveFrom) {
      state.toast(
        "Complete the academic context",
        "Academic year, delivery unit, official course and effective-from date are required.",
      );
      return;
    }
    if (
      batches.some(
        (batch) =>
          !batch.label.trim() ||
          !Number.isFinite(Number(batch.capacity)) ||
          Number(batch.capacity) <= 0,
      )
    ) {
      state.toast(
        "Complete approved batches",
        "Every batch needs a label and positive sanctioned capacity.",
      );
      return;
    }
    if (duplicate) {
      state.toast(
        "Duplicate offering blocked",
        "Open the existing offering instead of saving this combination.",
      );
      return;
    }
    const id =
      existing?.id ??
      `off-sahya-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
    const record: CourseOffering = {
      id,
      academicYearId,
      universityId: "sahya",
      deliveryUnitId,
      courseMasterId,
      offeringStatus,
      mode,
      shift,
      approvalReference: approvalReference.trim(),
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      reviewNote: existing?.reviewNote ?? "",
      lastUpdatedAt: existing?.lastUpdatedAt ?? new Date().toISOString(),
    };
    const approvedBatches: CourseBatch[] = batches.map((batch, index) => ({
      id: batch.clientKey.startsWith("batch-")
        ? batch.clientKey
        : `batch-${id}-${index + 1}`,
      courseOfferingId: id,
      batchLabel: batch.label.trim(),
      sanctionedCapacity: Math.round(Number(batch.capacity)),
      active: batch.active,
    }));
    if (state.saveCourseOffering(record, approvedBatches)) {
      window.setTimeout(
        () => router.push(`/university/course-offerings/${id}`),
        0,
      );
    }
  }

  return (
    <div className="offering-page offering-form-page">
      <header className="offering-form-header">
        <button
          onClick={() => router.push("/university/course-offerings")}
        >
          <ArrowLeft size={14} /> Course offerings
        </button>
        <div>
          <p className="offering-kicker">Guided offering setup</p>
          <h1>{existing ? "Update course offering draft" : "Create course offering"}</h1>
          <p>
            Bind one active HEC course to one academic delivery unit and define
            sanctioned capacity through approved batch rows.
          </p>
        </div>
        <button className="button button-primary" onClick={save}>
          <Save size={15} /> Save Offering
        </button>
      </header>

      {duplicate ? (
        <section className="offering-duplicate-warning">
          <AlertTriangle size={18} />
          <div>
            <strong>Duplicate offering combination already exists</strong>
            <p>
              The same academic year, delivery unit, course, mode and shift are
              already recorded under {duplicate.id}. Saving is blocked.
            </p>
          </div>
          <button
            onClick={() =>
              router.push(`/university/course-offerings/${duplicate.id}`)
            }
          >
            Open existing <ArrowRight size={13} />
          </button>
        </section>
      ) : null}

      <div className="offering-form-layout">
        <main>
          <section className="offering-form-section">
            <header>
              <span><CalendarDays size={19} /></span>
              <div>
                <p>Section 1</p>
                <h2>Academic Context</h2>
                <small>Choose from shared HEC and institution master records.</small>
              </div>
            </header>
            <div className="offering-form-grid">
              <label>
                <span>Academic year</span>
                <select
                  value={academicYearId}
                  onChange={(event) => {
                    const yearId = event.target.value;
                    setAcademicYearId(yearId);
                    const year = state.academicYears.find(
                      (item) => item.id === yearId,
                    );
                    if (year) setEffectiveFrom(year.startDate);
                  }}
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
              <div className="wide">
                <AcademicDeliveryUnitSelector
                  universityId="sahya"
                  value={deliveryUnitId}
                  onChange={setDeliveryUnitId}
                />
              </div>
              <div className="wide offering-course-selector">
                <CourseMasterCombobox
                  value={courseMasterId}
                  onChange={setCourseMasterId}
                  label="Course from HEC Course Master"
                />
                <button
                  type="button"
                  onClick={() => setCourseHelpOpen(true)}
                >
                  Course not listed in the HEC master?
                </button>
              </div>
            </div>
            {selectedCourse ? (
              <div className="offering-course-readonly">
                <span><GraduationCap size={20} /></span>
                <div>
                  <small>Selected official course</small>
                  <strong>{selectedCourse.courseName}</strong>
                  <p>{selectedCourse.courseCode}</p>
                </div>
                <dl>
                  <div><dt>Duration</dt><dd>{selectedCourse.durationYears} years</dd></div>
                  <div><dt>Total semesters</dt><dd>{selectedCourse.totalSemesters}</dd></div>
                  <div><dt>Discipline</dt><dd>{selectedCourse.discipline}</dd></div>
                  <div><dt>Programme type</dt><dd>{selectedCourse.programmeType}</dd></div>
                </dl>
              </div>
            ) : null}
          </section>

          <section className="offering-form-section">
            <header>
              <span><BookOpenCheck size={19} /></span>
              <div>
                <p>Section 2</p>
                <h2>Offering Details</h2>
                <small>Record how and when this unit delivers the course.</small>
              </div>
            </header>
            <div className="offering-form-grid">
              <label>
                <span>Mode</span>
                <select
                  value={mode}
                  onChange={(event) =>
                    setMode(event.target.value as CourseOffering["mode"])
                  }
                >
                  <option value="in_person">In person</option>
                  <option value="blended">Blended</option>
                  <option value="online">Online</option>
                </select>
              </label>
              <label>
                <span>Shift</span>
                <select
                  value={shift}
                  onChange={(event) =>
                    setShift(event.target.value as CourseOffering["shift"])
                  }
                >
                  <option value="day">Day</option>
                  <option value="evening">Evening</option>
                  <option value="weekend">Weekend</option>
                </select>
              </label>
              <label className="wide">
                <span>Approval reference</span>
                <input
                  value={approvalReference}
                  onChange={(event) =>
                    setApprovalReference(event.target.value)
                  }
                  placeholder="HEC/OFFER/2026/..."
                />
                {!approvalReference.trim() ? (
                  <small>
                    <CircleAlert size={11} /> HEC cannot verify without an
                    approval reference.
                  </small>
                ) : null}
              </label>
              <label>
                <span>Effective from</span>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                />
              </label>
              <label>
                <span>Effective to</span>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(event) => setEffectiveTo(event.target.value)}
                />
              </label>
              <label className="wide">
                <span>Offering status</span>
                <select
                  value={offeringStatus}
                  onChange={(event) =>
                    setOfferingStatus(
                      event.target.value as CourseOffering["offeringStatus"],
                    )
                  }
                >
                  <option value="draft">Save as Draft</option>
                  <option value="submitted">Submit for HEC verification</option>
                  {existing?.offeringStatus === "returned" ? (
                    <option value="returned">Returned for correction</option>
                  ) : null}
                </select>
              </label>
            </div>
          </section>

          <section className="offering-form-section batch-section">
            <header>
              <span><Layers3 size={19} /></span>
              <div>
                <p>Section 3</p>
                <h2>Approved Batches</h2>
                <small>Sanctioned capacity is the sum of active batch rows.</small>
              </div>
              <button onClick={copyPreviousCapacity}>
                <Copy size={13} /> Copy Previous Academic Year Capacity
              </button>
            </header>
            <div className="batch-editor-head batch-editor-grid">
              <span>Batch label</span>
              <span>Sanctioned capacity</span>
              <span>Active status</span>
              <span />
            </div>
            <div className="batch-editor-list">
              {batches.map((batch) => (
                <div className="batch-editor-row batch-editor-grid" key={batch.clientKey}>
                  <input
                    value={batch.label}
                    onChange={(event) =>
                      updateBatch(batch.clientKey, {
                        label: event.target.value,
                      })
                    }
                    aria-label="Batch label"
                  />
                  <input
                    type="number"
                    min="1"
                    value={batch.capacity}
                    onChange={(event) =>
                      updateBatch(batch.clientKey, {
                        capacity: event.target.value,
                      })
                    }
                    aria-label="Sanctioned capacity"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={batch.active}
                      onChange={(event) =>
                        updateBatch(batch.clientKey, {
                          active: event.target.checked,
                        })
                      }
                    />
                    <span>{batch.active ? "Active batch" : "Inactive batch"}</span>
                  </label>
                  <button
                    onClick={() => removeBatch(batch.clientKey)}
                    aria-label={`Remove ${batch.label}`}
                  >
                    <Minus size={14} /> Remove Draft Batch
                  </button>
                </div>
              ))}
            </div>
            <footer className="batch-editor-footer">
              <button onClick={addBatch}>
                <Plus size={14} /> Add Another Batch
              </button>
              <div>
                <span>Total Sanctioned Capacity</span>
                <strong>{totalCapacity}</strong>
                <small>Calculated from active approved batches</small>
              </div>
            </footer>
          </section>
        </main>

        <aside className="offering-form-summary">
          <span><ShieldCheck size={18} /></span>
          <p>Offering definition</p>
          <h2>{selectedCourse?.shortName ?? "Select an official course"}</h2>
          <dl>
            <div><dt>Academic year</dt><dd>{selectedYear?.label ?? "—"}</dd></div>
            <div><dt>Delivery unit</dt><dd>{selectedUnit?.shortName ?? "Not selected"}</dd></div>
            <div><dt>Mode and shift</dt><dd>{mode.replaceAll("_", " ")} · {shift}</dd></div>
            <div><dt>Approved batches</dt><dd>{batches.filter((batch) => batch.active).length}</dd></div>
            <div><dt>Sanctioned capacity</dt><dd>{totalCapacity}</dd></div>
          </dl>
          <div>
            <Check size={14} />
            Total capacity cannot be edited separately from the batch rows.
          </div>
        </aside>
      </div>

      <Modal
        open={courseHelpOpen}
        title="Course not listed in the HEC master?"
        onClose={() => setCourseHelpOpen(false)}
      >
        <div className="modal-body offering-course-help">
          <GraduationCap size={28} />
          <div>
            <strong>Universities cannot create new course names.</strong>
            <p>Send a master-data request to HEC.</p>
            <small>
              There is no free-text workaround. The course becomes selectable
              only after HEC activates it in the official Course Master.
            </small>
          </div>
        </div>
        <div className="modal-actions">
          <button
            className="button button-primary"
            onClick={() => setCourseHelpOpen(false)}
          >
            Understood
          </button>
        </div>
      </Modal>
    </div>
  );
}
