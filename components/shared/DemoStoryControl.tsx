"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Check,
  ChevronRight,
  Compass,
  GraduationCap,
  RotateCcw,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import { DemoResetDialog } from "./DemoResetDialog";

type StoryId = "calendar" | "capacity";

type StoryStep = {
  label: string;
  detail: string;
  href: string;
  routeMatch: string;
};

const storySteps: Record<StoryId, StoryStep[]> = {
  calendar: [
    {
      label: "Find the official examination date",
      detail: "Open the public event drawer for Semester 1 Theory Examination.",
      href: "/calendar?event=semester-1-theory-examination&view=agenda",
      routeMatch: "/calendar",
    },
    {
      label: "Inspect the seven-day deviation",
      detail: "Open Sahya’s red Theory Examination cell in the Alignment Matrix.",
      href: "/hec/compliance",
      routeMatch: "/hec/compliance",
    },
    {
      label: "Submit CR-2026-014",
      detail: "Complete the university’s formal date-change request.",
      href: "/university/change-requests/new",
      routeMatch: "/university/change-requests/new",
    },
    {
      label: "Record the governance decision",
      detail: "Recommend, then approve the request with conditions.",
      href: "/workflow/requests/CR-2026-014",
      routeMatch: "/workflow/requests/CR-2026-014",
    },
    {
      label: "Publish Version 1.1",
      detail: "Release the approved exception from the Publication Desk.",
      href: "/hec/publication",
      routeMatch: "/hec/publication",
    },
    {
      label: "Verify the public update",
      detail: "Return to the public event and confirm Version 1.1.",
      href: "/calendar?event=semester-1-theory-examination&view=agenda",
      routeMatch: "/calendar",
    },
  ],
  capacity: [
    {
      label: "Open the Admission Pulse",
      detail: "Read the statewide Semester 1 seat position.",
      href: "/hec/admissions",
      routeMatch: "/hec/admissions",
    },
    {
      label: "Select B.Sc. Computer Science",
      detail: "Use the course-first vacancy explorer.",
      href: "/hec/vacancies",
      routeMatch: "/hec/vacancies",
    },
    {
      label: "Open Green Valley College",
      detail: "Show 80 sanctioned seats, 63 admissions and 17 vacancies.",
      href: "/hec/vacancies",
      routeMatch: "/hec/vacancies",
    },
    {
      label: "Show direct university teaching",
      detail: "Compare Ananthapuri School of Computing in the same matrix.",
      href: "/hec/vacancies",
      routeMatch: "/hec/vacancies",
    },
    {
      label: "Open the eight-semester journey",
      detail: "Inspect the B.Sc. Computer Science cohort across Semesters 1–8.",
      href: "/university/student-strength/cohort-off-001",
      routeMatch: "/university/student-strength/",
    },
    {
      label: "Find a missing report",
      detail: "Return to statewide student-strength monitoring.",
      href: "/hec/student-strength",
      routeMatch: "/hec/student-strength",
    },
    {
      label: "Send a reporting reminder",
      detail: "Use the simulated reminder action in the Admission Pulse.",
      href: "/hec/admissions",
      routeMatch: "/hec/admissions",
    },
  ],
};

export function DemoStoryControl() {
  const pathname = usePathname();
  const state = useDemoState();
  const [open, setOpen] = useState(false);
  const [story, setStory] = useState<StoryId>("calendar");
  const [resetOpen, setResetOpen] = useState(false);

  const governanceCompleted = [
    state.requestStatus !== "draft",
    state.hecRecommendation !== "pending",
    state.committeeDecision !== "pending",
    state.revisionPublicationState === "published",
  ].filter(Boolean).length;

  return (
    <>
      <button
        type="button"
        className="demo-story-launcher"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Compass size={16} />
        <span>Demo stories</span>
        {governanceCompleted ? <b>{governanceCompleted}/4</b> : null}
      </button>

      {open ? (
        <div className="demo-story-backdrop" onMouseDown={() => setOpen(false)}>
          <aside
            className="demo-story-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-story-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p>Optional guided presentation</p>
                <h2 id="demo-story-title">Choose a demo story</h2>
              </div>
              <button
                type="button"
                aria-label="Close demo stories"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="demo-story-tabs" role="tablist" aria-label="Demo stories">
              <button
                type="button"
                role="tab"
                aria-selected={story === "calendar"}
                className={story === "calendar" ? "active" : ""}
                onClick={() => setStory("calendar")}
              >
                <BookOpenCheck size={17} />
                <span><small>Story A</small>Calendar governance</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={story === "capacity"}
                className={story === "capacity" ? "active" : ""}
                onClick={() => setStory("capacity")}
              >
                <GraduationCap size={17} />
                <span><small>Story B</small>Capacity &amp; vacancy</span>
              </button>
            </div>

            <div className="demo-story-summary">
              <strong>
                {story === "calendar"
                  ? "Prove that a published date cannot be changed silently."
                  : "Explain sanctioned capacity, actual intake and reporting gaps."}
              </strong>
              <p>
                Open each step in sequence. The control stays available on every route.
              </p>
            </div>

            <ol className="demo-story-steps">
              {storySteps[story].map((step, index) => {
                const current =
                  pathname === step.routeMatch ||
                  (step.routeMatch.endsWith("/") && pathname.startsWith(step.routeMatch));
                const completed =
                  story === "calendar" &&
                  ((index === 2 && state.requestStatus !== "draft") ||
                    (index === 3 && state.committeeDecision !== "pending") ||
                    (index >= 4 && state.revisionPublicationState === "published"));
                return (
                  <li key={`${story}-${index}`} className={current ? "current" : ""}>
                    <span className={completed ? "complete" : ""}>
                      {completed ? <Check size={13} /> : index + 1}
                    </span>
                    <div>
                      <strong>{step.label}</strong>
                      <p>{step.detail}</p>
                    </div>
                    <Link href={step.href} onClick={() => setOpen(false)}>
                      {current ? "Current" : "Open"} <ChevronRight size={14} />
                    </Link>
                  </li>
                );
              })}
            </ol>

            <footer>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setResetOpen(true);
                }}
              >
                <RotateCcw size={14} /> Reset governance story
              </button>
              <Link href="/login" onClick={() => setOpen(false)}>
                Switch role workspace <ChevronRight size={14} />
              </Link>
            </footer>
          </aside>
        </div>
      ) : null}
      <DemoResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </>
  );
}
