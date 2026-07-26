"use client";

import {
  AlertTriangle,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Search,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  sahyaColleges,
  type CollegeAttention,
} from "@/lib/university-data";

const statusMeta: Record<
  CollegeAttention,
  { label: string; Icon: typeof CheckCircle2 }
> = {
  aligned: { label: "Ready", Icon: CheckCircle2 },
  attention: { label: "Follow-up", Icon: AlertTriangle },
  pending: { label: "Pending", Icon: Clock3 },
};

export function AffiliatedCollegeMonitoring() {
  const { toast } = useDemoState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CollegeAttention>("all");
  const [district, setDistrict] = useState("all");

  const districts = Array.from(
    new Set(sahyaColleges.map((college) => college.district)),
  ).sort();
  const visible = useMemo(
    () =>
      sahyaColleges.filter((college) => {
        const matchesQuery = `${college.name} ${college.district}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === "all" || college.status === status;
        const matchesDistrict =
          district === "all" || college.district === district;
        return matchesQuery && matchesStatus && matchesDistrict;
      }),
    [district, query, status],
  );

  const aligned = sahyaColleges.filter(
    (college) => college.status === "aligned",
  ).length;
  const attention = sahyaColleges.filter(
    (college) => college.status === "attention",
  ).length;
  const pending = sahyaColleges.filter(
    (college) => college.status === "pending",
  ).length;

  return (
    <div className="uni-page">
      <header className="uni-page-header">
        <div>
          <p className="uni-kicker">Affiliated network · 18 colleges</p>
          <h1>College readiness monitoring</h1>
          <p>
            Follow acknowledgement, evidence and upcoming milestone readiness
            without changing college records from this workspace.
          </p>
        </div>
        <div className="uni-header-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "College register prepared",
                "A demonstration readiness register is ready to download.",
              )
            }
          >
            <Download size={16} /> Export summary
          </button>
          <button
            className="button button-primary"
            onClick={() =>
              toast(
                "Reminder batch sent",
                "Readiness reminders were sent to 5 follow-up and 3 pending colleges.",
              )
            }
          >
            <BellRing size={16} /> Remind outstanding
          </button>
        </div>
      </header>

      <section className="uni-college-overview">
        <div className="uni-network-identity">
          <span><Building2 size={23} /></span>
          <div><p>Sahya affiliated network</p><strong>18 participating colleges</strong><small>Thrissur, Palakkad, Malappuram and Pathanamthitta</small></div>
        </div>
        <div className="uni-network-stat green"><CheckCircle2 size={18} /><span><strong>{aligned}</strong><small>Ready</small></span></div>
        <div className="uni-network-stat amber"><AlertTriangle size={18} /><span><strong>{attention}</strong><small>Follow-up</small></span></div>
        <div className="uni-network-stat grey"><Clock3 size={18} /><span><strong>{pending}</strong><small>Pending</small></span></div>
      </section>

      <section className="uni-college-toolbar">
        <label className="uni-college-search">
          <Search size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search college or district"
          />
        </label>
        <label>
          <span className="sr-only">Filter by district</span>
          <select value={district} onChange={(event) => setDistrict(event.target.value)}>
            <option value="all">All districts</option>
            {districts.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <div className="uni-segmented" aria-label="Filter by attention status">
          {[
            ["all", "All"],
            ["attention", "Follow-up"],
            ["pending", "Pending"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={status === value ? "active" : ""}
              onClick={() => setStatus(value as "all" | CollegeAttention)}
            >
              {label}
            </button>
          ))}
        </div>
        <span>{visible.length} colleges</span>
      </section>

      <section className="uni-table-panel uni-college-table-panel">
        <div className="uni-table-scroll">
          <table className="uni-college-table">
            <thead>
              <tr>
                <th>College</th>
                <th>District / region</th>
                <th>Calendar acknowledgement</th>
                <th>Upcoming readiness</th>
                <th>Last reported milestone</th>
                <th>Attention status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((college) => {
                const meta = statusMeta[college.status];
                const Icon = meta.Icon;
                return (
                  <tr key={college.id}>
                    <td>
                      <span className="uni-college-initial">{college.name.split(" ").slice(0, 2).map((word) => word[0]).join("")}</span>
                      <span><strong>{college.name}</strong><small>{college.id.toUpperCase()}</small></span>
                    </td>
                    <td><span className="uni-region"><MapPin size={14} /> {college.district}</span></td>
                    <td><strong>{college.acknowledgement}</strong></td>
                    <td><span className={college.status === "aligned" ? "ready-text" : ""}>{college.readiness}</span></td>
                    <td>{college.lastMilestone}</td>
                    <td>
                      <span className={`uni-state-chip ${college.status === "aligned" ? "green" : college.status === "attention" ? "amber" : "grey"}`}>
                        <Icon size={14} /> {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!visible.length ? (
          <div className="uni-college-empty">
            <UsersRound size={23} />
            <strong>No colleges match these filters</strong>
            <button onClick={() => { setQuery(""); setStatus("all"); setDistrict("all"); }}>Clear filters</button>
          </div>
        ) : null}
      </section>

      <p className="uni-college-footnote">
        <Clock3 size={14} /> Readiness position last consolidated 26 July 2026 at
        14:20. Individual college editing is intentionally unavailable.
      </p>
    </div>
  );
}

