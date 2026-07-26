"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpenCheck,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  FileCheck2,
  FileClock,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { buildMatrixCells } from "@/lib/compliance-matrix-data";
import { useDemoState } from "@/lib/demo-state";
import { councilNotifications, sahyaColleges } from "@/lib/university-data";

const requestLabels = {
  draft: "Draft",
  submitted: "Submitted for screening",
  screening: "Screening in progress",
  "committee-review": "Committee review",
  returned: "Returned for information",
  approved: "Approved, awaiting publication",
  rejected: "Decision recorded",
  published: "Published as Version 1.1",
};

export function UniversityOperationsDashboard() {
  const {
    requestStatus,
    committeeDecision,
    revisionPublicationState,
    completedEventConfirmations,
    toast,
  } = useDemoState();
  const cells = buildMatrixCells({
    requestStatus,
    committeeDecision,
    revisionPublicationState,
  }).filter((cell) => cell.universityId === "sahya");
  const theory = cells.find((cell) => cell.milestoneId === "theory")!;
  const collegeAligned = sahyaColleges.filter(
    (college) => college.status === "aligned",
  ).length;
  const completionCount = completedEventConfirmations.length;
  const isRed = theory.status === "red";
  const isGreen = theory.status === "green";
  const issueTone = isRed ? "red" : isGreen ? "green" : "amber";
  const issueTitle = isRed
    ? "Formal approval required for the 12 December theory examination"
    : isGreen
      ? "Theory examination exception is now official"
      : "Theory examination request is progressing through review";

  return (
    <div className="uni-page">
      <header className="uni-page-header">
        <div>
          <p className="uni-kicker">Sahya Higher Studies University · Nodal office</p>
          <h1>University academic operations</h1>
          <p>
            Keep the adopted FYUGP calendar, completion reporting and affiliated
            college readiness in one working view.
          </p>
        </div>
        <div className="uni-header-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "Readiness reminder sent",
                "A demonstration reminder was sent to colleges awaiting confirmation.",
              )
            }
          >
            <BellRing size={16} /> Remind colleges
          </button>
          <Link className="button button-primary" href="/university/calendar">
            Open adopted calendar <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <section className="uni-identity-band" aria-label="Institution status">
        <div className="uni-identity-mark">
          <Landmark size={25} />
        </div>
        <div className="uni-identity-copy">
          <span>Institution SHSU-2026 · Central Kerala</span>
          <strong>Sahya Higher Studies University</strong>
          <small>18 affiliated colleges · University Nodal Officer: Prof. Anjali Menon</small>
        </div>
        <div className="uni-adoption-state">
          <span><LockKeyhole size={15} /> Adopted calendar</span>
          <strong>Version 1.0 · Locked</strong>
          <small>Adopted 18 July 2026</small>
        </div>
        <div className={`uni-overall-state ${issueTone}`}>
          {isRed ? (
            <AlertTriangle size={20} />
          ) : isGreen ? (
            <CheckCircle2 size={20} />
          ) : (
            <Clock3 size={20} />
          )}
          <span>
            <small>Overall compliance</small>
            <strong>
              {isRed
                ? "Critical deviation"
                : isGreen
                  ? "Approved exception"
                  : "Attention required"}
            </strong>
          </span>
        </div>
      </section>

      <section className={`uni-priority-issue ${issueTone}`}>
        <div className="uni-issue-icon">
          {isRed ? (
            <AlertTriangle size={24} />
          ) : isGreen ? (
            <ShieldCheck size={24} />
          ) : (
            <FileClock size={24} />
          )}
        </div>
        <div className="uni-issue-main">
          <p>Priority academic calendar issue · Semester 1</p>
          <h2>{issueTitle}</h2>
          <div className="uni-date-comparison">
            <span>
              <small>Council baseline</small>
              <strong>05 Dec 2026</strong>
            </span>
            <ChevronRight size={20} />
            <span>
              <small>University schedule</small>
              <strong>12 Dec 2026</strong>
            </span>
            <span className="uni-variance">+7 days</span>
          </div>
          <p className="uni-issue-reason">{theory.reason}</p>
        </div>
        <div className="uni-issue-side">
          <span className={`uni-state-chip ${issueTone}`}>
            {isRed ? (
              <AlertTriangle size={14} />
            ) : isGreen ? (
              <CheckCircle2 size={14} />
            ) : (
              <Clock3 size={14} />
            )}
            {theory.statusLabel}
          </span>
          <small>18 colleges · CR-2026-014</small>
          <Link
            className="button button-primary"
            href={
              requestStatus === "draft"
                ? "/university/change-requests/new"
                : "/university/change-requests"
            }
          >
            {requestStatus === "draft" ? "Complete request" : "Track request"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <div className="uni-dashboard-grid">
        <section className="uni-panel uni-obligations">
          <div className="uni-panel-heading">
            <div>
              <p>What needs attention next</p>
              <h2>Upcoming obligations</h2>
            </div>
            <Link href="/university/calendar">View calendar <ArrowRight size={14} /></Link>
          </div>
          <div className="uni-obligation-list">
            <article>
              <time><strong>31</strong><span>JUL</span></time>
              <div>
                <span className="uni-obligation-type">Readiness</span>
                <h3>Confirm examination centre preparedness</h3>
                <p>5 affiliated colleges have evidence or confirmation outstanding.</p>
              </div>
              <span className="uni-due-chip">5 days</span>
            </article>
            <article>
              <time><strong>03</strong><span>AUG</span></time>
              <div>
                <span className="uni-obligation-type">Academic activity</span>
                <h3>Semester classes commence</h3>
                <p>Completion reporting opens on the approved Council date.</p>
              </div>
              <span className="uni-due-chip neutral">8 days</span>
            </article>
            <article>
              <time><strong>14</strong><span>AUG</span></time>
              <div>
                <span className="uni-obligation-type">Registration</span>
                <h3>Course registration deadline</h3>
                <p>College-level enrolment evidence must be consolidated.</p>
              </div>
              <span className="uni-due-chip neutral">19 days</span>
            </article>
          </div>
        </section>

        <section className="uni-panel uni-working-summary">
          <div className="uni-panel-heading">
            <div>
              <p>Working position</p>
              <h2>Today’s university record</h2>
            </div>
          </div>
          <div className="uni-working-list">
            <Link href="/university/calendar">
              <span className="uni-summary-icon teal"><CalendarCheck2 size={18} /></span>
              <span><strong>3 confirmations pending</strong><small>{completionCount} milestones recorded</small></span>
              <ChevronRight size={17} />
            </Link>
            <Link href="/university/change-requests">
              <span className={`uni-summary-icon ${issueTone}`}><FileClock size={18} /></span>
              <span><strong>1 active change request</strong><small>{requestLabels[requestStatus]}</small></span>
              <ChevronRight size={17} />
            </Link>
            <Link href="/university/colleges">
              <span className="uni-summary-icon green"><UsersRound size={18} /></span>
              <span><strong>{collegeAligned} of 18 colleges ready</strong><small>5 require follow-up</small></span>
              <ChevronRight size={17} />
            </Link>
            <button
              onClick={() =>
                toast(
                  "Evidence register opened",
                  "The demonstration evidence register is up to date.",
                )
              }
            >
              <span className="uni-summary-icon navy"><FileCheck2 size={18} /></span>
              <span><strong>Evidence register current</strong><small>Last upload 24 July 2026</small></span>
              <ChevronRight size={17} />
            </button>
          </div>
        </section>

        <section className="uni-panel uni-college-response">
          <div className="uni-panel-heading">
            <div>
              <p>Affiliated network</p>
              <h2>College response summary</h2>
            </div>
            <Link href="/university/colleges">All colleges <ArrowRight size={14} /></Link>
          </div>
          <div className="uni-response-figure">
            <div className="uni-ring" style={{ "--value": "56%" } as React.CSSProperties}>
              <strong>{collegeAligned}</strong><span>ready</span>
            </div>
            <div className="uni-response-legend">
              <span><i className="green" /><strong>10</strong> Ready and aligned</span>
              <span><i className="amber" /><strong>5</strong> Follow-up required</span>
              <span><i className="grey" /><strong>3</strong> Confirmation pending</span>
            </div>
          </div>
          <div className="uni-college-note">
            <Building2 size={17} />
            <span><strong>Next coordination call</strong> · 29 July, 11:00</span>
          </div>
        </section>

        <section className="uni-panel uni-council-feed">
          <div className="uni-panel-heading">
            <div>
              <p>Official updates</p>
              <h2>Latest Council notifications</h2>
            </div>
          </div>
          <div className="uni-notification-list">
            {councilNotifications.map((item, index) => (
              <button
                key={item.id}
                onClick={() =>
                  toast("Council notice opened", item.detail)
                }
              >
                <span className={index === 0 ? "new" : ""}>
                  {index === 0 ? <BellRing size={15} /> : <BookOpenCheck size={15} />}
                </span>
                <div>
                  <small>{item.date} {index === 0 ? "· New" : ""}</small>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="uni-adoption-footer">
        <ShieldCheck size={19} />
        <div>
          <strong>FYUGP Academic Calendar 2026–27 · Version 1.0</strong>
          <span>Published and locked · Authority KSHEC/ACAD/CAL/2026/01</span>
        </div>
        <span><CircleDashed size={15} /> Last synchronised 26 Jul 2026 · 14:20</span>
      </section>
    </div>
  );
}
