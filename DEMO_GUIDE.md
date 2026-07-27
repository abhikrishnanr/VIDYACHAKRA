# VIDYACHAKRA demo guide

## Product purpose

VIDYACHAKRA means “wheel of knowledge”:

- **Vidya** means knowledge or education.
- **Chakra** means wheel, cycle or connected system.

The name reflects the recurring university academic cycle from admissions and
classes through examinations, valuation and results. The product provides one
trusted academic timeline, structured university calendar submission,
statewide compliance monitoring, formal change governance and publication of
approved revisions.

This is an illustrative frontend prototype. It uses fictional institutions and
local browser state; it has no backend service or database.

## Core terminology

| Term | Meaning |
|---|---|
| HEC Calendar | The authoritative statewide academic and examination timeline. |
| Calendar Milestone | A structured academic event such as classes commencing, an assessment or an examination period. |
| Calendar Submission | A university’s structured annual calendar aligned against HEC milestone definitions. |
| Academic Delivery Unit | A university campus, department, centre, constituent college or affiliated college that delivers courses. |
| HEC Course Master | The official course catalogue. Universities cannot create course names. |
| Course Offering | One active HEC course linked to one academic delivery unit for one academic year. |
| Change Request | The formal route for proposing a change to a locked calendar date. |
| Approved Exception | A change approved through governance and published in an official calendar version. |

## Roles

| Role | Main purpose | Start route |
|---|---|---|
| Public user | Find official academic dates and approved revisions. | `/` |
| University user | Maintain institutional structure, submit structured calendars, manage official course offerings and request locked-date changes. | `/university/dashboard` |
| HEC Academic Monitoring Officer | Monitor calendar alignment, review submissions and verify course offerings. | `/hec/dashboard` |
| Empowered Committee Member | Review and decide formal calendar change requests. | `/workflow/dashboard` |
| HEC Calendar Administrator | Maintain master data and publish approved revisions. | `/administrator/dashboard` |
| Executive viewer | Read a concise statewide academic pulse. | `/executive/dashboard` |

Use `/login` to switch workspaces.

## Calendar compliance status

- **Green — Aligned:** the university date matches the approved calendar or is
  covered by a published exception.
- **Amber — Attention required:** confirmation, review or publication is still
  pending.
- **Red — Confirmed deviation:** an unauthorised date difference remains.
- **Grey — Not applicable:** the milestone does not apply.

Every status includes an icon and text.

## Guided calendar-governance demonstration

The floating **Demo story** control provides these steps:

1. Open `/calendar?event=semester-1-theory-examination&view=agenda`.
   Open **Semester 1 Theory Examination** and show the official date of
   5 December 2026.
2. Open `/hec/compliance`.
   Select Sahya Higher Studies University’s red **Theory Examination** cell and
   show the university date of 12 December 2026 with a +7 day variance.
3. Switch to the University workspace and open
   `/university/change-requests/new`.
   Complete the prefilled CR-2026-014 flow and click **Submit Change Request**.
4. Switch to the HEC Monitoring workspace and open
   `/workflow/requests/CR-2026-014`.
   Click **Recommend Approval**.
5. Switch to the Committee workspace on the same route.
   Choose **Approve with Conditions**, retain the suggested condition and
   record the decision.
6. Switch to the Calendar Administrator workspace and open `/hec/publication`.
   Click **Publish Version 1.1**.
7. Return to `/calendar?event=semester-1-theory-examination&view=agenda`.
   Confirm the revised date, Version 1.1 and public revision notice.
8. Open `/hec/compliance` and confirm the Sahya cell is now green with the
   label **Approved Exception**.

## Course and institution demonstration

1. Open `/hec/masters/courses` as the Calendar Administrator.
   Show that course names and codes are controlled by HEC.
2. Open `/hec/institutions`.
   Compare a teaching university, an affiliating university and a hybrid
   university.
3. Open `/hec/institutions/ananthapuri`.
   Show that direct university campuses and departments are valid academic
   delivery units.
4. Open `/university/course-offerings`.
   Show official courses grouped by delivery unit.
5. Click **Create Course Offering**.
   Demonstrate the searchable **Course from HEC Course Master** selector and
   the absence of any free-text course option.
6. Open `/hec/course-offerings`.
   Select a submitted record, review its course, delivery unit and approval
   reference, then use **Verify Offering** or **Return for Correction**.

## Direct university teaching and affiliated colleges

The product uses one compatible `AcademicDeliveryUnit` model:

- A teaching university delivers courses through its campus, departments and
  centres.
- An affiliating university delivers courses through constituent or affiliated
  colleges.
- A hybrid university may use both.

Direct university teaching units are not displayed as colleges. Every course
offering still belongs to a valid delivery unit.

## Important routes

### Public

- `/`
- `/calendar`
- `/login`

### HEC

- `/hec/dashboard`
- `/hec/compliance`
- `/hec/calendar-submissions`
- `/hec/course-offerings`
- `/hec/masters/academic-years`
- `/hec/masters/calendar-milestones`
- `/hec/masters/courses`
- `/hec/institutions`
- `/hec/institutions/[id]`
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
- `/university/change-requests`
- `/university/change-requests/new`
- `/university/colleges`

### Workflow and audit

- `/workflow/dashboard`
- `/workflow/requests/CR-2026-014`
- `/workflow/decisions`
- `/audit`

### Executive

- `/executive/dashboard`

## Seven-minute presentation

| Time | Screen |
|---|---|
| 0:00–0:50 | `/` — meaning, purpose and public search. |
| 0:50–1:30 | `/calendar` — official examination event. |
| 1:30–2:20 | `/hec/dashboard` — statewide Academic Pulse. |
| 2:20–3:10 | `/hec/compliance` — Sahya +7 day deviation. |
| 3:10–4:00 | `/university/change-requests/new` — submit CR-2026-014. |
| 4:00–5:00 | `/workflow/requests/CR-2026-014` — recommendation and committee decision. |
| 5:00–5:50 | `/hec/publication` — publish Version 1.1. |
| 5:50–6:25 | `/calendar` — confirm the public update. |
| 6:25–7:00 | `/university/course-offerings` — official courses by delivery unit. |

## Fifteen-minute presentation

Use the seven-minute sequence, then add:

1. `/hec/calendar-submissions` — structured baseline comparison and locking.
2. `/hec/masters/calendar-milestones` — dynamic date field definitions.
3. `/hec/masters/courses` — authoritative course catalogue.
4. `/hec/institutions` — all three university operating models.
5. `/university/institution-structure` — direct teaching and colleges together.
6. `/university/course-offerings/new` — official course selection.
7. `/hec/course-offerings` — course-offering verification.
8. `/audit` — immutable-looking workflow and version history.
9. `/executive/dashboard` — leadership summary and presentation mode.

## Reset and recovery

Use **Reset demo** from the profile menu or the Demo story drawer. This returns
the prototype to Version 1.0 with CR-2026-014 in draft and the Sahya Theory
Examination cell red.

If the demo already shows Version 1.1:

1. Open the profile menu.
2. Choose **Reset demo**.
3. Confirm the reset.
4. Return to `/hec/compliance` and verify the red +7 day Sahya deviation.

If local state fails to hydrate, refresh once and use **Reset demo**. The
versioned migration keeps supported calendar workflow state and removes
retired prototype collections.
