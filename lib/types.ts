export type DemoRoleId =
  | "public"
  | "university"
  | "monitoring"
  | "committee"
  | "administrator"
  | "executive";

export type WorkspaceRole = Exclude<DemoRoleId, "public">;

export type AcademicYearLabel = string;
export type Programme = "Four Year Undergraduate Programme (FYUGP)";
export type Semester = "Semester 1" | "Semester 3";
export type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AcademicYearStatus = "planned" | "active" | "closed";

export type AcademicYear = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  admissionYear: number;
  status: AcademicYearStatus;
};

export type CalendarDateInputType =
  | "single_date"
  | "date_range"
  | "deadline";

export type CalendarAlignmentRule =
  | "exact_date"
  | "permitted_window"
  | "reporting_only";

export type ProgrammeType =
  | "FYUGP"
  | "Undergraduate"
  | "Postgraduate"
  | "Professional"
  | "Vocational";

export type CalendarMilestoneDefinition = {
  id: string;
  code: string;
  title: string;
  description: string;
  category:
    | "Admission"
    | "Academic activity"
    | "Assessment"
    | "Examination"
    | "Valuation"
    | "Result"
    | "Governance";
  dateInputType: CalendarDateInputType;
  applicableSemesters: SemesterNumber[];
  applicableProgrammeTypes: ProgrammeType[];
  alignmentRule: CalendarAlignmentRule;
  toleranceBeforeDays: number;
  toleranceAfterDays: number;
  mandatory: boolean;
  displayOrder: number;
  active: boolean;
};

export type CourseMaster = {
  id: string;
  courseCode: string;
  courseName: string;
  shortName: string;
  qualificationLevel: "Undergraduate" | "Postgraduate" | "Diploma";
  discipline: string;
  programmeType: ProgrammeType;
  durationYears: number;
  totalSemesters: SemesterNumber;
  active: boolean;
  effectiveFromAcademicYear: string;
  description: string;
};

export type UniversityOperatingModel =
  | "teaching_only"
  | "affiliating"
  | "hybrid";

export type UniversityProfile = {
  id: string;
  name: string;
  shortName: string;
  operatingModel: UniversityOperatingModel;
  district: string;
  active: boolean;
};

export type DeliveryUnitType =
  | "university_campus"
  | "university_department"
  | "university_centre"
  | "constituent_college"
  | "affiliated_college";

export type AcademicDeliveryUnit = {
  id: string;
  universityId: string;
  name: string;
  shortName: string;
  unitType: DeliveryUnitType;
  district: string;
  institutionCode: string;
  active: boolean;
};

export type UniversityCalendarSubmission = {
  id: string;
  universityId: string;
  academicYearId: string;
  programmeType: ProgrammeType;
  version: string;
  status:
    | "draft"
    | "submitted"
    | "under_review"
    | "returned"
    | "accepted"
    | "locked";
  scopeType:
    | "all_delivery_units"
    | "university_teaching_only"
    | "selected_delivery_units";
  selectedDeliveryUnitIds: string[];
  submittedAt: string | null;
  reviewedAt: string | null;
  lockedAt: string | null;
};

export type UniversityCalendarEntry = {
  id: string;
  submissionId: string;
  milestoneDefinitionId: string;
  semester: SemesterNumber;
  councilBaselineStartDate: string;
  councilBaselineEndDate: string | null;
  universityStartDate: string;
  universityEndDate: string | null;
  actualStartDate: string | null;
  actualEndDate: string | null;
  varianceDays: number;
  ragStatus: RagStatus;
  ragReason: string;
  deviationReason: string;
  evidenceStatus: "not_required" | "pending" | "submitted" | "verified";
  changeRequestId: string | null;
};

export type CourseOffering = {
  id: string;
  academicYearId: string;
  universityId: string;
  deliveryUnitId: string;
  courseMasterId: string;
  offeringStatus: "draft" | "submitted" | "verified" | "inactive";
  mode: "in_person" | "blended" | "online";
  shift: "day" | "evening" | "weekend";
  approvalReference: string;
  effectiveFrom: string;
  effectiveTo: string | null;
};

export type CourseBatch = {
  id: string;
  courseOfferingId: string;
  batchLabel: string;
  sanctionedCapacity: number;
  active: boolean;
};

export type StudentCohort = {
  id: string;
  courseOfferingId: string;
  admissionAcademicYearId: string;
  cohortLabel: string;
  admissionStatus: "not_started" | "in_progress" | "finalised";
  lastUpdatedAt: string | null;
};

export type SemesterStrengthSnapshot = {
  id: string;
  cohortId: string;
  courseBatchId: string;
  semesterNumber: SemesterNumber;
  sanctionedCapacity: number;
  currentStrength: number | null;
  admissionIntake: number | null;
  reportingDate: string;
  reportingStatus: "not_started" | "draft" | "submitted" | "verified";
  remarks: string;
  updatedAt: string | null;
};

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
  demoStateVersion: number;
  activeRole: DemoRoleId | null;
  activeInstitution: string;
  academicYear: AcademicYearLabel;
  defaultAcademicYearId: string;
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
  academicYears: AcademicYear[];
  calendarMilestoneDefinitions: CalendarMilestoneDefinition[];
  courseMasters: CourseMaster[];
  universityProfiles: UniversityProfile[];
  academicDeliveryUnits: AcademicDeliveryUnit[];
  universityCalendarSubmissions: UniversityCalendarSubmission[];
  universityCalendarEntries: UniversityCalendarEntry[];
  courseOfferings: CourseOffering[];
  courseBatches: CourseBatch[];
  studentCohorts: StudentCohort[];
  semesterStrengthSnapshots: SemesterStrengthSnapshot[];
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
    | "audit"
    | "master"
    | "course"
    | "admission"
    | "vacancy"
    | "structure"
    | "students";
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
