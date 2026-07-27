# VIDYACHAKRA domain model

VIDYACHAKRA is a frontend-only governance prototype for Kerala higher
education academic calendars. Strongly typed entities live in `lib/types.ts`,
realistic defaults live in `lib/domain-data.ts`, and shared demo state is
managed by `lib/demo-state.tsx`.

## HEC-owned master data

- `AcademicYear` defines the official planning period and admission year.
- `CalendarMilestoneDefinition` defines calendar categories, date-input types,
  applicable semesters, alignment rules and permitted tolerance.
- `CourseMaster` is the authoritative course catalogue. Universities may
  select active HEC course records but cannot create private course names.

## Institutions and academic delivery

- `UniversityProfile` identifies a fictional university and its operating
  model: `teaching_only`, `affiliating`, or `hybrid`.
- `AcademicDeliveryUnit` represents every place where a course may be
  delivered: a university campus, department, centre, constituent college or
  affiliated college.
- `CourseOffering` links one active HEC Course Master record to one academic
  delivery unit for one academic year. It records delivery mode, shift,
  approval reference, effective period, verification status and review notes.

Course offerings progress through draft, submitted, returned or HEC-verified
states. Their duplicate key is academic year, delivery unit, course, mode and
shift.

## Academic calendar submissions

`UniversityCalendarSubmission` belongs to a university for an academic year
and programme type. Its scope may cover all delivery units, direct university
teaching units only, or selected delivery units. Its lifecycle is:

`draft → submitted → under_review → returned or accepted → locked`

`UniversityCalendarEntry` references one HEC milestone definition and keeps
the Council baseline, university date, variance, evidence state and formal
change-request reference. Dates are structured as single dates, ranges or
deadlines; documents are supporting references only.

Calendar scope is inherited by the selected academic delivery units. The UI
summarises that coverage without duplicating every entry for every college or
teaching unit.

## Calendar compliance and change governance

Calendar compliance is calculated from the official milestone baseline,
university date, alignment rule and any published exception.

The Sahya Semester 1 Theory Examination scenario is the locked calendar entry
referenced by CR-2026-014. Its shared state moves from:

`Red unauthorised deviation → Amber under review → Amber approved pending publication → Green approved exception`

Only publication of Version 1.1 changes the official public calendar.

## Demo persistence

The prototype remains frontend-only. `DEMO_STATE_VERSION` versions the state
stored under the existing localStorage key. Hydration merges supported legacy
workflow state with current defaults and removes retired collections.

“Reset Demo” restores Version 1.0, the initial red Sahya examination
deviation, CR-2026-014 in draft, the master records, institution structure,
calendar submissions and course offerings.

## Illustrative dataset

The defaults include:

- five academic years;
- seventeen calendar milestone definitions;
- twelve HEC Course Master records;
- six fictional universities covering all three operating models;
- eighteen academic delivery units;
- twenty-seven course offerings linking official courses to delivery units;
- structured annual calendar submissions and entries; and
- the CR-2026-014 academic-calendar deviation.
