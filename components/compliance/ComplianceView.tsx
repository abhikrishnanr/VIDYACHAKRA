"use client";

import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileClock,
  Filter,
  Grid3X3,
  Search,
  University,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildMatrixCells,
  matrixMilestones,
  type MatrixCategory,
  type MatrixCell,
  type MatrixStatus,
} from "@/lib/compliance-matrix-data";
import { institutions } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

type MatrixFocus = "all" | "attention" | "red";
type MatrixView = "university" | "college";
type SemesterFilter = "all" | "Semester 1" | "Semester 3";

const statusMeta = {
  green: { label: "Green", Icon: CheckCircle2 },
  amber: { label: "Amber", Icon: AlertTriangle },
  red: { label: "Red", Icon: XCircle },
  grey: { label: "Grey", Icon: Clock3 },
};

export function ComplianceView() {
  const {
    requestStatus,
    committeeDecision,
    revisionPublicationState,
    toast,
  } = useDemoState();
  const [query, setQuery] = useState("");
  const [semester, setSemester] = useState<SemesterFilter>("Semester 1");
  const [category, setCategory] = useState<"all" | MatrixCategory>("all");
  const [focus, setFocus] = useState<MatrixFocus>("all");
  const [view, setView] = useState<MatrixView>("university");
  const [selectedCell, setSelectedCell] = useState<MatrixCell | null>(null);

  const cells = useMemo(
    () =>
      buildMatrixCells({
        requestStatus,
        committeeDecision,
        revisionPublicationState,
      }),
    [committeeDecision, requestStatus, revisionPublicationState],
  );

  const visibleMilestones = matrixMilestones.filter(
    (milestone) =>
      (semester === "all" || milestone.semesters.includes(semester)) &&
      (category === "all" || milestone.category === category),
  );

  const universityRows = institutions.map((institution) => ({
    id: institution.id,
    universityId: institution.id,
    name: institution.name,
    secondary: `${institution.region} Kerala · ${institution.colleges.length} sample colleges`,
    kind: "university" as const,
  }));
  const collegeRows = institutions.flatMap((institution) =>
    institution.colleges.map((college, index) => ({
      id: `${institution.id}-college-${index}`,
      universityId: institution.id,
      name: college,
      secondary: institution.name,
      kind: "college" as const,
    })),
  );
  const baseRows = view === "university" ? universityRows : collegeRows;
  const rows = baseRows.filter((row) => {
    const matchesSearch = `${row.name} ${row.secondary}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const rowCells = cells.filter(
      (cell) =>
        cell.universityId === row.universityId &&
        visibleMilestones.some((milestone) => milestone.id === cell.milestoneId),
    );
    const matchesFocus =
      focus === "all" ||
      (focus === "attention" &&
        rowCells.some((cell) => cell.status === "amber" || cell.status === "red")) ||
      (focus === "red" && rowCells.some((cell) => cell.status === "red"));
    return matchesSearch && matchesFocus;
  });

  const visibleCells = cells.filter((cell) =>
    visibleMilestones.some((milestone) => milestone.id === cell.milestoneId),
  );
  const counts = {
    green: visibleCells.filter((cell) => cell.status === "green").length,
    amber: visibleCells.filter((cell) => cell.status === "amber").length,
    red: visibleCells.filter((cell) => cell.status === "red").length,
    grey: visibleCells.filter((cell) => cell.status === "grey").length,
  };

  return (
    <>
      <header className="matrix-page-header">
        <div>
          <p>HEC Academic Monitoring · FYUGP 2026–27</p>
          <h1>Statewide Compliance Matrix</h1>
          <span>
            Compare every governed milestone across Kerala&apos;s participating
            universities without losing critical exceptions in the averages.
          </span>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() =>
            toast(
              "Matrix export prepared",
              `${rows.length} ${view === "university" ? "universities" : "colleges"} and ${visibleMilestones.length} milestones are ready for export.`,
            )
          }
        >
          <Download size={16} /> Export Matrix
        </button>
      </header>

      <section className="matrix-explanation">
        <div>
          <Grid3X3 size={19} />
          <span>
            <strong>One-glance alignment</strong>
            Select any status cell for dates, evidence, authority and workflow context.
          </span>
        </div>
        <div className="matrix-counts">
          {(Object.keys(statusMeta) as MatrixStatus[]).map((status) => {
            const { Icon, label } = statusMeta[status];
            return (
              <span className={status} key={status}>
                <Icon size={13} />
                <b>{counts[status]}</b>
                {label}
              </span>
            );
          })}
        </div>
      </section>

      <section className="matrix-toolbar">
        <div className="matrix-search">
          <Search size={17} />
          <label className="sr-only" htmlFor="matrix-search">
            Search institutions
          </label>
          <input
            id="matrix-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={view === "university" ? "Search universities" : "Search colleges or parent universities"}
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={15} />
            </button>
          ) : null}
        </div>
        <label>
          <span>Semester</span>
          <select value={semester} onChange={(event) => setSemester(event.target.value as SemesterFilter)}>
            <option value="all">All semesters</option>
            <option>Semester 1</option>
            <option>Semester 3</option>
          </select>
        </label>
        <label>
          <span>Event category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as "all" | MatrixCategory)}>
            <option value="all">All categories</option>
            <option>Academic</option>
            <option>Registration</option>
            <option>Assessment</option>
            <option>Examination</option>
            <option>Valuation</option>
            <option>Results</option>
          </select>
        </label>
        <div className="matrix-view-toggle" aria-label="Matrix row view">
          <button type="button" className={view === "university" ? "active" : ""} onClick={() => setView("university")}>
            <University size={15} /> University View
          </button>
          <button type="button" className={view === "college" ? "active" : ""} onClick={() => setView("college")}>
            <Building2 size={15} /> College View
          </button>
        </div>
      </section>

      <div className="matrix-focus-tabs" aria-label="Status focus">
        <button type="button" className={focus === "all" ? "active" : ""} onClick={() => setFocus("all")}>
          Show All
        </button>
        <button type="button" className={focus === "attention" ? "active amber" : "amber"} onClick={() => setFocus("attention")}>
          <AlertTriangle size={13} /> Show Amber and Red
        </button>
        <button type="button" className={focus === "red" ? "active red" : "red"} onClick={() => setFocus("red")}>
          <XCircle size={13} /> Show Red Only
        </button>
        <span><Filter size={13} /> {rows.length} rows · {visibleMilestones.length} milestones</span>
      </div>

      <section className="matrix-frame" aria-label="University milestone compliance matrix">
        {rows.length ? (
          <div className="matrix-scroll">
            <table className="compliance-matrix">
              <thead>
                <tr>
                  <th className="matrix-sticky-column">
                    {view === "university" ? "University" : "Affiliated college"}
                  </th>
                  {visibleMilestones.map((milestone) => (
                    <th key={milestone.id}>
                      <span>{milestone.category}</span>
                      <strong>{milestone.shortLabel}</strong>
                      <small>{format(parseISO(milestone.councilDate), "dd MMM")}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <th className="matrix-sticky-column">
                      <Link href={`/hec/institutions/${row.universityId}`}>
                        <span className="matrix-row-icon">
                          {row.kind === "university" ? <University size={15} /> : <Building2 size={15} />}
                        </span>
                        <span>
                          <strong>{row.name}</strong>
                          <small>{row.secondary}</small>
                        </span>
                        <ChevronRight size={14} />
                      </Link>
                    </th>
                    {visibleMilestones.map((milestone) => {
                      const cell = cells.find(
                        (item) =>
                          item.universityId === row.universityId &&
                          item.milestoneId === milestone.id,
                      )!;
                      return (
                        <td key={milestone.id}>
                          <MatrixCellButton cell={cell} onOpen={setSelectedCell} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="matrix-empty">
            <Search size={24} />
            <h2>No institutions match this view.</h2>
            <p>Clear the search or widen the status focus.</p>
            <button type="button" onClick={() => { setQuery(""); setFocus("all"); }}>Reset filters</button>
          </div>
        )}
        <footer>
          <span>Headers and institution names remain visible while the matrix scrolls.</span>
          <span className="matrix-scroll-hint"><ArrowRight size={14} /> Scroll horizontally for all milestones</span>
        </footer>
      </section>

      <section className="matrix-definitions">
        <h2>Compliance status definitions</h2>
        <div>
          <p className="green"><CheckCircle2 size={15} /><span><strong>Green · Aligned</strong>Approved calendar date or a published exception.</span></p>
          <p className="amber"><AlertTriangle size={15} /><span><strong>Amber · Attention</strong>Confirmation, evidence or workflow decision pending.</span></p>
          <p className="red"><XCircle size={15} /><span><strong>Red · Deviation</strong>Unauthorised, overdue, rejected or uncorrected.</span></p>
          <p className="grey"><Clock3 size={15} /><span><strong>Grey · Not applicable</strong>The milestone does not apply to this calendar.</span></p>
        </div>
      </section>

      {selectedCell ? (
        <CellDetailDrawer cell={selectedCell} onClose={() => setSelectedCell(null)} />
      ) : null}
    </>
  );
}

function MatrixCellButton({
  cell,
  onOpen,
}: {
  cell: MatrixCell;
  onOpen: (cell: MatrixCell) => void;
}) {
  const { Icon } = statusMeta[cell.status];
  return (
    <button
      type="button"
      className={`matrix-cell-button ${cell.status}`}
      onClick={() => onOpen(cell)}
      aria-label={`${cell.statusLabel}, ${cell.variance}`}
    >
      <span className="matrix-cell-status"><Icon size={15} /><strong>{cell.statusLabel}</strong></span>
      <small>{cell.variance}</small>
      {cell.requestId ? <em><FileClock size={10} /> {cell.requestId}</em> : null}
    </button>
  );
}

function CellDetailDrawer({
  cell,
  onClose,
}: {
  cell: MatrixCell;
  onClose: () => void;
}) {
  const institution = institutions.find((item) => item.id === cell.universityId)!;
  const milestone = matrixMilestones.find((item) => item.id === cell.milestoneId)!;
  const { Icon, label } = statusMeta[cell.status];
  const date = (value: string | null) =>
    value ? format(parseISO(value), "dd MMMM yyyy") : "Not reported";

  return (
    <div className="matrix-drawer-layer">
      <button type="button" className="matrix-drawer-backdrop" aria-label="Close cell details" onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-labelledby="matrix-drawer-title">
        <header>
          <div>
            <p>{institution.name}</p>
            <h2 id="matrix-drawer-title">{milestone.label}</h2>
          </div>
          <button type="button" aria-label="Close cell details" onClick={onClose}><X size={20} /></button>
        </header>
        <div className={`matrix-drawer-status ${cell.status}`}>
          <Icon size={22} />
          <div><strong>{label} · {cell.statusLabel}</strong><span>{cell.reason}</span></div>
        </div>
        <dl>
          <div><dt>Council baseline date</dt><dd>{date(cell.councilDate)}</dd></div>
          <div><dt>Institution scheduled date</dt><dd>{date(cell.scheduledDate)}</dd></div>
          <div><dt>Actual completion date</dt><dd>{date(cell.actualCompletionDate)}</dd></div>
          <div><dt>Date variance</dt><dd>{cell.variance}</dd></div>
          <div><dt>Compliance status</dt><dd>{label} · {cell.statusLabel}</dd></div>
          <div><dt>Change request status</dt><dd>{cell.requestId ? `${cell.requestId} · ${cell.requestStatus.replace("-", " ")}` : "No request"}</dd></div>
          <div><dt>Affected college count</dt><dd>{cell.affectedCollegeCount}</dd></div>
          <div><dt>Evidence status</dt><dd>{cell.evidenceStatus}</dd></div>
          <div className="wide"><dt>Authority reference</dt><dd>{cell.authorityReference}</dd></div>
        </dl>
        <section>
          <h3>Monitoring reason</h3>
          <p>{cell.reason}</p>
        </section>
        <div className="matrix-drawer-actions">
          <Link href={`/hec/institutions/${institution.id}`} className="button button-secondary">
            View Institution <ChevronRight size={15} />
          </Link>
          {cell.requestId ? (
            <Link href={`/workflow/agenda?request=${cell.requestId}`} className="button button-primary">
              Open Change Request <ArrowRight size={15} />
            </Link>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
