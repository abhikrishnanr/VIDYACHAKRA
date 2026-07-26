import type {
  CommitteeDecision,
  DemoAuditRecord,
  HecRecommendation,
  RequestStatus,
  RevisionPublicationState,
} from "./types";

export type WorkflowState = {
  requestStatus: RequestStatus;
  hecRecommendation: HecRecommendation;
  committeeDecision: CommitteeDecision;
  revisionPublicationState: RevisionPublicationState;
  institutionsNotified: boolean;
  publicCalendarUpdated: boolean;
};

export type WorkflowStage = {
  number: number;
  label: string;
  role: string;
  date: string;
  audit: string;
  state: "complete" | "current" | "upcoming";
};

export const workflowLifecycle = [
  {
    label: "Drafted by University",
    role: "University Nodal Officer",
    date: "26 Jul 2026 · 09:05",
    audit: "Draft record CR-2026-014 created",
  },
  {
    label: "Submitted by University",
    role: "University Nodal Officer",
    date: "26 Jul 2026 · 15:08",
    audit: "Submission receipt and evidence manifest recorded",
  },
  {
    label: "Scrutiny by HEC Academic Officer",
    role: "HEC Academic Monitoring Officer",
    date: "27 Jul 2026 · 10:15",
    audit: "Baseline, evidence and institutional impact checked",
  },
  {
    label: "Recommendation Recorded",
    role: "HEC Academic Monitoring Officer",
    date: "27 Jul 2026 · 11:20",
    audit: "Officer recommendation added without changing Version 1.0",
  },
  {
    label: "Empowered Committee Review",
    role: "Empowered Committee",
    date: "29 Jul 2026 · 15:30",
    audit: "Agenda item EC/FYUGP/2026/08 opened",
  },
  {
    label: "Approved, Rejected or Returned",
    role: "Empowered Committee",
    date: "29 Jul 2026 · 16:05",
    audit: "Signed committee decision retained with meeting record",
  },
  {
    label: "Publication by HEC Calendar Administrator",
    role: "HEC Calendar Administrator",
    date: "02 Aug 2026 · 10:00",
    audit: "Version 1.1 created; Version 1.0 retained",
  },
  {
    label: "Institutions Notified",
    role: "VIDYACHAKRA Notification Service",
    date: "02 Aug 2026 · 10:03",
    audit: "Notification receipt issued to governed institutions",
  },
  {
    label: "Public Calendar Updated",
    role: "VIDYACHAKRA Publication Service",
    date: "02 Aug 2026 · 10:04",
    audit: "Approved exception made visible on the public calendar",
  },
] as const;

function currentStageIndex(state: WorkflowState) {
  if (state.publicCalendarUpdated) return 8;
  if (state.institutionsNotified) return 7;
  if (state.revisionPublicationState === "published") return 6;
  if (state.requestStatus === "approved") return 6;
  if (
    state.committeeDecision !== "pending" ||
    state.requestStatus === "rejected"
  ) {
    return 5;
  }
  if (state.requestStatus === "committee-review") return 4;
  if (state.hecRecommendation !== "pending") return 3;
  if (state.requestStatus === "screening") return 2;
  if (state.requestStatus === "submitted") return 2;
  if (state.requestStatus === "returned") return 1;
  return 0;
}

export function buildWorkflowStages(state: WorkflowState): WorkflowStage[] {
  const activeIndex = currentStageIndex(state);
  return workflowLifecycle.map((stage, index) => ({
    number: index + 1,
    ...stage,
    date:
      index > activeIndex
        ? "Pending"
        : index === 2 &&
            state.requestStatus === "submitted" &&
            state.hecRecommendation === "pending"
          ? "Awaiting officer action"
          : stage.date,
    state:
      index < activeIndex
        ? "complete"
        : index === activeIndex
          ? state.publicCalendarUpdated
            ? "complete"
            : "current"
          : "upcoming",
  }));
}

export const supportingEvidence = [
  {
    name: "District disruption assessment",
    type: "PDF · 2.4 MB",
    reference: "SHSU/MONSOON/2026/04",
  },
  {
    name: "Consolidated college impact note",
    type: "PDF · 1.8 MB",
    reference: "SHSU/COLLEGES/2026/18",
  },
  {
    name: "Academic Council proceedings extract",
    type: "PDF · 940 KB",
    reference: "SHSU/AC/2026/77",
  },
];

