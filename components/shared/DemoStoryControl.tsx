"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  Check,
  ChevronRight,
  Compass,
  RotateCcw,
  X,
} from "lucide-react";
import { useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import { DemoResetDialog } from "./DemoResetDialog";

const storySteps = [
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
];

export function DemoStoryControl() {
  const pathname = usePathname();
  const state = useDemoState();
  const [open, setOpen] = useState(false);
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
        <span>Demo story</span>
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
                <p>Guided presentation</p>
                <h2 id="demo-story-title">Academic Calendar Governance</h2>
              </div>
              <button
                type="button"
                aria-label="Close demo story"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </header>

            <div className="demo-story-summary">
              <BookOpenCheck size={18} />
              <div>
                <strong>Prove that a published date cannot be changed silently.</strong>
                <p>Open each step in sequence. The control stays available on every route.</p>
              </div>
            </div>

            <ol className="demo-story-steps">
              {storySteps.map((step, index) => {
                const current = pathname === step.routeMatch;
                const completed =
                  (index === 2 && state.requestStatus !== "draft") ||
                  (index === 3 && state.committeeDecision !== "pending") ||
                  (index >= 4 && state.revisionPublicationState === "published");
                return (
                  <li key={step.label} className={current ? "current" : ""}>
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
