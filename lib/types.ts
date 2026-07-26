export type DemoRoleId =
  | "public"
  | "university"
  | "monitoring"
  | "committee"
  | "administrator"
  | "executive";

export type WorkspaceRole = Exclude<DemoRoleId, "public">;

export type AcademicYear = "2026–27";
export type Programme = "Four Year Undergraduate Programme (FYUGP)";
export type Semester = "Semester 1" | "Semester 3";

export type RequestStatus =
  | "draft"
  | "submitted"
  | "screening"
  | "committee-review"
  | "returned"
  | "approved"
  | "rejected"
  | "published";

export type PublicationStatus = "draft" | "published" | "locked";
export type HecRecommendation =
  | "pending"
  | "approval"
  | "rejection"
  | "clarification";
export type CommitteeDecision =
  | "pending"
  | "approved"
  | "approved-with-conditions"
  | "returned"
  | "rejected";
export type RevisionPublicationState = "not-started" | "ready" | "published";
export type RagStatus = "green" | "amber" | "red" | "grey";

export type CompletionReport = {
  actualDate: string;
  remarks: string;
  evidenceType: string;
  attachmentName: string;
  submittedAt: string;
};

export type DemoAuditRecord = {
  id: string;
  action: string;
  actor: string;
  scope: string;
  timestamp: string;
  detail: string;
  actorRole?: string;
  previousValue?: string;
  newValue?: string;
  workflowStage?: string;
  reference?: string;
};

export type EventType =
  | "publication"
  | "admission"
  | "instruction"
  | "registration"
  | "assessment"
  | "feedback"
  | "examination"
  | "valuation"
  | "result";

export type DemoSessionState = {
  activeRole: DemoRoleId | null;
  activeInstitution: string;
  academicYear: AcademicYear;
  selectedProgramme: Programme;
  selectedSemester: Semester;
  requestStatus: RequestStatus;
  masterCalendarVersion: string;
  publicationStatus: PublicationStatus;
  notificationCount: number;
  completedEventConfirmations: string[];
  completionReports: Record<string, CompletionReport>;
  demoAuditEntries: DemoAuditRecord[];
  hecRecommendation: HecRecommendation;
  officerNote: string;
  committeeDecision: CommitteeDecision;
  committeeCondition: string;
  committeeMeetingNote: string;
  revisionPublicationState: RevisionPublicationState;
  publicationSchedule: string;
  institutionsNotified: boolean;
  publicCalendarUpdated: boolean;
  bookmarkedEvents: string[];
};

export type RoleNavigationItem = {
  label: string;
  href: string;
  icon:
    | "dashboard"
    | "calendar"
    | "compliance"
    | "institution"
    | "request"
    | "version"
    | "report"
    | "agenda"
    | "decision"
    | "impact"
    | "publication"
    | "alert"
    | "audit";
};

export type DemoRoleDefinition = {
  id: DemoRoleId;
  label: string;
  shortLabel: string;
  description: string;
  identity: string;
  destination: string;
  permissions: string[];
  navigation: RoleNavigationItem[];
  accent: "navy" | "teal" | "green" | "gold" | "terracotta" | "slate";
};

export type AcademicMilestone = {
  id: string;
  title: string;
  councilBaselineDate: string;
  institutionScheduledDate: string;
  actualCompletionDate: string | null;
  eventType: EventType;
  programme: Programme;
  semester: Semester;
  scope: string;
  publicationStatus: PublicationStatus;
  ragStatus: RagStatus;
  ragReason: string;
  version: string;
  authorityReference: string;
  changeRequestStatus: RequestStatus | "none";
  affectedCollegeCount: number;
};

export type ComplianceStatus =
  | "on-track"
  | "attention"
  | "overdue"
  | "not-reported";

export type AcademicEvent = {
  id: string;
  title: string;
  category: "Academic" | "Examination" | "Governance" | "Holiday";
  start: string;
  end?: string;
  audience: string;
  status?: ComplianceStatus;
  owner: string;
};

export type InstitutionCompliance = {
  id: string;
  name: string;
  region: string;
  submission: string;
  variance: string;
  status: ComplianceStatus;
  colleges: string[];
};

export type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  scope: string;
  timestamp: string;
  detail: string;
};
