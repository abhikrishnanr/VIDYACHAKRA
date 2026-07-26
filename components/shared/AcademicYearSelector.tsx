"use client";

import { CalendarDays } from "lucide-react";
import { useDemoState } from "@/lib/demo-state";

export function AcademicYearSelector() {
  const { academicYear, academicYears, setAcademicYear } = useDemoState();
  return (
    <label className="year-select">
      <CalendarDays size={16} aria-hidden="true" />
      <span className="sr-only">Academic year</span>
      <select
        value={academicYear}
        onChange={(event) => setAcademicYear(event.target.value)}
      >
        {academicYears
          .filter((year) => year.status !== "closed" || year.label === academicYear)
          .map((year) => (
          <option key={year.id} value={year.label}>
            {year.label}
          </option>
        ))}
      </select>
    </label>
  );
}
