"use client";

import { CalendarDays } from "lucide-react";
import { academicYears } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";
import type { AcademicYearLabel } from "@/lib/types";

export function AcademicYearSelector() {
  const { academicYear, setAcademicYear } = useDemoState();
  return (
    <label className="year-select">
      <CalendarDays size={16} aria-hidden="true" />
      <span className="sr-only">Academic year</span>
      <select
        value={academicYear}
        onChange={(event) =>
          setAcademicYear(event.target.value as AcademicYearLabel)
        }
      >
        {academicYears.map((year) => (
          <option key={year}>{year}</option>
        ))}
      </select>
    </label>
  );
}
