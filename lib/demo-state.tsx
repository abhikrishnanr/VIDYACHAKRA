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
  AcademicYear,
  CommitteeDecision,
  CompletionReport,
  DemoRoleId,
  DemoSessionState,
  Programme,
  RequestStatus,
  RevisionPublicationState,
  Semester,
} from "./types";

type Toast = { id: number; title: string; message: string };

export const initialDemoState: DemoSessionState = {
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
  committeeDecision: "pending",
  revisionPublicationState: "not-started",
  bookmarkedEvents: [],
};

type DemoStateContextValue = DemoSessionState & {
  hydrated: boolean;
  notificationsRead: boolean;
  selectWorkspace: (role: DemoRoleId) => void;
  signOut: () => void;
  resetDemo: () => void;
  setAcademicYear: (year: AcademicYear) => void;
  setSelectedProgramme: (programme: Programme) => void;
  setSelectedSemester: (semester: Semester) => void;
  setRequestStatus: (status: RequestStatus) => void;
  setCommitteeDecision: (decision: CommitteeDecision) => void;
  setRevisionPublicationState: (state: RevisionPublicationState) => void;
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
            setSession({ ...initialDemoState, ...parsed });
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
    (academicYear: AcademicYear) => {
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

  const publishRevision = useCallback(() => {
    commit((current) => ({
      ...current,
      masterCalendarVersion: "1.1",
      publicationStatus: "locked",
      requestStatus: "published",
      revisionPublicationState: "published",
    }));
    toast(
      "Revision published",
      "Calendar version 1.1 is now the locked demonstration baseline.",
    );
  }, [commit, toast]);

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
      notificationCount: Math.max(current.notificationCount + 1, 4),
      demoAuditEntries: [
        {
          id: `request-cr-2026-014-${Date.now()}`,
          action: "Change request submitted",
          actor: "Prof. Anjali Menon · University Nodal Officer",
          scope: "CR-2026-014",
          timestamp: "26 Jul 2026 · 15:08",
          detail:
            "Semester 1 Theory Examination date-change request submitted to the HEC Academic Monitoring Cell with impact and evidence records.",
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
