"use client";

import {
  Building2,
  Download,
  GraduationCap,
  Landmark,
  MapPin,
  Search,
} from "lucide-react";
import { useState } from "react";
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
    return (
      matchesQuery &&
      (district === "all" || unit.district === district) &&
      (unitType === "all" || unit.unitType === unitType)
    );
  });
  const universityCourseIds = new Set(
    state.courseOfferings
      .filter(
        (offering) =>
          offering.universityId === universityId &&
          offering.offeringStatus !== "inactive",
      )
      .map((offering) => offering.courseMasterId),
  );

  return (
    <div className="delivery-monitor-page">
      <header className="delivery-monitor-header">
        <div>
          <p className="uni-kicker">One academic delivery network</p>
          <h1>Colleges and teaching units</h1>
          <p>
            See the official HEC courses delivered by every Sahya university
            campus, school and affiliated college.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() =>
            state.toast(
              "Delivery-unit register prepared",
              "A demonstration register of delivery units and official courses is ready.",
            )
          }
        >
          <Download size={16} /> Export register
        </button>
      </header>

      <section className="delivery-network-band">
        <span><Landmark size={24} /></span>
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
            <dt>{universityCourseIds.size}</dt>
            <dd>Official courses</dd>
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
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
        <select value={district} onChange={(event) => setDistrict(event.target.value)}>
          <option value="all">All districts</option>
          {districts.map((item) => <option key={item}>{item}</option>)}
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
                <th>Official courses</th>
                <th>Offering status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((unit) => {
                const metrics = getUnitMetrics({
                  unit,
                  courseOfferings: state.courseOfferings,
                });
                const courses = metrics.distinctCourseIds
                  .map((courseId) =>
                    state.courseMasters.find((course) => course.id === courseId),
                  )
                  .filter(Boolean);
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
                    <td>
                      <strong>{courses.map((course) => course?.shortName).join(", ") || "No course linked"}</strong>
                      <small>{courses.length} official course{courses.length === 1 ? "" : "s"}</small>
                    </td>
                    <td>
                      <span className="offering-status status-verified">
                        <GraduationCap size={12} />
                        {metrics.verifiedOfferings === metrics.offerings.length &&
                        metrics.offerings.length
                          ? "HEC verified"
                          : metrics.offerings.length
                            ? "Review in progress"
                            : "No active offering"}
                      </span>
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
    </div>
  );
}
