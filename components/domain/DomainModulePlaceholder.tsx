"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  CircleHelp,
  Layers3,
  Network,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  calculateFillRate,
  calculateReportingCompleteness,
  calculateSemesterOneAdmissionVacancy,
  getCapacityWarning,
} from "@/lib/domain-calculations";
import { useDemoState } from "@/lib/demo-state";

export type DomainModule =
  | "academic-years"
  | "calendar-milestones"
  | "courses"
  | "institutions"
  | "admissions"
  | "vacancies"
  | "institution-structure"
  | "calendar-submissions"
  | "course-offerings"
  | "student-strength";

type ModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  nextPhase: string;
  owner: string;
  icon: typeof CalendarRange;
};

const moduleConfigs: Record<DomainModule, ModuleConfig> = {
  "academic-years": {
    eyebrow: "HEC Master Data",
    title: "Academic Year Registry",
    description:
      "Govern the time boundaries used by calendars, admissions, course offerings and strength reporting.",
    nextPhase: "Create, activate and close academic years with dependency checks.",
    owner: "HEC Calendar Administration",
    icon: CalendarRange,
  },
  "calendar-milestones": {
    eyebrow: "HEC Master Data",
    title: "Calendar Milestone Master",
    description:
      "Define the authoritative events, applicability and alignment rules used in every university calendar submission.",
    nextPhase: "Add milestone editing, effective dating and rule-version history.",
    owner: "HEC Academic Monitoring",
    icon: ClipboardList,
  },
  courses: {
    eyebrow: "HEC Master Data",
    title: "Course Master",
    description:
      "Maintain a single HEC-owned catalogue that universities select from when declaring delivery-unit offerings.",
    nextPhase: "Add controlled master amendments and retirement safeguards.",
    owner: "HEC Academic Administration",
    icon: GraduationCap,
  },
  institutions: {
    eyebrow: "Statewide Academic Network",
    title: "Institution Registry",
    description:
      "Represent every university by its operating model and the academic delivery units through which courses are actually offered.",
    nextPhase: "Add registry verification, operating-model review and unit onboarding.",
    owner: "HEC Institutional Coordination",
    icon: Building2,
  },
  admissions: {
    eyebrow: "Semester 1 Monitoring",
    title: "Admission Intake",
    description:
      "Prepare course-offering and batch-level intake reporting for newly admitted Semester 1 cohorts.",
    nextPhase: "Add staged university submissions and HEC verification.",
    owner: "HEC Admission Monitoring",
    icon: Users,
  },
  vacancies: {
    eyebrow: "Seat Utilisation",
    title: "Vacancy Monitor",
    description:
      "Compare sanctioned batch capacity with reported intake without mixing seat utilisation with calendar compliance.",
    nextPhase: "Add district, course and delivery-unit drill-downs with reporting cut-offs.",
    owner: "HEC Admission Monitoring",
    icon: Layers3,
  },
  "institution-structure": {
    eyebrow: "Sahya University Setup",
    title: "Institution Structure",
    description:
      "Define the university campus, departments, centres and affiliated colleges that own academic delivery.",
    nextPhase: "Add unit verification and local nodal-officer assignments.",
    owner: "University Nodal Office",
    icon: Network,
  },
  "calendar-submissions": {
    eyebrow: "University Calendar Governance",
    title: "Calendar Submissions",
    description:
      "Prepare a university-owned calendar submission against the HEC milestone master and its locked Council baselines.",
    nextPhase: "Add the submission editor, validation summary and formal declaration.",
    owner: "University Nodal Office",
    icon: BookOpenCheck,
  },
  "course-offerings": {
    eyebrow: "University Academic Setup",
    title: "Course Offerings",
    description:
      "Select active HEC Course Master records and bind every offering to a specific academic delivery unit.",
    nextPhase: "Add offering configuration and approval-reference verification.",
    owner: "University Academic Administration",
    icon: GraduationCap,
  },
  "student-strength": {
    eyebrow: "University Reporting",
    title: "Student Strength",
    description:
      "Report Semester 1 intake and Semester 2–8 current strength at batch level while retaining cohort lineage.",
    nextPhase: "Add batch-level reporting, evidence upload and submission history.",
    owner: "University Nodal Office",
    icon: Users,
  },
};

