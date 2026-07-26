"use client";

import { format, parseISO } from "date-fns";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Gavel,
  LockKeyhole,
  MessageSquareText,
} from "lucide-react";
import { CalendarVersionBadge } from "@/components/shared/CalendarVersionBadge";
import { EventTypeIcon } from "@/components/shared/EventTypeIcon";
import { PageHeader } from "@/components/shared/PageHeader";
import { RagBadge } from "@/components/shared/RagBadge";
import { RoleBadge } from "@/components/shared/RoleBadge";
import {
  academicMilestones,
  centralIncident,
  institutions,
  roleDefinitions,
} from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";
import type { WorkspaceRole } from "@/lib/types";

type SectionMode =
  | "institutions"
  | "requests"
  | "versions"
  | "reports"
  | "completion"
  | "colleges"
  | "agenda"
  | "decisions"
  | "impact"
  | "publication"
  | "revisions"
  | "audit"
  | "alerts"
  | "milestones";

const descriptions: Record<SectionMode, string> = {
  institutions:
    "Compare adoption, reporting readiness and material calendar variance across participating universities.",
  requests:
    "Follow change requests from institutional draft through screening, committee review and publication.",
  versions:
    "Inspect the approved calendar lineage and the publication state of every official baseline.",
  reports:
    "Prepare concise extracts for academic coordination, compliance review and executive briefing.",
  completion:
    "Confirm actual completion against adopted institutional dates and retain a clear reporting trail.",
  colleges:
    "Coordinate the fictional affiliated colleges included in the Sahya university demonstration.",
  agenda:
    "Organise screened change requests into a focused empowered committee meeting sequence.",
  decisions:
    "Record an approval, rejection or return with the academic impact kept visible.",
  impact:
    "Trace how one proposed date change affects valuation, grade approval and result publication.",
  publication:
    "Publish only approved revisions and lock a new master calendar baseline for every workspace.",
  revisions:
    "Review committee-approved changes that are ready for controlled calendar publication.",
  audit:
    "Inspect the decision and publication trail for the active master calendar version.",
  alerts:
    "Review the small number of statewide signals that require senior attention.",
  milestones:
    "See the next statewide teaching, assessment and examination moments at a glance.",
};

function sectionTitle(role: WorkspaceRole, mode: SectionMode) {
  const match = roleDefinitions[role].navigation.find((item) =>
    item.href.endsWith(`/${mode}`),
  );
  return match?.label ?? (mode === "publication" ? "Publication Desk" : "Workspace");
}

