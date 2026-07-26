import {
  calculateFillRate,
  calculateSemesterOneAdmissionVacancy,
  calculateTotalSanctionedIntake,
} from "./domain-calculations";
import type {
  AcademicDeliveryUnit,
  CourseBatch,
  CourseMaster,
  CourseOffering,
  SemesterNumber,
  SemesterStrengthSnapshot,
  StudentCohort,
  UniversityProfile,
} from "./types";

export type CourseOfferingMetrics = {
  offering: CourseOffering;
  university: UniversityProfile | undefined;
  unit: AcademicDeliveryUnit | undefined;
  course: CourseMaster | undefined;
  batches: CourseBatch[];
  snapshots: SemesterStrengthSnapshot[];
  cohorts: StudentCohort[];
  totalCapacity: number;
  firstSemesterIntake: number | null;
  admissionVacancy: number | null;
  reportingIncomplete: boolean;
  fillRate: number | null;
  semesterSummaries: Array<{
    semester: SemesterNumber;
    sanctionedCapacity: number;
    reportedStrength: number | null;
    reportingStatus: string;
  }>;
};

export function buildCourseOfferingMetrics(input: {
  offering: CourseOffering;
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  courses: CourseMaster[];
  batches: CourseBatch[];
  cohorts: StudentCohort[];
  snapshots: SemesterStrengthSnapshot[];
}): CourseOfferingMetrics {
  const batches = input.batches.filter(
    (batch) =>
      batch.courseOfferingId === input.offering.id && batch.active,
  );
  const batchIds = new Set(batches.map((batch) => batch.id));
  const cohorts = input.cohorts.filter(
    (cohort) => cohort.courseOfferingId === input.offering.id,
  );
  const cohortIds = new Set(cohorts.map((cohort) => cohort.id));
  const snapshots = input.snapshots.filter(
    (snapshot) =>
      batchIds.has(snapshot.courseBatchId) ||
      cohortIds.has(snapshot.cohortId),
  );
  const firstSemester = snapshots.filter(
    (snapshot) => snapshot.semesterNumber === 1,
  );
  const totalCapacity = calculateTotalSanctionedIntake(batches);
  const hasCompleteFirstSemester =
    batches.length > 0 &&
    batches.every((batch) =>
      firstSemester.some(
        (snapshot) =>
          snapshot.courseBatchId === batch.id &&
          snapshot.admissionIntake !== null &&
          snapshot.reportingStatus !== "not_started",
      ),
    );
  const firstSemesterIntake = hasCompleteFirstSemester
    ? firstSemester.reduce(
        (total, snapshot) => total + (snapshot.admissionIntake ?? 0),
        0,
      )
    : null;

  const semesterSummaries = Array.from(
    new Set(snapshots.map((snapshot) => snapshot.semesterNumber)),
  )
    .sort((a, b) => a - b)
    .map((semester) => {
      const semesterSnapshots = snapshots.filter(
        (snapshot) => snapshot.semesterNumber === semester,
      );
      const reported = semesterSnapshots.filter(
        (snapshot) =>
          snapshot.currentStrength !== null &&
          snapshot.reportingStatus !== "not_started",
      );
      return {
        semester,
        sanctionedCapacity: semesterSnapshots.reduce(
          (total, snapshot) => total + snapshot.sanctionedCapacity,
          0,
        ),
        reportedStrength:
          reported.length === semesterSnapshots.length
            ? reported.reduce(
                (total, snapshot) => total + (snapshot.currentStrength ?? 0),
                0,
              )
            : null,
        reportingStatus:
          reported.length === semesterSnapshots.length
            ? "Reported"
            : "Incomplete",
      };
    });

  return {
    offering: input.offering,
    university: input.universities.find(
      (university) => university.id === input.offering.universityId,
    ),
    unit: input.units.find(
      (unit) => unit.id === input.offering.deliveryUnitId,
    ),
    course: input.courses.find(
      (course) => course.id === input.offering.courseMasterId,
    ),
    batches,
    snapshots,
    cohorts,
    totalCapacity,
    firstSemesterIntake,
    admissionVacancy:
      firstSemesterIntake === null
        ? null
        : calculateSemesterOneAdmissionVacancy(
            totalCapacity,
            firstSemesterIntake,
          ),
    reportingIncomplete: !hasCompleteFirstSemester,
    fillRate:
      firstSemesterIntake === null
        ? null
        : calculateFillRate(firstSemesterIntake, totalCapacity),
    semesterSummaries,
  };
}

export function buildAllCourseOfferingMetrics(input: {
  offerings: CourseOffering[];
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  courses: CourseMaster[];
  batches: CourseBatch[];
  cohorts: StudentCohort[];
  snapshots: SemesterStrengthSnapshot[];
}) {
  return input.offerings.map((offering) =>
    buildCourseOfferingMetrics({
      offering,
      universities: input.universities,
      units: input.units,
      courses: input.courses,
      batches: input.batches,
      cohorts: input.cohorts,
      snapshots: input.snapshots,
    }),
  );
}

export function offeringStatusLabel(status: CourseOffering["offeringStatus"]) {
  const labels: Record<CourseOffering["offeringStatus"], string> = {
    draft: "Draft",
    submitted: "Awaiting HEC verification",
    returned: "Returned for correction",
    verified: "HEC verified",
    inactive: "Inactive",
  };
  return labels[status];
}

export function offeringCombinationKey(
  offering: Pick<
    CourseOffering,
    | "academicYearId"
    | "deliveryUnitId"
    | "courseMasterId"
    | "mode"
    | "shift"
  >,
) {
  return [
    offering.academicYearId,
    offering.deliveryUnitId,
    offering.courseMasterId,
    offering.mode,
    offering.shift,
  ].join("::");
}

export function findDuplicateOffering(
  candidate: Pick<
    CourseOffering,
    | "id"
    | "academicYearId"
    | "deliveryUnitId"
    | "courseMasterId"
    | "mode"
    | "shift"
  >,
  offerings: CourseOffering[],
) {
  const key = offeringCombinationKey(candidate);
  return offerings.find(
    (offering) =>
      offering.id !== candidate.id &&
      offering.offeringStatus !== "inactive" &&
      offeringCombinationKey(offering) === key,
  );
}

export function duplicateOfferingIds(offerings: CourseOffering[]) {
  const byKey = new Map<string, CourseOffering[]>();
  offerings
    .filter((offering) => offering.offeringStatus !== "inactive")
    .forEach((offering) => {
      const key = offeringCombinationKey(offering);
      byKey.set(key, [...(byKey.get(key) ?? []), offering]);
    });
  return new Set(
    Array.from(byKey.values())
      .filter((records) => records.length > 1)
      .flatMap((records) => records.map((record) => record.id)),
  );
}

export function formatOfferingDate(value: string | null) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}
