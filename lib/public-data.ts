import { academicMilestones } from "./demo-data";
import {
  domainAcademicDeliveryUnits,
  domainUniversityProfiles,
} from "./domain-data";
import {
  isCollegeDeliveryUnit,
  isDirectDeliveryUnit,
  operatingModelLabels,
  unitTypeLabels,
} from "./institution-structure";
import type { Semester } from "./types";

export type PublicEventCategory =
  | "Academic activity"
  | "Admission"
  | "Assessment"
  | "Examination"
  | "Valuation"
  | "Result"
  | "Holiday or break"
  | "Official revision";

export type PublicStatus =
  | "Official"
  | "Revised by Empowered Committee"
  | "Approved institution-specific exception"
  | "Awaiting official confirmation";

export type JourneyPhase =
  | "Admissions"
  | "Classes"
  | "Assessments"
  | "Examinations"
  | "Valuation"
  | "Results";

export type PublicCalendarEvent = {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  councilDate: string;
  programme: string;
  semester: Semester | "All semesters";
  institutions: string[];
  category: PublicEventCategory;
  officialVersion: string;
  publicationStatus: PublicStatus;
  authorityReference: string;
  revisionHistory: string[];
  summary: string;
  journeyPhase: JourneyPhase;
};

export const publicEventCategories: Array<PublicEventCategory | "All event types"> = [
  "All event types",
  "Academic activity",
  "Admission",
  "Assessment",
  "Examination",
  "Valuation",
  "Result",
  "Holiday or break",
  "Official revision",
];

export const journeyPhases: JourneyPhase[] = [
  "Admissions",
  "Classes",
  "Assessments",
  "Examinations",
  "Valuation",
  "Results",
];

const allInstitutions = domainUniversityProfiles.map(
  (institution) => institution.name,
);
const programme = "Four Year Undergraduate Programme (FYUGP)";

function categoryFor(eventType: (typeof academicMilestones)[number]["eventType"]) {
  switch (eventType) {
    case "admission":
      return "Admission" as const;
    case "assessment":
    case "feedback":
      return "Assessment" as const;
    case "examination":
      return "Examination" as const;
    case "valuation":
      return "Valuation" as const;
    case "result":
      return "Result" as const;
    default:
      return "Academic activity" as const;
  }
}

function journeyFor(eventType: (typeof academicMilestones)[number]["eventType"]) {
  switch (eventType) {
    case "admission":
      return "Admissions" as const;
    case "assessment":
    case "feedback":
      return "Assessments" as const;
    case "examination":
    case "registration":
    case "publication":
      return "Examinations" as const;
    case "valuation":
      return "Valuation" as const;
    case "result":
      return "Results" as const;
    default:
      return "Classes" as const;
  }
}

const includedMilestones = academicMilestones.filter(
  (event) => event.id !== "calendar-publication",
);

