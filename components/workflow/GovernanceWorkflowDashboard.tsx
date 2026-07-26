"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileClock,
  Gavel,
  Inbox,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { WorkflowStepTracker } from "@/components/workflow/WorkflowStepTracker";
import { useDemoState } from "@/lib/demo-state";
import {
  buildWorkflowStages,
  relatedWorkflowRequests,
  requestStageLabel,
} from "@/lib/workflow-data";

const bucketMeta = {
  scrutiny: {
    title: "Requests awaiting scrutiny",
    Icon: Inbox,
    helper: "HEC Academic Officer",
  },
  committee: {
    title: "Awaiting committee decision",
    Icon: Gavel,
    helper: "Empowered Committee",
  },
  publication: {
    title: "Approved · Awaiting publication",
    Icon: ShieldCheck,
    helper: "Calendar Administrator",
  },
  returned: {
    title: "Returned requests",
    Icon: RotateCcw,
    helper: "University clarification",
  },
} as const;

type Bucket = keyof typeof bucketMeta;

export function GovernanceWorkflowDashboard() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [activeBucket, setActiveBucket] = useState<Bucket | "all">("all");
  const stages = buildWorkflowStages(state);
  const principalStage = requestStageLabel(state);

  const principalBucket: Bucket =
    state.requestStatus === "approved"
      ? "publication"
      : state.requestStatus === "committee-review"
        ? "committee"
        : state.requestStatus === "returned"
          ? "returned"
          : "scrutiny";

  const allRequests = useMemo(
    () => [
      {
        id: "CR-2026-014",
        university: "Sahya Higher Studies University",
        event: "Semester 1 Theory Examination",
        originalDate: "05 Dec 2026",
        proposedDate: "12 Dec 2026",
        variance: "+7 days",
        impact: "18 colleges · 11,460 students",
        stage: principalStage,
        submitted:
          state.requestStatus === "draft" ? "Not submitted" : "26 Jul 2026",
        priority: "Critical",
        bucket: principalBucket,
      },
      ...relatedWorkflowRequests,
    ],
    [principalBucket, principalStage, state.requestStatus],
  );

  const visibleRequests = allRequests.filter((request) => {
    const matchesBucket =
      activeBucket === "all" || request.bucket === activeBucket;
    const matchesQuery = `${request.id} ${request.university} ${request.event}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesBucket && matchesQuery;
  });

  const bucketCounts = (bucket: Bucket) =>
    allRequests.filter((request) => request.bucket === bucket).length;

  return (
    <div className="gov-page">
      <header className="gov-page-header">
        <div>
          <p className="gov-kicker">Academic calendar change governance</p>
          <h1>Controlled change workflow</h1>
          <p>
            Every proposed date moves through accountable review, decision and
            publication. The locked Version 1.0 baseline remains visible throughout.
          </p>
        </div>
        <div className="gov-header-state">
          <span><ShieldCheck size={17} /> Official baseline protected</span>
          <strong>Version {state.masterCalendarVersion}</strong>
          <small>{state.revisionPublicationState === "published" ? "Published and locked" : "No unpublished change is public"}</small>
        </div>
      </header>

      <section className="gov-workload-rail" aria-label="Workflow queues">
        {(Object.keys(bucketMeta) as Bucket[]).map((bucket) => {
          const item = bucketMeta[bucket];
          const Icon = item.Icon;
          return (
            <button
              key={bucket}
              className={activeBucket === bucket ? "active" : ""}
              onClick={() =>
                setActiveBucket((current) => (current === bucket ? "all" : bucket))
              }
            >
              <span><Icon size={18} /></span>
              <div><small>{item.helper}</small><strong>{item.title}</strong></div>
              <b>{bucketCounts(bucket)}</b>
            </button>
          );
        })}
      </section>

      <section className="gov-principal-request">
        <div className="gov-principal-copy">
          <div className="gov-principal-top">
            <span className="gov-priority critical">
              <AlertTriangle size={14} /> Principal demonstration request
            </span>
            <span className={`gov-stage-chip stage-${state.requestStatus}`}>
              <Clock3 size={14} /> {principalStage}
            </span>
          </div>
          <p>CR-2026-014 · Sahya Higher Studies University</p>
          <h2>Semester 1 Theory Examination</h2>
          <p className="gov-principal-reason">
            Severe monsoon disruption affected scheduled academic activities
            across 18 affiliated colleges.
          </p>
          <div className="gov-date-delta">
            <span><small>Current approved date</small><strong>05 Dec 2026</strong></span>
            <ArrowRight size={20} />
            <span><small>Proposed revision</small><strong>12 Dec 2026</strong></span>
            <b>+7 days</b>
          </div>
        </div>
        <div className="gov-principal-action">
          <dl>
            <div><dt>Affected scope</dt><dd>18 colleges</dd></div>
            <div><dt>Estimated students</dt><dd>11,460</dd></div>
            <div><dt>Submitted</dt><dd>{state.requestStatus === "draft" ? "Awaiting university" : "26 Jul 2026"}</dd></div>
          </dl>
          <Link href="/workflow/requests/CR-2026-014" className="button button-primary">
            Open governance record <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="gov-lifecycle-panel">
        <div className="gov-section-heading">
          <div><p>End-to-end evidence</p><h2>CR-2026-014 lifecycle</h2></div>
          <span><FileClock size={15} /> {stages.filter((stage) => stage.state === "complete").length} of 9 stages complete</span>
        </div>
        <WorkflowStepTracker stages={stages} compact />
      </section>

      <section className="gov-queue-panel">
        <div className="gov-queue-toolbar">
          <div>
            <p>All controlled requests</p>
            <h2>Governance queue</h2>
          </div>
          <label>
            <span className="sr-only">Search workflow requests</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search request, university or event"
            />
          </label>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Workflow register prepared",
                "A demonstration governance queue extract is ready.",
              )
            }
          >
            Export queue
          </button>
        </div>
        <div className="gov-request-table-wrap">
          <table className="gov-request-table">
            <thead>
              <tr>
                <th>Request / University</th>
                <th>Event</th>
                <th>Dates</th>
                <th>Variance</th>
                <th>Impact</th>
                <th>Current stage</th>
                <th>Submitted</th>
                <th>Priority</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.id}</strong><span>{request.university}</span></td>
                  <td>{request.event}</td>
                  <td><small>{request.originalDate}</small><ArrowRight size={12} /><strong>{request.proposedDate}</strong></td>
                  <td><span className="gov-variance">{request.variance}</span></td>
                  <td>{request.impact}</td>
                  <td><span className="gov-stage-chip"><Clock3 size={12} /> {request.stage}</span></td>
                  <td>{request.submitted}</td>
                  <td>
                    <span className={`gov-priority ${request.priority.toLowerCase()}`}>
                      {request.priority === "Critical" ? <AlertTriangle size={12} /> : <Clock3 size={12} />}
                      {request.priority}
                    </span>
                  </td>
                  <td>
                    {request.id === "CR-2026-014" ? (
                      <Link href="/workflow/requests/CR-2026-014" aria-label="Open CR-2026-014"><ArrowRight size={16} /></Link>
                    ) : (
                      <button
                        aria-label={`Open ${request.id}`}
                        onClick={() =>
                          state.toast(
                            `${request.id} opened`,
                            "This supporting request remains illustrative and read-only.",
                          )
                        }
                      >
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!visibleRequests.length ? (
          <div className="gov-empty-queue">
            <Inbox size={22} />
            <strong>No requests match this view</strong>
            <button onClick={() => { setQuery(""); setActiveBucket("all"); }}>Clear filters</button>
          </div>
        ) : null}
      </section>

      <section className="gov-recent-decisions">
        <div className="gov-section-heading">
          <div><p>Decision record</p><h2>Recent decisions</h2></div>
          <Link href="/workflow/decisions">View decision register <ArrowRight size={14} /></Link>
        </div>
        <div>
          <article>
            <span className="green"><CheckCircle2 size={16} /></span>
            <div><strong>CR-2026-006 · Approved with conditions</strong><p>Ananthapuri University · Practical Examination</p></div>
            <time>25 Jul 2026</time>
          </article>
          <article>
            <span className="amber"><RotateCcw size={16} /></span>
            <div><strong>CR-2026-003 · Returned for clarification</strong><p>Periyar Valley University · Classes Commence</p></div>
            <time>23 Jul 2026</time>
          </article>
          <article>
            <span className="red"><Send size={16} /></span>
            <div><strong>CR-2026-002 · Rejected</strong><p>Kuttanad Knowledge University · Result Publication</p></div>
            <time>21 Jul 2026</time>
          </article>
        </div>
      </section>
    </div>
  );
}
