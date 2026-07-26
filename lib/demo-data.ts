import type { AcademicEvent, AuditEntry, InstitutionCompliance } from "./types";

export const academicYears = ["2026–27", "2025–26", "2024–25"];

export const statewideEvents: AcademicEvent[] = [
  {
    id: "semester-start",
    title: "Odd semester instruction begins",
    category: "Academic",
    start: "2026-08-03",
    audience: "All undergraduate institutions",
    owner: "Academic Coordination Cell",
  },
  {
    id: "enrolment-freeze",
    title: "First-year enrolment data freeze",
    category: "Governance",
    start: "2026-08-14",
    audience: "University nodal officers",
    owner: "State Data Secretariat",
    status: "attention",
  },
  {
    id: "onam-recess",
    title: "Onam academic recess",
    category: "Holiday",
    start: "2026-08-24",
    end: "2026-09-01",
    audience: "All institutions",
    owner: "State Calendar Secretariat",
  },
  {
    id: "internal-assessment",
    title: "Internal assessment window I",
    category: "Examination",
    start: "2026-09-21",
    end: "2026-09-26",
    audience: "Affiliated colleges",
    owner: "Examination Coordination Cell",
  },
  {
    id: "syllabus-review",
    title: "Semester syllabus coverage review",
    category: "Governance",
    start: "2026-10-09",
    audience: "Heads of institutions",
    owner: "Academic Coordination Cell",
    status: "on-track",
  },
  {
    id: "exam-registration",
    title: "End-semester examination registration",
    category: "Examination",
    start: "2026-10-12",
    end: "2026-10-23",
    audience: "University examination branches",
    owner: "Examination Coordination Cell",
  },
  {
    id: "instruction-close",
    title: "Last instructional day",
    category: "Academic",
    start: "2026-11-13",
    audience: "All institutions",
    owner: "Academic Coordination Cell",
  },
  {
    id: "semester-exams",
    title: "Odd semester examinations",
    category: "Examination",
    start: "2026-11-23",
    end: "2026-12-12",
    audience: "All participating institutions",
    owner: "University examination branches",
  },
];

export const institutions: InstitutionCompliance[] = [
  {
    id: "malabar",
    name: "Malabar Coast University",
    region: "North",
    submission: "Calendar ratified · 18 Jul",
    variance: "2 approved variations",
    status: "on-track",
  },
  {
    id: "periyar",
    name: "Periyar Valley University",
    region: "Central",
    submission: "Awaiting syndicate confirmation",
    variance: "1 open clarification",
    status: "attention",
  },
  {
    id: "travancore",
    name: "Travancore Institute of Higher Studies",
    region: "South",
    submission: "Calendar ratified · 21 Jul",
    variance: "No material variance",
    status: "on-track",
  },
  {
    id: "backwater",
    name: "Backwater Science & Arts University",
    region: "Central",
    submission: "Submission due 24 Jul",
    variance: "3 unresolved dates",
    status: "overdue",
  },
  {
    id: "wayanad",
    name: "Wayanad Highlands University",
    region: "North",
    submission: "Draft received · 23 Jul",
    variance: "Under academic review",
    status: "attention",
  },
  {
    id: "coastal",
    name: "Kerala Coastal College Consortium",
    region: "South",
    submission: "Reporting not started",
    variance: "Baseline pending",
    status: "not-reported",
  },
];

export const auditEntries: AuditEntry[] = [
  {
    id: "a1",
    action: "State calendar published",
    actor: "Dr. Meera Nair · HEC Secretariat",
    scope: "Academic year 2026–27",
    timestamp: "26 Jul 2026 · 10:42",
    detail: "Version 1.4 released to all participating universities.",
  },
  {
    id: "a2",
    action: "Variation request approved",
    actor: "Academic Coordination Cell",
    scope: "Malabar Coast University",
    timestamp: "25 Jul 2026 · 16:18",
    detail: "Monsoon contingency buffer accepted for two teaching days.",
  },
  {
    id: "a3",
    action: "Compliance note submitted",
    actor: "Prof. Anjali Menon · University Nodal Officer",
    scope: "Periyar Valley University",
    timestamp: "25 Jul 2026 · 12:05",
    detail: "Syndicate meeting date supplied for final calendar ratification.",
  },
  {
    id: "a4",
    action: "Examination window revised",
    actor: "Examination Coordination Cell",
    scope: "All participating institutions",
    timestamp: "24 Jul 2026 · 17:30",
    detail: "Registration window extended by three working days.",
  },
];

export const navigationByRole = {
  hec: [
    { label: "Overview", href: "/hec/dashboard" },
    { label: "Compliance", href: "/hec/compliance" },
    { label: "State calendar", href: "/calendar" },
    { label: "Audit trail", href: "/audit" },
  ],
  university: [
    { label: "Overview", href: "/university/dashboard" },
    { label: "Calendar workspace", href: "/university/calendar" },
    { label: "State calendar", href: "/calendar" },
    { label: "Audit trail", href: "/audit" },
  ],
  workflow: [
    { label: "Governance queue", href: "/workflow/dashboard" },
    { label: "State calendar", href: "/calendar" },
    { label: "Audit trail", href: "/audit" },
  ],
  executive: [
    { label: "Executive view", href: "/executive/dashboard" },
    { label: "Compliance", href: "/hec/compliance" },
    { label: "State calendar", href: "/calendar" },
  ],
};
