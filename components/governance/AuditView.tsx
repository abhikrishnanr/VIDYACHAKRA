"use client";

import { Download, FileClock, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { auditEntries } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

export function AuditView() {
  const [query, setQuery] = useState("");
  const { toast } = useDemoState();
  const results = useMemo(
    () =>
      auditEntries.filter((entry) =>
        `${entry.action} ${entry.actor} ${entry.scope} ${entry.detail}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <>
      <PageHeader
        eyebrow="Governance record · Academic year 2026–27"
        title="Audit trail"
        description="A chronological record of calendar publications, institutional submissions, review decisions and material revisions."
        actions={
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "Audit extract prepared",
                "A demonstration audit extract has been prepared.",
              )
            }
          >
            <Download size={16} /> Export record
          </button>
        }
      />

      <section className="audit-assurance">
        <span className="section-icon">
          <ShieldCheck size={21} />
        </span>
        <div>
          <strong>Complete record for calendar version 1.0</strong>
          <p>
            Each entry identifies who acted, what changed, the affected scope and when
            the action was recorded.
          </p>
        </div>
        <span className="audit-hash">VC-2627-014</span>
      </section>

      <section className="audit-panel">
        <div className="audit-toolbar">
          <div className="search-field">
            <Search size={17} />
            <label className="sr-only" htmlFor="audit-search">
              Search the audit trail
            </label>
            <input
              id="audit-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions, institutions or people"
            />
          </div>
          <span>{results.length} recorded actions</span>
        </div>
        {results.length ? (
          <div className="audit-timeline">
            {results.map((entry) => (
              <article className="audit-entry" key={entry.id}>
                <span className="audit-marker">
                  <FileClock size={17} />
                </span>
                <div className="audit-time">
                  <strong>{entry.timestamp.split(" · ")[0]}</strong>
                  <span>{entry.timestamp.split(" · ")[1]}</span>
                </div>
                <div className="audit-copy">
                  <h2>{entry.action}</h2>
                  <p>{entry.detail}</p>
                  <div>
                    <span>{entry.actor}</span>
                    <span>{entry.scope}</span>
                  </div>
                </div>
                <button
                  className="row-action"
                  onClick={() =>
                    toast(
                      "Audit entry opened",
                      `Reference ${entry.id.toUpperCase()} is shown in demonstration mode.`,
                    )
                  }
                >
                  View detail
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No audit actions match your search"
            onReset={() => setQuery("")}
          />
        )}
      </section>
    </>
  );
}