export function RoleSectionView({
  role,
  mode,
}: {
  role: WorkspaceRole;
  mode: SectionMode;
}) {
  const {
    requestStatus,
    committeeDecision,
    revisionPublicationState,
    masterCalendarVersion,
    publicationStatus,
    completedEventConfirmations,
    setRequestStatus,
    setCommitteeDecision,
    setRevisionPublicationState,
    confirmEventCompletion,
    publishRevision,
    toast,
  } = useDemoState();
  const title = sectionTitle(role, mode);

  function primaryAction() {
    if (mode === "requests" && role === "university") {
      setRequestStatus("submitted");
      toast("Request submitted", "CR-2026-014 moved to HEC screening.");
      return;
    }
    if (mode === "requests" && role === "monitoring") {
      setRequestStatus("committee-review");
      toast("Screening complete", "CR-2026-014 moved to committee review.");
      return;
    }
    if (mode === "decisions") {
      setCommitteeDecision("approved");
      setRequestStatus("approved");
      setRevisionPublicationState("ready");
      toast("Request approved", "CR-2026-014 is ready for calendar publication.");
      return;
    }
    if (mode === "publication" || mode === "revisions") {
      publishRevision();
      return;
    }
    toast("Demonstration action recorded", `${title} has been added to the local activity.`);
  }

  const primaryLabel =
    mode === "requests" && role === "university"
      ? "Submit CR-2026-014"
      : mode === "requests"
        ? "Complete screening"
        : mode === "decisions"
          ? "Approve request"
          : mode === "publication" || mode === "revisions"
            ? "Publish version 1.1"
            : "Prepare summary";

  return (
    <>
      <PageHeader
        eyebrow={`${roleDefinitions[role].shortLabel} · Academic year 2026–27`}
        title={title}
        description={descriptions[mode]}
        actions={
          mode === "alerts" || mode === "milestones" || mode === "reports" ? (
            <button className="button button-secondary" onClick={primaryAction}>
              <Download size={16} /> {primaryLabel}
            </button>
          ) : (
            <button className="button button-primary" onClick={primaryAction}>
              {mode === "publication" || mode === "revisions" ? (
                <LockKeyhole size={16} />
              ) : mode === "decisions" ? (
                <Gavel size={16} />
              ) : (
                <ArrowRight size={16} />
              )}
              {primaryLabel}
            </button>
          )
        }
      />

      {(mode === "requests" ||
        mode === "decisions" ||
        mode === "impact" ||
        mode === "publication" ||
        mode === "revisions" ||
        mode === "alerts") && (
        <section className="incident-panel">
          <div className="incident-panel-top">
            <div>
              <p className="eyebrow">CR-2026-014 · Central demonstration incident</p>
              <h2>{centralIncident.title}</h2>
              <p>{centralIncident.ragReason}</p>
            </div>
            <RagBadge status="red" />
          </div>
          <div className="incident-date-comparison">
            <div>
              <span>Council baseline</span>
              <strong>
                {format(parseISO(centralIncident.councilBaselineDate), "dd MMM yyyy")}
              </strong>
            </div>
            <span className="variance-arrow">+7 days <ArrowRight size={18} /></span>
            <div>
              <span>Sahya scheduled date</span>
              <strong>
                {format(
                  parseISO(centralIncident.institutionScheduledDate),
                  "dd MMM yyyy",
                )}
              </strong>
            </div>
            <div>
              <span>Affected colleges</span>
              <strong>{centralIncident.affectedCollegeCount}</strong>
            </div>
          </div>
          <div className="incident-workflow">
            {[
              ["University draft", requestStatus !== "draft"],
              [
                "HEC screening",
                ["committee-review", "approved", "published"].includes(requestStatus),
              ],
              [
                "Committee decision",
                committeeDecision !== "pending" || requestStatus === "published",
              ],
              ["Revision publication", revisionPublicationState === "published"],
            ].map(([label, complete], index) => (
              <div className={complete ? "complete" : ""} key={String(label)}>
                <span>{complete ? <Check size={13} /> : index + 1}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      {mode === "institutions" || mode === "colleges" ? (
        <section className="role-data-panel">
          <div className="role-data-head">
            <div>
              <p className="eyebrow">
                {mode === "colleges" ? "Affiliated college directory" : "Statewide participation"}
              </p>
              <h2>
                {mode === "colleges"
                  ? "Fictional colleges by university"
                  : "Six universities in the demonstration"}
              </h2>
            </div>
            <RoleBadge role={role} compact />
          </div>
          <div className="role-institution-list">
            {institutions.map((institution) => (
              <article key={institution.id}>
                <span className="role-list-icon"><Building2 size={18} /></span>
                <div>
                  <h3>{institution.name}</h3>
                  <p>{institution.submission}</p>
                  <div className="college-chip-list">
                    {institution.colleges.map((college) => (
                      <span key={college}>{college}</span>
                    ))}
                  </div>
                </div>
                <span>{institution.region} region</span>
              </article>
            ))}
          </div>
        </section>
      ) : mode === "completion" ? (
        <section className="role-data-panel">
          <div className="role-data-head">
            <div>
              <p className="eyebrow">Institutional reporting</p>
              <h2>Completion confirmations</h2>
            </div>
            <span>{completedEventConfirmations.length} confirmed</span>
          </div>
          <div className="completion-list">
            {academicMilestones.slice(0, 7).map((event) => {
              const complete = completedEventConfirmations.includes(event.id);
              return (
                <article key={event.id}>
                  <span className="role-list-icon">
                    <EventTypeIcon type={event.eventType} />
                  </span>
                  <div>
                    <h3>{event.title}</h3>
                    <p>
                      Scheduled {format(parseISO(event.institutionScheduledDate), "dd MMM yyyy")}
                    </p>
                  </div>
                  <button
                    className={`completion-button ${complete ? "complete" : ""}`}
                    onClick={() =>
                      complete
                        ? toast("Already confirmed", "This milestone is already complete.")
                        : confirmEventCompletion(event.id)
                    }
                  >
                    {complete ? <CheckCircle2 size={15} /> : <ClipboardCheck size={15} />}
                    {complete ? "Confirmed" : "Confirm completion"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ) : mode === "versions" || mode === "publication" || mode === "revisions" ? (
        <section className="version-ledger">
          <div className="version-ledger-current">
            <span className="role-list-icon"><BookOpenCheck size={21} /></span>
            <div>
              <p className="eyebrow">Current official baseline</p>
              <h2>Academic Calendar {masterCalendarVersion}</h2>
              <p>Published 15 June 2026 · applicable to FYUGP Semester 1 and 3.</p>
            </div>
            <CalendarVersionBadge
              version={masterCalendarVersion}
              status={publicationStatus}
            />
          </div>
          <div className="version-ledger-row">
            <span>Proposed version 1.1</span>
            <strong>Includes approved examination revision</strong>
            <span className={`revision-state state-${revisionPublicationState}`}>
              {revisionPublicationState.replace("-", " ")}
            </span>
          </div>
          <div className="version-ledger-row">
            <span>Version 1.3</span>
            <strong>Initial university adoption baseline</strong>
            <span>Archived · 15 May 2026</span>
          </div>
        </section>
      ) : (
        <section className="role-overview-grid">
          <article className="role-overview-lead">
            <span className="role-list-icon"><FileText size={20} /></span>
            <div>
              <p className="eyebrow">Focused workspace</p>
              <h2>{title} is ready</h2>
              <p>
                The active filters are FYUGP, Semester 1 and academic year 2026–27.
                All interactions remain on this device.
              </p>
            </div>
          </article>
          <article className="role-overview-note">
            <MessageSquareText size={20} />
            <div>
              <strong>One shared issue remains visible</strong>
              <p>
                CR-2026-014 connects the university, monitoring, committee and
                administrator demonstrations.
              </p>
            </div>
          </article>
        </section>
      )}
    </>
  );
}
