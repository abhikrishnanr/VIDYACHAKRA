"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  BookOpenCheck,
  CalendarCheck2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Download,
  FileClock,
  FileText,
  History,
  Landmark,
  LockKeyhole,
  MapPinned,
  MessageSquareWarning,
  ShieldCheck,
  SlidersHorizontal,
  University,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { institutions } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

type PulseStatus = "aligned" | "attention" | "deviation";
type PulseDistribution = Record<PulseStatus, number>;
type PulseMilestone = {
  id: string;
  shortLabel: string;
  label: string;
  date: string;
  semester1: PulseDistribution;
  semester3: PulseDistribution;
  institutions: Array<{
    name: string;
    status: PulseStatus;
    note: string;
  }>;
};

const pulseMilestones: PulseMilestone[] = [
  {
    id: "admission",
    shortLabel: "Admission",
    label: "Admission cycle",
    date: "22 Jun – 24 Jul",
    semester1: { aligned: 6, attention: 0, deviation: 0 },
    semester3: { aligned: 6, attention: 0, deviation: 0 },
    institutions: institutions.map((item) => ({
      name: item.name,
      status: "aligned",
      note: "Admission return confirmed",
    })),
  },
  {
    id: "classes",
    shortLabel: "Classes",
    label: "Classes commence",
    date: "03 Aug",
    semester1: { aligned: 5, attention: 1, deviation: 0 },
    semester3: { aligned: 6, attention: 0, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 3 ? "attention" : "aligned",
      note: index === 3 ? "Timetable confirmation due" : "Readiness confirmed",
    })),
  },
  {
    id: "internal-1",
    shortLabel: "Internal 1",
    label: "Internal Assessment 1",
    date: "21 Sep",
    semester1: { aligned: 5, attention: 1, deviation: 0 },
    semester3: { aligned: 4, attention: 2, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 5 ? "attention" : "aligned",
      note: index === 5 ? "Assessment plan awaited" : "Window adopted",
    })),
  },
  {
    id: "internal-2",
    shortLabel: "Internal 2",
    label: "Internal Assessment 2",
    date: "19 Oct",
    semester1: { aligned: 5, attention: 1, deviation: 0 },
    semester3: { aligned: 4, attention: 2, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 2 || index === 5 ? "attention" : "aligned",
      note: index === 2 || index === 5 ? "Local window under review" : "Window adopted",
    })),
  },
  {
    id: "last-working-day",
    shortLabel: "Last Day",
    label: "Last Working Day",
    date: "13 Nov",
    semester1: { aligned: 5, attention: 1, deviation: 0 },
    semester3: { aligned: 5, attention: 1, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 5 ? "attention" : "aligned",
      note: index === 5 ? "Teaching-day evidence pending" : "Date confirmed",
    })),
  },
  {
    id: "practicals",
    shortLabel: "Practicals",
    label: "Practical Examinations",
    date: "25 Nov",
    semester1: { aligned: 5, attention: 1, deviation: 0 },
    semester3: { aligned: 4, attention: 2, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 2 || index === 3 ? "attention" : "aligned",
      note: index === 2 || index === 3 ? "Laboratory schedule awaited" : "Schedule confirmed",
    })),
  },
  {
    id: "theory",
    shortLabel: "Theory",
    label: "Theory Examinations",
    date: "05 Dec",
    semester1: { aligned: 4, attention: 1, deviation: 1 },
    semester3: { aligned: 5, attention: 1, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 0 ? "deviation" : index === 5 ? "attention" : "aligned",
      note:
        index === 0
          ? "+7 days · CR-2026-014 draft"
          : index === 5
            ? "Confirmation awaiting syndicate"
            : "Council date adopted",
    })),
  },
  {
    id: "valuation",
    shortLabel: "Valuation",
    label: "Centralised Valuation",
    date: "19 Dec",
    semester1: { aligned: 4, attention: 2, deviation: 0 },
    semester3: { aligned: 5, attention: 1, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 0 || index === 5 ? "attention" : "aligned",
      note: index === 0 ? "Depends on theory decision" : index === 5 ? "Examiner list due" : "Plan confirmed",
    })),
  },
  {
    id: "results",
    shortLabel: "Results",
    label: "Result Publication",
    date: "20 Jan",
    semester1: { aligned: 3, attention: 3, deviation: 0 },
    semester3: { aligned: 4, attention: 2, deviation: 0 },
    institutions: institutions.map((item, index) => ({
      name: item.name,
      status: index === 0 || index === 3 || index === 5 ? "attention" : "aligned",
      note: index === 0 ? "Projection depends on CR-2026-014" : index === 3 || index === 5 ? "Readiness note due" : "Result plan confirmed",
    })),
  },
];

