import type {
  CalendarMilestoneDefinition,
  CourseBatch,
  RagStatus,
} from "./types";

export function normaliseStudentCount(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function calculateTotalSanctionedIntake(
  batches: CourseBatch[],
  courseOfferingId?: string,
) {
  return batches
    .filter(
      (batch) =>
        batch.active &&
        (!courseOfferingId || batch.courseOfferingId === courseOfferingId),
    )
    .reduce(
      (total, batch) => total + normaliseStudentCount(batch.sanctionedCapacity),
      0,
    );
}

export function calculateSemesterOneAdmissionVacancy(
  sanctionedCapacity: number,
  admissionIntake: number | null,
) {
  return Math.max(
    0,
    normaliseStudentCount(sanctionedCapacity) -
      normaliseStudentCount(admissionIntake),
  );
}

export function calculateCurrentStrengthGap(
  sanctionedCapacity: number,
  currentStrength: number | null,
) {
  return Math.max(
    0,
    normaliseStudentCount(sanctionedCapacity) -
      normaliseStudentCount(currentStrength),
  );
}

export function calculateFillRate(
  reportedStrength: number | null,
  sanctionedCapacity: number,
) {
  const capacity = normaliseStudentCount(sanctionedCapacity);
  if (capacity === 0) return 0;
  return Math.round(
    (normaliseStudentCount(reportedStrength) / capacity) * 1000,
  ) / 10;
}

function dayNumber(date: string) {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

export function calculateCalendarVariance(
  councilBaselineDate: string,
  universityDate: string,
) {
  const baseline = dayNumber(councilBaselineDate);
  const proposed = dayNumber(universityDate);
  if (!Number.isFinite(baseline) || !Number.isFinite(proposed)) return 0;
  return Math.round(proposed - baseline);
}

export function calculateCalendarCompliance(input: {
  definition: CalendarMilestoneDefinition;
  councilBaselineDate: string;
  universityDate: string;
  approvedException?: boolean;
}): { ragStatus: RagStatus; varianceDays: number; reason: string } {
  const varianceDays = calculateCalendarVariance(
    input.councilBaselineDate,
    input.universityDate,
  );

  if (input.approvedException) {
    return {
      ragStatus: "green",
      varianceDays,
      reason: "Aligned through an approved institution-specific exception.",
    };
  }

  if (input.definition.alignmentRule === "reporting_only") {
    return {
      ragStatus: "grey",
      varianceDays,
      reason: "Reporting completeness is monitored separately from date alignment.",
    };
  }

  const withinTolerance =
    varianceDays >= -input.definition.toleranceBeforeDays &&
    varianceDays <= input.definition.toleranceAfterDays;

  return withinTolerance
    ? {
        ragStatus: "green",
        varianceDays,
        reason: "The university date is within the approved Council rule.",
      }
    : {
        ragStatus: "red",
        varianceDays,
        reason: "The university date falls outside the approved Council rule.",
      };
}

export function calculateReportingCompleteness(
  expectedReports: number,
  submittedReports: number,
) {
  const expected = normaliseStudentCount(expectedReports);
  const submitted = Math.min(expected, normaliseStudentCount(submittedReports));
  const percentage =
    expected === 0 ? 100 : Math.round((submitted / expected) * 1000) / 10;
  return {
    expected,
    submitted,
    missing: Math.max(0, expected - submitted),
    percentage,
    complete: submitted >= expected,
  };
}

export function getCapacityWarning(
  sanctionedCapacity: number,
  reportedStrength: number | null,
) {
  const capacity = normaliseStudentCount(sanctionedCapacity);
  const reported = normaliseStudentCount(reportedStrength);
  const excess = Math.max(0, reported - capacity);
  return excess > 0
    ? {
        status: "red" as const,
        label: "Above approved capacity",
        excess,
      }
    : {
        status: "green" as const,
        label: "Within approved capacity",
        excess: 0,
      };
}
