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
  CommitteeDecision,
  CompletionReport,
  DemoRoleId,
  DemoSessionState,
  HecRecommendation,
  Programme,
  RequestStatus,
  RevisionPublicationState,
  Semester,
} from "./types";
import { defaultDomainState } from "./domain-data";

type Toast = { id: number; title: string; message: string };

export const DEMO_STATE_VERSION = 4;

export const initialDemoState: DemoSessionState = {
  demoStateVersion: DEMO_STATE_VERSION,
  activeRole: null,
  activeInstitution: "Sahya Higher Studies University",
  academicYear: "2026–27",
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
