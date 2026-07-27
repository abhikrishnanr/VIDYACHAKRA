"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Building2,
  Edit3,
  GraduationCap,
  Landmark,
  MapPin,
  Network,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useId, useState, type FormEvent } from "react";
import { Modal } from "@/components/shared/Modal";
import { PageHeader } from "@/components/shared/PageHeader";
import { RagBadge } from "@/components/shared/RagBadge";
import { useDemoState } from "@/lib/demo-state";
import {
  getUnitMetrics,
  getUniversityMetrics,
  isCollegeDeliveryUnit,
  operatingModelLabels,
  unitTypeLabels,
} from "@/lib/institution-structure";
import type {
  AcademicDeliveryUnit,
  DeliveryUnitType,
  UniversityOperatingModel,
} from "@/lib/types";

function operatingModelWarning(
  model: UniversityOperatingModel,
  unitType: DeliveryUnitType,
) {
  if (model === "teaching_only" && unitType === "affiliated_college") {
    return "Teaching universities do not normally add affiliated colleges. Confirm the HEC classification before using this unit type.";
  }
  if (
    model === "affiliating" &&
    ["university_campus", "university_department", "university_centre"].includes(
      unitType,
    )
  ) {
    return "This affiliating university has no direct teaching unit in the current demonstration. HEC may need to review its operating model.";
  }
  return "";
}

