import type {
  AcademicDeliveryUnit,
  CourseOffering,
  RequestStatus,
  UniversityCalendarSubmission,
  UniversityOperatingModel,
  UniversityProfile,
} from "./types";

export const directDeliveryUnitTypes = [
  "university_campus",
  "university_department",
  "university_centre",
] as const;

export const collegeDeliveryUnitTypes = [
  "constituent_college",
  "affiliated_college",
] as const;

export const unitTypeLabels: Record<AcademicDeliveryUnit["unitType"], string> = {
  university_campus: "University Campus",
  university_department: "University Department",
  university_centre: "University Centre",
  constituent_college: "Constituent College",
  affiliated_college: "Affiliated College",
};

export const operatingModelLabels: Record<UniversityOperatingModel, string> = {
  teaching_only: "Teaching University",
  affiliating: "Affiliating University",
  hybrid: "Hybrid University",
};

export function isDirectDeliveryUnit(unit: AcademicDeliveryUnit) {
  return (directDeliveryUnitTypes as readonly string[]).includes(unit.unitType);
}

export function isCollegeDeliveryUnit(unit: AcademicDeliveryUnit) {
  return (collegeDeliveryUnitTypes as readonly string[]).includes(unit.unitType);
}

export function getUnitMetrics(input: {
  unit: AcademicDeliveryUnit;
  courseOfferings: CourseOffering[];
}) {
  const offerings = input.courseOfferings.filter(
    (offering) =>
      offering.deliveryUnitId === input.unit.id &&
      offering.offeringStatus !== "inactive",
  );
  return {
    offerings,
    distinctCourseIds: Array.from(
      new Set(offerings.map((offering) => offering.courseMasterId)),
    ),
    verifiedOfferings: offerings.filter(
      (offering) => offering.offeringStatus === "verified",
    ).length,
  };
}

export function getUniversityMetrics(input: {
  university: UniversityProfile;
  units: AcademicDeliveryUnit[];
  courseOfferings: CourseOffering[];
  calendarSubmissions: UniversityCalendarSubmission[];
  requestStatus: RequestStatus;
  masterCalendarVersion: string;
}) {
  const units = input.units.filter(
    (unit) => unit.universityId === input.university.id && unit.active,
  );
  const offerings = input.courseOfferings.filter(
    (offering) =>
      offering.universityId === input.university.id &&
      offering.offeringStatus !== "inactive",
  );
  const submission = input.calendarSubmissions.find(
    (item) => item.universityId === input.university.id,
  );
  const sahyaIssueOpen =
    input.university.id === "sahya" && input.masterCalendarVersion !== "1.1";
  const submissionNeedsAttention =
    !submission ||
    ["draft", "submitted", "under_review", "returned"].includes(submission.status);
  const critical = sahyaIssueOpen && input.requestStatus === "draft";
  const attention = sahyaIssueOpen || submissionNeedsAttention;

  return {
    units,
    directUnits: units.filter(isDirectDeliveryUnit),
    constituentColleges: units.filter(
      (unit) => unit.unitType === "constituent_college",
    ),
    affiliatedColleges: units.filter(
      (unit) => unit.unitType === "affiliated_college",
    ),
    offerings,
    distinctCourseCount: new Set(
      offerings.map((offering) => offering.courseMasterId),
    ).size,
    submission,
    calendarCurrent:
      Boolean(submission) &&
      ["accepted", "locked"].includes(submission?.status ?? ""),
    attentionStatus: critical ? "red" : attention ? "amber" : "green",
    attentionLabel: critical
      ? "Critical calendar attention"
      : attention
        ? "Calendar attention required"
        : "Calendar aligned",
  } as const;
}
