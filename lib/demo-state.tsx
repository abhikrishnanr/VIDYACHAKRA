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

type Toast = { id: number; title: string; message: string };

type DemoState = {
  academicYear: string;
  setAcademicYear: (year: string) => void;
  bookmarkedEvents: string[];
  toggleBookmark: (id: string) => void;
  notificationsRead: boolean;
  setNotificationsRead: (value: boolean) => void;
  toast: (title: string, message: string) => void;
};

const DemoContext = createContext<DemoState | null>(null);

function persistDemoState(
  patch: Partial<{ academicYear: string; bookmarkedEvents: string[] }>,
) {
  try {
    const current = JSON.parse(
      window.localStorage.getItem("vidyachakra-demo-state") ?? "{}",
    ) as { academicYear?: string; bookmarkedEvents?: string[] };
    window.localStorage.setItem(
      "vidyachakra-demo-state",
      JSON.stringify({ ...current, ...patch }),
    );
  } catch {
    window.localStorage.setItem("vidyachakra-demo-state", JSON.stringify(patch));
  }
}

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const [academicYear, setAcademicYearState] = useState("2026–27");
  const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([]);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("vidyachakra-demo-state");
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as {
          academicYear?: string;
          bookmarkedEvents?: string[];
        };
        if (parsed.academicYear) setAcademicYearState(parsed.academicYear);
        if (parsed.bookmarkedEvents) setBookmarkedEvents(parsed.bookmarkedEvents);
      } catch {
        window.localStorage.removeItem("vidyachakra-demo-state");
      }
    }, 0);
    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const toast = useCallback((title: string, message: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, message }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((item) => item.id !== id)),
      3600,
    );
  }, []);

  const setAcademicYear = useCallback(
    (year: string) => {
      setAcademicYearState(year);
      persistDemoState({ academicYear: year });
      toast("Academic year changed", `The prototype is now showing ${year}.`);
    },
    [toast],
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      setBookmarkedEvents((current) => {
        const exists = current.includes(id);
        toast(
          exists ? "Reminder removed" : "Reminder saved",
          exists
            ? "This date has been removed from your saved reminders."
            : "This date is now available in your saved reminders.",
        );
        const next = exists
          ? current.filter((eventId) => eventId !== id)
          : [...current, id];
        persistDemoState({ bookmarkedEvents: next });
        return next;
      });
    },
    [toast],
  );

  const value = useMemo(
    () => ({
      academicYear,
      setAcademicYear,
      bookmarkedEvents,
      toggleBookmark,
      notificationsRead,
      setNotificationsRead,
      toast,
    }),
    [
      academicYear,
      setAcademicYear,
      bookmarkedEvents,
      toggleBookmark,
      notificationsRead,
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
