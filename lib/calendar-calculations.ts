import type { CalendarMilestoneDefinition, RagStatus } from "./types";

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
      reason: "Date alignment is not evaluated for this reporting-only milestone.",
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
