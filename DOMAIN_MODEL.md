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
  The duplicate key is academic year, delivery unit, course, mode and shift.
  The offering retains approval reference, verification note, status and last
  update time; the university still cannot create a course name.
- `CourseBatch` belongs to one course offering and owns its sanctioned capacity.
  An offering may have one or more batches. Total sanctioned capacity is always
  calculated from active batch rows and is never stored as a separately editable
  value.

Course offerings progress through draft, submitted, returned or HEC-verified
states. Once verified, direct capacity editing is blocked; the university can
record a simulated reconsideration reason without changing the verified batch
values.

## Academic calendar submissions

`UniversityCalendarSubmission` is owned by a university for an academic year
and programme type. Its scope can cover all delivery units, university teaching
units only, or selected delivery units. The submission records its title,
applicable semesters, structured review note, declaration and the lifecycle
`draft → submitted → under_review → returned or accepted → locked`.

`UniversityCalendarEntry` belongs to a submission and references one HEC
`CalendarMilestoneDefinition`. It retains both the locked Council baseline and
the university date, along with actual completion, variance, evidence and any
formal change-request reference.

Milestone fields are rendered from the HEC definition's `dateInputType`;
single dates, date ranges and deadlines therefore remain structured data.
Documents can be retained only as supporting references and never replace the
entry records as the authoritative university calendar.

Calendar scope is inherited by the selected `AcademicDeliveryUnit` records.
The UI summarises that coverage rather than visibly duplicating every calendar
entry for every college or teaching unit.

Calendar compliance is calculated only from the milestone alignment rule,
baseline, university date and an approved exception. Reporting-only milestones
remain distinct from date alignment.

The Sahya Semester 1 Theory Examination scenario is the locked
`UniversityCalendarEntry` referenced by CR-2026-014. Its shared state moves from
red unauthorised deviation, to amber during request review, stays amber after
approval pending publication, and becomes green only when Version 1.1 publishes
the approved exception.

## Cohorts and student strength

- `StudentCohort` identifies an admission-year group for a course offering.
- `SemesterStrengthSnapshot` belongs to a cohort and course batch. It records
  sanctioned capacity, Semester 1 admission intake, current strength,
  reporting status and the reporting date.
- Semester 1 monitoring uses **admission vacancy**: sanctioned capacity minus
  admission intake.
- Semester 2–8 monitoring uses **current strength gap**: sanctioned capacity
  minus current strength.
- Each active course batch has one aggregate snapshot for every supported
  semester. The eight-semester journey is therefore a cohort history, not a
  collection of individual student records.
- Semester 1 intake may be updated while admission is in progress. Finalising
  admission protects the reported intake; reopening it requires a reason that
  remains visible in the local audit history.

Derived gaps are clamped at zero; student counts never become negative. A
reported value above sanctioned capacity is retained, produces a fill rate over
100%, and must be shown with an explicit red “Above approved capacity” warning.
It is not silently capped.

Blank and zero have different meanings. Blank is stored as `null` and means no
report has been received. Zero is a valid whole-number report and means the
university deliberately reported no active students for that batch and
semester.

Every saved batch update records the previous value, new value, actor,
timestamp, course, delivery unit and semester in the immutable-looking local
audit stream. The HEC workspace reads these reports but has no mutation action
for university-submitted numbers.

## Status semantics

Calendar compliance RAG and seat-utilisation status are different concepts and
must have separate labels and legends. An on-time calendar does not imply full
admission, and a seat vacancy does not constitute a calendar violation.

The HEC capacity monitor exposes two explicit modes:

- **Semester 1 Admission Vacancy** = sanctioned capacity minus actual admitted
  students.
- **Semester 2–8 Current Strength Gap** = sanctioned capacity minus current
  reported strength.

These measures are never combined into an unexplained total. Seat-utilisation
thresholds live in `SEAT_UTILISATION_THRESHOLDS`: 90%–100% is Green, 70% to
below 90% is Amber, below 70% is Red, intake above capacity is Red, and an
unreported intake is Grey. Every status includes an icon, label and
human-readable reason and never uses calendar terms such as “Aligned”.

Institution-level vacancy figures remain restricted to HEC and university
workspaces. They are not automatically published through the public calendar
portal.

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
- twenty-seven course offerings with one or two batches, including Green
  Valley College, Sahya University Teaching Campus and Ananthapuri School of
  Computing capacity examples;
- admission cohorts and Semester 1–8 strength coverage;
- high-vacancy, full, not-reported and above-capacity examples; and
- the original CR-2026-014 calendar deviation.
