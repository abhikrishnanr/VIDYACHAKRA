"use client";

import {
  AlertTriangle,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Download,
  GraduationCap,
  MessageSquareText,
  RotateCcw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildAllCourseOfferingMetrics,
  duplicateOfferingIds,
  formatOfferingDate,
  offeringStatusLabel,
} from "@/lib/course-offerings";
import { useDemoState } from "@/lib/demo-state";
import { unitTypeLabels } from "@/lib/institution-structure";

export function HECCourseOfferingWorkspace() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [universityId, setUniversityId] = useState("all");
  const [status, setStatus] = useState("unverified");
  const [issue, setIssue] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>("off-026");
  const [note, setNote] = useState("");

  const allMetrics = useMemo(
    () =>
      buildAllCourseOfferingMetrics({
        offerings: state.courseOfferings,
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        courses: state.courseMasters,
        batches: state.courseBatches,
        cohorts: state.studentCohorts,
        snapshots: state.semesterStrengthSnapshots,
      }),
    [
      state.academicDeliveryUnits,
      state.courseBatches,
      state.courseMasters,
      state.courseOfferings,
      state.semesterStrengthSnapshots,
      state.studentCohorts,
      state.universityProfiles,
    ],
  );
  const duplicateIds = useMemo(
    () => duplicateOfferingIds(state.courseOfferings),
    [state.courseOfferings],
  );
  const visible = useMemo(
    () =>
      allMetrics
        .filter(
          (metric) =>
            universityId === "all" ||
            metric.offering.universityId === universityId,
        )
        .filter((metric) =>
          status === "all"
            ? true
            : status === "unverified"
              ? ["draft", "submitted", "returned"].includes(
                  metric.offering.offeringStatus,
                )
              : metric.offering.offeringStatus === status,
        )
        .filter((metric) => {
          if (issue === "missing_reference") {
            return !metric.offering.approvalReference.trim();
          }
          if (issue === "duplicate") {
            return duplicateIds.has(metric.offering.id);
          }
          if (issue === "reporting") return metric.reportingIncomplete;
          return true;
        })
        .filter((metric) =>
          `${metric.university?.name} ${metric.unit?.name} ${metric.course?.courseName} ${metric.course?.courseCode}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const priority = (value: string) =>
            value === "submitted" ? 0 : value === "returned" ? 1 : value === "draft" ? 2 : 3;
          return (
            priority(a.offering.offeringStatus) -
              priority(b.offering.offeringStatus) ||
            (a.university?.name ?? "").localeCompare(b.university?.name ?? "")
          );
        }),
    [allMetrics, duplicateIds, issue, query, status, universityId],
  );
  const selected =
    allMetrics.find((metric) => metric.offering.id === selectedId) ?? null;

  const missingReferences = allMetrics.filter(
    (metric) => !metric.offering.approvalReference.trim(),
  ).length;
  const unverified = allMetrics.filter((metric) =>
    ["draft", "submitted", "returned"].includes(
      metric.offering.offeringStatus,
    ),
  ).length;
  const statewideCapacity = allMetrics.reduce(
    (total, metric) => total + metric.totalCapacity,
    0,
  );

  function review(action: "verify" | "return" | "note") {
    if (!selected) return;
    if (state.reviewCourseOffering(selected.offering.id, action, note)) {
      setNote("");
    }
  }

  return (
    <div className="offering-page hec-offering-page">
      <header className="offering-page-header">
        <div>
          <p className="offering-kicker">HEC read-oriented verification</p>
          <h1>Course offering verification</h1>
          <p>
            Review university, delivery-unit, official course and batch capacity
            records without introducing a separate capacity committee workflow.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            state.toast(
              "Verification register exported",
              "The filtered statewide offering register has been prepared.",
            )
          }
        >
          <Download size={15} /> Export Verification Register
        </button>
      </header>

      <section className="hec-offering-pulse">
        <div className="lead">
          <span><ShieldCheck size={22} /></span>
          <div>
            <small>Statewide offering assurance</small>
            <strong>
              {unverified} offering{unverified === 1 ? "" : "s"} require
              verification attention
            </strong>
            <p>
              {statewideCapacity} sanctioned seats across{" "}
              {allMetrics.length} delivery-unit course offerings.
            </p>
          </div>
        </div>
        <div>
          <span>Missing approval references</span>
          <strong>{missingReferences}</strong>
        </div>
        <div>
          <span>Duplicate warnings</span>
          <strong>{duplicateIds.size}</strong>
        </div>
        <div>
          <span>Unverified offerings</span>
          <strong>{unverified}</strong>
        </div>
      </section>

      <section className="hec-offering-filters">
        <label className="hec-offering-search">
          <span>Search</span>
          <div>
            <Search size={14} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="University, unit, course or code"
            />
          </div>
        </label>
        <label>
          <span>University</span>
          <select
            value={universityId}
            onChange={(event) => setUniversityId(event.target.value)}
          >
            <option value="all">All universities</option>
            {state.universityProfiles.map((university) => (
              <option key={university.id} value={university.id}>
                {university.shortName}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Offering status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="unverified">Unverified offerings</option>
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="returned">Returned</option>
            <option value="draft">Draft</option>
            <option value="verified">Verified</option>
          </select>
        </label>
        <label>
          <span>Verification issue</span>
          <select
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
          >
            <option value="all">All issue types</option>
            <option value="missing_reference">Missing approval reference</option>
            <option value="duplicate">Duplicate warnings</option>
            <option value="reporting">Student reporting incomplete</option>
          </select>
        </label>
      </section>

      <div className="hec-offering-layout">
        <section className="hec-offering-register">
          <div className="hec-offering-head hec-offering-grid">
            <span>University & delivery unit</span>
            <span>Official course</span>
            <span>Academic year</span>
            <span>Sanctioned capacity</span>
            <span>Approval assurance</span>
            <span>Status</span>
          </div>
          {visible.map((metric) => (
            <button
              className={`hec-offering-row hec-offering-grid ${
                selectedId === metric.offering.id ? "selected" : ""
              }`}
              key={metric.offering.id}
              onClick={() => setSelectedId(metric.offering.id)}
            >
              <div>
                <span><Building2 size={16} /></span>
                <div>
                  <strong>{metric.university?.shortName}</strong>
                  <small>{metric.unit?.name}</small>
                  <em>{metric.unit ? unitTypeLabels[metric.unit.unitType] : ""}</em>
                </div>
              </div>
              <div>
                <strong>{metric.course?.courseName}</strong>
                <small>{metric.course?.courseCode} · {metric.course?.discipline}</small>
              </div>
              <div>
                <strong>
                  {
                    state.academicYears.find(
                      (year) => year.id === metric.offering.academicYearId,
                    )?.label
                  }
                </strong>
                <small>{metric.offering.mode.replaceAll("_", " ")} · {metric.offering.shift}</small>
              </div>
              <div>
                <strong>{metric.totalCapacity}</strong>
                <small>{metric.batches.length} approved batch{metric.batches.length === 1 ? "" : "es"}</small>
              </div>
              <div>
                {!metric.offering.approvalReference.trim() ? (
                  <span className="assurance-warning">
                    <AlertTriangle size={12} /> Approval reference missing
                  </span>
                ) : duplicateIds.has(metric.offering.id) ? (
                  <span className="assurance-warning">
                    <CircleAlert size={12} /> Possible duplicate
                  </span>
                ) : (
                  <span className="assurance-complete">
                    <CheckCircle2 size={12} /> Reference recorded
                  </span>
                )}
                <small>{metric.offering.approvalReference || "Correction required"}</small>
              </div>
              <div>
                <span className={`offering-status status-${metric.offering.offeringStatus}`}>
                  {metric.offering.offeringStatus === "verified" ? (
                    <ShieldCheck size={12} />
                  ) : (
                    <BookOpenCheck size={12} />
                  )}
                  {offeringStatusLabel(metric.offering.offeringStatus)}
                </span>
                <small>{formatOfferingDate(metric.offering.lastUpdatedAt)}</small>
              </div>
            </button>
          ))}
          {!visible.length ? (
            <div className="offering-empty">
              <CheckCircle2 size={27} />
              <h2>No offerings match this verification view</h2>
              <p>Adjust the status or issue filters to inspect other records.</p>
            </div>
          ) : null}
        </section>

        <aside className="hec-offering-review">
          {selected ? (
            <>
              <header>
                <span><ClipboardCheck size={19} /></span>
                <div>
                  <p>Verification record</p>
                  <h2>{selected.course?.shortName}</h2>
                  <small>{selected.offering.id}</small>
                </div>
              </header>
              <section className="hec-selected-offering">
                <div>
                  <GraduationCap size={17} />
                  <span>
                    <small>Official HEC course</small>
                    <strong>{selected.course?.courseName}</strong>
                  </span>
                </div>
                <div>
                  <Building2 size={17} />
                  <span>
                    <small>Academic delivery unit</small>
                    <strong>{selected.unit?.name}</strong>
                  </span>
                </div>
              </section>
              <dl>
                <div><dt>University</dt><dd>{selected.university?.name}</dd></div>
                <div><dt>Approved batches</dt><dd>{selected.batches.length}</dd></div>
                <div><dt>Sanctioned capacity</dt><dd>{selected.totalCapacity}</dd></div>
                <div><dt>Approval reference</dt><dd>{selected.offering.approvalReference || "Missing"}</dd></div>
                <div><dt>Duplicate check</dt><dd>{duplicateIds.has(selected.offering.id) ? "Warning found" : "No duplicate found"}</dd></div>
                <div><dt>Student reporting</dt><dd>{selected.reportingIncomplete ? "Incomplete" : "Reported"}</dd></div>
              </dl>
              {selected.offering.reviewNote ? (
                <div className="hec-existing-note">
                  <MessageSquareText size={14} />
                  <p>{selected.offering.reviewNote}</p>
                </div>
              ) : null}
              <label>
                <span>HEC verification note</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a verification or correction note"
                />
              </label>
              <div className="hec-review-actions">
                <button onClick={() => review("note")}>
                  <MessageSquareText size={13} /> Add Note
                </button>
                {selected.offering.offeringStatus === "submitted" ? (
                  <>
                    <button className="return" onClick={() => review("return")}>
                      <RotateCcw size={13} /> Return for Correction
                    </button>
                    <button className="verify" onClick={() => review("verify")}>
                      <ShieldCheck size={13} /> Verify Offering
                    </button>
                  </>
                ) : null}
              </div>
              <small className="hec-review-footnote">
                Verification protects capacity. It does not create a committee
                workflow in this prototype.
              </small>
            </>
          ) : (
            <div className="hec-review-empty">
              <ClipboardCheck size={25} />
              <p>Select an offering to review its approval and capacity record.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