function sentenceCase(value: string) {
  return value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

export function DomainModulePlaceholder({ module }: { module: DomainModule }) {
  const state = useDemoState();
  const config = moduleConfigs[module];
  const Icon = config.icon;
  const sahyaUnits = state.academicDeliveryUnits.filter(
    (unit) => unit.universityId === "sahya",
  );
  const sahyaOfferings = state.courseOfferings.filter(
    (offering) => offering.universityId === "sahya",
  );
  const firstSemesterReports = state.semesterStrengthSnapshots.filter(
    (snapshot) => snapshot.semesterNumber === 1,
  );
  const submittedReports = state.semesterStrengthSnapshots.filter(
    (snapshot) => snapshot.reportingStatus !== "not_started",
  );
  const completeness = calculateReportingCompleteness(
    state.semesterStrengthSnapshots.length,
    submittedReports.length,
  );
  const aboveCapacity = state.semesterStrengthSnapshots.filter(
    (snapshot) =>
      getCapacityWarning(snapshot.sanctionedCapacity, snapshot.currentStrength)
        .excess > 0,
  );
  const semesterOneVacancies = firstSemesterReports.reduce(
    (total, snapshot) =>
      total +
      calculateSemesterOneAdmissionVacancy(
        snapshot.sanctionedCapacity,
        snapshot.admissionIntake,
      ),
    0,
  );

  const stats = {
    "academic-years": [
      [String(state.academicYears.length), "Academic years modelled"],
      [String(state.academicYears.filter((year) => year.status === "active").length), "Active year"],
      ["5 years", "Planning horizon"],
    ],
    "calendar-milestones": [
      [String(state.calendarMilestoneDefinitions.length), "Milestone definitions"],
      [String(state.calendarMilestoneDefinitions.filter((item) => item.mandatory).length), "Mandatory events"],
      ["3 rules", "Alignment methods"],
    ],
    courses: [
      [String(state.courseMasters.length), "HEC course records"],
      [String(state.courseMasters.filter((course) => course.active).length), "Active courses"],
      ["1 catalogue", "Authoritative source"],
    ],
    institutions: [
      [String(state.universityProfiles.length), "Universities"],
      [String(state.academicDeliveryUnits.length), "Academic delivery units"],
      ["3 models", "Teaching, affiliating, hybrid"],
    ],
    admissions: [
      [String(firstSemesterReports.length), "Semester 1 batch reports"],
      [String(semesterOneVacancies), "Reported vacant seats"],
      [`${completeness.percentage}%`, "Overall reporting coverage"],
    ],
    vacancies: [
      [String(semesterOneVacancies), "Semester 1 vacancies"],
      [String(aboveCapacity.length), "Above-capacity warnings"],
      [`${completeness.missing}`, "Reports outstanding"],
    ],
    "institution-structure": [
      [String(sahyaUnits.length), "Sahya delivery units"],
      [String(sahyaUnits.filter((unit) => unit.unitType === "affiliated_college").length), "Affiliated colleges modelled"],
      ["Hybrid", "Operating model"],
    ],
    "calendar-submissions": [
      [String(state.universityCalendarSubmissions.length), "Statewide submissions"],
      [String(state.universityCalendarEntries.length), "Calendar entries"],
      ["1.0", "Sahya locked submission"],
    ],
    "course-offerings": [
      [String(sahyaOfferings.length), "Sahya offerings"],
      [String(state.courseOfferings.length), "Statewide offerings"],
      ["100%", "Bound to delivery units"],
    ],
    "student-strength": [
      [String(state.semesterStrengthSnapshots.length), "Batch snapshots"],
      ["1–8", "Semester coverage"],
      [`${completeness.percentage}%`, "Reporting completeness"],
    ],
  }[module];

  const home =
    module.startsWith("institution-") ||
    module === "calendar-submissions" ||
    module === "course-offerings" ||
    module === "student-strength"
      ? "/university/dashboard"
      : "/hec/dashboard";

  return (
    <div className="domain-page">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        actions={
          <button
            className="button button-primary"
            onClick={() =>
              state.toast(
                "Foundation ready",
                `${config.title} is prepared for the next implementation phase.`,
              )
            }
          >
            Preview planned workflow
          </button>
        }
      />

      <section className="domain-foundation-band">
        <div className="domain-foundation-icon">
          <Icon size={28} aria-hidden="true" />
        </div>
        <div>
          <span>Domain foundation ready</span>
          <h2>Core records and relationships are available in the shared demo state.</h2>
          <p>
            This route is intentionally a focused foundation view. It does not duplicate
            the completed operational dashboards.
          </p>
        </div>
        <CheckCircle2 size={24} aria-label="Ready" />
      </section>

      <div className="domain-stat-strip" aria-label={`${config.title} summary`}>
        {stats.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="domain-content-grid">
        <section className="domain-panel">
          <div className="domain-panel-heading">
            <div>
              <span>Model coverage</span>
              <h2>What is represented now</h2>
            </div>
          </div>
          {module === "institutions" ? (
            <div className="domain-record-list">
              {state.universityProfiles.map((university) => (
                <Link
                  href={
                    university.id === "sahya"
                      ? "/hec/institutions/sahya"
                      : "/hec/institutions"
                  }
                  key={university.id}
                >
                  <div>
                    <strong>{university.name}</strong>
                    <span>{university.district}</span>
                  </div>
                  <small>{sentenceCase(university.operatingModel)}</small>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : module === "vacancies" || module === "student-strength" ? (
            <div className="domain-utilisation-sample">
              {state.semesterStrengthSnapshots.slice(0, 4).map((snapshot) => {
                const warning = getCapacityWarning(
                  snapshot.sanctionedCapacity,
                  snapshot.currentStrength,
                );
                return (
                  <div key={snapshot.id}>
                    <div>
                      <strong>{snapshot.id.replace("snapshot-batch-", "Batch ")}</strong>
                      <span>
                        {snapshot.currentStrength === null
                          ? "Strength not reported"
                          : `${snapshot.currentStrength} of ${snapshot.sanctionedCapacity} · ${calculateFillRate(
                              snapshot.currentStrength,
                              snapshot.sanctionedCapacity,
                            )}% filled`}
                      </span>
                    </div>
                    {snapshot.currentStrength === null ? (
                      <span className="utilisation-indicator utilisation-missing">
                        <CircleHelp size={14} aria-hidden="true" />
                        Not reported
                      </span>
                    ) : warning.excess > 0 ? (
                      <span className="utilisation-indicator utilisation-warning">
                        <AlertTriangle size={14} aria-hidden="true" />
                        Above approved capacity
                      </span>
                    ) : (
                      <span className="utilisation-indicator utilisation-normal">
                        <CheckCircle2 size={14} aria-hidden="true" />
                        Within approved capacity
                      </span>
                    )}
                  </div>
                );
              })}
              <p className="domain-legend-note">
                Seat-utilisation status is a separate operational signal and is not
                calendar-compliance RAG.
              </p>
            </div>
          ) : (
            <ul className="domain-capability-list">
              <li>
                <CheckCircle2 size={17} />
                Strongly typed records with stable identifiers and ownership.
              </li>
              <li>
                <CheckCircle2 size={17} />
                Relationships validated through academic year, university, delivery
                unit, offering, batch and cohort references.
              </li>
              <li>
                <CheckCircle2 size={17} />
                Realistic default records included in versioned local demo state.
              </li>
            </ul>
          )}
        </section>

        <aside className="domain-panel domain-next-panel">
          <span>Next implementation phase</span>
          <h2>{config.nextPhase}</h2>
          <dl>
            <div>
              <dt>Data owner</dt>
              <dd>{config.owner}</dd>
            </div>
            <div>
              <dt>Prototype persistence</dt>
              <dd>Versioned localStorage</dd>
            </div>
            <div>
              <dt>Current mode</dt>
              <dd>Read-only foundation</dd>
            </div>
          </dl>
          <Link className="domain-back-link" href={home}>
            Return to workspace <ArrowRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
