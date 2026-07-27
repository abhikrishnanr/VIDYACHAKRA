import type {
  AcademicDeliveryUnit,
  AcademicYear,
  CourseBatch,
  CourseMaster,
  CourseOffering,
  SemesterNumber,
  SemesterStrengthSnapshot,
  StudentCohort,
  UniversityProfile,
} from "./types";

export const SEAT_UTILISATION_THRESHOLDS = {
  greenMinimumFillRate: 90,
  amberMinimumFillRate: 70,
  highVacancyMaximumFillRate: 70,
  overdueReportingDays: 7,
} as const;

export type SeatUtilisationStatus = "green" | "amber" | "red" | "grey";

export type CapacityOfferingMetric = {
  offering: CourseOffering;
  course: CourseMaster;
  university: UniversityProfile;
  unit: AcademicDeliveryUnit;
  academicYear: AcademicYear | undefined;
  cohort: StudentCohort | undefined;
  batches: CourseBatch[];
  snapshots: SemesterStrengthSnapshot[];
  sanctionedCapacity: number;
  actualIntake: number | null;
  admissionVacancy: number | null;
  fillRate: number | null;
  utilisationStatus: SeatUtilisationStatus;
  utilisationLabel: string;
  attentionReason: string;
  reportingStatus: "fully_reported" | "partially_reported" | "not_reported";
  overdue: boolean;
  currentSemester: SemesterNumber;
  currentStrength: number | null;
  currentStrengthGap: number | null;
  semesterStrengths: Array<{
    semester: SemesterNumber;
    strength: number | null;
    gap: number | null;
    reportingUnits: number;
  }>;
};

function reportedValue(
  snapshot: SemesterStrengthSnapshot | undefined,
  semester: SemesterNumber,
) {
  if (!snapshot || snapshot.reportingStatus === "not_started") return null;
  return semester === 1
    ? snapshot.admissionIntake
    : snapshot.currentStrength;
}

export function seatUtilisationStatus(
  sanctionedCapacity: number,
  actualIntake: number | null,
) {
  if (actualIntake === null) {
    return {
      status: "grey" as const,
      label: "Not reported",
      reason: "Semester 1 admission intake has not been reported.",
      fillRate: null,
    };
  }
  const fillRate =
    sanctionedCapacity > 0
      ? Math.round((actualIntake / sanctionedCapacity) * 10_000) / 100
      : 0;
  if (actualIntake > sanctionedCapacity) {
    return {
      status: "red" as const,
      label: "Above Approved Capacity",
      reason: `Reported intake exceeds approved capacity by ${actualIntake - sanctionedCapacity} student${actualIntake - sanctionedCapacity === 1 ? "" : "s"}.`,
      fillRate,
    };
  }
  if (fillRate >= SEAT_UTILISATION_THRESHOLDS.greenMinimumFillRate) {
    return {
      status: "green" as const,
      label: "High utilisation",
      reason: `Fill rate is ${fillRate}%—within the 90% to 100% utilisation band.`,
      fillRate,
    };
  }
  if (fillRate >= SEAT_UTILISATION_THRESHOLDS.amberMinimumFillRate) {
    return {
      status: "amber" as const,
      label: "Moderate vacancy",
      reason: `Fill rate is ${fillRate}%—between 70% and below 90%.`,
      fillRate,
    };
  }
  return {
    status: "red" as const,
    label: "High vacancy",
    reason: `Fill rate is ${fillRate}%—below the 70% monitoring threshold.`,
    fillRate,
  };
}