export function getPublicCalendarEvents(revisionPublished: boolean) {
  const version = revisionPublished ? "1.1" : "1.0";

  const events: PublicCalendarEvent[] = includedMilestones.map((event) => {
    const isInstitutionSpecific = event.scope.includes("Sahya Higher Studies University");
    const isSahyaTheory = event.id === "semester-1-theory-examination";
    const isRevisedTheory =
      revisionPublished && isSahyaTheory;
    const date = isRevisedTheory
      ? event.institutionScheduledDate
      : event.councilBaselineDate;

    return {
      id: event.id,
      name: event.title,
      date,
      councilDate: event.councilBaselineDate,
      programme,
      semester: event.semester,
      institutions: isRevisedTheory
        ? ["Sahya Higher Studies University"]
        : isSahyaTheory
          ? allInstitutions
          : isInstitutionSpecific
            ? ["Sahya Higher Studies University"]
            : allInstitutions,
      category: isRevisedTheory ? "Official revision" : categoryFor(event.eventType),
      officialVersion: version,
      publicationStatus: isRevisedTheory
        ? "Revised by Empowered Committee"
        : isSahyaTheory
          ? "Official"
        : event.changeRequestStatus === "screening"
          ? "Awaiting official confirmation"
          : isInstitutionSpecific
            ? "Approved institution-specific exception"
            : "Official",
      authorityReference: isRevisedTheory
        ? "KSHEC/ACAD/CAL/2026/01-R1"
        : isSahyaTheory
          ? "KSHEC/ACAD/CAL/2026/01"
          : event.authorityReference,
      revisionHistory: isRevisedTheory
        ? [
            "Version 1.1 · Approved 02 August 2026",
            "Theory examination moved from 05 December to 12 December for Sahya Higher Studies University after severe monsoon disruption.",
          ]
        : isSahyaTheory
          ? ["Version 1.0 · Published and locked 15 June 2026"]
          : ["No approved revisions to this event."],
      summary: isRevisedTheory
        ? "The revised date applies to 18 affiliated colleges of Sahya Higher Studies University."
        : isSahyaTheory
          ? "The official Council date remains 05 December 2026. An institution-specific change becomes official only after approval and publication."
        : event.ragReason.replace("Unauthorised", "Reported"),
      journeyPhase: journeyFor(event.eventType),
    };
  });

  events.push(
    {
      id: "onam-academic-recess",
      name: "Onam academic recess",
      date: "2026-08-24",
      endDate: "2026-09-01",
      councilDate: "2026-08-24",
      programme,
      semester: "All semesters",
      institutions: allInstitutions,
      category: "Holiday or break",
      officialVersion: version,
      publicationStatus: "Official",
      authorityReference: "KSHEC/ACAD/HOL/2026/04",
      revisionHistory: ["No approved revisions to this event."],
      summary: "Statewide academic recess. Institution offices may follow local duty arrangements.",
      journeyPhase: "Classes",
    },
    {
      id: "official-calendar-publication",
      name: revisionPublished
        ? "Academic calendar Version 1.1 published"
        : "Academic calendar Version 1.0 published",
      date: revisionPublished ? "2026-08-02" : "2026-06-15",
      councilDate: revisionPublished ? "2026-08-02" : "2026-06-15",
      programme,
      semester: "All semesters",
      institutions: allInstitutions,
      category: "Official revision",
      officialVersion: version,
      publicationStatus: revisionPublished
        ? "Revised by Empowered Committee"
        : "Official",
      authorityReference: revisionPublished
        ? "KSHEC/ACAD/CAL/2026/01-R1"
        : "KSHEC/ACAD/CAL/2026/01",
      revisionHistory: revisionPublished
        ? [
            "Version 1.1 · Published 02 August 2026",
            "Version 1.0 · Published 15 June 2026",
          ]
        : ["Version 1.0 · Published 15 June 2026"],
      summary: revisionPublished
        ? "Version 1.1 includes the approved Sahya institution-specific examination revision."
        : "The approved FYUGP calendar baseline for participating higher education institutions.",
      journeyPhase: "Admissions",
    },
  );

  return events.sort((left, right) => left.date.localeCompare(right.date));
}

export const publicInstitutions = domainUniversityProfiles.map((institution) => {
  const deliveryUnits = domainAcademicDeliveryUnits
    .filter((unit) => unit.universityId === institution.id && unit.active)
    .map((unit) => ({
      id: unit.id,
      name: unit.name,
      district: unit.district,
      type: unitTypeLabels[unit.unitType],
      direct: isDirectDeliveryUnit(unit),
    }));
  const directCount = deliveryUnits.filter((unit) => unit.direct).length;
  const collegeCount = deliveryUnits.filter((unit) => {
    const source = domainAcademicDeliveryUnits.find(
      (candidate) => candidate.id === unit.id,
    );
    return source ? isCollegeDeliveryUnit(source) : false;
  }).length;

  return {
    id: institution.id,
    name: institution.name,
    region: institution.district,
    operatingModel: operatingModelLabels[institution.operatingModel],
    deliveryUnits,
    structureSummary:
      institution.operatingModel === "teaching_only"
        ? `${directCount} direct teaching units · no affiliated colleges`
        : institution.operatingModel === "hybrid"
          ? `${directCount} direct teaching units · ${collegeCount} representative colleges`
          : `${collegeCount} representative colleges`,
  };
});

export const todayHighlights = {
  date: "Sunday, 26 July 2026",
  phase: "Admission close-out and semester readiness",
  description:
    "Admission returns are being consolidated while colleges prepare timetables for Semester 1 classes beginning 03 August.",
};
