"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  Check,
  CircleAlert,
  GraduationCap,
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
import type { CourseOffering } from "@/lib/types";

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
  const [courseHelpOpen, setCourseHelpOpen] = useState(false);

  useEffect(() => {
    if (!state.hydrated || !existing || loadedRef.current === existing.id) return;
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
  }, [existing, state.hydrated]);

  const selectedCourse = state.courseMasters.find(
    (course) => course.id === courseMasterId,
  );
  const selectedUnit = state.academicDeliveryUnits.find(
    (unit) => unit.id === deliveryUnitId,
  );
  const selectedYear = state.academicYears.find(
    (year) => year.id === academicYearId,
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

  function save() {
    if (!deliveryUnitId || !courseMasterId || !effectiveFrom) {
      state.toast(
        "Complete the academic context",
        "Academic year, delivery unit, official course and effective-from date are required.",
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
    if (state.saveCourseOffering(record)) {
      window.setTimeout(
        () => router.push(`/university/course-offerings/${id}`),
        0,
      );
    }
  }

  return (
    <div className="offering-page offering-form-page">
      <header className="offering-form-header">
        <button onClick={() => router.push("/university/course-offerings")}>
          <ArrowLeft size={14} /> Course offerings
        </button>
        <div>
          <p className="offering-kicker">Guided offering setup</p>
          <h1>{existing ? "Update course offering draft" : "Create course offering"}</h1>
          <p>
            Select one active HEC course and link it to the academic delivery
            unit where it is offered.
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
                <button type="button" onClick={() => setCourseHelpOpen(true)}>
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
                  onChange={(event) => setApprovalReference(event.target.value)}
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
        </main>

        <aside className="offering-form-summary">
          <span><ShieldCheck size={18} /></span>
          <p>Offering definition</p>
          <h2>{selectedCourse?.shortName ?? "Select an official course"}</h2>
          <dl>
            <div><dt>Academic year</dt><dd>{selectedYear?.label ?? "—"}</dd></div>
            <div><dt>Delivery unit</dt><dd>{selectedUnit?.shortName ?? "Not selected"}</dd></div>
            <div><dt>Course code</dt><dd>{selectedCourse?.courseCode ?? "Not selected"}</dd></div>
            <div><dt>Mode and shift</dt><dd>{mode.replaceAll("_", " ")} · {shift}</dd></div>
          </dl>
          <div>
            <Check size={14} />
            Universities can select only active HEC Course Master records.
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
              The course becomes selectable only after HEC activates it in the
              official Course Master.
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
