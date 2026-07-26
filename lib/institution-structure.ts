import type {
  AcademicDeliveryUnit,
  CourseBatch,
  CourseOffering,
  RequestStatus,
  SemesterStrengthSnapshot,
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
  courseBatches: CourseBatch[];
  semesterStrengthSnapshots: SemesterStrengthSnapshot[];
}) {
  const offerings = input.courseOfferings.filter(
    (offering) =>
      offering.deliveryUnitId === input.unit.id &&
      offering.offeringStatus !== "inactive",
  );
  const offeringIds = new Set(offerings.map((offering) => offering.id));
  const batches = input.courseBatches.filter(
    (batch) => batch.active && offeringIds.has(batch.courseOfferingId),
  );
  const batchIds = new Set(batches.map((batch) => batch.id));
  const snapshots = input.semesterStrengthSnapshots.filter((snapshot) =>
    batchIds.has(snapshot.courseBatchId),
  );
  const submitted = snapshots.filter(
    (snapshot) => snapshot.reportingStatus !== "not_started",
  ).length;
  const expected = batches.length;
  const reportingPercentage =
    expected === 0 ? 0 : Math.round((submitted / expected) * 100);

  return {
    offerings,
    batches,
    snapshots,
    sanctionedCapacity: batches.reduce(
      (total, batch) => total + Math.max(0, batch.sanctionedCapacity),
      0,
    ),
    reportingPercentage,
    reportingComplete: expected > 0 && submitted >= expected,
    reportsExpected: expected,
    reportsSubmitted: submitted,
  };
}

export function getUniversityMetrics(input: {
  university: UniversityProfile;
  units: AcademicDeliveryUnit[];
  courseOfferings: CourseOffering[];
  courseBatches: CourseBatch[];
  semesterStrengthSnapshots: SemesterStrengthSnapshot[];
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
  const offeringIds = new Set(offerings.map((offering) => offering.id));
  const batches = input.courseBatches.filter(
    (batch) => batch.active && offeringIds.has(batch.courseOfferingId),
  );
  const batchIds = new Set(batches.map((batch) => batch.id));
  const snapshots = input.semesterStrengthSnapshots.filter((snapshot) =>
    batchIds.has(snapshot.courseBatchId),
  );
  const submitted = snapshots.filter(
    (snapshot) => snapshot.reportingStatus !== "not_started",
  ).length;
  const expected = batches.length;
  const reportingPercentage =
    expected === 0 ? 0 : Math.round((submitted / expected) * 100);
  const submission = input.calendarSubmissions.find(
    (item) => item.universityId === input.university.id,
  );
  const sahyaIssueOpen =
    input.university.id === "sahya" && input.masterCalendarVersion !== "1.1";
  const reportingIncomplete = expected === 0 || submitted < expected;
  const submissionNeedsAttention =
    !submission ||
    ["draft", "submitted", "under_review", "returned"].includes(submission.status);
  const critical = sahyaIssueOpen && input.requestStatus === "draft";
  const attention = sahyaIssueOpen || reportingIncomplete || submissionNeedsAttention;

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
    reportingPercentage,
    reportingComplete: expected > 0 && submitted >= expected,
    reportsExpected: expected,
    reportsSubmitted: submitted,
    submission,
    attentionStatus: critical ? "red" : attention ? "amber" : "green",
    attentionLabel: critical
      ? "Critical calendar attention"
      : attention
        ? "Attention required"
        : "Aligned and reporting",
  } as const;
}
