# VIDYACHAKRA domain model

This document defines the frontend prototype domain used by the shared
`DemoStateProvider`. It is intentionally implementation-oriented: the entities
are strongly typed in `lib/types.ts`, realistic defaults live in
`lib/domain-data.ts`, and derived calculations live in
`lib/domain-calculations.ts`.

## Ownership and hierarchy

### HEC-owned master data

- `AcademicYear` supplies the official time boundary and admission year used by
  all downstream records.
- `CalendarMilestoneDefinition` supplies the event category, date-input type,
  applicability, alignment rule and permitted tolerance. A university does not
  redefine these rules in its submission.
- `CourseMaster` is the authoritative HEC course catalogue. Universities select
  active records from this master; they do not create private copies of course
  definitions.

### University and academic delivery

- `UniversityProfile` identifies a university and its operating model:
  `teaching_only`, `affiliating`, or `hybrid`.
- `AcademicDeliveryUnit` is the mandatory unit of academic delivery. It may be a
  university campus, department, centre, constituent college or affiliated
  college. Teaching-only universities still use campus or department delivery
  units, so no course offering floats directly under a university. The same
  entity records the unit type, institution code, district, active status and
  academic year in which teaching commenced.
- `CourseOffering` joins an academic year, university, delivery unit and active
  HEC Course Master record. Every offering must have a `deliveryUnitId`.
- `CourseBatch` belongs to one course offering and owns its sanctioned capacity.
  An offering may have one or more batches.

## Academic calendar submissions

`UniversityCalendarSubmission` is owned by a university for an academic year
and programme type. Its scope can cover all delivery units, university teaching
units only, or selected delivery units.

`UniversityCalendarEntry` belongs to a submission and references one HEC
`CalendarMilestoneDefinition`. It retains both the locked Council baseline and
the university date, along with actual completion, variance, evidence and any
formal change-request reference.

Calendar compliance is calculated only from the milestone alignment rule,
baseline, university date and an approved exception. Reporting-only milestones
remain distinct from date alignment.

## Cohorts and student strength

- `StudentCohort` identifies an admission-year group for a course offering.
- `SemesterStrengthSnapshot` belongs to a cohort and course batch. It records
  sanctioned capacity, Semester 1 admission intake, current strength,
  reporting status and the reporting date.
- Semester 1 monitoring uses **admission vacancy**: sanctioned capacity minus
  admission intake.
- Semester 2–8 monitoring uses **current strength gap**: sanctioned capacity
  minus current strength.

Derived gaps are clamped at zero; student counts never become negative. A
reported value above sanctioned capacity is retained, produces a fill rate over
100%, and must be shown with an explicit red “Above approved capacity” warning.
It is not silently capped.

## Status semantics

Calendar compliance RAG and seat-utilisation status are different concepts and
must have separate labels and legends. An on-time calendar does not imply full
admission, and a seat vacancy does not constitute a calendar violation.

Reporting completeness is derived from expected and submitted snapshots. A
missing report remains visible as “Not reported”; it is not converted to a zero
strength.

## Demo persistence and migration

The prototype remains frontend-only. `DEMO_STATE_VERSION` versions the complete
state stored under the existing localStorage key. Hydration merges legacy
workflow state with the current defaults and restores any missing domain
collections. This preserves an in-progress CR-2026-014 workflow while safely
adding new entities.

“Reset Demo” restores all domain defaults, Version 1.0 and the initial red Sahya
Semester 1 Theory Examination deviation with CR-2026-014 in draft.

## Illustrative dataset

The defaults include:

- five academic years;
- seventeen calendar milestone definitions;
- twelve HEC Course Master records;
- six fictional universities with teaching-only, affiliating and hybrid models;
- eighteen academic delivery units;
- twenty-five course offerings with one or two batches;
- admission cohorts and Semester 1–8 strength coverage;
- high-vacancy, full, not-reported and above-capacity examples; and
- the original CR-2026-014 calendar deviation.