const statusMeta = {
  aligned: { label: "Aligned", Icon: CheckCircle2 },
  attention: { label: "Needs attention", Icon: AlertTriangle },
  deviation: { label: "Confirmed deviation", Icon: XCircle },
};

export function HECCommandCentre() {
  const {
    academicYear,
    selectedProgramme,
    selectedSemester,
    requestStatus,
    masterCalendarVersion,
    revisionPublicationState,
    setAcademicYear,
    setSelectedProgramme,
    setSelectedSemester,
    toast,
  } = useDemoState();
  const [selectedMilestoneId, setSelectedMilestoneId] = useState("theory");
  const [deviationOpen, setDeviationOpen] = useState(false);
  const revisionPublished = revisionPublicationState === "published";
  const requestUnderReview = requestStatus !== "draft";

  const effectivePulseMilestones = useMemo(
    () =>
      pulseMilestones.map((milestone) => {
        if (milestone.id !== "theory") return milestone;
        const sahyaStatus: PulseStatus = revisionPublished
          ? "aligned"
          : requestUnderReview
            ? "attention"
            : "deviation";
        return {
          ...milestone,
          semester1: revisionPublished
            ? { aligned: 5, attention: 1, deviation: 0 }
            : requestUnderReview
              ? { aligned: 4, attention: 2, deviation: 0 }
              : milestone.semester1,
          institutions: milestone.institutions.map((institution) =>
            institution.name === "Sahya Higher Studies University"
              ? {
                  ...institution,
                  status: sahyaStatus,
                  note: revisionPublished
                    ? "Approved exception published · 12 Dec"
                    : requestUnderReview
                      ? `CR-2026-014 · ${requestStatus.replace("-", " ")}`
                      : "+7 days · CR-2026-014 draft",
                }
              : institution,
          ),
        };
      }),
    [requestStatus, requestUnderReview, revisionPublished],
  );
  const selectedMilestone =
    effectivePulseMilestones.find(
      (milestone) => milestone.id === selectedMilestoneId,
    ) ?? effectivePulseMilestones[6];
  const distributionKey =
    selectedSemester === "Semester 1" ? "semester1" : "semester3";
  const summary =
    selectedSemester === "Semester 1"
      ? revisionPublished
        ? { aligned: 5, attention: 1, deviations: 0, requests: 1 }
        : requestUnderReview
          ? { aligned: 4, attention: 2, deviations: 0, requests: 2 }
          : { aligned: 4, attention: 1, deviations: 1, requests: 2 }
      : { aligned: 5, attention: 1, deviations: 0, requests: 1 };

  const visibleInstitutions = useMemo(
    () =>
      selectedMilestone.institutions.filter(
        (institution) =>
          selectedSemester === "Semester 1" || institution.status !== "deviation",
      ),
    [selectedMilestone, selectedSemester],
  );

  return (
    <>
      <header className="command-header">
        <div className="command-heading">
          <p>HEC Academic Monitoring · Statewide Control View</p>
          <h1>Academic Calendar Command Centre</h1>
          <span>Statewide monitoring of FYUGP academic and examination milestones</span>
        </div>
        <div className="command-header-actions">
          <span className="command-sync">
            <CircleDot size={13} />
            Last synchronised <strong>26 Jul · 17:42</strong>
          </span>
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              toast(
                "Monitoring brief prepared",
                `${selectedSemester} alignment data has been prepared for export.`,
              )
            }
          >
            <Download size={16} /> Export Brief
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              toast(
                "Institution notice queued",
                "A readiness reminder has been prepared for the three institutions requiring follow-up.",
              )
            }
          >
            <BellRing size={16} /> Notify Institutions
          </button>
        </div>
        <div className="command-filters" aria-label="Command Centre filters">
          <label>
            <span>Academic year</span>
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value as typeof academicYear)}
            >
              <option>2026–27</option>
            </select>
          </label>
          <label>
            <span>Programme</span>
            <select
              value={selectedProgramme}
              onChange={(event) =>
                setSelectedProgramme(event.target.value as typeof selectedProgramme)
              }
            >
              <option>Four Year Undergraduate Programme (FYUGP)</option>
            </select>
          </label>
          <label>
            <span>Semester</span>
            <select
              value={selectedSemester}
              onChange={(event) =>
                setSelectedSemester(event.target.value as typeof selectedSemester)
              }
            >
              <option>Semester 1</option>
              <option>Semester 3</option>
            </select>
          </label>
          <span className="command-filter-note">
            <SlidersHorizontal size={14} />
            Filters update the statewide pulse
          </span>
        </div>
      </header>

      <section className="publication-lock-banner">
        <div className="publication-lock-icon">
          <LockKeyhole size={25} />
        </div>
        <div className="publication-lock-title">
          <p>Governing academic baseline</p>
          <h2>FYUGP Academic Calendar 2026–27</h2>
          <span><ShieldCheck size={14} /> Published and Locked</span>
        </div>
        <div className="publication-lock-version">
          <small>VERSION</small>
          <strong>{masterCalendarVersion}</strong>
        </div>
        <dl>
          <div>
            <dt>Publication date</dt>
            <dd>{revisionPublished ? "02 August 2026" : "15 June 2026"}</dd>
          </div>
          <div>
            <dt>Authority reference</dt>
            <dd>
              {revisionPublished
                ? "KSHEC/ACAD/CAL/2026/01-R1"
                : "KSHEC/ACAD/CAL/2026/01"}
            </dd>
          </div>
          <div>
            <dt>Governed milestones</dt>
            <dd>18 statewide milestones</dd>
          </div>
        </dl>
        <Link href="/hec/versions">
          <History size={15} /> View Version History
        </Link>
      </section>

      <section className="command-summary-band" aria-label="Statewide alignment summary">
        <div className="aligned">
          <span><CheckCircle2 size={20} /></span>
          <strong>{summary.aligned}</strong>
          <p>Institutions aligned</p>
          <small>following the approved calendar</small>
        </div>
        <div className="attention">
          <span><AlertTriangle size={20} /></span>
          <strong>{summary.attention}</strong>
          <p>Attention required</p>
          <small>confirmation or evidence due</small>
        </div>
        <div className="deviation">
          <span><XCircle size={20} /></span>
          <strong>{summary.deviations}</strong>
          <p>Confirmed deviations</p>
          <small>
            {summary.deviations
              ? "Sahya theory examination"
              : "none in this semester"}
          </small>
        </div>
        <div className="requests">
          <span><FileClock size={20} /></span>
          <strong>{summary.requests}</strong>
          <p>Pending change requests</p>
          <small>awaiting workflow decisions</small>
        </div>
      </section>

      <section className="academic-pulse">
        <div className="academic-pulse-heading">
          <div>
            <p className="eyebrow">Statewide calendar integrity</p>
            <h2>Academic Pulse</h2>
            <span>
              Select a milestone to see which institutions are aligned and where
              intervention is needed.
            </span>
          </div>
          <div className="pulse-legend">
            {(Object.keys(statusMeta) as PulseStatus[]).map((status) => {
              const { label, Icon } = statusMeta[status];
              return (
                <span className={status} key={status}>
                  <Icon size={13} /> {label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="pulse-timeline" aria-label={`${selectedSemester} academic lifecycle`}>
          {effectivePulseMilestones.map((milestone, index) => {
            const distribution = milestone[distributionKey];
            const selected = milestone.id === selectedMilestone.id;
            return (
              <button
                type="button"
                className={`pulse-milestone ${selected ? "selected" : ""} ${distribution.deviation ? "has-deviation" : ""}`}
                onClick={() => setSelectedMilestoneId(milestone.id)}
                aria-pressed={selected}
                key={milestone.id}
              >
                <span className="pulse-step">{String(index + 1).padStart(2, "0")}</span>
                <strong>{milestone.shortLabel}</strong>
                <small>{milestone.date}</small>
                <span className="pulse-distribution">
                  <span className="aligned">
                    <CheckCircle2 size={11} />
                    <b>{distribution.aligned}</b>
                    <em>aligned</em>
                  </span>
                  <span className="attention">
                    <AlertTriangle size={11} />
                    <b>{distribution.attention}</b>
                    <em>attention</em>
                  </span>
                  <span className="deviation">
                    <XCircle size={11} />
                    <b>{distribution.deviation}</b>
                    <em>deviation</em>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="pulse-detail">
          <div className="pulse-detail-copy">
            <div className="pulse-detail-title">
              <div>
                <p>{selectedMilestone.date} · {selectedSemester}</p>
                <h3>{selectedMilestone.label}</h3>
              </div>
              <span>
                {selectedMilestone[distributionKey].deviation
                  ? <><XCircle size={14} /> Confirmed deviation present</>
                  : selectedMilestone[distributionKey].attention
                    ? <><AlertTriangle size={14} /> Follow-up required</>
                    : <><CheckCircle2 size={14} /> All institutions aligned</>}
              </span>
            </div>
            <div className="pulse-institution-grid">
              {visibleInstitutions.map((institution) => {
                const { Icon, label } = statusMeta[institution.status];
                return (
                  <button
                    type="button"
                    className={institution.status}
                    onClick={() =>
                      institution.status === "deviation"
                        ? setDeviationOpen(true)
                        : toast(institution.name, institution.note)
                    }
                    key={institution.name}
                  >
                    <Icon size={16} />
                    <span>
                      <strong>{institution.name}</strong>
                      <small>{label} · {institution.note}</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="kerala-signal-map" aria-label="Indicative Kerala university status motif, not a geographic map">
            <div className="kerala-flow" aria-hidden="true" />
            <p><MapPinned size={14} /> Indicative university signals</p>
            {[
              ["MLU", "aligned", "north"],
              ["KKU", "attention", "north-centre"],
              [
                "SHSU",
                selectedSemester !== "Semester 1"
                  ? "aligned"
                  : revisionPublished
                    ? "aligned"
                    : requestUnderReview
                      ? "attention"
                      : "deviation",
                "centre",
              ],
              ["PVU", "attention", "centre-south"],
              ["VAU", "aligned", "south-centre"],
              ["AUS", "aligned", "south"],
            ].map(([name, status, position]) => {
              const Icon = status === "deviation" ? XCircle : status === "attention" ? AlertTriangle : Check;
              return (
                <span className={`map-signal ${status} ${position}`} key={name}>
                  <Icon size={10} /> {name}
                </span>
              );
            })}
            <small>Decorative geographic motif · not to scale</small>
          </div>
        </div>
      </section>

      <div className="command-secondary-grid">
        <section
          className={`critical-deviation-panel ${revisionPublished ? "resolved" : requestUnderReview ? "under-review" : ""}`}
        >
          <div className="critical-deviation-head">
            <span>
              {revisionPublished ? (
                <CheckCircle2 size={21} />
              ) : (
                <MessageSquareWarning size={21} />
              )}
            </span>
            <div>
              <p className="eyebrow">
                {revisionPublished
                  ? "Published calendar decision"
                  : requestUnderReview
                    ? "Deviation under governance"
                    : "Critical deviation"}
              </p>
              <h2>Semester 1 Theory Examination</h2>
            </div>
            <span className="critical-status">
              {revisionPublished ? (
                <><CheckCircle2 size={13} /> Approved exception</>
              ) : requestUnderReview ? (
                <><AlertTriangle size={13} /> Under review</>
              ) : (
                <><XCircle size={13} /> Confirmed deviation</>
              )}
            </span>
          </div>
          <p>
            {revisionPublished
              ? "Sahya Higher Studies University’s seven-day institution-specific exception is covered by published Calendar Version 1.1."
              : requestUnderReview
                ? "Sahya Higher Studies University’s seven-day variance is in the formal governance workflow; Version 1.0 remains the official baseline."
                : "Sahya Higher Studies University has scheduled the theory examination seven days after the approved Council date."}
          </p>
          <dl>
            <div><dt>Variance</dt><dd>+7 days</dd></div>
            <div><dt>Affected colleges</dt><dd>18 affiliated colleges</dd></div>
            <div><dt>Change request</dt><dd>CR-2026-014 · {requestStatus.replace("-", " ")}</dd></div>
          </dl>
          <div className="critical-actions">
            <button type="button" onClick={() => setDeviationOpen(true)}>
              {revisionPublished ? "Review decision" : "Review deviation"} <ArrowRight size={15} />
            </button>
            <Link href="/hec/compliance">View in Matrix <ChevronRight size={15} /></Link>
          </div>
        </section>

        <section className="command-panel command-due-panel">
          <div className="command-panel-heading">
            <div><p className="eyebrow">Forward view</p><h2>Events Due in the Next 15 Days</h2></div>
            <CalendarCheck2 size={19} />
          </div>
          <div className="command-chronology">
            {[
              ["31 JUL", "Calendar adoption confirmations", "3 institutions pending"],
              ["03 AUG", "Semester classes commence", "Statewide FYUGP milestone"],
              ["08 AUG", "First-week readiness snapshot", "University nodal officers"],
            ].map(([date, title, note]) => (
              <button type="button" onClick={() => toast(title, note)} key={date}>
                <time>{date}</time>
                <span><strong>{title}</strong><small>{note}</small></span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="command-panel workflow-decision-panel">
          <div className="command-panel-heading">
            <div><p className="eyebrow">Governance queue</p><h2>Pending Workflow Decisions</h2></div>
            <FileClock size={19} />
          </div>
          <Link href="/workflow/agenda?request=CR-2026-014" className="workflow-decision-primary">
            <span>CR-2026-014</span>
            <strong>Sahya Higher Studies University</strong>
            <small>
              Theory Examination ·{" "}
              {revisionPublished
                ? "Published in Version 1.1"
                : requestUnderReview
                  ? "Controlled workflow active"
                  : "Draft evidence assembly"}
            </small>
            <em>{requestStatus.replace("-", " ")}</em>
            <ChevronRight size={17} />
          </Link>
          <Link href="/workflow/agenda?request=CR-2026-011" className="workflow-decision-row">
            <span>CR-2026-011</span>
            <div><strong>Periyar Valley University</strong><small>Practical examination · Screening</small></div>
            <ChevronRight size={15} />
          </Link>
        </section>

        <section className="command-panel readiness-panel">
          <div className="command-panel-heading">
            <div><p className="eyebrow">Confirmation watch</p><h2>Institution Readiness</h2></div>
            <University size={19} />
          </div>
          {[
            ["Periyar Valley University", "Classes commence", "Attention · Due 31 Jul"],
            ["Kuttanad Knowledge University", "Internal Assessment 1", "Awaiting confirmation · Due 02 Aug"],
            ["Malabar Learning University", "Practical schedule", "Awaiting confirmation · Due 04 Aug"],
          ].map(([name, event, due], index) => (
            <button
              type="button"
              onClick={() =>
                toast("Readiness follow-up", `${name} will be reminded to confirm ${event}.`)
              }
              key={name}
            >
              <span className={index === 0 ? "attention" : "pending"}>
                {index === 0 ? <AlertTriangle size={14} /> : <Clock3 size={14} />}
              </span>
              <div><strong>{name}</strong><small>{event} · {due}</small></div>
              <BellRing size={15} />
            </button>
          ))}
        </section>
      </div>

      <section className="official-activity">
        <div className="official-activity-heading">
          <div><p className="eyebrow">Audit-ready trail</p><h2>Recent Official Activity</h2></div>
          <Link href="/audit">Open audit log <ArrowRight size={15} /></Link>
        </div>
        <div className="official-activity-rail">
          {[
            ...(revisionPublished
              ? [[ShieldCheck, "Calendar revision published", "Version 1.1 locked", "02 Aug · 10:00"]]
              : []),
            [BookOpenCheck, "Calendar published", "Version 1.0 locked", "15 Jun · 10:42"],
            [Landmark, "Institution adoption", "Vembanad calendar confirmed", "18 Jul · 14:10"],
            [CheckCircle2, "Completion confirmed", "Admission closure recorded", "24 Jul · 17:05"],
            [FileText, "Change request opened", "CR-2026-014 created by Sahya", "26 Jul · 09:05"],
          ].map(([Icon, title, detail, time]) => {
            const ActivityIcon = Icon as typeof BookOpenCheck;
            return (
              <article key={title as string}>
                <span><ActivityIcon size={17} /></span>
                <div><strong>{title as string}</strong><small>{detail as string}</small></div>
                <time>{time as string}</time>
              </article>
            );
          })}
        </div>
      </section>

      {deviationOpen ? (
        <DeviationDrawer
          onClose={() => setDeviationOpen(false)}
          requestStatus={requestStatus}
          revisionPublished={revisionPublished}
        />
      ) : null}
    </>
  );
}

function DeviationDrawer({
  onClose,
  requestStatus,
  revisionPublished,
}: {
  onClose: () => void;
  requestStatus: string;
  revisionPublished: boolean;
}) {
  return (
    <div className="command-drawer-layer">
      <button
        type="button"
        className="command-drawer-backdrop"
        aria-label="Close deviation details"
        onClick={onClose}
      />
      <aside role="dialog" aria-modal="true" aria-labelledby="deviation-drawer-title">
        <header>
          <div>
            <p className="eyebrow">
              {revisionPublished ? "Published calendar decision" : "Confirmed calendar deviation"}
            </p>
            <h2 id="deviation-drawer-title">Semester 1 Theory Examination</h2>
          </div>
          <button type="button" aria-label="Close deviation details" onClick={onClose}>
            <X size={20} />
          </button>
        </header>
        <div className={`drawer-deviation-status ${revisionPublished ? "resolved" : ""}`}>
          {revisionPublished ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
          <div>
            <strong>
              {revisionPublished
                ? "7-day approved institution-specific exception"
                : "7-day variance from the approved baseline"}
            </strong>
            <span>Sahya Higher Studies University · 18 affiliated colleges</span>
          </div>
        </div>
        <div className="drawer-date-comparison">
          <div><span>Approved Council date</span><strong>05 December 2026</strong></div>
          <ArrowRight size={18} />
          <div><span>Institution date</span><strong>12 December 2026</strong></div>
        </div>
        <section>
          <h3>Monitoring explanation</h3>
          <p>
            {revisionPublished
              ? "The Empowered Committee approved the monsoon-related request with conditions, and the HEC Calendar Administrator published the Sahya-specific date in Version 1.1."
              : "Severe monsoon disruption affected scheduled academic activity. The institution has opened a change request but the revised date is not official until committee approval and publication."}
          </p>
        </section>
        <dl>
          <div><dt>Request</dt><dd>CR-2026-014</dd></div>
          <div><dt>Current stage</dt><dd>{requestStatus.replace("-", " ")}</dd></div>
          <div>
            <dt>Authority reference</dt>
            <dd>{revisionPublished ? "KSHEC/ACAD/CAL/2026/01-R1" : "SHSU/EXAM/CAL/2026/77"}</dd>
          </div>
          <div><dt>Downstream impact</dt><dd>Valuation, grade approval and results</dd></div>
        </dl>
        <section>
          <h3>Sample affected colleges</h3>
          <ul>
            <li>Sahya College of Liberal Studies</li>
            <li>Green Valley College</li>
            <li>Pamba Institute of Commerce</li>
            <li>15 additional affiliated colleges</li>
          </ul>
        </section>
        <div className="command-drawer-actions">
          <Link href="/hec/compliance" className="button button-secondary">
            View in Matrix
          </Link>
          <Link href="/workflow/agenda?request=CR-2026-014" className="button button-primary">
            Open Workflow Detail <ArrowRight size={15} />
          </Link>
        </div>
      </aside>
    </div>
  );
}
