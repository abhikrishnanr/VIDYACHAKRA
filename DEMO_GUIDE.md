# VIDYACHAKRA Demonstration Guide

## Product purpose

**VIDYACHAKRA** combines *vidya* (knowledge or learning) with *chakra*
(a wheel or continuous cycle). The name represents the recurring academic
cycle from admissions and classes through examinations, valuation, results and
the next academic year.

VIDYACHAKRA gives Kerala higher education one trusted, structured calendar and
one traceable governance process. It helps:

- students and families find official academic dates;
- universities adopt the Council calendar, report completion and request
  justified changes;
- HEC monitor calendar alignment, course capacity, intake, vacancies and
  aggregate semester strength;
- authorised officers review, approve and publish calendar changes without
  silently editing an official date; and
- senior leadership understand risk without opening operational registers.

This repository is an **illustrative local-state prototype**. Institution names
and statistics are fictional. No credentials or individual student records are
used.

Production demonstration URL:
[https://vidyachakra.vercel.app](https://vidyachakra.vercel.app)

## Guided Demo control

A persistent **Demo stories** button appears at the lower-left of every route.
It offers:

- **Story A — Calendar governance**
- **Story B — Capacity & vacancy**

The control links to each presentation step and shows governance progress. It
also includes **Reset governance story**. On small screens, the button remains
compact and the story guide opens as a full-height drawer.

## Domain terminology

| Term | Meaning in VIDYACHAKRA |
| --- | --- |
| Academic Year | The governed annual context, such as 2026–27. |
| Calendar Milestone Definition | An HEC-defined date field such as a single date, date range or deadline. |
| University Calendar Submission | A structured annual calendar submitted by a university; a PDF is never the authoritative calendar. |
| University Calendar Entry | One milestone date inside a submission. After acceptance and locking, it cannot be edited directly. |
| Academic Delivery Unit | A common model for a university campus, department, centre, constituent college or affiliated college. |
| HEC Course Master | The authoritative catalogue of courses. Universities select courses from this master and cannot create free-text course names. |
| Course Offering | One HEC course offered by one Academic Delivery Unit in one Academic Year. |
| Approved Batch | A capacity-bearing batch within a Course Offering, such as Batch A with 40 sanctioned seats. |
| Student Cohort | Aggregate students admitted to a Course Offering in one admission year. No individual student records are stored. |
| Semester Strength | The aggregate active-student figure reported for a cohort and batch in a semester. Blank means not reported; zero means a deliberate report of zero. |
| Change Request | The formal workflow used to propose a change to a locked calendar entry. |
| Published Version | An immutable official calendar release. A later version is appended; the earlier value remains visible. |

### Calendar compliance status

Calendar RAG answers whether an institution follows the official calendar:

- **Green — Aligned:** matches the published date or is covered by a published
  exception.
- **Amber — Attention:** confirmation, evidence, review or publication is
  pending.
- **Red — Deviation:** an unauthorised or overdue difference remains.
- **Grey — Not applicable:** the milestone does not apply.

### Seat utilisation status

Seat-utilisation RAG is deliberately separate from calendar compliance:

- **Green — Healthy utilisation:** fill rate from 90% to 100%.
- **Amber — Moderate vacancy:** fill rate from 70% to below 90%.
- **Red — High vacancy or above capacity:** fill rate below 70%, or reported
  intake exceeds approved capacity.
- **Grey — Not reported:** intake is blank.

Never describe a seat position as “Aligned” and never describe a calendar date
as “High vacancy.”

### Semester 1 vacancy versus Semester 2–8 strength gap

**Semester 1 Admission Vacancy**

> Sanctioned capacity − actual admitted students

This is an admission measure. For Green Valley College, 80 sanctioned seats
minus 63 admitted students equals 17 admission vacancies.

**Semester 2–8 Current Strength Gap**

> Sanctioned cohort capacity − current reported active strength

This is a continuing-cohort measure. It does not automatically mean that fresh
admission is allowed in that semester.

## Available roles

Open `/login` and select a workspace:

| Role | Primary responsibility | Main entry route |
| --- | --- | --- |
| Public User | Find published dates and approved revisions. | `/calendar` |
| University Nodal Officer | Submit structured calendars, manage offerings, report aggregate strength and request date changes. | `/university/dashboard` |
| HEC Academic Monitoring Officer | Monitor alignment, submissions, capacity, intake and reporting gaps. Master data is read-only for this role. | `/hec/dashboard` |
| Empowered Committee Member | Review evidence and record decisions on calendar change requests. | `/workflow/dashboard` |
| HEC Calendar Administrator | Manage master data and publish approved calendar versions. | `/administrator/dashboard` |
| Executive Viewer | Read a concise statewide academic pulse. | `/executive/dashboard` |

The workspace switcher in the top bar changes roles without losing the local
demo state.

## Story A — Academic Calendar Governance

### Starting state

- Master calendar: **Version 1.0 — Published and Locked**
- CR-2026-014: **Draft**
- Sahya Theory Examination: **Red — Unauthorised deviation**
- Council date: **5 December 2026**
- University scheduled date: **12 December 2026**
- Variance: **+7 days**
- Affected colleges: **18**

### Exact demonstration steps

1. Open `/calendar`.
   - In **Search calendar**, enter `Semester 1 Theory Examination`.
   - Click the **Dec 05 — Semester 1 Theory Examination** agenda row.
   - Point out **Official**, **Version 1.0**, the Council date and authority.

2. Open `/hec/compliance`.
   - Optionally click **Show Red Only**.
   - In the Sahya row, click the **Unauthorised deviation · +7 days** Theory
     Examination cell.
   - Show the Council date, institution date, variance, 18 affected colleges
     and CR-2026-014 draft marker.

3. Open `/university/change-requests/new`.
   - Step 1: confirm **Semester 1 Theory Examination**, then click **Continue**.
   - Step 2: compare 5 December with 12 December, then click **Continue**.
   - Step 3: show the prefilled monsoon reason, 18 colleges, 11,460 students
     and downstream impacts, then click **Continue**.
   - Step 4: show the simulated evidence list, then click **Continue**.
   - Step 5: select the declaration and click **Submit CR-2026-014**.
   - Point out that the request is Submitted and compliance is now Amber.

4. Open `/workflow/requests/CR-2026-014`.
   - Compare **Current Approved Calendar** with **Proposed Revision**.
   - In **HEC Academic Officer**, click **Recommend Approval**.
   - In **Empowered Committee**, keep the prefilled condition and click
     **Approve with Conditions**.
   - Point out that the request remains Amber until publication.

5. Open `/hec/publication`.
   - Review Version 1.0 versus proposed Version 1.1.
   - Click **Publish Version 1.1**.
   - In the restrained success state, click **View public calendar**.

6. In the public event drawer:
   - show the retained **Official Council date: 5 December 2026**;
   - show **Approved date: 12 December 2026**;
   - show **Version 1.1** and the `KSHEC/ACAD/CAL/2026/01-R1` authority.

7. Return to `/hec/compliance`.
   - The same Sahya cell is now **Green — Approved exception**.
   - Open `/audit` and click **Compare Versions** to show that Version 1.0 was
     retained rather than overwritten.

## Story B — Course Capacity and Vacancy Monitoring

### Starting facts

- Course: **B.Sc. Computer Science**
- Green Valley College:
  - two approved batches of 40;
  - 80 sanctioned seats;
  - 63 actual admissions;
  - 17 Semester 1 admission vacancies;
  - 78.75% fill rate;
  - Amber — Moderate vacancy.
- Ananthapuri School of Computing:
  - a direct **University Department**, not a college;
  - one approved batch of 50.

### Exact demonstration steps

1. Open `/hec/admissions`.
   - Show the **Admission Capacity Pulse** and the active
     **Mode 1 — Semester 1 Admission Vacancy** definition.
   - Point out sanctioned seats, reported admissions, vacancies, fill rate,
     high-vacancy courses and above-capacity reporting.

2. Click **Explore by Course** to open `/hec/vacancies`.
   - The default course is **B.Sc. Computer Science**.
   - If changed, use **Select a course to view statewide seat position** and
     select B.Sc. Computer Science.

3. In the institution matrix, click **Green Valley College**.
   - Show **2 batches**, **80 sanctioned**, **63 actual intake** and
     **17 vacancy**.
   - Show Batch A at 40/34 and Batch B at 40/29.

4. Close the drawer and click **Ananthapuri University — School of
   Computing**.
   - Point out the **University Department** unit type.
   - Explain that direct university teaching and colleges use the same Course
     Offering and capacity model.

5. Open `/university/student-strength/cohort-off-001`.
   - Show the **Semester journey** from Semester 1 through Semester 8.
   - Click any semester node to switch the update panel.
   - For Semester 2–8, emphasise **Current Strength Gap**, not admission
     vacancy.

6. Return to `/hec/admissions` and scroll to **Reporting completeness**.
   - Show the **Not reported** institution count and the watchlist item whose
     intake is blank.
   - Click **Send Reminder**.
   - Confirm the `Admission reminder sent` toast.

## Seven-minute presentation sequence

| Time | Screen and action |
| --- | --- |
| 0:00–0:45 | `/` — explain VIDYACHAKRA and search-led public experience. |
| 0:45–1:20 | `/calendar` — open the official 5 December examination event. |
| 1:20–2:05 | `/hec/compliance` — open Sahya’s red +7-day cell. |
| 2:05–3:05 | `/university/change-requests/new` — move quickly through the prefilled request and submit. |
| 3:05–4:15 | `/workflow/requests/CR-2026-014` — recommend and approve with conditions. |
| 4:15–4:55 | `/hec/publication` — publish Version 1.1 and verify the public update. |
| 4:55–5:40 | `/hec/admissions` — explain the statewide Admission Capacity Pulse. |
| 5:40–6:35 | `/hec/vacancies` — show Green Valley 80/63/17 and Ananthapuri direct teaching. |
| 6:35–7:00 | `/university/student-strength/cohort-off-001` — close with the eight-semester journey. |

## Fifteen-minute presentation sequence

1. **Public purpose — 1 minute**
   - `/`
   - `/calendar`

2. **HEC academic pulse — 1.5 minutes**
   - `/hec/dashboard`
   - `/hec/compliance`

3. **Structured university calendar — 1.5 minutes**
   - `/university/calendar-submissions`
   - `/university/calendar-submissions/new`
   - explain milestone definitions, scope inheritance and locked entries.

4. **Change governance — 4 minutes**
   - submit CR-2026-014;
   - recommend approval;
   - approve with conditions;
   - publish Version 1.1;
   - verify `/audit`.

5. **Institution structure and course authority — 1.5 minutes**
   - `/university/institution-structure`
   - `/hec/masters/courses`
   - explain AcademicDeliveryUnits and HEC-only Course Master maintenance.

6. **Offerings and approved batches — 1.5 minutes**
   - `/university/course-offerings`
   - `/university/course-offerings/new`
   - show the calculated total from batch capacities.

7. **Admission capacity and vacancy — 2 minutes**
   - `/hec/admissions`
   - `/hec/vacancies`
   - show Green Valley and Ananthapuri School of Computing.

8. **Cohort strength and reporting — 1.5 minutes**
   - `/university/student-strength/cohort-off-001`
   - `/hec/student-strength`
   - send the simulated reminder.

9. **Executive close — 0.5 minute**
   - `/executive/dashboard`
   - enable presentation mode and summarise the statewide position.

## Route reference

### Public

- `/`
- `/calendar`
- `/login`

### HEC monitoring and governance

- `/hec/dashboard`
- `/hec/compliance`
- `/hec/calendar-submissions`
- `/hec/calendar-submissions/[id]`
- `/hec/admissions`
- `/hec/vacancies`
- `/hec/student-strength`
- `/hec/course-offerings`
- `/hec/masters/academic-years`
- `/hec/masters/calendar-milestones`
- `/hec/masters/courses`
- `/hec/institutions`
- `/hec/institutions/[id]`
- `/hec/institutions/[id]/capacity`
- `/hec/courses/[courseId]/monitor`
- `/hec/publication`

### University

- `/university/dashboard`
- `/university/institution-structure`
- `/university/calendar`
- `/university/calendar-submissions`
- `/university/calendar-submissions/new`
- `/university/calendar-submissions/[id]`
- `/university/course-offerings`
- `/university/course-offerings/new`
- `/university/course-offerings/[id]`
- `/university/student-strength`
- `/university/student-strength/[cohortId]`
- `/university/student-strength/bulk-update`
- `/university/change-requests`
- `/university/change-requests/new`
- `/university/colleges`

### Workflow, audit and executive

- `/workflow/dashboard`
- `/workflow/requests/CR-2026-014`
- `/workflow/decisions`
- `/audit`
- `/executive/dashboard`

## Direct university teaching versus affiliated colleges

An **AcademicDeliveryUnit** is the common delivery model:

- University Campus
- University Department
- University Centre
- Constituent College
- Affiliated College

A teaching-only university such as Ananthapuri can offer courses through its
own campus and departments without any college record. An affiliating university
can deliver through colleges. A hybrid university such as Sahya can do both.

Every Course Offering, approved batch and student-strength report points to an
AcademicDeliveryUnit. A university department is therefore a valid teaching
unit, but it is never relabelled as a college.

## Reset and recovery

### Normal reset

1. Click **Demo stories**.
2. Click **Reset governance story**.
3. In the confirmation dialog, click **Reset demo**.

Alternative:

1. Open the profile menu in any role workspace.
2. Click **Reset demo**.
3. Confirm **Reset demo**.

Expected reset state:

- Version 1.0 is published and locked.
- CR-2026-014 is Draft.
- Sahya Theory Examination is Red with a +7-day unauthorised deviation.
- notification and audit additions from the previous run are cleared.
- master data, offerings, batches and aggregate strength return to their
  illustrative defaults.

### If the governance story is already completed

- Use the reset steps above before starting Story A.
- If time is limited, start at `/hec/publication` to show the completed success
  state, then use `/audit` to compare Versions 1.0 and 1.1.
- Do not attempt to “undo” a published value through the calendar screen. The
  correct recovery is **Reset demo**.

### If a page looks stale after switching roles

1. Allow the route to finish loading; local state hydrates from the current
   browser.
2. Navigate once through the **Demo stories** control or the workspace
   switcher.
3. If the state is still unsuitable for presentation, use **Reset demo**.

### If a draft form was partially completed

The prototype stores authoritative shared demo state, while some unfinished
form fields remain component-local. Return to the form’s first step or reset the
demo. Published calendar history, completed workflow actions and aggregate
reporting state are restored through the versioned local-state migration.
