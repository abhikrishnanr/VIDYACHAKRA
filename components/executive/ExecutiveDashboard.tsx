"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  CircleCheckBig,
  Clock3,
  Download,
  Expand,
  FileCheck2,
  Gavel,
  Landmark,
  Presentation,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RagBadge } from "@/components/shared/RagBadge";
import { useDemoState } from "@/lib/demo-state";
import type { RagStatus } from "@/lib/types";

type ExecutiveYear = "2026–27" | "2025–26";

type LifecycleItem = {
  label: string;
  date: string;
  note: string;
  status: RagStatus;
  statusLabel: string;
};

type AttentionItem = {
  title: string;
  institution: string;
  note: string;
  status: RagStatus;
  statusLabel: string;
  href: string;
};

const publishedDecision =
  "All monitored institutions are aligned or covered by approved calendar decisions.";

export function ExecutiveDashboard() {
  const {
    committeeDecision,
    hecRecommendation,
    masterCalendarVersion,
    requestStatus,
    revisionPublicationState,
    toast,
  } = useDemoState();
  const [selectedYear, setSelectedYear] = useState<ExecutiveYear>("2026–27");
  const [presentationMode, setPresentationMode] = useState(false);

  const archivedYear = selectedYear === "2025–26";
  const published = revisionPublicationState === "published";
  const approved =
    committeeDecision === "approved" ||
    committeeDecision === "approved-with-conditions" ||
    requestStatus === "approved";
  const underReview =
    !published &&
    !approved &&
    requestStatus !== "draft" &&
    requestStatus !== "rejected";
  const issueStatus: RagStatus = published
    ? "green"
    : approved || underReview
      ? "amber"
      : "red";

  useEffect(() => {
    document.body.classList.toggle("executive-presentation", presentationMode);

    function syncFullscreenState() {
      if (!document.fullscreenElement) {
        setPresentationMode(false);
      }
    }

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => {
      document.body.classList.remove("executive-presentation");
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, [presentationMode]);

  const overallStatement = archivedYear
    ? "The 2025–26 academic year closed with all official milestones completed."
    : published
      ? publishedDecision
      : approved
        ? "Statewide calendar broadly on track, with one approved examination decision awaiting publication."
        : underReview
          ? "Statewide calendar broadly on track, with one examination deviation moving through formal review."
          : "Statewide calendar broadly on track, with one critical examination deviation requiring intervention.";

  const lifecycle = useMemo<LifecycleItem[]>(() => {
    if (archivedYear) {
      return [
        ["Admissions", "JUN", "Completed", "green", "Completed"],
        ["Classes", "JUL", "Completed", "green", "Completed"],
        ["Assessments", "SEP", "Completed", "green", "Completed"],
        ["Examinations", "NOV", "Completed", "green", "Completed"],
        ["Valuation", "DEC", "Completed", "green", "Completed"],
        ["Results", "JAN", "Published", "green", "Completed"],
      ].map(([label, date, note, status, statusLabel]) => ({
        label,
        date,
        note,
        status: status as RagStatus,
        statusLabel,
      }));
    }

    return [
      {
        label: "Admissions",
        date: "24 JUL",
        note: "Closed on schedule",
        status: "green",
        statusLabel: "Complete",
      },
      {
        label: "Classes",
        date: "03 AUG",
        note: "Readiness confirmed",
        status: "green",
        statusLabel: "Ready",
      },
      {
        label: "Assessments",
        date: "21 SEP",
        note: "Common window protected",
        status: "green",
        statusLabel: "On track",
      },
      {
        label: "Examinations",
        date: published ? "05–12 DEC" : "05 DEC",
        note: published
          ? "One approved institutional exception"
          : approved
            ? "Decision awaiting publication"
            : underReview
              ? "One variance under review"
              : "One critical variance",
        status: issueStatus,
        statusLabel: published
          ? "Approved"
          : approved
            ? "Pending publication"
            : underReview
              ? "Under review"
              : "At risk",
      },
      {
        label: "Valuation",
        date: "19 DEC",
        note: published ? "Statewide window protected" : "Monitored dependency",
        status: published ? "green" : "amber",
        statusLabel: published ? "On track" : "Watch",
      },
      {
        label: "Results",
        date: "20 JAN",
        note: "Statewide publication window",
        status: published ? "green" : "amber",
        statusLabel: published ? "On track" : "Protected",
      },
    ];
  }, [approved, archivedYear, issueStatus, published, underReview]);

  const attentionItems = useMemo<AttentionItem[]>(() => {
    if (archivedYear || published) return [];
    const sahyaLabel = approved
      ? "Approved · awaiting publication"
      : underReview
        ? "Formal review in progress"
        : "Intervention required";
    return [
      {
        title: "Semester 1 Theory Examination",
        institution: "Sahya Higher Studies University",
        note: `Scheduled for 12 December against the 5 December Council date. ${sahyaLabel}.`,
        status: issueStatus,
        statusLabel: sahyaLabel,
        href: "/workflow/requests/CR-2026-014",
      },
      {
        title: "Academic readiness confirmation",
        institution: "Periyar Valley University",
        note: "Syndicate confirmation remains due before the class commencement checkpoint.",
        status: "amber",
        statusLabel: "Confirmation awaited",
        href: "/hec/institutions/periyar",
      },
      {
        title: "Milestone evidence",
        institution: "Kuttanad Knowledge University",
        note: "Two upcoming dates remain under monitoring while readiness evidence is completed.",
        status: "amber",
        statusLabel: "Evidence incomplete",
        href: "/hec/institutions/kuttanad",
      },
    ];
  }, [approved, archivedYear, issueStatus, published, underReview]);

  const watchlist = archivedYear || published
    ? []
    : [
        {
          name: "Sahya Higher Studies University",
          detail: approved
            ? "Approved examination exception awaiting publication"
            : underReview
              ? "Examination variance under formal review"
              : "Unauthorised seven-day examination variance",
          status: issueStatus,
          label: approved
            ? "Pending publication"
            : underReview
              ? "Under review"
              : "Critical",
        },
        {
          name: "Periyar Valley University",
          detail: "Syndicate readiness confirmation awaited",
          status: "amber" as RagStatus,
          label: "Attention",
        },
        {
          name: "Kuttanad Knowledge University",
          detail: "Two dates under monitoring",
          status: "amber" as RagStatus,
          label: "Attention",
        },
      ];

  const executiveBrief = archivedYear
    ? "The FYUGP 2025–26 academic cycle is closed. Admissions, teaching, assessments, examinations, valuation and results were completed within the final approved calendar, with no decision awaiting leadership action."
    : published
      ? `The FYUGP 2026–27 calendar is on track across all six monitored universities. Calendar Version ${masterCalendarVersion} formally covers Sahya Higher Studies University’s seven-day examination exception while protecting the statewide result window. No critical intervention or publication decision is currently outstanding.`
      : approved
        ? "The FYUGP 2026–27 calendar remains broadly on track. The Empowered Committee has approved Sahya Higher Studies University’s seven-day examination exception affecting 18 colleges. The exception remains an Amber item until Version 1.1 is published; the statewide result window is protected."
        : underReview
          ? "The FYUGP 2026–27 calendar remains broadly on track. Sahya Higher Studies University’s seven-day theory examination variance, affecting 18 colleges, is now in the formal governance workflow. Periyar Valley and Kuttanad remain on the watchlist for readiness confirmation; no statewide milestone has been moved."
          : "The FYUGP 2026–27 calendar remains broadly on track. Sahya Higher Studies University has scheduled its Semester 1 Theory Examination seven days beyond the approved Council date, affecting 18 colleges. The request has not yet completed formal review. Periyar Valley and Kuttanad also require routine readiness follow-up.";

  function downloadBrief() {
    const file = new Blob(
      [
        `VIDYACHAKRA Executive Brief\nKerala FYUGP Academic Pulse · Academic Year ${selectedYear}\n\n${overallStatement}\n\n${executiveBrief}\n`,
      ],
      { type: "text/plain;charset=utf-8" },
    );
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `VIDYACHAKRA-Executive-Brief-${selectedYear}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast(
      "Executive brief downloaded",
      `The ${selectedYear} leadership summary has been prepared as a text brief.`,
    );
  }

  async function openPresentationMode() {
    setPresentationMode(true);
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      toast(
        "Presentation view opened",
        "The dashboard has been optimised for projection in this window.",
      );
    }
  }

  async function closePresentationMode() {
    setPresentationMode(false);
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  }

  return (
    <div className="executive-dashboard">
      {presentationMode ? (
        <button
          className="executive-presentation-exit"
          onClick={closePresentationMode}
          aria-label="Exit presentation mode"
        >
          <X size={18} /> Exit presentation
        </button>
      ) : null}

      <header className="executive-summary-hero">
        <div className="executive-summary-copy">
          <p className="executive-kicker">
            <Landmark size={15} /> Leadership overview · Updated 26 July 2026
          </p>
          <h1>Kerala FYUGP Academic Pulse</h1>
          <span className="executive-year-label">Academic Year {selectedYear}</span>
          <p className="executive-state-statement">{overallStatement}</p>
        </div>
        <div className="executive-hero-actions">
          <label className="executive-year-control">
            <span>Academic year</span>
            <select
              value={selectedYear}
              onChange={(event) => {
                const year = event.target.value as ExecutiveYear;
                setSelectedYear(year);
                toast(
                  "Academic year switched",
                  year === "2025–26"
                    ? "Showing the closed 2025–26 executive record."
                    : "Showing the active 2026–27 academic pulse.",
                );
              }}
            >
              <option value="2026–27">2026–27 · Active</option>
              <option value="2025–26">2025–26 · Closed</option>
            </select>
          </label>
          <button className="button button-secondary" onClick={downloadBrief}>
            <Download size={17} /> Download Executive Brief
          </button>
          <button className="button button-primary" onClick={openPresentationMode}>
            <Expand size={17} /> Presentation Mode
          </button>
        </div>
      </header>

      <section className="executive-alignment" aria-labelledby="alignment-title">
        <div className="executive-alignment-score">
          <span>{archivedYear || published ? "6 of 6" : underReview || approved ? "6 in view" : "5 of 6"}</span>
          <p id="alignment-title">Statewide Alignment</p>
        </div>
        <div className="executive-alignment-message">
          <RagBadge
            status={archivedYear || published ? "green" : issueStatus}
            label={
              archivedYear
                ? "Academic year completed"
                : published
                  ? "Aligned or officially covered"
                  : approved
                    ? "One decision awaiting publication"
                    : underReview
                      ? "One exception under review"
                      : "One critical exception"
            }
          />
          <h2>
            {archivedYear
              ? "All six university records are closed."
              : published
                ? "Every monitored university is within the official governance framework."
                : "Most universities are aligned; the examination exception is isolated and visible."}
          </h2>
          <p>
            {archivedYear
              ? "The final approved calendar and completion record remain available for reference."
              : published
                ? "The approved Sahya exception is recorded in Version 1.1 without changing the statewide result window."
                : "No statewide teaching or assessment milestone has been moved. Senior attention can remain focused on one formal case."}
          </p>
        </div>
        <Link className="executive-link-action" href="/hec/compliance">
          View Detailed Matrix <ArrowRight size={17} />
        </Link>
      </section>

      <section className="executive-section executive-lifecycle-section">
        <div className="executive-section-heading">
          <div>
            <p>Academic Lifecycle</p>
            <h2>From admissions to results</h2>
          </div>
          <span>Simple statewide view</span>
        </div>
        <div className="executive-lifecycle">
          {lifecycle.map((item) => (
            <article key={item.label} className={`executive-lifecycle-item lifecycle-${item.status}`}>
              <span className="executive-lifecycle-date">{item.date}</span>
              <span className="executive-lifecycle-marker" aria-hidden="true">
                {item.status === "green" ? (
                  <CheckCircle2 size={18} />
                ) : item.status === "red" ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Clock3 size={18} />
                )}
              </span>
              <h3>{item.label}</h3>
              <p>{item.note}</p>
              <RagBadge status={item.status} label={item.statusLabel} />
            </article>
          ))}
        </div>
      </section>

      <div className="executive-primary-grid">
        <section className="executive-section executive-attention">
          <div className="executive-section-heading">
            <div>
              <p>Critical Attention</p>
              <h2>{attentionItems.length ? "Items requiring leadership visibility" : "No critical intervention required"}</h2>
            </div>
            <span>{attentionItems.length} open</span>
          </div>
          {attentionItems.length ? (
            <div className="executive-attention-list">
              {attentionItems.map((item) => (
                <Link href={item.href} key={item.title}>
                  <span className={`executive-attention-icon attention-${item.status}`}>
                    {item.status === "red" ? (
                      <AlertTriangle size={21} />
                    ) : (
                      <Clock3 size={21} />
                    )}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.institution}</small>
                    <p>{item.note}</p>
                  </span>
                  <RagBadge status={item.status} label={item.statusLabel} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="executive-clear-state">
              <CircleCheckBig size={30} />
              <div>
                <strong>{archivedYear ? "Academic year closed" : "The previous critical exception is officially resolved."}</strong>
                <p>
                  {archivedYear
                    ? "No unresolved intervention item remains in the closed record."
                    : "Calendar Version 1.1 retains the decision, affected institutions and original date history."}
                </p>
              </div>
            </div>
          )}
          {!archivedYear && !published ? (
            <Link className="executive-text-link" href="/workflow/requests/CR-2026-014">
              Open Critical Issue <ArrowRight size={16} />
            </Link>
          ) : null}
        </section>

        <section className="executive-section executive-upcoming">
          <div className="executive-section-heading">
            <div>
              <p>Upcoming Statewide Milestones</p>
              <h2>{archivedYear ? "Academic year completed" : "What comes next"}</h2>
            </div>
            <CalendarClock size={22} />
          </div>
          {archivedYear ? (
            <div className="executive-clear-state">
              <CalendarCheck2 size={30} />
              <div>
                <strong>No upcoming obligations</strong>
                <p>The selected year is closed and retained for executive reference.</p>
              </div>
            </div>
          ) : (
            <ol className="executive-upcoming-list">
              {[
                ["03", "AUG", "Semester classes commence", "Ready across all universities", "green"],
                ["14", "AUG", "Course registration closes", "Readiness confirmations received", "green"],
                ["21", "SEP", "Internal Assessment 1", "Common window protected", "green"],
                ["25", "NOV", "Practical examinations", "Routine monitoring", "amber"],
                [
                  published ? "05–12" : "05",
                  "DEC",
                  "Theory examinations",
                  published ? "Official exception recorded" : "One university requires attention",
                  issueStatus,
                ],
              ].map(([day, month, title, note, status]) => (
                <li key={title}>
                  <span className="executive-date-block">
                    <strong>{day}</strong>
                    <small>{month}</small>
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{note}</small>
                  </span>
                  <RagBadge
                    status={status as RagStatus}
                    label={
                      status === "green"
                        ? "Ready"
                        : status === "red"
                          ? "At risk"
                          : published && title === "Theory examinations"
                            ? "Approved"
                            : "Watch"
                    }
                  />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="executive-secondary-grid">
        <section className="executive-section">
          <div className="executive-section-heading">
            <div>
              <p>Institution Watchlist</p>
              <h2>Only Amber and Red universities</h2>
            </div>
            <span>{watchlist.length} listed</span>
          </div>
          {watchlist.length ? (
            <div className="executive-watchlist">
              {watchlist.map((institution) => (
                <article key={institution.name}>
                  <div>
                    <strong>{institution.name}</strong>
                    <p>{institution.detail}</p>
                  </div>
                  <RagBadge status={institution.status} label={institution.label} />
                </article>
              ))}
            </div>
          ) : (
            <div className="executive-clear-state compact">
              <ShieldCheck size={25} />
              <div>
                <strong>No university is on the executive watchlist.</strong>
                <p>All monitored records are aligned, completed or officially covered.</p>
              </div>
            </div>
          )}
        </section>

        <section className="executive-section">
          <div className="executive-section-heading">
            <div>
              <p>Pending Decisions</p>
              <h2>Committee and publication action</h2>
            </div>
            <Gavel size={22} />
          </div>
          <div className="executive-decision-list">
            {archivedYear || published ? (
              <div className="executive-clear-state compact">
                <CheckCircle2 size={25} />
                <div>
                  <strong>No decision awaiting action</strong>
                  <p>Committee and publication queues are clear for this executive view.</p>
                </div>
              </div>
            ) : approved ? (
              <Link href="/hec/publication">
                <FileCheck2 size={20} />
                <span>
                  <strong>Publish Calendar Version 1.1</strong>
                  <small>Committee decision recorded · administrator action required</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            ) : requestStatus === "committee-review" ? (
              <Link href="/workflow/decisions">
                <Gavel size={20} />
                <span>
                  <strong>Decide CR-2026-014</strong>
                  <small>HEC recommendation recorded · committee decision required</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            ) : underReview ? (
              <Link href="/workflow/requests/CR-2026-014">
                <Clock3 size={20} />
                <span>
                  <strong>HEC scrutiny in progress</strong>
                  <small>The request will enter committee review after recommendation</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            ) : (
              <Link href="/workflow/requests/CR-2026-014">
                <AlertTriangle size={20} />
                <span>
                  <strong>CR-2026-014 has not entered formal review</strong>
                  <small>The university must submit the request before a decision can be taken</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </section>
      </div>

      <section className="executive-section executive-decisions">
        <div className="executive-section-heading">
          <div>
            <p>Recent Official Decisions</p>
            <h2>Decisions that changed or protected the calendar</h2>
          </div>
          <Link className="executive-text-link" href="/audit">
            View audit history <ArrowRight size={16} />
          </Link>
        </div>
        <div className="executive-decision-history">
          {published && !archivedYear ? (
            <article>
              <span><ShieldCheck size={20} /></span>
              <div>
                <strong>Calendar Version 1.1 published and locked</strong>
                <p>Sahya’s 12 December examination date became an approved institution-specific exception.</p>
              </div>
              <time>02 AUG 2026</time>
            </article>
          ) : null}
          {committeeDecision !== "pending" && !archivedYear ? (
            <article>
              <span><Gavel size={20} /></span>
              <div>
                <strong>
                  Empowered Committee {committeeDecision === "approved-with-conditions" ? "approved with conditions" : committeeDecision}
                </strong>
                <p>CR-2026-014 was recorded under decision reference EC/FYUGP/2026/08.</p>
              </div>
              <time>29 JUL 2026</time>
            </article>
          ) : null}
          {hecRecommendation !== "pending" && !archivedYear ? (
            <article>
              <span><FileCheck2 size={20} /></span>
              <div>
                <strong>HEC scrutiny recommendation recorded</strong>
                <p>The examination exception was assessed against the locked Council baseline.</p>
              </div>
              <time>27 JUL 2026</time>
            </article>
          ) : null}
          <article>
            <span><CalendarCheck2 size={20} /></span>
            <div>
              <strong>
                {archivedYear ? "Academic Calendar 2025–26 closed" : "FYUGP Academic Calendar Version 1.0 published"}
              </strong>
              <p>
                {archivedYear
                  ? "The final completion record was locked with prior values retained."
                  : "The statewide academic and examination baseline became official for all institutions."}
              </p>
            </div>
            <time>{archivedYear ? "31 MAY 2026" : "15 JUN 2026"}</time>
          </article>
        </div>
      </section>

      <section className="executive-brief">
        <span className="executive-brief-icon"><Presentation size={26} /></span>
        <div>
          <p>Executive Brief</p>
          <h2>Plain-language leadership summary</h2>
          <blockquote>{executiveBrief}</blockquote>
        </div>
        <button className="button button-secondary" onClick={downloadBrief}>
          <Download size={17} /> Download Brief
        </button>
      </section>
    </div>
  );
}
