"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  Landmark,
  MapPin,
  Network,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { RagBadge } from "@/components/shared/RagBadge";
import { useDemoState } from "@/lib/demo-state";
import {
  getUniversityMetrics,
  operatingModelLabels,
} from "@/lib/institution-structure";
import type { UniversityOperatingModel } from "@/lib/types";

export function HECInstitutionDirectory() {
  const state = useDemoState();
  const [query, setQuery] = useState("");
  const [model, setModel] = useState<"all" | UniversityOperatingModel>("all");
  const [district, setDistrict] = useState("all");
  const [focus, setFocus] = useState<"all" | "complete" | "attention">("all");
  const districts = Array.from(
    new Set(state.universityProfiles.map((university) => university.district)),
  ).sort();

  const universities = useMemo(
    () =>
      state.universityProfiles
        .map((university) => ({
          university,
          metrics: getUniversityMetrics({
            university,
            units: state.academicDeliveryUnits,
            courseOfferings: state.courseOfferings,
            courseBatches: state.courseBatches,
            semesterStrengthSnapshots: state.semesterStrengthSnapshots,
            calendarSubmissions: state.universityCalendarSubmissions,
            requestStatus: state.requestStatus,
            masterCalendarVersion: state.masterCalendarVersion,
          }),
        }))
        .filter(({ university }) =>
          `${university.name} ${university.shortName} ${university.district}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .filter(({ university }) =>
          model === "all" ? true : university.operatingModel === model,
        )
        .filter(({ university }) =>
          district === "all" ? true : university.district === district,
        )
        .filter(({ metrics }) =>
          focus === "complete"
            ? metrics.reportingComplete
            : focus === "attention"
              ? metrics.attentionStatus !== "green"
              : true,
        ),
    [
      district,
      focus,
      model,
      query,
      state.academicDeliveryUnits,
      state.courseBatches,
      state.courseOfferings,
      state.masterCalendarVersion,
      state.requestStatus,
      state.semesterStrengthSnapshots,
      state.universityCalendarSubmissions,
      state.universityProfiles,
    ],
  );

  return (
    <div className="institution-directory-page">
      <PageHeader
        eyebrow="Statewide Institution Registry"
        title="University Structure Directory"
        description="See how every fictional university delivers courses—through its own campuses and schools, colleges, or both—without fragmenting the institutional model."
        actions={
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Directory extract prepared",
                "The institution structure and reporting summary is ready for the demonstration export.",
              )
            }
          >
            <Download size={16} /> Export directory
          </button>
        }
      />

      <section className="operating-model-guide">
        {[
          {
            id: "teaching_only" as const,
            title: "Teaching University",
            copy: "Courses delivered through university campuses, schools and centres.",
            Icon: Landmark,
          },
          {
            id: "affiliating" as const,
            title: "Affiliating University",
            copy: "Courses delivered through affiliated or constituent colleges.",
            Icon: Building2,
          },
          {
            id: "hybrid" as const,
            title: "Hybrid University",
            copy: "Direct university teaching and college delivery in one structure.",
            Icon: Network,
          },
        ].map(({ id, title, copy, Icon }) => (
          <button
            key={String(id)}
            className={model === id ? "active" : ""}
            onClick={() =>
              setModel((current) =>
                current === id ? "all" : (id as UniversityOperatingModel),
              )
            }
          >
            <span>
              <Icon size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>{title}</strong>
              <small>{copy}</small>
            </div>
          </button>
        ))}
      </section>

      <section className="institution-directory-toolbar">
        <label>
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search university or district"
          />
        </label>
        <select value={model} onChange={(event) => setModel(event.target.value as typeof model)}>
          <option value="all">All operating models</option>
          <option value="teaching_only">Teaching only</option>
          <option value="affiliating">Affiliating</option>
          <option value="hybrid">Hybrid</option>
        </select>
        <select value={district} onChange={(event) => setDistrict(event.target.value)}>
          <option value="all">All districts</option>
          {districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <div className="institution-focus-filter" aria-label="Reporting and attention filter">
          {[
            ["all", "Show all"],
            ["complete", "Reporting complete"],
            ["attention", "Attention required"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={focus === value ? "active" : ""}
              onClick={() => setFocus(value as typeof focus)}
            >
              {label}
            </button>
          ))}
        </div>
        <span>{universities.length} universities</span>
      </section>

      <section className="institution-directory-list">
        <div className="institution-directory-head institution-directory-grid">
          <span>University and model</span>
          <span>Delivery structure</span>
          <span>Courses</span>
          <span>Calendar submission</span>
          <span>Student reporting</span>
          <span>Current attention</span>
          <span />
        </div>
        {universities.map(({ university, metrics }) => (
          <Link
            href={`/hec/institutions/${university.id}`}
            className="institution-directory-row institution-directory-grid"
            key={university.id}
          >
            <span className="institution-directory-identity">
              <span>
                {university.operatingModel === "affiliating" ? (
                  <Building2 size={20} />
                ) : university.operatingModel === "hybrid" ? (
                  <Network size={20} />
                ) : (
                  <Landmark size={20} />
                )}
              </span>
              <span>
                <strong>{university.name}</strong>
                <small>
                  <MapPin size={11} /> {university.district}
                </small>
                <b>{operatingModelLabels[university.operatingModel]}</b>
              </span>
            </span>
            <span className="institution-structure-counts">
              <strong>{metrics.directUnits.length}</strong>
              <small>direct units</small>
              <strong>{metrics.constituentColleges.length}</strong>
              <small>constituent</small>
              <strong>{metrics.affiliatedColleges.length}</strong>
              <small>affiliated</small>
            </span>
            <span className="institution-course-count">
              <strong>{metrics.distinctCourseCount}</strong>
              <small>{metrics.offerings.length} offerings</small>
            </span>
            <span className="institution-submission-status">
              <strong>
                {metrics.submission
                  ? metrics.submission.status.replaceAll("_", " ")
                  : "Not started"}
              </strong>
              <small>{metrics.submission ? `Version ${metrics.submission.version}` : "No submission"}</small>
            </span>
            <span className="institution-reporting">
              <strong>{metrics.reportingPercentage}%</strong>
              <small>
                {metrics.reportsSubmitted}/{metrics.reportsExpected} batch reports
              </small>
              <span>
                <i style={{ width: `${metrics.reportingPercentage}%` }} />
              </span>
            </span>
            <RagBadge
              status={metrics.attentionStatus}
              label={metrics.attentionLabel}
            />
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ))}
        {!universities.length ? (
          <div className="institution-directory-empty">
            <CheckCircle2 size={25} />
            <strong>No universities match these filters</strong>
            <button
              onClick={() => {
                setQuery("");
                setModel("all");
                setDistrict("all");
                setFocus("all");
              }}
            >
              Clear directory filters
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