export function buildCapacityOfferingMetric(input: {
  offering: CourseOffering;
  courses: CourseMaster[];
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  academicYears: AcademicYear[];
  cohorts: StudentCohort[];
  batches: CourseBatch[];
  snapshots: SemesterStrengthSnapshot[];
}): CapacityOfferingMetric | null {
  const course = input.courses.find(
    (item) => item.id === input.offering.courseMasterId,
  );
  const university = input.universities.find(
    (item) => item.id === input.offering.universityId,
  );
  const unit = input.units.find(
    (item) => item.id === input.offering.deliveryUnitId,
  );
  if (!course || !university || !unit) return null;
  const cohort = input.cohorts.find(
    (item) => item.courseOfferingId === input.offering.id,
  );
  const batches = input.batches.filter(
    (item) => item.courseOfferingId === input.offering.id && item.active,
  );
  const batchIds = new Set(batches.map((item) => item.id));
  const snapshots = input.snapshots.filter(
    (item) =>
      item.cohortId === cohort?.id && batchIds.has(item.courseBatchId),
  );
  const sanctionedCapacity = batches.reduce(
    (total, batch) => total + batch.sanctionedCapacity,
    0,
  );
  const semesterOneValues = batches.map((batch) =>
    reportedValue(
      snapshots.find(
        (snapshot) =>
          snapshot.courseBatchId === batch.id &&
          snapshot.semesterNumber === 1,
      ),
      1,
    ),
  );
  const reportedBatchCount = semesterOneValues.filter(
    (value) => value !== null,
  ).length;
  const actualIntake =
    reportedBatchCount === batches.length && batches.length > 0
      ? semesterOneValues.reduce<number>(
          (total, value) => total + (value ?? 0),
          0,
        )
      : null;
  const utilisation = seatUtilisationStatus(
    sanctionedCapacity,
    actualIntake,
  );
  const semesterStrengths = Array.from(
    { length: course.totalSemesters },
    (_, index) => (index + 1) as SemesterNumber,
  ).map((semester) => {
    const values = batches.map((batch) =>
      reportedValue(
        snapshots.find(
          (snapshot) =>
            snapshot.courseBatchId === batch.id &&
            snapshot.semesterNumber === semester,
        ),
        semester,
      ),
    );
    const reportingUnits = values.filter((value) => value !== null).length;
    const strength =
      reportingUnits === batches.length && batches.length > 0
        ? values.reduce<number>(
            (total, value) => total + (value ?? 0),
            0,
          )
        : null;
    return {
      semester,
      strength,
      gap:
        strength === null
          ? null
          : Math.max(0, sanctionedCapacity - strength),
      reportingUnits,
    };
  });
  const reportedSemesters = semesterStrengths.filter(
    (item) => item.strength !== null,
  );
  const current =
    reportedSemesters.at(-1) ?? semesterStrengths[0];
  const latestDate = snapshots
    .map((snapshot) => snapshot.reportingDate)
    .filter(Boolean)
    .sort()
    .at(-1);
  const overdue =
    actualIntake === null &&
    (!latestDate ||
      Date.parse("2026-07-27T00:00:00Z") -
        Date.parse(`${latestDate}T00:00:00Z`) >
        SEAT_UTILISATION_THRESHOLDS.overdueReportingDays * 86_400_000);

  return {
    offering: input.offering,
    course,
    university,
    unit,
    academicYear: input.academicYears.find(
      (item) => item.id === input.offering.academicYearId,
    ),
    cohort,
    batches,
    snapshots,
    sanctionedCapacity,
    actualIntake,
    admissionVacancy:
      actualIntake === null
        ? null
        : Math.max(0, sanctionedCapacity - actualIntake),
    fillRate: utilisation.fillRate,
    utilisationStatus: utilisation.status,
    utilisationLabel: utilisation.label,
    attentionReason: utilisation.reason,
    reportingStatus:
      reportedBatchCount === 0
        ? "not_reported"
        : reportedBatchCount < batches.length
          ? "partially_reported"
          : "fully_reported",
    overdue,
    currentSemester: current.semester,
    currentStrength: current.strength,
    currentStrengthGap: current.gap,
    semesterStrengths,
  };
}

export function buildAllCapacityOfferingMetrics(
  input: Omit<
    Parameters<typeof buildCapacityOfferingMetric>[0],
    "offering"
  > & { offerings: CourseOffering[] },
) {
  return input.offerings
    .map((offering) => buildCapacityOfferingMetric({ ...input, offering }))
    .filter((item): item is CapacityOfferingMetric => Boolean(item));
}

export function aggregateAdmissionMetrics(
  metrics: CapacityOfferingMetric[],
) {
  const reported = metrics.filter((item) => item.actualIntake !== null);
  const sanctionedCapacity = metrics.reduce(
    (total, item) => total + item.sanctionedCapacity,
    0,
  );
  const reportedCapacity = reported.reduce(
    (total, item) => total + item.sanctionedCapacity,
    0,
  );
  const actualIntake = reported.reduce(
    (total, item) => total + (item.actualIntake ?? 0),
    0,
  );
  const admissionVacancy = reported.reduce(
    (total, item) => total + (item.admissionVacancy ?? 0),
    0,
  );
  return {
    sanctionedCapacity,
    reportedCapacity,
    actualIntake,
    admissionVacancy,
    fillRate:
      reportedCapacity > 0
        ? Math.round((actualIntake / reportedCapacity) * 10_000) / 100
        : null,
    notReporting: metrics.filter(
      (item) => item.reportingStatus === "not_reported",
    ).length,
    partiallyReporting: metrics.filter(
      (item) => item.reportingStatus === "partially_reported",
    ).length,
    highVacancy: metrics.filter(
      (item) =>
        item.utilisationStatus === "red" &&
        item.actualIntake !== null &&
        !(
          item.actualIntake > item.sanctionedCapacity
        ),
    ).length,
    aboveCapacity: metrics.filter(
      (item) =>
        item.actualIntake !== null &&
        item.actualIntake > item.sanctionedCapacity,
    ).length,
    overdue: metrics.filter((item) => item.overdue).length,
  };
}

export function reportingStatusLabel(
  status: CapacityOfferingMetric["reportingStatus"],
) {
  return {
    fully_reported: "Fully reported",
    partially_reported: "Partially reported",
    not_reported: "Not reported",
  }[status];
}
