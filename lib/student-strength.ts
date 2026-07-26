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

export type SemesterJourneyPoint = {
  semester: SemesterNumber;
  reportedStrength: number | null;
  gap: number | null;
  reportingDate: string;
  reportingStatus: SemesterStrengthSnapshot["reportingStatus"];
  changeFromPrevious: number | null;
  aboveCapacity: boolean;
  completeBatchCount: number;
};

export type StudentCohortMetrics = {
  cohort: StudentCohort;
  offering: CourseOffering;
  university: UniversityProfile | undefined;
  unit: AcademicDeliveryUnit | undefined;
  course: CourseMaster | undefined;
  academicYear: AcademicYear | undefined;
  batches: CourseBatch[];
  snapshots: SemesterStrengthSnapshot[];
  totalCapacity: number;
  currentSemester: SemesterNumber;
  reportedStrength: number | null;
  gap: number | null;
  fillRate: number | null;
  reportingStatus: SemesterStrengthSnapshot["reportingStatus"];
  lastUpdatedAt: string | null;
  highVacancy: boolean;
  aboveCapacity: boolean;
  journey: SemesterJourneyPoint[];
};

function aggregateStatus(
  snapshots: SemesterStrengthSnapshot[],
  batchCount: number,
): SemesterStrengthSnapshot["reportingStatus"] {
  const reported = snapshots.filter(
    (snapshot) =>
      snapshot.currentStrength !== null &&
      snapshot.reportingStatus !== "not_started",
  );
  if (reported.length === 0) return "not_started";
  if (reported.length < batchCount) return "draft";
  if (reported.every((snapshot) => snapshot.reportingStatus === "verified")) {
    return "verified";
  }
  if (
    reported.every((snapshot) =>
      ["submitted", "verified"].includes(snapshot.reportingStatus),
    )
  ) {
    return "submitted";
  }
  return "draft";
}

function reportedTotal(
  snapshots: SemesterStrengthSnapshot[],
  batchCount: number,
) {
  if (
    snapshots.length < batchCount ||
    snapshots.some(
      (snapshot) =>
        snapshot.currentStrength === null ||
        snapshot.reportingStatus === "not_started",
    )
  ) {
    return null;
  }
  return snapshots.reduce(
    (total, snapshot) => total + (snapshot.currentStrength ?? 0),
    0,
  );
}

export function buildStudentCohortMetrics(input: {
  cohort: StudentCohort;
  offerings: CourseOffering[];
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  courses: CourseMaster[];
  academicYears: AcademicYear[];
  batches: CourseBatch[];
  snapshots: SemesterStrengthSnapshot[];
}): StudentCohortMetrics | null {
  const offering = input.offerings.find(
    (item) => item.id === input.cohort.courseOfferingId,
  );
  if (!offering) return null;
  const course = input.courses.find(
    (item) => item.id === offering.courseMasterId,
  );
  if (!course) return null;
  const batches = input.batches.filter(
    (batch) => batch.courseOfferingId === offering.id && batch.active,
  );
  const batchIds = new Set(batches.map((batch) => batch.id));
  const snapshots = input.snapshots.filter(
    (snapshot) =>
      snapshot.cohortId === input.cohort.id &&
      batchIds.has(snapshot.courseBatchId),
  );
  const reportedSemesters = snapshots
    .filter(
      (snapshot) =>
        snapshot.reportingStatus !== "not_started" &&
        snapshot.currentStrength !== null,
    )
    .map((snapshot) => snapshot.semesterNumber);
  const currentSemester = (reportedSemesters.length
    ? Math.max(...reportedSemesters)
    : 1) as SemesterNumber;
  const totalCapacity = batches.reduce(
    (total, batch) => total + batch.sanctionedCapacity,
    0,
  );
  let previousReported: number | null = null;
  const journey = Array.from(
    { length: course.totalSemesters },
    (_, index) => (index + 1) as SemesterNumber,
  ).map((semester) => {
    const semesterSnapshots = batches
      .map((batch) =>
        snapshots.find(
          (snapshot) =>
            snapshot.courseBatchId === batch.id &&
            snapshot.semesterNumber === semester,
        ),
      )
      .filter(
        (snapshot): snapshot is SemesterStrengthSnapshot => Boolean(snapshot),
      );
    const reportedStrength = reportedTotal(
      semesterSnapshots,
      batches.length,
    );
    const point: SemesterJourneyPoint = {
      semester,
      reportedStrength,
      gap:
        reportedStrength === null
          ? null
          : Math.max(0, totalCapacity - reportedStrength),
      reportingDate:
        semesterSnapshots.find((snapshot) => snapshot.reportingDate)
          ?.reportingDate ?? "",
      reportingStatus: aggregateStatus(
        semesterSnapshots,
        batches.length,
      ),
      changeFromPrevious:
        reportedStrength === null || previousReported === null
          ? null
          : reportedStrength - previousReported,
      aboveCapacity:
        reportedStrength !== null && reportedStrength > totalCapacity,
      completeBatchCount: semesterSnapshots.filter(
        (snapshot) => snapshot.currentStrength !== null,
      ).length,
    };
    if (reportedStrength !== null) previousReported = reportedStrength;
    return point;
  });
  const current = journey.find(
    (point) => point.semester === currentSemester,
  )!;
  const lastUpdatedAt =
    snapshots
      .map((snapshot) => snapshot.updatedAt)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? input.cohort.lastUpdatedAt;
  return {
    cohort: input.cohort,
    offering,
    university: input.universities.find(
      (item) => item.id === offering.universityId,
    ),
    unit: input.units.find((item) => item.id === offering.deliveryUnitId),
    course,
    academicYear: input.academicYears.find(
      (item) => item.id === input.cohort.admissionAcademicYearId,
    ),
    batches,
    snapshots,
    totalCapacity,
    currentSemester,
    reportedStrength: current.reportedStrength,
    gap: current.gap,
    fillRate:
      current.reportedStrength === null || totalCapacity === 0
        ? null
        : Math.round((current.reportedStrength / totalCapacity) * 1000) / 10,
    reportingStatus: current.reportingStatus,
    lastUpdatedAt,
    highVacancy:
      current.gap !== null &&
      totalCapacity > 0 &&
      current.gap / totalCapacity >= 0.2,
    aboveCapacity: current.aboveCapacity,
    journey,
  };
}

export function buildAllStudentCohortMetrics(
  input: Omit<Parameters<typeof buildStudentCohortMetrics>[0], "cohort"> & {
    cohorts: StudentCohort[];
  },
) {
  return input.cohorts
    .map((cohort) => buildStudentCohortMetrics({ ...input, cohort }))
    .filter((metric): metric is StudentCohortMetrics => Boolean(metric));
}

export function strengthStatusLabel(
  status: SemesterStrengthSnapshot["reportingStatus"],
) {
  return {
    not_started: "Not reported",
    draft: "Draft",
    submitted: "Submitted",
    verified: "Verified",
  }[status];
}

export function formatStrengthDate(value: string | null) {
  if (!value) return "Not reported";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
}

export function formatStrengthUpdated(value: string | null) {
  if (!value) return "Not updated";
  const date = new Date(value);
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  if (sameDay) return `Last updated today at ${time}`;
  return `Updated ${formatStrengthDate(value)} at ${time}`;
}
