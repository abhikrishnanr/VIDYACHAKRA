"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AcademicYearLabel,
  AcademicYear,
  AcademicDeliveryUnit,
  CalendarMilestoneDefinition,
  CommitteeDecision,
  CompletionReport,
  CourseBatch,
  CourseMaster,
  CourseOffering,
  DemoRoleId,
  DemoSessionState,
  HecRecommendation,
  Programme,
  RequestStatus,
  RevisionPublicationState,
  Semester,
  StrengthReportUpdate,
  UniversityCalendarEntry,
  UniversityCalendarSubmission,
  UniversityOperatingModel,
} from "./types";
import { defaultDomainState } from "./domain-data";
import { findDuplicateOffering } from "./course-offerings";

type Toast = { id: number; title: string; message: string };

export const DEMO_STATE_VERSION = 9;

export const initialDemoState: DemoSessionState = {
  demoStateVersion: DEMO_STATE_VERSION,
  activeRole: null,
  activeInstitution: "Sahya Higher Studies University",
  academicYear: "2026–27",
  defaultAcademicYearId: "ay-2026-27",
  selectedProgramme: "Four Year Undergraduate Programme (FYUGP)",
  selectedSemester: "Semester 1",
  requestStatus: "draft",
  masterCalendarVersion: "1.0",
  publicationStatus: "published",
  notificationCount: 3,
  completedEventConfirmations: [
    "calendar-publication",
    "admission-commencement",
    "admission-closure",
  ],
  completionReports: {},
  demoAuditEntries: [],
  hecRecommendation: "pending",
  officerNote: "",
  committeeDecision: "pending",
  committeeCondition: "",
  committeeMeetingNote: "",
  revisionPublicationState: "not-started",
  publicationSchedule: "",
  institutionsNotified: false,
  publicCalendarUpdated: false,
  bookmarkedEvents: [],
  ...defaultDomainState,
};

type DemoStateContextValue = DemoSessionState & {
  hydrated: boolean;
  notificationsRead: boolean;
  selectWorkspace: (role: DemoRoleId) => void;
  signOut: () => void;
  resetDemo: () => void;
  setAcademicYear: (year: AcademicYearLabel) => void;
  saveAcademicYear: (record: AcademicYear, mode: "create" | "edit") => boolean;
  setDefaultAcademicYear: (id: string) => boolean;
  closeAcademicYear: (id: string) => boolean;
  saveCalendarMilestone: (
    record: CalendarMilestoneDefinition,
    mode: "create" | "edit",
  ) => boolean;
  setCalendarMilestoneActive: (id: string, active: boolean) => boolean;
  saveCourseMaster: (record: CourseMaster, mode: "create" | "edit") => boolean;
  setCourseMasterActive: (id: string, active: boolean) => boolean;
  saveAcademicDeliveryUnit: (record: AcademicDeliveryUnit) => boolean;
  setUniversityOperatingModel: (
    universityId: string,
    operatingModel: UniversityOperatingModel,
  ) => boolean;
  saveCourseOffering: (
    record: CourseOffering,
    batches: CourseBatch[],
  ) => boolean;
  submitCourseOffering: (id: string) => boolean;
  reviewCourseOffering: (
    id: string,
    action: "verify" | "return" | "note",
    note: string,
  ) => boolean;
  copyCourseOfferingToNextYear: (id: string) => string | null;
  requestVerifiedCapacityChange: (id: string, reason: string) => boolean;
  saveStrengthReports: (updates: StrengthReportUpdate[]) => boolean;
  setCohortAdmissionStatus: (
    cohortId: string,
    status: "in_progress" | "finalised",
    reason?: string,
  ) => boolean;
  saveUniversityCalendarSubmission: (
    record: UniversityCalendarSubmission,
    entries: UniversityCalendarEntry[],
  ) => boolean;
  submitUniversityCalendarSubmission: (
    id: string,
    draft?: {
      record: UniversityCalendarSubmission;
      entries: UniversityCalendarEntry[];
    },
  ) => boolean;
  addUniversityCalendarReviewNote: (id: string, note: string) => boolean;
  reviewUniversityCalendarSubmission: (
    id: string,
    decision: "lock" | "return",
    note: string,
  ) => boolean;
  setSelectedProgramme: (programme: Programme) => void;
  setSelectedSemester: (semester: Semester) => void;
  setRequestStatus: (status: RequestStatus) => void;
  setCommitteeDecision: (decision: CommitteeDecision) => void;
  setRevisionPublicationState: (state: RevisionPublicationState) => void;
  recordHecRecommendation: (
    recommendation: Exclude<HecRecommendation, "pending">,
    note: string,
  ) => void;
  saveOfficerNote: (note: string) => void;
  recordCommitteeOutcome: (
    decision: Exclude<CommitteeDecision, "pending">,
    condition: string,
    meetingNote: string,
  ) => void;
  saveCommitteeMeetingNote: (note: string) => void;
  scheduleRevisionPublication: (schedule: string) => void;
  returnPublicationToCommittee: (note: string) => void;
  publishRevision: () => void;
  confirmEventCompletion: (id: string) => void;
  submitCompletionReport: (
    id: string,
    report: Omit<CompletionReport, "submittedAt">,
  ) => void;
  submitChangeRequest: () => void;
  toggleBookmark: (id: string) => void;
  setNotificationsRead: (read: boolean) => void;
  toast: (title: string, message: string) => void;
};

const DemoContext = createContext<DemoStateContextValue | null>(null);
const storageKey = "vidyachakra-demo-state-v3";

