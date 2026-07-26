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
  CourseMaster,
  DemoRoleId,
  DemoSessionState,
  HecRecommendation,
  Programme,
  RequestStatus,
  RevisionPublicationState,
  Semester,
  UniversityCalendarEntry,
  UniversityCalendarSubmission,
  UniversityOperatingModel,
} from "./types";
import { defaultDomainState } from "./domain-data";

type Toast = { id: number; title: string; message: string };

export const DEMO_STATE_VERSION = 7;

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