export const relatedWorkflowRequests = [
  {
    id: "CR-2026-008",
    university: "Malabar Learning University",
    event: "Internal Assessment 2",
    originalDate: "19 Oct 2026",
    proposedDate: "21 Oct 2026",
    variance: "+2 days",
    impact: "42 colleges · 8,200 students",
    stage: "Awaiting scrutiny",
    submitted: "25 Jul 2026",
    priority: "Standard",
    bucket: "scrutiny",
  },
  {
    id: "CR-2026-011",
    university: "Kuttanad Knowledge University",
    event: "Centralised Valuation",
    originalDate: "19 Dec 2026",
    proposedDate: "22 Dec 2026",
    variance: "+3 days",
    impact: "12 colleges · result window unchanged",
    stage: "Committee decision",
    submitted: "24 Jul 2026",
    priority: "High",
    bucket: "committee",
  },
  {
    id: "CR-2026-005",
    university: "Vembanad Academic University",
    event: "Practical Examination",
    originalDate: "25 Nov 2026",
    proposedDate: "27 Nov 2026",
    variance: "+2 days",
    impact: "6 specialist colleges",
    stage: "Approved · Awaiting publication",
    submitted: "18 Jul 2026",
    priority: "Standard",
    bucket: "publication",
  },
  {
    id: "CR-2026-003",
    university: "Periyar Valley University",
    event: "Classes Commence",
    originalDate: "03 Aug 2026",
    proposedDate: "10 Aug 2026",
    variance: "+7 days",
    impact: "Clarification on admission closure required",
    stage: "Returned",
    submitted: "16 Jul 2026",
    priority: "Standard",
    bucket: "returned",
  },
];

export const baseWorkflowAudit: DemoAuditRecord[] = [
  {
    id: "wf-a1",
    action: "Master calendar published and locked",
    actor: "Leela Krishnan",
    actorRole: "HEC Calendar Administrator",
    scope: "FYUGP Academic Calendar 2026–27",
    timestamp: "15 Jun 2026 · 10:42",
    detail:
      "Version 1.0 established the governed baseline for participating universities.",
    previousValue: "Calendar draft 0.9",
    newValue: "Version 1.0 · Published and Locked",
    workflowStage: "Official Baseline Publication",
    reference: "KSHEC/ACAD/CAL/2026/01",
  },
  {
    id: "wf-a2",
    action: "University calendar adoption recorded",
    actor: "Prof. Anjali Menon",
    actorRole: "University Nodal Officer",
    scope: "Sahya Higher Studies University",
    timestamp: "18 Jul 2026 · 12:10",
    detail:
      "Sahya adopted Version 1.0; the Council dates remained locked and unchanged.",
    previousValue: "Adoption pending",
    newValue: "Version 1.0 adopted",
    workflowStage: "Institution Adoption",
    reference: "SHSU/FYUGP/ADOPT/2026/01",
  },
  {
    id: "wf-a3",
    action: "Theory examination variance detected",
    actor: "VIDYACHAKRA Monitoring Service",
    actorRole: "Automated Monitoring",
    scope: "Semester 1 Theory Examination",
    timestamp: "25 Jul 2026 · 16:18",
    detail:
      "A seven-day institution schedule variance was flagged without altering the Council baseline.",
    previousValue: "Council date · 05 Dec 2026",
    newValue: "University schedule · 12 Dec 2026",
    workflowStage: "Deviation Detection",
    reference: "CR-2026-014",
  },
  {
    id: "wf-a4",
    action: "Change request drafted",
    actor: "Prof. Anjali Menon",
    actorRole: "University Nodal Officer",
    scope: "Semester 1 Theory Examination",
    timestamp: "26 Jul 2026 · 09:05",
    detail:
      "A formal request was opened with the proposed date and impact evidence.",
    previousValue: "No request",
    newValue: "CR-2026-014 · Draft",
    workflowStage: "Drafted by University",
    reference: "CR-2026-014",
  },
];

export function requestStageLabel(state: WorkflowState) {
  if (state.revisionPublicationState === "published") {
    return "Published · Institutions notified";
  }
  if (state.requestStatus === "approved") {
    return "Approved · Awaiting publication";
  }
  if (state.requestStatus === "committee-review") {
    return "Empowered Committee review";
  }
  if (state.requestStatus === "returned") return "Returned for clarification";
  if (state.requestStatus === "rejected") return "Rejected";
  if (state.requestStatus === "submitted" || state.requestStatus === "screening") {
    return "Awaiting HEC scrutiny";
  }
  return "Drafted by University";
}