export function InstitutionStructureDetail({
  id,
  workspace,
}: {
  id: string;
  workspace: "hec" | "university";
}) {
  const state = useDemoState();
  const university = state.universityProfiles.find((item) => item.id === id);
  const [addOpen, setAddOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [nextModel, setNextModel] = useState<UniversityOperatingModel>(
    university?.operatingModel ?? "hybrid",
  );
  const [newUnit, setNewUnit] = useState<AcademicDeliveryUnit | null>(null);
  const draftUnitId = useId().replaceAll(":", "");

  if (!university) {
    return (
      <section className="structure-not-found">
        <Landmark size={30} />
        <h1>University structure not found</h1>
        <p>This institution is not part of the current demonstration registry.</p>
        <Link className="button button-primary" href="/hec/institutions">
          Return to institution directory
        </Link>
      </section>
    );
  }

  const metrics = getUniversityMetrics({
    university,
    units: state.academicDeliveryUnits,
    courseOfferings: state.courseOfferings,
    calendarSubmissions: state.universityCalendarSubmissions,
    requestStatus: state.requestStatus,
    masterCalendarVersion: state.masterCalendarVersion,
  });
  const canChangeModel =
    workspace === "hec" && state.activeRole === "administrator";
  const canAdd = workspace === "university" && state.activeRole === "university";
  const commencementYear = (unit: AcademicDeliveryUnit) =>
    state.academicYears.find(
      (year) => year.id === unit.teachingCommencedAcademicYearId,
    )?.label ?? "Not recorded";

  function beginAdd() {
    if (!university) return;
    setNewUnit({
      id: `du-${university.id}-${draftUnitId}-${state.academicDeliveryUnits.length + 1}`,
      universityId: university.id,
      name: "",
      shortName: "",
      unitType:
        university.operatingModel === "affiliating"
          ? "affiliated_college"
          : "university_department",
      district: university.district,
      institutionCode: "",
      active: true,
      teachingCommencedAcademicYearId: state.defaultAcademicYearId,
    });
    setAddOpen(true);
  }

  function saveUnit(event: FormEvent) {
    event.preventDefault();
    if (!newUnit) return;
    if (
      !newUnit.name ||
      !newUnit.shortName ||
      !newUnit.institutionCode ||
      !newUnit.district
    ) {
      state.toast(
        "Complete the delivery unit",
        "Name, short name, institution code and district are required.",
      );
      return;
    }
    if (state.saveAcademicDeliveryUnit(newUnit)) {
      setAddOpen(false);
      setNewUnit(null);
    }
  }

  const renderUnit = (unit: AcademicDeliveryUnit) => {
    const unitMetrics = getUnitMetrics({
      unit,
      courseOfferings: state.courseOfferings,
    });
    const unitCourses = unitMetrics.distinctCourseIds
      .map((courseId) =>
        state.courseMasters.find((course) => course.id === courseId),
      )
      .filter(Boolean);
    const UnitIcon = isCollegeDeliveryUnit(unit) ? Building2 : Landmark;
    return (
      <article className="structure-unit-card" key={unit.id}>
        <div className="structure-unit-icon">
          <UnitIcon size={19} aria-hidden="true" />
        </div>
        <div className="structure-unit-copy">
          <div>
            <span className={`unit-type-badge type-${unit.unitType}`}>
              {unitTypeLabels[unit.unitType]}
            </span>
            {!unit.active ? <span className="unit-inactive-badge">Inactive</span> : null}
          </div>
          <h3>{unit.name}</h3>
          <p>
            {unit.institutionCode} · <MapPin size={11} /> {unit.district}
          </p>
          <small>Teaching commenced {commencementYear(unit)}</small>
        </div>
        <div className="structure-unit-metrics">
          <span>
            <GraduationCap size={14} />
            <strong>{unitCourses.length}</strong>
            <small>courses</small>
          </span>
          <span>
            <BookOpenCheck size={14} />
            <strong>{unitMetrics.verifiedOfferings}</strong>
            <small>verified</small>
          </span>
        </div>
      </article>
    );
  };

  return (
    <div className="institution-structure-page">
      <Link
        className="structure-back-link"
        href={workspace === "hec" ? "/hec/institutions" : "/university/dashboard"}
      >
        <ArrowLeft size={14} />
        {workspace === "hec" ? "Institution directory" : "University dashboard"}
      </Link>

      <PageHeader
        eyebrow={
          workspace === "hec"
            ? "HEC Institution Structure"
            : "University Institution Structure"
        }
        title={university.name}
        description={
          workspace === "hec"
            ? "One institutional hierarchy connecting direct teaching units and colleges to the same course-delivery model."
            : "Maintain the university campuses, schools and colleges that deliver official HEC courses."
        }
        actions={
          canAdd ? (
            <button className="button button-primary" onClick={beginAdd}>
              <Plus size={16} /> Add delivery unit
            </button>
          ) : workspace === "hec" ? (
            <>
              <Link className="button button-secondary" href="/hec/course-offerings">
                View Course Offerings <GraduationCap size={15} />
              </Link>
              <Link className="button button-secondary" href="/hec/compliance">
                View in Compliance Matrix <ArrowRight size={15} />
              </Link>
            </>
          ) : null
        }
      />

      <section className="structure-identity-band">
        <div className="structure-model-icon">
          {university.operatingModel === "hybrid" ? (
            <Network size={28} aria-hidden="true" />
          ) : university.operatingModel === "affiliating" ? (
            <Building2 size={28} aria-hidden="true" />
          ) : (
            <Landmark size={28} aria-hidden="true" />
          )}
        </div>
        <div className="structure-model-copy">
          <span>Operating model</span>
          <h2>{operatingModelLabels[university.operatingModel]}</h2>
          <p>
            {university.operatingModel === "teaching_only"
              ? "Academic delivery is owned by university campuses, schools and centres. No affiliated colleges are registered."
              : university.operatingModel === "affiliating"
                ? "Academic delivery is owned by colleges. No direct university teaching unit is registered in this demonstration."
                : "The university teaches directly and also governs affiliated or constituent colleges."}
          </p>
        </div>
        <div className="structure-model-summary">
          <span>
            <strong>{metrics.directUnits.length}</strong>
            <small>Direct units</small>
          </span>
          <span>
            <strong>
              {metrics.constituentColleges.length +
                metrics.affiliatedColleges.length}
            </strong>
            <small>Colleges</small>
          </span>
          <span>
            <strong>{metrics.offerings.length}</strong>
            <small>Offerings</small>
          </span>
        </div>
        {canChangeModel ? (
          <button
            className="structure-model-edit"
            onClick={() => {
              setNextModel(university.operatingModel);
              setModelOpen(true);
            }}
          >
            <Edit3 size={15} /> Change classification
          </button>
        ) : (
          <span className="structure-model-locked">
            <ShieldCheck size={15} />
            {workspace === "university"
              ? "HEC-controlled classification"
              : "Classification is read only"}
          </span>
        )}
      </section>

      {university.id === "sahya" && state.masterCalendarVersion !== "1.1" ? (
        <section className="structure-calendar-attention">
          <AlertTriangle size={19} />
          <div>
            <strong>Semester 1 Theory Examination remains under attention</strong>
            <span>
              The +7 day variance and CR-2026-014 remain visible independently of
              the institution structure.
            </span>
          </div>
          <Link href="/workflow/requests/CR-2026-014">Open request</Link>
        </section>
      ) : null}

      <section className="structure-hierarchy">
        <div className="structure-root">
          <span>
            <Landmark size={22} />
          </span>
          <div>
            <small>University root</small>
            <strong>{university.name}</strong>
            <p>
              {university.district} · {university.shortName}
            </p>
          </div>
          <RagBadge
            status={metrics.attentionStatus}
            label={metrics.attentionLabel}
          />
        </div>
        <div className="structure-connector" aria-hidden="true">
          <span />
        </div>
        <div className="structure-branches">
          <section>
            <header>
              <Landmark size={18} />
              <div>
                <span>Direct academic delivery</span>
                <h2>University teaching units</h2>
              </div>
              <b>{metrics.directUnits.length}</b>
            </header>
            <div className="structure-unit-list">
              {metrics.directUnits.length ? (
                metrics.directUnits.map(renderUnit)
              ) : (
                <div className="structure-empty-branch">
                  <Landmark size={21} />
                  <strong>No direct teaching unit</strong>
                  <span>
                    {university.operatingModel === "affiliating"
                      ? "This matches the current affiliating-university demonstration."
                      : "A campus, department or centre may be added by the university."}
                  </span>
                </div>
              )}
            </div>
          </section>
          <section>
            <header>
              <Building2 size={18} />
              <div>
                <span>College academic delivery</span>
                <h2>Constituent and affiliated colleges</h2>
              </div>
              <b>
                {metrics.constituentColleges.length +
                  metrics.affiliatedColleges.length}
              </b>
            </header>
            <div className="structure-unit-list">
              {metrics.constituentColleges.length ||
              metrics.affiliatedColleges.length ? (
                [
                  ...metrics.constituentColleges,
                  ...metrics.affiliatedColleges,
                ].map(renderUnit)
              ) : (
                <div className="structure-empty-branch">
                  <Building2 size={21} />
                  <strong>No affiliated colleges</strong>
                  <span>
                    {university.operatingModel === "teaching_only"
                      ? "This matches the teaching-only university classification."
                      : "No college delivery units are registered."}
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <Modal open={addOpen} title="Add academic delivery unit" onClose={() => setAddOpen(false)}>
        {newUnit ? (
          <form className="structure-unit-form" onSubmit={saveUnit}>
            <div className="modal-body">
              <p>
                The new record becomes a valid owner for official course
                offerings and calendar scope.
              </p>
              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Unit name</span>
                  <input
                    value={newUnit.name}
                    placeholder="School of Environmental Studies"
                    onChange={(event) =>
                      setNewUnit({ ...newUnit, name: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Institution code</span>
                  <input
                    value={newUnit.institutionCode}
                    placeholder="SHSU-DEPT-03"
                    onChange={(event) =>
                      setNewUnit({
                        ...newUnit,
                        institutionCode: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Short name</span>
                  <input
                    value={newUnit.shortName}
                    placeholder="Environmental School"
                    onChange={(event) =>
                      setNewUnit({ ...newUnit, shortName: event.target.value })
                    }
                  />
                </label>
                <label className="form-field">
                  <span>Unit type</span>
                  <select
                    value={newUnit.unitType}
                    onChange={(event) =>
                      setNewUnit({
                        ...newUnit,
                        unitType: event.target.value as DeliveryUnitType,
                      })
                    }
                  >
                    {Object.entries(unitTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>District</span>
                  <input
                    value={newUnit.district}
                    onChange={(event) =>
                      setNewUnit({ ...newUnit, district: event.target.value })
                    }
                  />
                </label>
                <label className="form-field form-field-wide">
                  <span>Teaching commenced academic year</span>
                  <select
                    value={newUnit.teachingCommencedAcademicYearId}
                    onChange={(event) =>
                      setNewUnit({
                        ...newUnit,
                        teachingCommencedAcademicYearId: event.target.value,
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
                <label className="master-check form-field-wide">
                  <input
                    type="checkbox"
                    checked={newUnit.active}
                    onChange={(event) =>
                      setNewUnit({ ...newUnit, active: event.target.checked })
                    }
                  />
                  <span>Active for course and reporting selectors</span>
                </label>
              </div>
              {operatingModelWarning(
                university.operatingModel,
                newUnit.unitType,
              ) ? (
                <div className="structure-model-warning">
                  <AlertTriangle size={16} />
                  <span>
                    {operatingModelWarning(
                      university.operatingModel,
                      newUnit.unitType,
                    )}
                  </span>
                </div>
              ) : (
                <div className="structure-model-ok">
                  <CheckCircle2 size={16} />
                  <span>
                    This unit type is consistent with the current{" "}
                    {operatingModelLabels[university.operatingModel]} classification.
                  </span>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="button button-quiet" onClick={() => setAddOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Add delivery unit
              </button>
            </div>
          </form>
        ) : null}
      </Modal>

      <Modal
        open={modelOpen}
        title="Change university operating model"
        onClose={() => setModelOpen(false)}
      >
        <div className="modal-body">
          <p>
            Classification changes do not delete delivery units. Review any
            mismatched campuses or colleges after saving.
          </p>
          <label className="form-field">
            <span>Operating model</span>
            <select
              value={nextModel}
              onChange={(event) =>
                setNextModel(event.target.value as UniversityOperatingModel)
              }
            >
              <option value="teaching_only">Teaching University</option>
              <option value="affiliating">Affiliating University</option>
              <option value="hybrid">Hybrid University</option>
            </select>
          </label>
        </div>
        <div className="modal-actions">
          <button className="button button-quiet" onClick={() => setModelOpen(false)}>
            Cancel
          </button>
          <button
            className="button button-primary"
            onClick={() => {
              if (state.setUniversityOperatingModel(university.id, nextModel)) {
                setModelOpen(false);
              }
            }}
          >
            Save classification
          </button>
        </div>
      </Modal>
    </div>
  );
}
