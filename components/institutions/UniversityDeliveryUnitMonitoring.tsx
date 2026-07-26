"use client";

import {
  BellRing,
  Building2,
  Download,
  Landmark,
  MapPin,
  Search,
} from "lucide-react";
import { useState } from "react";
import { RagBadge } from "@/components/shared/RagBadge";
import { useDemoState } from "@/lib/demo-state";
import {
  getUnitMetrics,
  isCollegeDeliveryUnit,
  unitTypeLabels,
} from "@/lib/institution-structure";

export function UniversityDeliveryUnitMonitoring() {
  const state = useDemoState();
  const universityId = "sahya";
  const university = state.universityProfiles.find(
    (item) => item.id === universityId,
  )!;
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("all");
  const [unitType, setUnitType] = useState("all");
  const units = state.academicDeliveryUnits.filter(
    (unit) => unit.universityId === universityId,
  );
  const submission = state.universityCalendarSubmissions.find(
    (item) => item.universityId === universityId,
  );
  const districts = Array.from(new Set(units.map((unit) => unit.district))).sort();
  const visible = units.filter((unit) => {
    const matchesQuery = `${unit.name} ${unit.shortName} ${unit.institutionCode}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesDistrict =
      district === "all" || unit.district === district;
    const matchesType = unitType === "all" || unit.unitType === unitType;
    return matchesQuery && matchesDistrict && matchesType;
  });
  const outstanding = units.filter((unit) => {
    const metrics = getUnitMetrics({
      unit,
      courseOfferings: state.courseOfferings,
      courseBatches: state.courseBatches,
      semesterStrengthSnapshots: state.semesterStrengthSnapshots,
    });
    return !metrics.reportingComplete || metrics.offerings.length === 0;
  }).length;

  return (
    <div className="delivery-monitor-page">
      <header className="delivery-monitor-header">
        <div>
          <p className="uni-kicker">One academic delivery network</p>
          <h1>Colleges and teaching units</h1>
          <p>
            Monitor every Sahya delivery unit through the same course-offering,
            batch-capacity and student-reporting relationships.
          </p>
        </div>
        <div>
          <button
            className="button button-secondary"
            onClick={() =>
              state.toast(
                "Delivery-unit register prepared",
                "A demonstration register with capacity and reporting status is ready.",
              )
            }
          >
            <Download size={16} /> Export register
          </button>
          <button
            className="button button-primary"
            onClick={() =>
              state.toast(
                "Reporting reminders sent",
                `${outstanding} delivery units received a demonstration follow-up.`,
              )
            }
          >
            <BellRing size={16} /> Remind outstanding
          </button>
        </div>
      </header>

      <section className="delivery-network-band">
        <span>
          <Landmark size={24} />
        </span>
        <div>
          <small>{university.name}</small>
          <strong>Hybrid academic delivery network</strong>
          <p>University teaching units and affiliated colleges share one model.</p>
        </div>
        <dl>
          <div>
            <dt>{units.filter((unit) => !isCollegeDeliveryUnit(unit)).length}</dt>
            <dd>Direct units</dd>
          </div>
          <div>
            <dt>{units.filter(isCollegeDeliveryUnit).length}</dt>
            <dd>Colleges</dd>
          </div>
          <div>
            <dt>{outstanding}</dt>
            <dd>Follow-up</dd>
          </div>
        </dl>
      </section>

      <section className="delivery-monitor-toolbar">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search delivery unit or code"
          />
        </label>
        <select value={unitType} onChange={(event) => setUnitType(event.target.value)}>
          <option value="all">All unit types</option>
          {Object.entries(unitTypeLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={district} onChange={(event) => setDistrict(event.target.value)}>
          <option value="all">All districts</option>
          {districts.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <span>{visible.length} delivery units</span>
      </section>

      <section className="delivery-monitor-table">
        <div className="delivery-monitor-table-scroll">
          <table>
            <thead>
              <tr>
                <th>College or delivery unit</th>
                <th>Unit type</th>
                <th>District</th>
                <th>Calendar coverage</th>
                <th>Course offerings</th>
                <th>Sanctioned capacity</th>
                <th>Student reporting</th>
                <th>Attention</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((unit) => {
                const metrics = getUnitMetrics({
                  unit,
                  courseOfferings: state.courseOfferings,
                  courseBatches: state.courseBatches,
                  semesterStrengthSnapshots: state.semesterStrengthSnapshots,
                });
                const noOfferings = metrics.offerings.length === 0;
                const status = noOfferings || !metrics.reportingComplete ? "amber" : "green";
                return (
                  <tr key={unit.id}>
                    <td>
                      <span className="delivery-unit-table-icon">
                        {isCollegeDeliveryUnit(unit) ? (
                          <Building2 size={16} />
                        ) : (
                          <Landmark size={16} />
                        )}
                      </span>
                      <span>
                        <strong>{unit.name}</strong>
                        <small>{unit.institutionCode}</small>
                      </span>
                    </td>
                    <td>
                      <span className={`unit-type-badge type-${unit.unitType}`}>
                        {unitTypeLabels[unit.unitType]}
                      </span>
                    </td>
                    <td>
                      <span className="delivery-district">
                        <MapPin size={13} /> {unit.district}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {submission?.scopeType === "all_delivery_units"
                          ? "Covered"
                          : "Review scope"}
                      </strong>
                      <small>
                        {submission ? `Calendar ${submission.version}` : "No submission"}
                      </small>
                    </td>
                    <td>{metrics.offerings.length}</td>
                    <td>{metrics.sanctionedCapacity}</td>
                    <td>
                      <strong>{metrics.reportingPercentage}%</strong>
                      <small>
                        {metrics.reportsSubmitted}/{metrics.reportsExpected} reports
                      </small>
                    </td>
                    <td>
                      <RagBadge
                        status={status}
                        label={
                          noOfferings
                            ? "No active offering"
                            : metrics.reportingComplete
                              ? "Ready"
                              : "Reporting follow-up"
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!visible.length ? (
          <div className="delivery-monitor-empty">
            <Building2 size={23} />
            <strong>No delivery units match these filters</strong>
            <button
              onClick={() => {
                setQuery("");
                setDistrict("all");
                setUnitType("all");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </section>

      <p className="delivery-monitor-footnote">
        This page reports aggregated delivery-unit and batch information only. It
        does not contain individual student records.
      </p>
    </div>
  );
}
