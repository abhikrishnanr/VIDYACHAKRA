import type {
  AcademicDeliveryUnit,
  CalendarMilestoneDefinition,
  RagStatus,
  UniversityCalendarEntry,
  UniversityCalendarSubmission,
  UniversityProfile,
} from "./types";

export const calendarSubmissionGroups = [
  "Admissions",
  "Academic Activities",
  "Assessments",
  "Examinations",
  "Valuation and Results",
] as const;

export type CalendarSubmissionGroup =
  (typeof calendarSubmissionGroups)[number];

export function getMilestoneGroup(
  definition: CalendarMilestoneDefinition,
): CalendarSubmissionGroup {
  if (definition.category === "Admission") return "Admissions";
  if (definition.category === "Assessment") return "Assessments";
  if (definition.category === "Examination") return "Examinations";
  if (
    definition.category === "Valuation" ||
    definition.category === "Result"
  ) {
    return "Valuation and Results";
  }
  return "Academic Activities";
}

export function formatCalendarDate(value: string | null) {
  if (!value) return "Not entered";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatCalendarDateRange(
  start: string,
  end: string | null,
) {
  if (!start) return "Not entered";
  return end
    ? `${formatCalendarDate(start)} – ${formatCalendarDate(end)}`
    : formatCalendarDate(start);
}

export function formatVariance(value: number) {
  if (value === 0) return "No variance";
  return `${value > 0 ? "+" : ""}${value} day${Math.abs(value) === 1 ? "" : "s"}`;
}

export function countSubmissionStatuses(entries: UniversityCalendarEntry[]) {
  return entries.reduce(
    (summary, entry) => {
      summary[entry.ragStatus] += 1;
      if (!entry.universityStartDate) summary.incomplete += 1;
      return summary;
    },
    { green: 0, amber: 0, red: 0, grey: 0, incomplete: 0 },
  );
}

export function submissionStatusLabel(
  status: UniversityCalendarSubmission["status"],
) {
  const labels: Record<UniversityCalendarSubmission["status"], string> = {
    draft: "Draft",
    submitted: "Submitted",
    under_review: "Under HEC Review",
    returned: "Returned",
    accepted: "Accepted",
    locked: "Locked",
  };
  return labels[status];
}

export function scopeLabel(
  scope: UniversityCalendarSubmission["scopeType"],
) {
  if (scope === "university_teaching_only") return "Direct teaching units";
  if (scope === "selected_delivery_units") return "Selected delivery units";
  return "All delivery units";
}

export function getSubmissionUnits(
  submission: UniversityCalendarSubmission,
  units: AcademicDeliveryUnit[],
) {
  const active = units.filter(
    (unit) => unit.universityId === submission.universityId && unit.active,
  );
  if (submission.scopeType === "selected_delivery_units") {
    return active.filter((unit) =>
      submission.selectedDeliveryUnitIds.includes(unit.id),
    );
  }
  if (submission.scopeType === "university_teaching_only") {
    return active.filter(
      (unit) =>
        unit.unitType === "university_campus" ||
        unit.unitType === "university_department" ||
        unit.unitType === "university_centre",
    );
  }
  return active;
}

export function inheritanceSummary(
  submission: UniversityCalendarSubmission,
  units: AcademicDeliveryUnit[],
) {
  const selected = getSubmissionUnits(submission, units);
  const teaching = selected.filter(
    (unit) =>
      unit.unitType === "university_campus" ||
      unit.unitType === "university_department" ||
      unit.unitType === "university_centre",
  ).length;
  const colleges = selected.length - teaching;
  const parts = [];
  if (colleges) {
    parts.push(`${colleges} ${colleges === 1 ? "college" : "colleges"}`);
  }
  if (teaching) {
    parts.push(
      `${teaching} university teaching ${teaching === 1 ? "unit" : "units"}`,
    );
  }
  return parts.length
    ? `Applies to ${parts.join(" and ")}.`
    : "No active delivery units are currently covered.";
}

export function getSubmissionUniversity(
  submission: UniversityCalendarSubmission,
  universities: UniversityProfile[],
) {
  return universities.find(
    (university) => university.id === submission.universityId,
  );
}

export const ragPublicLabels: Record<RagStatus, string> = {
  green: "Aligned",
  amber: "Needs completion",
  red: "Outside permitted rule",
  grey: "Reporting only",
};
