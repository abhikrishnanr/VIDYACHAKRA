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
  buildAllCourseOfferingDetails,
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

  const allOfferings = useMemo(
    () =>
      buildAllCourseOfferingDetails({
        offerings: state.courseOfferings,
        universities: state.universityProfiles,
        units: state.academicDeliveryUnits,
        courses: state.courseMasters,
      }),
    [
      state.academicDeliveryUnits,
      state.courseMasters,
      state.courseOfferings,
      state.universityProfiles,
    ],
  );
  const duplicateIds = useMemo(
    () => duplicateOfferingIds(state.courseOfferings),
    [state.courseOfferings],
  );
  const visible = useMemo(
    () =>
      allOfferings
        .filter(
          (item) =>
            universityId === "all" ||
            item.offering.universityId === universityId,
        )
        .filter((item) =>
          status === "all"
            ? true
            : status === "unverified"
              ? ["draft", "submitted", "returned"].includes(
                  item.offering.offeringStatus,
                )
              : item.offering.offeringStatus === status,
        )
        .filter((item) => {
          if (issue === "missing_reference") {
            return !item.offering.approvalReference.trim();
          }
          if (issue === "duplicate") return duplicateIds.has(item.offering.id);
          return true;
        })
        .filter((item) =>
          `${item.university?.name} ${item.unit?.name} ${item.course?.courseName} ${item.course?.courseCode}`
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
    [allOfferings, duplicateIds, issue, query, status, universityId],
  );
  const selected =
    allOfferings.find((item) => item.offering.id === selectedId) ?? null;
  const missingReferences = allOfferings.filter(
    (item) => !item.offering.approvalReference.trim(),
  ).length;
  const unverified = allOfferings.filter((item) =>
    ["draft", "submitted", "returned"].includes(item.offering.offeringStatus),
  ).length;

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
          <p className="offering-kicker">HEC course verification</p>
          <h1>Course offering verification</h1>
          <p>
            Verify that each academic delivery unit is linked to an official
            HEC course with a valid approval reference.
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
            <small>Statewide course assurance</small>
            <strong>
              {unverified} offering{unverified === 1 ? "" : "s"} require
              verification attention
            </strong>
            <p>{allOfferings.length} delivery-unit course records are in the register.</p>
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
          <select value={universityId} onChange={(event) => setUniversityId(event.target.value)}>
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
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
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
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="all">All issue types</option>
            <option value="missing_reference">Missing approval reference</option>
            <option value="duplicate">Duplicate warnings</option>
          </select>
        </label>
      </section>

      <div className="hec-offering-layout">
        <section className="hec-offering-register">
          <div className="hec-offering-head hec-offering-grid">
            <span>University &amp; delivery unit</span>
            <span>Official course</span>
            <span>Academic year</span>
            <span>Approval assurance</span>
            <span>Status</span>
          </div>
          {visible.map((item) => (
            <button
              className={`hec-offering-row hec-offering-grid ${
                selectedId === item.offering.id ? "selected" : ""
              }`}
              key={item.offering.id}
              onClick={() => setSelectedId(item.offering.id)}
            >
              <div>
                <span><Building2 size={16} /></span>
                <div>
                  <strong>{item.university?.shortName}</strong>
                  <small>{item.unit?.name}</small>
                  <em>{item.unit ? unitTypeLabels[item.unit.unitType] : ""}</em>
                </div>
              </div>
              <div>
                <strong>{item.course?.courseName}</strong>
                <small>{item.course?.courseCode} · {item.course?.discipline}</small>
              </div>
              <div>
                <strong>
                  {state.academicYears.find(
                    (year) => year.id === item.offering.academicYearId,
                  )?.label}
                </strong>
                <small>{item.offering.mode.replaceAll("_", " ")} · {item.offering.shift}</small>
              </div>
              <div>
                {!item.offering.approvalReference.trim() ? (
                  <span className="assurance-warning">
                    <AlertTriangle size={12} /> Approval reference missing
                  </span>
                ) : duplicateIds.has(item.offering.id) ? (
                  <span className="assurance-warning">
                    <CircleAlert size={12} /> Possible duplicate
                  </span>
                ) : (
                  <span className="assurance-complete">
                    <CheckCircle2 size={12} /> Reference recorded
                  </span>
                )}
                <small>{item.offering.approvalReference || "Correction required"}</small>
              </div>
              <div>
                <span className={`offering-status status-${item.offering.offeringStatus}`}>
                  {item.offering.offeringStatus === "verified" ? (
                    <ShieldCheck size={12} />
                  ) : (
                    <BookOpenCheck size={12} />
                  )}
                  {offeringStatusLabel(item.offering.offeringStatus)}
                </span>
                <small>{formatOfferingDate(item.offering.lastUpdatedAt)}</small>
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
                <div><dt>Course code</dt><dd>{selected.course?.courseCode}</dd></div>
                <div><dt>Discipline</dt><dd>{selected.course?.discipline}</dd></div>
                <div><dt>Approval reference</dt><dd>{selected.offering.approvalReference || "Missing"}</dd></div>
                <div><dt>Duplicate check</dt><dd>{duplicateIds.has(selected.offering.id) ? "Warning found" : "No duplicate found"}</dd></div>
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
                Verification confirms the official course, delivery unit and
                approval reference.
              </small>
            </>
          ) : (
            <div className="hec-review-empty">
              <ClipboardCheck size={25} />
              <p>Select an offering to review its course and approval details.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