function persistState(state: DemoSessionState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

function isStoredState(value: unknown): value is Partial<DemoSessionState> {
  return typeof value === "object" && value !== null;
}

const domainCollectionKeys = [
  "academicYears",
  "calendarMilestoneDefinitions",
  "courseMasters",
  "universityProfiles",
  "academicDeliveryUnits",
  "universityCalendarSubmissions",
  "universityCalendarEntries",
  "courseOfferings",
  "courseBatches",
  "studentCohorts",
  "semesterStrengthSnapshots",
] as const;

function migrateDemoState(stored: Partial<DemoSessionState>): DemoSessionState {
  const migrated: DemoSessionState = {
    ...initialDemoState,
    ...stored,
    demoStateVersion: DEMO_STATE_VERSION,
    completionReports:
      stored.completionReports &&
      typeof stored.completionReports === "object" &&
      !Array.isArray(stored.completionReports)
        ? stored.completionReports
        : initialDemoState.completionReports,
  };

  for (const key of domainCollectionKeys) {
    if (!Array.isArray(stored[key])) {
      (migrated[key] as unknown[]) = initialDemoState[key] as unknown[];
    }
  }

  if ((stored.demoStateVersion ?? 0) < DEMO_STATE_VERSION) {
    for (const key of domainCollectionKeys) {
      const storedRecords = migrated[key] as Array<{ id: string }>;
      const knownIds = new Set(storedRecords.map((record) => record.id));
      const missingDefaults = (
        initialDemoState[key] as Array<{ id: string }>
      ).filter((record) => !knownIds.has(record.id));
      (migrated[key] as Array<{ id: string }>) = [
        ...storedRecords,
        ...missingDefaults,
      ];
    }
    const storedUnits = migrated.academicDeliveryUnits;
    const storedById = new Map(storedUnits.map((unit) => [unit.id, unit]));
    const defaultIds = new Set(
      initialDemoState.academicDeliveryUnits.map((unit) => unit.id),
    );
    migrated.academicDeliveryUnits = [
      ...initialDemoState.academicDeliveryUnits.map((unit) => ({
        ...unit,
        ...(storedById.get(unit.id) ?? {}),
        name: unit.name,
        shortName: unit.shortName,
        unitType: unit.unitType,
        teachingCommencedAcademicYearId:
          storedById.get(unit.id)?.teachingCommencedAcademicYearId ??
          unit.teachingCommencedAcademicYearId,
      })),
      ...storedUnits.filter((unit) => !defaultIds.has(unit.id)),
    ];
    const defaultOfferings = new Map(
      initialDemoState.courseOfferings.map((item) => [item.id, item]),
    );
    migrated.courseOfferings = migrated.courseOfferings.map((item) => {
      const fallback = defaultOfferings.get(item.id);
      return {
        ...fallback,
        ...item,
        reviewNote: item.reviewNote ?? fallback?.reviewNote ?? "",
        lastUpdatedAt:
          item.lastUpdatedAt ??
          fallback?.lastUpdatedAt ??
          "2026-07-26T12:30:00.000Z",
      };
    });
    migrated.courseBatches = migrated.courseBatches.map((batch) =>
      batch.courseOfferingId === "off-005"
        ? { ...batch, sanctionedCapacity: 40 }
        : batch,
    );
    const migratedBatchCapacity = new Map(
      migrated.courseBatches.map((batch) => [
        batch.id,
        batch.sanctionedCapacity,
      ]),
    );
    migrated.semesterStrengthSnapshots =
      migrated.semesterStrengthSnapshots.map((snapshot) => ({
        ...snapshot,
        sanctionedCapacity:
          migratedBatchCapacity.get(snapshot.courseBatchId) ??
          snapshot.sanctionedCapacity,
        ...(snapshot.courseBatchId.startsWith("batch-off-005-")
          ? {
              semesterNumber: 1 as const,
              admissionIntake: snapshot.currentStrength,
            }
          : {}),
      }));
    migrated.studentCohorts = migrated.studentCohorts.map((cohort) =>
      ({
        ...cohort,
        admissionFinalisedAt: cohort.admissionFinalisedAt ?? null,
        admissionReopenReason: cohort.admissionReopenReason ?? "",
        ...(cohort.courseOfferingId === "off-005"
          ? {
              admissionAcademicYearId: "ay-2026-27",
              cohortLabel: "2026-27 Admission Cohort",
              admissionStatus: "in_progress" as const,
              admissionFinalisedAt: null,
            }
          : {}),
      }),
    );
    const defaultStrengthById = new Map(
      initialDemoState.semesterStrengthSnapshots.map((snapshot) => [
        snapshot.id,
        snapshot,
      ]),
    );
    migrated.semesterStrengthSnapshots =
      migrated.semesterStrengthSnapshots.map((snapshot) =>
        snapshot.courseBatchId.startsWith("batch-off-005-") &&
        snapshot.semesterNumber === 1
          ? (defaultStrengthById.get(snapshot.id) ?? snapshot)
          : snapshot,
      );
    const defaultSubmissions = new Map(
      initialDemoState.universityCalendarSubmissions.map((item) => [
        item.id,
        item,
      ]),
    );
    migrated.universityCalendarSubmissions =
      migrated.universityCalendarSubmissions.map((item) => {
        const fallback = defaultSubmissions.get(item.id);
        return {
          ...fallback,
          ...item,
          title:
            item.title ??
            fallback?.title ??
            "Structured University Academic Calendar",
          applicableSemesters:
            item.applicableSemesters?.length
              ? item.applicableSemesters
              : (fallback?.applicableSemesters ?? [1, 3]),
          createdAt:
            item.createdAt ??
            fallback?.createdAt ??
            "2026-07-14T09:15:00.000Z",
          reviewNote: item.reviewNote ?? fallback?.reviewNote ?? "",
          declarationAccepted:
            item.declarationAccepted ??
            fallback?.declarationAccepted ??
            false,
        };
      });
  }

  return migrated;
}

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSessionState>(initialDemoState);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as unknown;
          if (isStoredState(parsed)) {
            const migrated = migrateDemoState(parsed);
            setSession(migrated);
            persistState(migrated);
          }
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const commit = useCallback(
    (updater: (current: DemoSessionState) => DemoSessionState) => {
      setSession((current) => {
        const next = updater(current);
        persistState(next);
        return next;
      });
    },
    [],
  );

  const toast = useCallback((title: string, message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, message }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      3600,
    );
  }, []);

  const selectWorkspace = useCallback(
    (role: DemoRoleId) => {
      const activeInstitution =
        role === "university"
          ? "Sahya Higher Studies University"
          : role === "public"
            ? "Public calendar"
            : "Kerala Higher Education Council";
      commit((current) => ({ ...current, activeRole: role, activeInstitution }));
    },
    [commit],
  );

  const signOut = useCallback(() => {
    commit((current) => ({ ...current, activeRole: null }));
  }, [commit]);

  const resetDemo = useCallback(() => {
    setSession(initialDemoState);
    persistState(initialDemoState);
    toast(
      "Demo restored",
      "CR-2026-014 is back at draft with the original red deviation.",
    );
  }, [toast]);

  const setAcademicYear = useCallback(
    (academicYear: AcademicYearLabel) => {
      commit((current) => ({ ...current, academicYear }));
      toast("Academic year selected", `The workspace is showing ${academicYear}.`);
    },
    [commit, toast],
  );

  const masterAdminAllowed = session.activeRole === "administrator";

  const denyMasterMutation = useCallback(() => {
    toast(
      "Read-only master data",
      "Editing is restricted to the HEC Calendar Administrator workspace.",
    );
  }, [toast]);

  const saveAcademicYear = useCallback(
    (record: AcademicYear, mode: "create" | "edit") => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      commit((current) => ({
        ...current,
        academicYears:
          mode === "create"
            ? [...current.academicYears, record]
            : current.academicYears.map((item) =>
                item.id === record.id ? record : item,
              ),
        demoAuditEntries: [
          {
            id: `academic-year-${mode}-${Date.now()}`,
            action:
              mode === "create"
                ? "Academic year created"
                : "Academic year metadata updated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: record.label,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${record.label} is ${record.status} from ${record.startDate} to ${record.endDate}.`,
            previousValue: mode === "create" ? "No record" : "Previous metadata",
            newValue: `${record.status} · Admission ${record.admissionYear}`,
            workflowStage: "HEC Master Data Administration",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        mode === "create" ? "Academic year created" : "Academic year updated",
        `${record.label} is now available across the local demonstration.`,
      );
      return true;
    },
    [commit, denyMasterMutation, masterAdminAllowed, toast],
  );

  const setDefaultAcademicYear = useCallback(
    (id: string) => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      const year = session.academicYears.find((item) => item.id === id);
      if (!year) return false;
      commit((current) => ({
        ...current,
        defaultAcademicYearId: id,
        academicYear: year.label,
        demoAuditEntries: [
          {
            id: `academic-year-default-${Date.now()}`,
            action: "Default academic year selected",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: year.label,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${year.label} is now the default academic year shown in workspaces.`,
            previousValue:
              current.academicYears.find(
                (item) => item.id === current.defaultAcademicYearId,
              )?.label ?? current.academicYear,
            newValue: year.label,
            workflowStage: "HEC Master Data Administration",
            reference: year.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast("Default academic year updated", `${year.label} is now selected by default.`);
      return true;
    },
    [
      commit,
      denyMasterMutation,
      masterAdminAllowed,
      session.academicYears,
      toast,
    ],
  );

  const closeAcademicYear = useCallback(
    (id: string) => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      const year = session.academicYears.find((item) => item.id === id);
      if (!year || id === session.defaultAcademicYearId) {
        toast(
          "Academic year cannot be closed",
          "Select another default academic year before closing this record.",
        );
        return false;
      }
      commit((current) => ({
        ...current,
        academicYears: current.academicYears.map((item) =>
          item.id === id ? { ...item, status: "closed" } : item,
        ),
        demoAuditEntries: [
          {
            id: `academic-year-close-${Date.now()}`,
            action: "Academic year closed",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: year.label,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: "The academic year remains in history and cannot receive new records.",
            previousValue: year.status,
            newValue: "closed",
            workflowStage: "HEC Master Data Administration",
            reference: year.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast("Academic year closed", `${year.label} remains available for history.`);
      return true;
    },
    [
      commit,
      denyMasterMutation,
      masterAdminAllowed,
      session.academicYears,
      session.defaultAcademicYearId,
      toast,
    ],
  );

  const saveCalendarMilestone = useCallback(
    (
      record: CalendarMilestoneDefinition,
      mode: "create" | "edit",
    ) => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      commit((current) => ({
        ...current,
        calendarMilestoneDefinitions:
          mode === "create"
            ? [...current.calendarMilestoneDefinitions, record]
            : current.calendarMilestoneDefinitions.map((item) =>
                item.id === record.id ? record : item,
              ),
        demoAuditEntries: [
          {
            id: `milestone-master-${mode}-${Date.now()}`,
            action:
              mode === "create"
                ? "Calendar milestone definition created"
                : "Calendar milestone definition updated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: record.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${record.code} uses ${record.dateInputType.replaceAll("_", " ")} with ${record.alignmentRule.replaceAll("_", " ")} alignment.`,
            previousValue: mode === "create" ? "No record" : "Previous definition",
            newValue: `${record.active ? "Active" : "Inactive"} · Order ${record.displayOrder}`,
            workflowStage: "HEC Master Data Administration",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        mode === "create" ? "Milestone created" : "Milestone updated",
        `${record.title} is available to calendar submissions.`,
      );
      return true;
    },
    [commit, denyMasterMutation, masterAdminAllowed, toast],
  );

  const setCalendarMilestoneActive = useCallback(
    (id: string, active: boolean) => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      const record = session.calendarMilestoneDefinitions.find(
        (item) => item.id === id,
      );
      if (!record) return false;
      commit((current) => ({
        ...current,
        calendarMilestoneDefinitions:
          current.calendarMilestoneDefinitions.map((item) =>
            item.id === id ? { ...item, active } : item,
          ),
        demoAuditEntries: [
          {
            id: `milestone-master-status-${Date.now()}`,
            action: active ? "Calendar milestone reactivated" : "Calendar milestone deactivated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: record.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: active
              ? "The definition can again be selected for future submissions."
              : "Existing calendar entries remain intact; future selection is disabled.",
            previousValue: active ? "Inactive" : "Active",
            newValue: active ? "Active" : "Inactive",
            workflowStage: "HEC Master Data Administration",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        active ? "Milestone reactivated" : "Milestone deactivated",
        `${record.title} has been updated without altering existing submissions.`,
      );
      return true;
    },
    [
      commit,
      denyMasterMutation,
      masterAdminAllowed,
      session.calendarMilestoneDefinitions,
      toast,
    ],
  );

  const saveCourseMaster = useCallback(
    (record: CourseMaster, mode: "create" | "edit") => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      commit((current) => ({
        ...current,
        courseMasters:
          mode === "create"
            ? [...current.courseMasters, record]
            : current.courseMasters.map((item) =>
                item.id === record.id ? record : item,
              ),
        demoAuditEntries: [
          {
            id: `course-master-${mode}-${Date.now()}`,
            action:
              mode === "create"
                ? "Official course master created"
                : "Official course metadata updated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: record.courseName,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${record.courseCode} · ${record.durationYears} years · ${record.totalSemesters} semesters.`,
            previousValue: mode === "create" ? "No record" : "Previous metadata",
            newValue: record.active ? "Active" : "Inactive",
            workflowStage: "HEC Master Data Administration",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        mode === "create" ? "Course added" : "Course updated",
        `${record.courseName} is now current in the HEC Course Master.`,
      );
      return true;
    },
    [commit, denyMasterMutation, masterAdminAllowed, toast],
  );

  const setCourseMasterActive = useCallback(
    (id: string, active: boolean) => {
      if (!masterAdminAllowed) {
        denyMasterMutation();
        return false;
      }
      const record = session.courseMasters.find((item) => item.id === id);
      if (!record) return false;
      commit((current) => ({
        ...current,
        courseMasters: current.courseMasters.map((item) =>
          item.id === id ? { ...item, active } : item,
        ),
        demoAuditEntries: [
          {
            id: `course-master-status-${Date.now()}`,
            action: active ? "Official course reactivated" : "Official course deactivated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: record.courseName,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: active
              ? "The course is available to future university offering selectors."
              : "Existing institutional offerings are preserved; future selection is disabled.",
            previousValue: active ? "Inactive" : "Active",
            newValue: active ? "Active" : "Inactive",
            workflowStage: "HEC Master Data Administration",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        active ? "Course reactivated" : "Course deactivated",
        active
          ? `${record.courseName} is selectable again.`
          : `${record.courseName} is hidden from new university course selectors.`,
      );
      return true;
    },
    [
      commit,
      denyMasterMutation,
      masterAdminAllowed,
      session.courseMasters,
      toast,
    ],
  );

  const saveAcademicDeliveryUnit = useCallback(
    (record: AcademicDeliveryUnit) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Delivery units are added from the university institution-structure workspace.",
        );
        return false;
      }
      commit((current) => ({
        ...current,
        academicDeliveryUnits: [...current.academicDeliveryUnits, record],
        demoAuditEntries: [
          {
            id: `delivery-unit-created-${Date.now()}`,
            action: "Academic delivery unit created",
            actor: "Prof. Anjali Menon",
            actorRole: "University Nodal Officer",
            scope: record.name,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${record.institutionCode} · ${record.unitType.replaceAll("_", " ")} · ${record.district}.`,
            previousValue: "No delivery unit",
            newValue: record.active ? "Active" : "Inactive",
            workflowStage: "University Institution Structure",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Delivery unit added",
        `${record.name} is now available to course-offering and strength selectors.`,
      );
      return true;
    },
    [commit, session.activeRole, toast],
  );

  const setUniversityOperatingModel = useCallback(
    (universityId: string, operatingModel: UniversityOperatingModel) => {
      if (session.activeRole !== "administrator") {
        toast(
          "Classification is protected",
          "Only the HEC Calendar Administrator may change a university operating model.",
        );
        return false;
      }
      const university = session.universityProfiles.find(
        (item) => item.id === universityId,
      );
      if (!university) return false;
      commit((current) => ({
        ...current,
        universityProfiles: current.universityProfiles.map((item) =>
          item.id === universityId ? { ...item, operatingModel } : item,
        ),
        demoAuditEntries: [
          {
            id: `operating-model-${Date.now()}`,
            action: "University operating model updated",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: university.name,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              "The classification changed without altering existing delivery units, offerings or calendar records.",
            previousValue: university.operatingModel,
            newValue: operatingModel,
            workflowStage: "HEC Institution Registry",
            reference: university.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Operating model updated",
        `${university.name} is now classified as ${operatingModel.replaceAll("_", " ")}.`,
      );
      return true;
    },
    [commit, session.activeRole, session.universityProfiles, toast],
  );

  const saveCourseOffering = useCallback(
    (record: CourseOffering, batches: CourseBatch[]) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Course offerings are maintained from the university workspace.",
        );
        return false;
      }
      const course = session.courseMasters.find(
        (item) => item.id === record.courseMasterId && item.active,
      );
      const unit = session.academicDeliveryUnits.find(
        (item) =>
          item.id === record.deliveryUnitId &&
          item.universityId === record.universityId &&
          item.active,
      );
      if (!course || !unit) {
        toast(
          "Official selections required",
          "Choose an active HEC Course Master record and an active academic delivery unit.",
        );
        return false;
      }
      if (findDuplicateOffering(record, session.courseOfferings)) {
        toast(
          "Duplicate offering blocked",
          "This academic year, delivery unit, course, mode and shift combination already exists.",
        );
        return false;
      }
      if (
        !batches.length ||
        batches.some(
          (batch) =>
            !batch.batchLabel.trim() ||
            !Number.isFinite(batch.sanctionedCapacity) ||
            batch.sanctionedCapacity <= 0,
        )
      ) {
        toast(
          "Approved batch details required",
          "Add at least one named batch with a positive sanctioned capacity.",
        );
        return false;
      }
      const existing = session.courseOfferings.find(
        (item) => item.id === record.id,
      );
      if (existing?.offeringStatus === "verified") {
        toast(
          "Verified capacity is protected",
          "Record a capacity-change reason for HEC instead of editing verified batches directly.",
        );
        return false;
      }
      const now = new Date().toISOString();
      const savedRecord = { ...record, lastUpdatedAt: now };
      commit((current) => ({
        ...current,
        courseOfferings: existing
          ? current.courseOfferings.map((item) =>
              item.id === record.id ? savedRecord : item,
            )
          : [savedRecord, ...current.courseOfferings],
        courseBatches: [
          ...current.courseBatches.filter(
            (batch) => batch.courseOfferingId !== record.id,
          ),
          ...batches.map((batch) => ({
            ...batch,
            courseOfferingId: record.id,
            sanctionedCapacity: Math.round(batch.sanctionedCapacity),
          })),
        ],
        studentCohorts: current.studentCohorts.some(
          (cohort) => cohort.courseOfferingId === record.id,
        )
          ? current.studentCohorts
          : [
              {
                id: `cohort-${record.id}`,
                courseOfferingId: record.id,
                admissionAcademicYearId: record.academicYearId,
                cohortLabel: `${record.academicYearId.replace("ay-", "")} Admission Cohort`,
                admissionStatus: "not_started",
                lastUpdatedAt: null,
              },
              ...current.studentCohorts,
            ],
        demoAuditEntries: [
          {
            id: `course-offering-saved-${Date.now()}`,
            action: existing
              ? "Course offering draft updated"
              : "Course offering created",
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: `${unit.name} · ${course.courseName}`,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${batches.length} approved batch${batches.length === 1 ? "" : "es"} · ${batches.reduce((total, batch) => total + Math.round(batch.sanctionedCapacity), 0)} sanctioned seats.`,
            previousValue: existing?.offeringStatus ?? "No offering",
            newValue: savedRecord.offeringStatus,
            workflowStage: "University Course Offering",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        existing ? "Offering draft updated" : "Course offering created",
        `${course.courseName} is bound to ${unit.name} with capacity calculated from its batches.`,
      );
      return true;
    },
    [
      commit,
      session.academicDeliveryUnits,
      session.activeRole,
      session.courseMasters,
      session.courseOfferings,
      toast,
    ],
  );

  const submitCourseOffering = useCallback(
    (id: string) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Only the university workspace can submit an offering for HEC verification.",
        );
        return false;
      }
      const offering = session.courseOfferings.find((item) => item.id === id);
      if (
        !offering ||
        !["draft", "returned"].includes(offering.offeringStatus)
      ) {
        return false;
      }
      const now = new Date().toISOString();
      commit((current) => ({
        ...current,
        courseOfferings: current.courseOfferings.map((item) =>
          item.id === id
            ? {
                ...item,
                offeringStatus: "submitted",
                reviewNote: "",
                lastUpdatedAt: now,
              }
            : item,
        ),
        notificationCount: Math.max(current.notificationCount + 1, 4),
        demoAuditEntries: [
          {
            id: `course-offering-submitted-${Date.now()}`,
            action: "Course offering submitted to HEC",
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: id,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              "Academic context, approval reference and batch-level sanctioned capacity submitted for verification.",
            previousValue: offering.offeringStatus,
            newValue: "Submitted",
            workflowStage: "HEC Course Offering Verification",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Offering submitted",
        "The course offering is now waiting for HEC verification.",
      );
      return true;
    },
    [commit, session.activeRole, session.courseOfferings, toast],
  );

  const reviewCourseOffering = useCallback(
    (
      id: string,
      action: "verify" | "return" | "note",
      note: string,
    ) => {
      if (session.activeRole !== "monitoring") {
        toast(
          "HEC verification action required",
          "Use the HEC Academic Monitoring Officer workspace to review offerings.",
        );
        return false;
      }
      const offering = session.courseOfferings.find((item) => item.id === id);
      if (!offering) return false;
      if (action === "verify" && !offering.approvalReference.trim()) {
        toast(
          "Approval reference missing",
          "Return the offering for correction or add a note before verification.",
        );
        return false;
      }
      if (
        action === "verify" &&
        offering.offeringStatus !== "submitted"
      ) {
        toast(
          "Submission required",
          "Only a university-submitted offering can be verified by HEC.",
        );
        return false;
      }
      if (
        action === "return" &&
        offering.offeringStatus !== "submitted"
      ) {
        toast(
          "Submission required",
          "Only a submitted offering can be returned for correction.",
        );
        return false;
      }
      if ((action === "return" || action === "note") && !note.trim()) {
        toast(
          "HEC note required",
          "Add a clear verification or correction note.",
        );
        return false;
      }
      const nextStatus =
        action === "verify"
          ? ("verified" as const)
          : action === "return"
            ? ("returned" as const)
            : offering.offeringStatus;
      const now = new Date().toISOString();
      commit((current) => ({
        ...current,
        courseOfferings: current.courseOfferings.map((item) =>
          item.id === id
            ? {
                ...item,
                offeringStatus: nextStatus,
                reviewNote:
                  note.trim() ||
                  "HEC verified the approval reference and sanctioned batch capacity.",
                lastUpdatedAt: now,
              }
            : item,
        ),
        notificationCount: Math.max(current.notificationCount + 1, 4),
        demoAuditEntries: [
          {
            id: `course-offering-review-${Date.now()}`,
            action:
              action === "verify"
                ? "Course offering verified"
                : action === "return"
                  ? "Course offering returned for correction"
                  : "HEC verification note added",
            actor: "Meera Nair",
            actorRole: "HEC Academic Monitoring Officer",
            scope: id,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              note.trim() ||
              "Approval reference and batch-level sanctioned capacity verified.",
            previousValue: offering.offeringStatus,
            newValue: nextStatus,
            workflowStage: "HEC Course Offering Verification",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        action === "verify"
          ? "Offering verified"
          : action === "return"
            ? "Offering returned"
            : "HEC note recorded",
        action === "verify"
          ? "The sanctioned batch capacity is now protected."
          : "The review record has been updated.",
      );
      return true;
    },
    [commit, session.activeRole, session.courseOfferings, toast],
  );

  const copyCourseOfferingToNextYear = useCallback(
    (id: string) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Offerings can be copied from the university workspace.",
        );
        return null;
      }
      const source = session.courseOfferings.find((item) => item.id === id);
      if (!source) return null;
      const orderedYears = [...session.academicYears].sort((a, b) =>
        a.startDate.localeCompare(b.startDate),
      );
      const currentIndex = orderedYears.findIndex(
        (year) => year.id === source.academicYearId,
      );
      const nextYear = orderedYears[currentIndex + 1];
      if (!nextYear) {
        toast(
          "No later academic year",
          "Create the next academic year in HEC master data before copying.",
        );
        return null;
      }
      const idSuffix = globalThis.crypto?.randomUUID?.() ?? Date.now();
      const newId = `off-copy-${idSuffix}`;
      const candidate: CourseOffering = {
        ...source,
        id: newId,
        academicYearId: nextYear.id,
        offeringStatus: "draft",
        approvalReference: "",
        effectiveFrom: nextYear.startDate,
        effectiveTo: null,
        reviewNote: "",
        lastUpdatedAt: new Date().toISOString(),
      };
      if (findDuplicateOffering(candidate, session.courseOfferings)) {
        toast(
          "Next-year offering already exists",
          "Open the existing draft instead of creating a duplicate.",
        );
        return null;
      }
      const sourceBatches = session.courseBatches.filter(
        (batch) => batch.courseOfferingId === id,
      );
      commit((current) => ({
        ...current,
        courseOfferings: [candidate, ...current.courseOfferings],
        courseBatches: [
          ...sourceBatches.map((batch, index) => ({
            ...batch,
            id: `batch-${newId}-${index + 1}`,
            courseOfferingId: newId,
          })),
          ...current.courseBatches,
        ],
        studentCohorts: [
          {
            id: `cohort-${newId}`,
            courseOfferingId: newId,
            admissionAcademicYearId: nextYear.id,
            cohortLabel: `${nextYear.label} Admission Cohort`,
            admissionStatus: "not_started",
            lastUpdatedAt: null,
          },
          ...current.studentCohorts,
        ],
        demoAuditEntries: [
          {
            id: `course-offering-copied-${Date.now()}`,
            action: "Course offering copied to next academic year",
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: newId,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${sourceBatches.length} batch capacities copied to ${nextYear.label}; approval reference requires reconfirmation.`,
            previousValue: `${source.academicYearId} · ${source.offeringStatus}`,
            newValue: `${nextYear.id} · draft`,
            workflowStage: "University Course Offering",
            reference: newId,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Offering copied",
        `${nextYear.label} now has a draft with the previous batch capacities.`,
      );
      return newId;
    },
    [
      commit,
      session.academicYears,
      session.activeRole,
      session.courseBatches,
      session.courseOfferings,
      toast,
    ],
  );

  const requestVerifiedCapacityChange = useCallback(
    (id: string, reason: string) => {
      if (session.activeRole !== "university" || !reason.trim()) {
        toast(
          "Capacity-change reason required",
          "Explain why the verified sanctioned capacity needs reconsideration.",
        );
        return false;
      }
      const offering = session.courseOfferings.find((item) => item.id === id);
      if (!offering || offering.offeringStatus !== "verified") return false;
      commit((current) => ({
        ...current,
        demoAuditEntries: [
          {
            id: `capacity-change-request-${Date.now()}`,
            action: "Verified capacity change reason recorded",
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: id,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: reason.trim(),
            previousValue: "HEC verified sanctioned capacity",
            newValue: "Capacity reconsideration note awaiting HEC",
            workflowStage: "Course Offering Capacity Control",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Capacity reason recorded",
        "The verified capacity remains unchanged until HEC reviews the note.",
      );
      return true;
    },
    [commit, session.activeRole, session.courseOfferings, toast],
  );

  const saveUniversityCalendarSubmission = useCallback(
    (
      record: UniversityCalendarSubmission,
      entries: UniversityCalendarEntry[],
    ) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Calendar drafts are maintained from the university workspace.",
        );
        return false;
      }
      const existing = session.universityCalendarSubmissions.find(
        (item) => item.id === record.id,
      );
      if (existing?.status === "locked") {
        toast(
          "Calendar is locked",
          "Published dates cannot be edited directly. Use the formal change-request workflow.",
        );
        return false;
      }
      commit((current) => ({
        ...current,
        universityCalendarSubmissions: existing
          ? current.universityCalendarSubmissions.map((item) =>
              item.id === record.id ? record : item,
            )
          : [record, ...current.universityCalendarSubmissions],
        universityCalendarEntries: [
          ...current.universityCalendarEntries.filter(
            (entry) => entry.submissionId !== record.id,
          ),
          ...entries,
        ],
        demoAuditEntries: [
          {
            id: `calendar-submission-saved-${Date.now()}`,
            action: existing
              ? "Structured calendar draft updated"
              : "Structured calendar draft created",
            actor: "Prof. Anjali Menon",
            actorRole: "University Nodal Officer",
            scope: record.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: `${entries.length} milestone records saved as structured calendar data. Supporting documents remain references only.`,
            previousValue: existing ? existing.status : "No submission",
            newValue: record.status,
            workflowStage: "University Calendar Submission",
            reference: record.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        existing ? "Draft updated" : "Draft created",
        "The structured dates and scope have been saved locally.",
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.universityCalendarSubmissions,
      toast,
    ],
  );

  const submitUniversityCalendarSubmission = useCallback(
    (
      id: string,
      draft?: {
        record: UniversityCalendarSubmission;
        entries: UniversityCalendarEntry[];
      },
    ) => {
      if (session.activeRole !== "university") {
        toast(
          "University action required",
          "Only the university workspace can submit an institutional calendar.",
        );
        return false;
      }
      const submission =
        draft?.record ??
        session.universityCalendarSubmissions.find((item) => item.id === id);
      if (!submission || submission.status === "locked") return false;
      const entries =
        draft?.entries ??
        session.universityCalendarEntries.filter(
          (entry) => entry.submissionId === id,
        );
      const incomplete = entries.some(
        (entry) =>
          !entry.universityStartDate ||
          (entry.ragStatus === "red" && !entry.deviationReason.trim()),
      );
      if (incomplete || !submission.declarationAccepted) {
        toast(
          "Submission needs attention",
          "Complete every required date, explain each unauthorised difference and accept the declaration.",
        );
        return false;
      }
      commit((current) => ({
        ...current,
        universityCalendarSubmissions: current.universityCalendarSubmissions.some(
          (item) => item.id === id,
        )
          ? current.universityCalendarSubmissions.map((item) =>
              item.id === id
                ? {
                    ...submission,
                    status: "submitted",
                    submittedAt: new Date().toISOString(),
                    reviewNote: "",
                  }
                : item,
            )
          : [
              {
                ...submission,
                status: "submitted",
                submittedAt: new Date().toISOString(),
                reviewNote: "",
              },
              ...current.universityCalendarSubmissions,
            ],
        universityCalendarEntries: draft
          ? [
              ...current.universityCalendarEntries.filter(
                (entry) => entry.submissionId !== id,
              ),
              ...entries,
            ]
          : current.universityCalendarEntries,
        notificationCount: Math.max(current.notificationCount + 1, 4),
        demoAuditEntries: [
          {
            id: `calendar-submission-submitted-${Date.now()}`,
            action: "Annual academic calendar submitted",
            actor: "Prof. Anjali Menon",
            actorRole: "University Nodal Officer",
            scope: submission.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              "Structured milestone dates, scope, deviations and declaration submitted to HEC for review.",
            previousValue: submission.status,
            newValue: "Submitted to HEC",
            workflowStage: "Calendar Submission Review",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Calendar submitted to HEC",
        "The structured annual calendar is now in the HEC review queue.",
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.universityCalendarEntries,
      session.universityCalendarSubmissions,
      toast,
    ],
  );

  const reviewUniversityCalendarSubmission = useCallback(
    (id: string, decision: "lock" | "return", note: string) => {
      if (session.activeRole !== "monitoring") {
        toast(
          "HEC review action required",
          "Calendar acceptance is available to the HEC Academic Monitoring Officer.",
        );
        return false;
      }
      const submission = session.universityCalendarSubmissions.find(
        (item) => item.id === id,
      );
      if (!submission || !["submitted", "under_review"].includes(submission.status)) {
        toast(
          "Submission is not reviewable",
          "Only submitted calendars can be accepted or returned.",
        );
        return false;
      }
      const now = new Date().toISOString();
      commit((current) => ({
        ...current,
        universityCalendarSubmissions:
          current.universityCalendarSubmissions.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: decision === "lock" ? "locked" : "returned",
                  reviewedAt: now,
                  lockedAt: decision === "lock" ? now : null,
                  reviewNote: note.trim(),
                }
              : item,
          ),
        notificationCount: Math.max(current.notificationCount + 1, 5),
        demoAuditEntries: [
          {
            id: `calendar-submission-review-${Date.now()}`,
            action:
              decision === "lock"
                ? "University calendar accepted and locked"
                : "University calendar returned for correction",
            actor: "Meera Nair",
            actorRole: "HEC Academic Monitoring Officer",
            scope: submission.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              note.trim() ||
              (decision === "lock"
                ? "The structured calendar was accepted against the HEC baseline and locked for implementation."
                : "Correction is required before the calendar can be accepted."),
            previousValue: submission.status,
            newValue: decision === "lock" ? "Locked" : "Returned",
            workflowStage: "HEC Calendar Review",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        decision === "lock" ? "Calendar accepted and locked" : "Calendar returned",
        decision === "lock"
          ? "Direct date editing is disabled; future revisions require formal change control."
          : "The university can now correct and resubmit the structured calendar.",
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.universityCalendarSubmissions,
      toast,
    ],
  );

  const addUniversityCalendarReviewNote = useCallback(
    (id: string, note: string) => {
      if (session.activeRole !== "monitoring" || !note.trim()) {
        toast(
          "Review note required",
          "Enter a note from the HEC Academic Monitoring Officer.",
        );
        return false;
      }
      const submission = session.universityCalendarSubmissions.find(
        (item) => item.id === id,
      );
      if (!submission || !["submitted", "under_review"].includes(submission.status)) {
        return false;
      }
      commit((current) => ({
        ...current,
        universityCalendarSubmissions:
          current.universityCalendarSubmissions.map((item) =>
            item.id === id
              ? { ...item, status: "under_review", reviewNote: note.trim() }
              : item,
          ),
        demoAuditEntries: [
          {
            id: `calendar-review-note-${Date.now()}`,
            action: "Calendar review note added",
            actor: "Meera Nair",
            actorRole: "HEC Academic Monitoring Officer",
            scope: submission.title,
            timestamp: new Date().toLocaleString("en-IN"),
            detail: note.trim(),
            previousValue: submission.reviewNote || "No review note",
            newValue: "Review note recorded",
            workflowStage: "Under HEC Review",
            reference: id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Review note recorded",
        "The note is visible in the submission review record.",
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.universityCalendarSubmissions,
      toast,
    ],
  );

  const saveStrengthReports = useCallback(
    (updates: StrengthReportUpdate[]) => {
      if (session.activeRole !== "university") {
        toast(
          "University reporting action required",
          "HEC can monitor aggregate figures but cannot alter university-reported student strength.",
        );
        return false;
      }
      if (!updates.length) {
        toast("No rows selected", "Select at least one strength row to save.");
        return false;
      }

      const validationError = updates.find((update) => {
        const cohort = session.studentCohorts.find(
          (item) => item.id === update.cohortId,
        );
        const offering = session.courseOfferings.find(
          (item) => item.id === cohort?.courseOfferingId,
        );
        const course = session.courseMasters.find(
          (item) => item.id === offering?.courseMasterId,
        );
        const batch = session.courseBatches.find(
          (item) =>
            item.id === update.courseBatchId &&
            item.courseOfferingId === offering?.id,
        );
        return (
          !cohort ||
          !offering ||
          !course ||
          !batch ||
          update.semesterNumber > course.totalSemesters ||
          (update.reportedStrength !== null &&
            (!Number.isInteger(update.reportedStrength) ||
              update.reportedStrength < 0))
        );
      });
      if (validationError) {
        toast(
          "Strength entries need correction",
          "Use whole, non-negative numbers and a semester supported by the official Course Master.",
        );
        return false;
      }

      const blockedFinalised = updates.find((update) => {
        const cohort = session.studentCohorts.find(
          (item) => item.id === update.cohortId,
        );
        if (
          cohort?.admissionStatus !== "finalised" ||
          update.semesterNumber !== 1
        ) {
          return false;
        }
        const existing = session.semesterStrengthSnapshots.find(
          (snapshot) =>
            snapshot.cohortId === update.cohortId &&
            snapshot.courseBatchId === update.courseBatchId &&
            snapshot.semesterNumber === 1,
        );
        return existing?.admissionIntake !== update.reportedStrength;
      });
      if (blockedFinalised) {
        toast(
          "Admission figure is finalised",
          "Reopen Semester 1 admission with a reason before changing the final intake.",
        );
        return false;
      }

      const now = new Date().toISOString();
      const timestamp = new Date().toLocaleString("en-IN");
      commit((current) => {
        const nextSnapshots = [...current.semesterStrengthSnapshots];
        const auditRecords = updates.map((update, index) => {
          const existingIndex = nextSnapshots.findIndex(
            (snapshot) =>
              snapshot.cohortId === update.cohortId &&
              snapshot.courseBatchId === update.courseBatchId &&
              snapshot.semesterNumber === update.semesterNumber,
          );
          const existing =
            existingIndex >= 0 ? nextSnapshots[existingIndex] : undefined;
          const batch = current.courseBatches.find(
            (item) => item.id === update.courseBatchId,
          )!;
          const cohort = current.studentCohorts.find(
            (item) => item.id === update.cohortId,
          )!;
          const offering = current.courseOfferings.find(
            (item) => item.id === cohort.courseOfferingId,
          )!;
          const course = current.courseMasters.find(
            (item) => item.id === offering.courseMasterId,
          )!;
          const unit = current.academicDeliveryUnits.find(
            (item) => item.id === offering.deliveryUnitId,
          )!;
          const previousValue =
            update.semesterNumber === 1
              ? existing?.admissionIntake
              : existing?.currentStrength;
          const nextSnapshot = {
            id:
              existing?.id ??
              `snapshot-${update.courseBatchId}-s${update.semesterNumber}`,
            cohortId: update.cohortId,
            courseBatchId: update.courseBatchId,
            semesterNumber: update.semesterNumber,
            sanctionedCapacity: batch.sanctionedCapacity,
            currentStrength: update.reportedStrength,
            admissionIntake:
              update.semesterNumber === 1
                ? update.reportedStrength
                : (existing?.admissionIntake ?? null),
            reportingDate: update.reportingDate,
            reportingStatus:
              update.reportedStrength === null
                ? ("not_started" as const)
                : update.reportingStatus,
            remarks: update.remarks.trim(),
            updatedAt: now,
          };
          if (existingIndex >= 0) {
            nextSnapshots[existingIndex] = nextSnapshot;
          } else {
            nextSnapshots.push(nextSnapshot);
          }
          return {
            id: `strength-update-${Date.now()}-${index}`,
            action:
              update.semesterNumber === 1
                ? "Semester 1 admission intake updated"
                : `Semester ${update.semesterNumber} strength updated`,
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: `${unit.name} · ${course.courseName} · ${batch.batchLabel}`,
            timestamp,
            detail:
              update.remarks.trim() ||
              `Aggregate batch figure recorded for Semester ${update.semesterNumber}.`,
            previousValue:
              previousValue === null || previousValue === undefined
                ? "Blank — not reported"
                : String(previousValue),
            newValue:
              update.reportedStrength === null
                ? "Blank — not reported"
                : String(update.reportedStrength),
            workflowStage: "Semester Strength Reporting",
            reference: `${update.cohortId}/S${update.semesterNumber}`,
          };
        });
        const updatedCohortIds = new Set(
          updates.map((update) => update.cohortId),
        );
        return {
          ...current,
          semesterStrengthSnapshots: nextSnapshots,
          studentCohorts: current.studentCohorts.map((cohort) =>
            updatedCohortIds.has(cohort.id)
              ? {
                  ...cohort,
                  admissionStatus:
                    cohort.admissionStatus === "not_started" &&
                    updates.some(
                      (update) =>
                        update.cohortId === cohort.id &&
                        update.semesterNumber === 1 &&
                        update.reportedStrength !== null,
                    )
                      ? "in_progress"
                      : cohort.admissionStatus,
                  lastUpdatedAt: now,
                }
              : cohort,
          ),
          demoAuditEntries: [...auditRecords, ...current.demoAuditEntries],
        };
      });
      toast(
        "Student strength saved",
        `${updates.length} aggregate batch report${updates.length === 1 ? "" : "s"} updated with an audit record.`,
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.courseBatches,
      session.courseMasters,
      session.courseOfferings,
      session.semesterStrengthSnapshots,
      session.studentCohorts,
      toast,
    ],
  );

  const setCohortAdmissionStatus = useCallback(
    (
      cohortId: string,
      status: "in_progress" | "finalised",
      reason = "",
    ) => {
      if (session.activeRole !== "university") {
        toast(
          "University reporting action required",
          "Only the reporting university can finalise or reopen admission intake.",
        );
        return false;
      }
      const cohort = session.studentCohorts.find(
        (item) => item.id === cohortId,
      );
      if (!cohort) return false;
      if (status === "in_progress" && cohort.admissionStatus === "finalised") {
        if (!reason.trim()) {
          toast(
            "Reopening reason required",
            "Explain why the final Semester 1 intake must be reopened.",
          );
          return false;
        }
      }
      if (status === "finalised") {
        const offeringBatches = session.courseBatches.filter(
          (batch) =>
            batch.courseOfferingId === cohort.courseOfferingId && batch.active,
        );
        const complete = offeringBatches.every((batch) =>
          session.semesterStrengthSnapshots.some(
            (snapshot) =>
              snapshot.cohortId === cohortId &&
              snapshot.courseBatchId === batch.id &&
              snapshot.semesterNumber === 1 &&
              snapshot.admissionIntake !== null,
          ),
        );
        if (!complete) {
          toast(
            "Admission intake is incomplete",
            "Report a whole-number intake for every active batch before finalising.",
          );
          return false;
        }
      }
      const now = new Date().toISOString();
      commit((current) => ({
        ...current,
        studentCohorts: current.studentCohorts.map((item) =>
          item.id === cohortId
            ? {
                ...item,
                admissionStatus: status,
                admissionFinalisedAt:
                  status === "finalised" ? now : null,
                admissionReopenReason:
                  status === "in_progress" ? reason.trim() : "",
                lastUpdatedAt: now,
              }
            : item,
        ),
        demoAuditEntries: [
          {
            id: `admission-status-${Date.now()}`,
            action:
              status === "finalised"
                ? "Semester 1 admission intake finalised"
                : "Finalised admission intake reopened",
            actor: "Prof. Anjali Menon",
            actorRole: "University Academic Administrator",
            scope: cohort.cohortLabel,
            timestamp: new Date().toLocaleString("en-IN"),
            detail:
              reason.trim() ||
              "All active batches have reported their final Semester 1 admission intake.",
            previousValue: cohort.admissionStatus,
            newValue: status,
            workflowStage: "Semester 1 Admission Reporting",
            reference: cohort.id,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        status === "finalised"
          ? "Admission intake finalised"
          : "Admission intake reopened",
        status === "finalised"
          ? "Semester 1 figures are now protected until a reason is recorded for reopening."
          : "Semester 1 figures can be updated again; the reason is preserved in the audit trail.",
      );
      return true;
    },
    [
      commit,
      session.activeRole,
      session.courseBatches,
      session.semesterStrengthSnapshots,
      session.studentCohorts,
      toast,
    ],
  );

  const setSelectedProgramme = useCallback(
    (selectedProgramme: Programme) => {
      commit((current) => ({ ...current, selectedProgramme }));
    },
    [commit],
  );

  const setSelectedSemester = useCallback(
    (selectedSemester: Semester) => {
      commit((current) => ({ ...current, selectedSemester }));
      toast("Semester filter changed", `${selectedSemester} milestones are in view.`);
    },
    [commit, toast],
  );

  const setRequestStatus = useCallback(
    (requestStatus: RequestStatus) => {
      commit((current) => ({ ...current, requestStatus }));
    },
    [commit],
  );

  const setCommitteeDecision = useCallback(
    (committeeDecision: CommitteeDecision) => {
      commit((current) => ({ ...current, committeeDecision }));
    },
    [commit],
  );

  const setRevisionPublicationState = useCallback(
    (revisionPublicationState: RevisionPublicationState) => {
      commit((current) => ({ ...current, revisionPublicationState }));
    },
    [commit],
  );

  const recordHecRecommendation = useCallback(
    (
      hecRecommendation: Exclude<HecRecommendation, "pending">,
      officerNote: string,
    ) => {
      const returned = hecRecommendation === "clarification";
      const recommendationLabel =
        hecRecommendation === "approval"
          ? "Recommend approval"
          : hecRecommendation === "rejection"
            ? "Recommend rejection"
            : "Return for clarification";
      commit((current) => ({
        ...current,
        hecRecommendation,
        officerNote,
        requestStatus: returned ? "returned" : "committee-review",
        notificationCount: Math.max(current.notificationCount + 1, 5),
        demoAuditEntries: [
          {
            id: `hec-recommendation-${Date.now()}`,
            action: recommendationLabel,
            actor: "Meera Nair",
            actorRole: "HEC Academic Monitoring Officer",
            scope: "Semester 1 Theory Examination",
            timestamp: "27 Jul 2026 · 11:20",
            detail:
              officerNote ||
              "HEC scrutiny completed against the published FYUGP baseline and submitted impact evidence.",
            previousValue: "Submitted by University",
            newValue: returned
              ? "Returned for Clarification"
              : "Empowered Committee Review",
            workflowStage: returned
              ? "Returned to University"
              : "Recommendation Recorded",
            reference: "CR-2026-014",
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        returned ? "Clarification requested" : "Recommendation recorded",
        returned
          ? "CR-2026-014 has been returned to Sahya University."
          : "CR-2026-014 is now in the Empowered Committee review queue.",
      );
    },
    [commit, toast],
  );

  const saveOfficerNote = useCallback(
    (officerNote: string) => {
      commit((current) => ({
        ...current,
        officerNote,
        requestStatus:
          current.requestStatus === "submitted" ? "screening" : current.requestStatus,
        demoAuditEntries: [
          {
            id: `officer-note-${Date.now()}`,
            action: "HEC scrutiny note added",
            actor: "Meera Nair",
            actorRole: "HEC Academic Monitoring Officer",
            scope: "Semester 1 Theory Examination",
            timestamp: "27 Jul 2026 · 10:35",
            detail: officerNote,
            previousValue: "No officer note",
            newValue: "Officer note recorded",
            workflowStage: "Scrutiny by HEC Academic Officer",
            reference: "CR-2026-014",
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Officer note recorded",
        "The note is part of the scrutiny record and the published date remains unchanged.",
      );
    },
    [commit, toast],
  );

  const recordCommitteeOutcome = useCallback(
    (
      committeeDecision: Exclude<CommitteeDecision, "pending">,
      committeeCondition: string,
      committeeMeetingNote: string,
    ) => {
      const approved =
        committeeDecision === "approved" ||
        committeeDecision === "approved-with-conditions";
      const requestStatus: RequestStatus = approved
        ? "approved"
        : committeeDecision === "returned"
          ? "returned"
          : "rejected";
      const decisionLabel =
        committeeDecision === "approved-with-conditions"
          ? "Approved with Conditions"
          : committeeDecision.charAt(0).toUpperCase() +
            committeeDecision.slice(1);
      commit((current) => ({
        ...current,
        committeeDecision,
        committeeCondition,
        committeeMeetingNote,
        requestStatus,
        revisionPublicationState: approved ? "ready" : "not-started",
        universityCalendarEntries: current.universityCalendarEntries.map(
          (entry) =>
            entry.changeRequestId === "CR-2026-014"
              ? {
                  ...entry,
                  ragStatus: approved ? ("amber" as const) : ("red" as const),
                  ragReason: approved
                    ? "Committee-approved exception awaiting publication in the official calendar."
                    : "The proposed date remains an unauthorised deviation.",
                }
              : entry,
        ),
        notificationCount: Math.max(current.notificationCount + 1, 6),
        demoAuditEntries: [
          {
            id: `committee-decision-${Date.now()}`,
            action: `Committee decision · ${decisionLabel}`,
            actor: "Dr. Ravi Varma",
            actorRole: "Empowered Committee Member",
            scope: "Semester 1 Theory Examination",
            timestamp: "29 Jul 2026 · 16:05",
            detail:
              committeeMeetingNote ||
              (approved
                ? "The committee accepted the institution-specific date revision."
                : "The committee recorded its decision against the submitted request."),
            previousValue: "Empowered Committee Review",
            newValue: approved
              ? "Approved · Publication Required"
              : decisionLabel,
            workflowStage: "Committee Decision",
            reference: "EC/FYUGP/2026/08 · CR-2026-014",
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        approved ? "Committee approval recorded" : "Committee decision recorded",
        approved
          ? "The request remains amber until Calendar Version 1.1 is published."
          : `CR-2026-014 is now ${requestStatus}.`,
      );
    },
    [commit, toast],
  );

  const saveCommitteeMeetingNote = useCallback(
    (committeeMeetingNote: string) => {
      commit((current) => ({
        ...current,
        committeeMeetingNote,
        demoAuditEntries: [
          {
            id: `committee-note-${Date.now()}`,
            action: "Committee meeting note recorded",
            actor: "Dr. Ravi Varma",
            actorRole: "Empowered Committee Member",
            scope: "Agenda item EC/FYUGP/2026/08",
            timestamp: "29 Jul 2026 · 15:48",
            detail: committeeMeetingNote,
            previousValue: "No meeting note",
            newValue: "Meeting note recorded",
            workflowStage: "Empowered Committee Review",
            reference: "CR-2026-014",
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Meeting note recorded",
        "The note is retained with the committee review record.",
      );
    },
    [commit, toast],
  );

  const scheduleRevisionPublication = useCallback(
    (publicationSchedule: string) => {
      const approved =
        session.committeeDecision === "approved" ||
        session.committeeDecision === "approved-with-conditions";
      if (!approved || session.revisionPublicationState !== "ready") {
        toast(
          "Scheduling is not authorised",
          "An approved committee decision is required before publication can be scheduled.",
        );
        return;
      }
      commit((current) => ({
          ...current,
          publicationSchedule,
          demoAuditEntries: [
            {
              id: `publication-scheduled-${Date.now()}`,
              action: "Publication scheduled",
              actor: "Leela Krishnan",
              actorRole: "HEC Calendar Administrator",
              scope: "Academic Calendar Version 1.1",
              timestamp: "01 Aug 2026 · 10:10",
              detail: `Controlled publication scheduled for ${publicationSchedule}.`,
              previousValue: "Approved · Awaiting Publication",
              newValue: `Scheduled · ${publicationSchedule}`,
              workflowStage: "Publication by HEC Calendar Administrator",
              reference: "KSHEC/ACAD/CAL/2026/01-R1",
            },
            ...current.demoAuditEntries,
          ],
        }));
      toast(
        "Publication scheduled",
        "The release remains unpublished until the administrator confirms publication.",
      );
    },
    [
      commit,
      session.committeeDecision,
      session.revisionPublicationState,
      toast,
    ],
  );

  const returnPublicationToCommittee = useCallback(
    (note: string) => {
      commit((current) => ({
        ...current,
        committeeDecision: "pending",
        committeeMeetingNote: note,
        requestStatus: "committee-review",
        revisionPublicationState: "not-started",
        publicationSchedule: "",
        demoAuditEntries: [
          {
            id: `publication-returned-${Date.now()}`,
            action: "Publication task returned",
            actor: "Leela Krishnan",
            actorRole: "HEC Calendar Administrator",
            scope: "Academic Calendar Version 1.1",
            timestamp: "01 Aug 2026 · 10:25",
            detail:
              note ||
              "Publication returned to the Committee Secretariat for clarification.",
            previousValue: "Approved · Awaiting Publication",
            newValue: "Empowered Committee Review",
            workflowStage: "Returned to Committee Secretariat",
            reference: "CR-2026-014",
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Returned to Committee Secretariat",
        "The publication task is paused pending a clarified committee record.",
      );
    },
    [commit, toast],
  );

  const publishRevision = useCallback(() => {
    const approved =
      session.committeeDecision === "approved" ||
      session.committeeDecision === "approved-with-conditions";
    if (!approved || session.revisionPublicationState !== "ready") {
      toast(
        "Publication is not authorised",
        "An approved committee decision is required before a new calendar version can be published.",
      );
      return;
    }
    commit((current) => ({
      ...current,
      masterCalendarVersion: "1.1",
      publicationStatus: "locked",
      requestStatus: "published",
      revisionPublicationState: "published",
      publicationSchedule: "",
      institutionsNotified: true,
      publicCalendarUpdated: true,
      universityCalendarEntries: current.universityCalendarEntries.map(
        (entry) =>
          entry.changeRequestId === "CR-2026-014"
            ? {
                ...entry,
                ragStatus: "green" as const,
                ragReason:
                  "Aligned through an approved institution-specific exception published in Calendar Version 1.1.",
                evidenceStatus: "verified" as const,
              }
            : entry,
      ),
      notificationCount: Math.max(current.notificationCount + 3, 8),
      demoAuditEntries: [
        {
          id: `public-calendar-updated-${Date.now()}`,
          action: "Public calendar updated",
          actor: "VIDYACHAKRA Publication Service",
          actorRole: "Public Calendar Service",
          scope: "Sahya Higher Studies University · 18 colleges",
          timestamp: "02 Aug 2026 · 10:04",
          detail:
            "The public Semester 1 Theory Examination date now shows 12 December 2026 as an approved institution-specific exception.",
          previousValue: "05 Dec 2026 · Version 1.0",
          newValue: "12 Dec 2026 · Version 1.1",
          workflowStage: "Public Calendar Updated",
          reference: "KSHEC/ACAD/CAL/2026/01-R1",
        },
        {
          id: `institutions-notified-${Date.now()}`,
          action: "Institutions notified",
          actor: "VIDYACHAKRA Notification Service",
          actorRole: "System Notification",
          scope: "All governed institutions",
          timestamp: "02 Aug 2026 · 10:03",
          detail:
            "Version 1.1 publication notice distributed to universities and affected colleges.",
          previousValue: "Notification pending",
          newValue: "Notification delivered",
          workflowStage: "Institutions Notified",
          reference: "NOTICE/FYUGP/2026/18",
        },
        {
          id: `revision-published-${Date.now()}`,
          action: "Calendar Version 1.1 published and locked",
          actor: "Leela Krishnan",
          actorRole: "HEC Calendar Administrator",
          scope: "FYUGP Academic Calendar 2026–27",
          timestamp: "02 Aug 2026 · 10:00",
          detail:
            "Approved revision published with the original Version 1.0 value retained in version history.",
          previousValue: "05 Dec 2026 · Version 1.0",
          newValue: "12 Dec 2026 · Version 1.1",
          workflowStage: "Publication by HEC Calendar Administrator",
          reference: "KSHEC/ACAD/CAL/2026/01-R1",
        },
        ...current.demoAuditEntries,
      ],
    }));
    toast(
      "Revision published",
      "Calendar version 1.1 is now the locked demonstration baseline.",
    );
  }, [
    commit,
    session.committeeDecision,
    session.revisionPublicationState,
    toast,
  ]);

  const confirmEventCompletion = useCallback(
    (id: string) => {
      commit((current) => ({
        ...current,
        completedEventConfirmations: current.completedEventConfirmations.includes(id)
          ? current.completedEventConfirmations
          : [...current.completedEventConfirmations, id],
      }));
      toast("Completion confirmed", "The milestone confirmation is saved on this device.");
    },
    [commit, toast],
  );

  const submitCompletionReport = useCallback(
    (id: string, report: Omit<CompletionReport, "submittedAt">) => {
      const submittedAt = new Date().toISOString();
      commit((current) => ({
        ...current,
        completedEventConfirmations: current.completedEventConfirmations.includes(id)
          ? current.completedEventConfirmations
          : [...current.completedEventConfirmations, id],
        completionReports: {
          ...current.completionReports,
          [id]: { ...report, submittedAt },
        },
        demoAuditEntries: [
          {
            id: `completion-${id}-${Date.now()}`,
            action: "Milestone completion confirmed",
            actor: "Prof. Anjali Menon · University Nodal Officer",
            scope: "Sahya Higher Studies University",
            timestamp: "26 Jul 2026 · 14:32",
            detail: `${report.evidenceType} evidence recorded with actual completion date ${report.actualDate}.`,
          },
          ...current.demoAuditEntries,
        ],
      }));
      toast(
        "Completion report submitted",
        "The actual date, remarks and evidence reference are now part of the university record.",
      );
    },
    [commit, toast],
  );

  const submitChangeRequest = useCallback(() => {
    commit((current) => ({
      ...current,
      requestStatus: "submitted",
      hecRecommendation: "pending",
      officerNote: "",
      committeeDecision: "pending",
      committeeCondition: "",
      committeeMeetingNote: "",
      revisionPublicationState: "not-started",
      publicationSchedule: "",
      institutionsNotified: false,
      publicCalendarUpdated: false,
      universityCalendarEntries: current.universityCalendarEntries.map(
        (entry) =>
          entry.changeRequestId === "CR-2026-014"
            ? {
                ...entry,
                ragStatus: "amber" as const,
                ragReason:
                  "Formal change request submitted and awaiting HEC scrutiny.",
              }
            : entry,
      ),
      notificationCount: Math.max(current.notificationCount + 1, 4),
      demoAuditEntries: [
        {
          id: `request-cr-2026-014-${Date.now()}`,
          action: "Change request submitted",
          actor: "Prof. Anjali Menon · University Nodal Officer",
          actorRole: "University Nodal Officer",
          scope: "CR-2026-014",
          timestamp: "26 Jul 2026 · 15:08",
          detail:
            "Semester 1 Theory Examination date-change request submitted to the HEC Academic Monitoring Cell with impact and evidence records.",
          previousValue: "Drafted by University",
          newValue: "Submitted by University",
          workflowStage: "Submitted by University",
          reference: "CR-2026-014",
        },
        ...current.demoAuditEntries,
      ],
    }));
    toast(
      "CR-2026-014 submitted",
      "The request is now in the HEC screening queue and the deviation is under review.",
    );
  }, [commit, toast]);

  const toggleBookmark = useCallback(
    (id: string) => {
      commit((current) => {
        const exists = current.bookmarkedEvents.includes(id);
        toast(
          exists ? "Reminder removed" : "Reminder saved",
          exists
            ? "This milestone is no longer in your saved reminders."
            : "This milestone is now available in your saved reminders.",
        );
        return {
          ...current,
          bookmarkedEvents: exists
            ? current.bookmarkedEvents.filter((eventId) => eventId !== id)
            : [...current.bookmarkedEvents, id],
        };
      });
    },
    [commit, toast],
  );

  const setNotificationsRead = useCallback(
    (read: boolean) => {
      commit((current) => ({ ...current, notificationCount: read ? 0 : 3 }));
    },
    [commit],
  );

  const value = useMemo<DemoStateContextValue>(
    () => ({
      ...session,
      hydrated,
      notificationsRead: session.notificationCount === 0,
      selectWorkspace,
      signOut,
      resetDemo,
      setAcademicYear,
      saveAcademicYear,
      setDefaultAcademicYear,
      closeAcademicYear,
      saveCalendarMilestone,
      setCalendarMilestoneActive,
      saveCourseMaster,
      setCourseMasterActive,
      saveAcademicDeliveryUnit,
      setUniversityOperatingModel,
      saveCourseOffering,
      submitCourseOffering,
      reviewCourseOffering,
      copyCourseOfferingToNextYear,
      requestVerifiedCapacityChange,
      saveStrengthReports,
      setCohortAdmissionStatus,
      saveUniversityCalendarSubmission,
      submitUniversityCalendarSubmission,
      addUniversityCalendarReviewNote,
      reviewUniversityCalendarSubmission,
      setSelectedProgramme,
      setSelectedSemester,
      setRequestStatus,
      setCommitteeDecision,
      setRevisionPublicationState,
      recordHecRecommendation,
      saveOfficerNote,
      recordCommitteeOutcome,
      saveCommitteeMeetingNote,
      scheduleRevisionPublication,
      returnPublicationToCommittee,
      publishRevision,
      confirmEventCompletion,
      submitCompletionReport,
      submitChangeRequest,
      toggleBookmark,
      setNotificationsRead,
      toast,
    }),
    [
      session,
      hydrated,
      selectWorkspace,
      signOut,
      resetDemo,
      setAcademicYear,
      saveAcademicYear,
      setDefaultAcademicYear,
      closeAcademicYear,
      saveCalendarMilestone,
      setCalendarMilestoneActive,
      saveCourseMaster,
      setCourseMasterActive,
      saveAcademicDeliveryUnit,
      setUniversityOperatingModel,
      saveCourseOffering,
      submitCourseOffering,
      reviewCourseOffering,
      copyCourseOfferingToNextYear,
      requestVerifiedCapacityChange,
      saveStrengthReports,
      setCohortAdmissionStatus,
      saveUniversityCalendarSubmission,
      submitUniversityCalendarSubmission,
      addUniversityCalendarReviewNote,
      reviewUniversityCalendarSubmission,
      setSelectedProgramme,
      setSelectedSemester,
      setRequestStatus,
      setCommitteeDecision,
      setRevisionPublicationState,
      recordHecRecommendation,
      saveOfficerNote,
      recordCommitteeOutcome,
      saveCommitteeMeetingNote,
      scheduleRevisionPublication,
      returnPublicationToCommittee,
      publishRevision,
      confirmEventCompletion,
      submitCompletionReport,
      submitChangeRequest,
      toggleBookmark,
      setNotificationsRead,
      toast,
    ],
  );

  return (
    <DemoContext.Provider value={value}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>
            <span className="toast-mark" aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
            </div>
          </div>
        ))}
      </div>
    </DemoContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemoState must be used within DemoStateProvider");
  }
  return context;
}
