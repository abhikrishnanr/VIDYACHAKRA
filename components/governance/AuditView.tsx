"use client";

import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileClock,
  Fingerprint,
  History,
  LockKeyhole,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import { baseWorkflowAudit } from "@/lib/workflow-data";
import type { DemoAuditRecord } from "@/lib/types";

export function AuditView() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DemoAuditRecord | null>(null);

  const entries = useMemo(
    () => [...state.demoAuditEntries, ...baseWorkflowAudit],
    [state.demoAuditEntries],
  );
  const roles = Array.from(
    new Set(entries.map((entry) => entry.actorRole ?? "Recorded actor")),
  );
  const results = entries.filter((entry) => {
    const matchesQuery =
      `${entry.action} ${entry.actor} ${entry.actorRole} ${entry.scope} ${entry.detail} ${entry.reference}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesRole = role === "all" || entry.actorRole === role;
    return matchesQuery && matchesRole;
  });

  return (
    <div className="gov-page gov-audit-page">
      <header className="gov-page-header">
        <div>
          <p className="gov-kicker">Immutable governance history · FYUGP 2026–27</p>
          <h1>Academic calendar audit trail</h1>
          <p>
            Every submission, recommendation, decision and publication retains its
            actor, previous value, new value, authority and workflow stage.
          </p>
        </div>
        <div className="gov-header-actions">
          <button className="button button-secondary" onClick={() => setComparisonOpen(true)}>
            <History size={16} /> Compare Versions
          </button>
          <button
            className="button button-primary"
            onClick={() =>
              state.toast(
                "Audit extract prepared",
                "A signed demonstration audit extract is ready.",
              )
            }
          >
            <Download size={16} /> Export immutable record
          </button>
        </div>
      </header>

      <section className="gov-audit-assurance">
        <span><ShieldCheck size={23} /></span>
        <div>
          <p>Append-only demonstration record</p>
          <strong>Old calendar values remain visible after every revision</strong>
          <small>Record chain VC-2627-014 · {entries.length} verified events · Local device state</small>
        </div>
        <div className="gov-audit-version">
          <small>Current official version</small>
          <strong>{state.masterCalendarVersion}</strong>
          <span><LockKeyhole size={12} /> {state.revisionPublicationState === "published" ? "Published and locked" : "Version 1.0 active"}</span>
        </div>
      </section>

      <section className="gov-audit-ledger">
        <div className="gov-audit-toolbar">
          <label className="gov-audit-search">
            <Search size={16} />
            <span className="sr-only">Search audit events</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search action, actor or reference" />
          </label>
          <label>
            <span className="sr-only">Filter by role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="all">All roles</option>
              {roles.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <span>{results.length} retained events</span>
        </div>

        <div className="gov-audit-table-wrap">
          <table className="gov-audit-table">
            <thead>
              <tr>
                <th>Date and time</th>
                <th>Actor / Role</th>
                <th>Action</th>
                <th>Previous value</th>
                <th>New value</th>
                <th>Workflow stage</th>
                <th>Reference</th>
                <th><span className="sr-only">Integrity</span></th>
              </tr>
            </thead>
            <tbody>
              {results.map((entry) => (
                <tr key={entry.id}>
                  <td><FileClock size={14} /><time>{entry.timestamp}</time></td>
                  <td><strong>{entry.actor}</strong><small>{entry.actorRole ?? "Recorded actor"}</small></td>
                  <td><strong>{entry.action}</strong><small>{entry.detail}</small></td>
                  <td><span className="gov-old-value">{entry.previousValue ?? "No value change"}</span></td>
                  <td><span className="gov-new-value">{entry.newValue ?? "Evidence record appended"}</span></td>
                  <td>{entry.workflowStage ?? "Supporting Evidence"}</td>
                  <td><code>{entry.reference ?? entry.scope}</code></td>
                  <td>
                    <button aria-label={`Inspect integrity for ${entry.action}`} onClick={() => setSelectedEntry(entry)}>
                      <Fingerprint size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!results.length ? (
          <div className="gov-empty-queue">
            <Search size={22} />
            <strong>No audit events match these filters</strong>
            <button onClick={() => { setQuery(""); setRole("all"); }}>Clear filters</button>
          </div>
        ) : null}
      </section>

      <section className="gov-audit-principle">
        <LockKeyhole size={18} />
        <div><strong>No deletion or in-place replacement</strong><p>Calendar Version 1.1, when published, is appended beside Version 1.0. The original date and authority reference remain readable.</p></div>
      </section>

      {comparisonOpen ? (
        <div className="gov-drawer-backdrop" onMouseDown={() => setComparisonOpen(false)}>
          <aside className="gov-version-drawer" role="dialog" aria-modal="true" aria-labelledby="version-comparison-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><p className="gov-kicker">Retained version history</p><h2 id="version-comparison-title">Version 1.0 and 1.1</h2></div>
              <button aria-label="Close version comparison" onClick={() => setComparisonOpen(false)}><X size={18} /></button>
            </header>
            <div className="gov-version-lineage">
              <article>
                <span><LockKeyhole size={17} /></span>
                <div><small>Original official baseline</small><h3>Version 1.0</h3><p>Published 15 June 2026 · Remains retained</p></div>
                <b>Active history</b>
              </article>
              <ArrowRight size={19} />
              <article className={state.revisionPublicationState === "published" ? "published" : ""}>
                <span>{state.revisionPublicationState === "published" ? <CheckCircle2 size={17} /> : <FileClock size={17} />}</span>
                <div><small>Approved revision</small><h3>Version 1.1</h3><p>{state.revisionPublicationState === "published" ? "Published 02 August 2026" : "Not yet published"}</p></div>
                <b>{state.revisionPublicationState === "published" ? "Official" : "Pending"}</b>
              </article>
            </div>
            <div className="gov-version-diff">
              <header><span>Field</span><strong>Version 1.0</strong><strong>Version 1.1</strong></header>
              <div><span>Event</span><strong>Semester 1 Theory Examination</strong><strong>Semester 1 Theory Examination</strong></div>
              <div><span>Date</span><strong className="old">05 Dec 2026</strong><strong className="new">12 Dec 2026</strong></div>
              <div><span>Scope</span><strong>Statewide baseline</strong><strong>Sahya · 18 colleges only</strong></div>
              <div><span>Authority</span><strong>KSHEC/ACAD/CAL/2026/01</strong><strong>KSHEC/ACAD/CAL/2026/01-R1</strong></div>
              <div><span>Status</span><strong>Retained official history</strong><strong>{state.revisionPublicationState === "published" ? "Published exception" : "Not yet official"}</strong></div>
            </div>
            <div className="gov-drawer-note">
              <ShieldCheck size={17} />
              <p>The revised value does not erase the original. Both records remain attributable to their respective authority and publication dates.</p>
            </div>
          </aside>
        </div>
      ) : null}

      {selectedEntry ? (
        <div className="gov-drawer-backdrop" onMouseDown={() => setSelectedEntry(null)}>
          <aside className="gov-integrity-drawer" role="dialog" aria-modal="true" aria-labelledby="integrity-title" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div><p className="gov-kicker">Record integrity</p><h2 id="integrity-title">{selectedEntry.action}</h2></div>
              <button aria-label="Close integrity detail" onClick={() => setSelectedEntry(null)}><X size={18} /></button>
            </header>
            <span className="gov-integrity-mark"><Fingerprint size={27} /></span>
            <dl>
              <div><dt>Actor</dt><dd>{selectedEntry.actor}</dd></div>
              <div><dt>Role</dt><dd>{selectedEntry.actorRole ?? "Recorded actor"}</dd></div>
              <div><dt>Date and time</dt><dd>{selectedEntry.timestamp}</dd></div>
              <div><dt>Workflow stage</dt><dd>{selectedEntry.workflowStage ?? "Supporting Evidence"}</dd></div>
              <div><dt>Reference</dt><dd>{selectedEntry.reference ?? selectedEntry.scope}</dd></div>
              <div><dt>Record state</dt><dd><LockKeyhole size={13} /> Retained · Read only</dd></div>
            </dl>
            <div><strong>Recorded detail</strong><p>{selectedEntry.detail}</p></div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
