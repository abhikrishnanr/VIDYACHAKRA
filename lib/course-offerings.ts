import type {
  AcademicDeliveryUnit,
  CourseMaster,
  CourseOffering,
  UniversityProfile,
} from "./types";

export type CourseOfferingDetails = {
  offering: CourseOffering;
  university: UniversityProfile | undefined;
  unit: AcademicDeliveryUnit | undefined;
  course: CourseMaster | undefined;
};

export function buildCourseOfferingDetails(input: {
  offering: CourseOffering;
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  courses: CourseMaster[];
}): CourseOfferingDetails {
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
  };
}

export function buildAllCourseOfferingDetails(input: {
  offerings: CourseOffering[];
  universities: UniversityProfile[];
  units: AcademicDeliveryUnit[];
  courses: CourseMaster[];
}) {
  return input.offerings.map((offering) =>
    buildCourseOfferingDetails({
      offering,
      universities: input.universities,
      units: input.units,
      courses: input.courses,
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
