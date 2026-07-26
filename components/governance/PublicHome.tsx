"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck2,
  Check,
  ChevronRight,
  Clock3,
  FileCheck2,
  GraduationCap,
  Landmark,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import {
  getPublicCalendarEvents,
  journeyPhases,
  publicInstitutions,
  todayHighlights,
} from "@/lib/public-data";
import { useDemoState } from "@/lib/demo-state";

const journeyDetails = {
  Admissions: "Applications, allotments and enrolment",
  Classes: "Teaching weeks and academic activity",
  Assessments: "Internal assessment and feedback",
  Examinations: "Registration, practicals and theory",
  Valuation: "Centralised evaluation and grade review",
  Results: "Approval, publication and progression",
};

const journeyIcons = {
  Admissions: Landmark,
  Classes: BookOpen,
  Assessments: FileCheck2,
  Examinations: GraduationCap,
  Valuation: Search,
  Results: Sparkles,
};

export function PublicHome() {
  const router = useRouter();
  const { revisionPublicationState } = useDemoState();
  const revisionPublished = revisionPublicationState === "published";
  const activeVersion = revisionPublished ? "1.1" : "1.0";
  const events = useMemo(
    () => getPublicCalendarEvents(revisionPublished),
    [revisionPublished],
  );
  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("2026–27");
  const [programme, setProgramme] = useState("FYUGP");
  const [semester, setSemester] = useState("All semesters");
  const [university, setUniversity] = useState("All universities");
  const [college, setCollege] = useState("All colleges");
  const [eventType, setEventType] = useState("All event types");
  const [institutionQuery, setInstitutionQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState("");

  const selectedUniversity = publicInstitutions.find(
    (institution) => institution.name === university,
  );
  const visibleInstitutions = publicInstitutions.filter((institution) =>
    `${institution.name} ${institution.region} ${institution.colleges.join(" ")}`
      .toLowerCase()
      .includes(institutionQuery.toLowerCase()),
  );
  const upcomingExams = events
    .filter((event) => event.category === "Examination" && event.date >= "2026-07-26")
    .slice(0, 3);
  const deadlines = events.filter((event) =>
    ["course-registration", "exam-registration", "hall-ticket-publication"].includes(
      event.id,
    ),
  );

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (academicYear !== "2026–27") params.set("year", academicYear);
    if (programme !== "FYUGP") params.set("programme", programme);
    if (semester !== "All semesters") params.set("semester", semester);
    if (university !== "All universities") params.set("university", university);
    if (college !== "All colleges") params.set("college", college);
    if (eventType !== "All event types") params.set("category", eventType);
    router.push(`/calendar${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <PublicShell>
      <section className="portal-hero">
        <Image
          className="portal-hero-landscape"
          src="/brand/kerala-academic-landscape.svg"
          alt="Students walking through a green Kerala university campus"
          width={1200}
          height={760}
          priority
        />
        <div className="portal-hero-shade" aria-hidden="true" />
        <div className="portal-hero-copy">
          <p className="portal-hero-overline">
            Kerala Higher Education Academic &amp; Examination Calendar
          </p>
          <div className="portal-wordmark">
            <h1>VIDYACHAKRA</h1>
            <span lang="ml">വിദ്യാചക്ര</span>
          </div>
          <h2>One trusted academic timeline for Kerala higher education.</h2>
          <p>
            Find official class commencement dates, assessments, examinations,
            valuation periods, results and approved calendar revisions.
          </p>
        </div>

        <form className="portal-search-panel" onSubmit={submitSearch}>
          <div className="portal-search-primary">
            <Search size={22} aria-hidden="true" />
            <label className="sr-only" htmlFor="portal-search">
              Search the academic calendar
            </label>
            <input
              id="portal-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search an examination, semester, institution or academic event"
            />
            <button type="submit" aria-label="Search calendar">
              Search <ArrowRight size={17} />
            </button>
          </div>
          <div className="portal-quick-filters">
            <label>
              <span>Academic Year</span>
              <select
                value={academicYear}
                onChange={(event) => setAcademicYear(event.target.value)}
              >
                <option>2026–27</option>
              </select>
            </label>
            <label>
              <span>Programme</span>
              <select
                value={programme}
                onChange={(event) => setProgramme(event.target.value)}
              >
                <option>FYUGP</option>
              </select>
            </label>
            <label>
              <span>Semester</span>
              <select value={semester} onChange={(event) => setSemester(event.target.value)}>
                <option>All semesters</option>
                <option>Semester 1</option>
                <option>Semester 3</option>
              </select>
            </label>
            <label>
              <span>University</span>
              <select
                value={university}
                onChange={(event) => {
                  setUniversity(event.target.value);
                  setCollege("All colleges");
                }}
              >
                <option>All universities</option>
                {publicInstitutions.map((institution) => (
                  <option key={institution.id}>{institution.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>College</span>
              <select value={college} onChange={(event) => setCollege(event.target.value)}>
                <option>All colleges</option>
                {(selectedUniversity?.colleges ??
                  publicInstitutions.flatMap((institution) => institution.colleges)
                ).map((collegeName) => (
                  <option key={collegeName}>{collegeName}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Event Type</span>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
              >
                <option>All event types</option>
                <option>Academic activity</option>
                <option>Admission</option>
                <option>Assessment</option>
                <option>Examination</option>
                <option>Valuation</option>
                <option>Result</option>
                <option>Holiday or break</option>
                <option>Official revision</option>
              </select>
            </label>
          </div>
        </form>

        <div className="portal-hero-actions" aria-label="Popular calendar actions">
          <Link href="/calendar" className="button button-primary">
            Explore Calendar <ArrowRight size={17} />
          </Link>
          <Link href="/calendar?view=agenda&category=Examination" className="button button-light">
            View Upcoming Examinations
          </Link>
          <Link href="/#revisions" className="portal-inline-action">
            Latest Official Revisions <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <div className="portal-main">
        <section className="portal-today" aria-labelledby="today-heading">
          <div className="portal-today-date">
            <span>JUL</span>
            <strong>26</strong>
            <small>2026</small>
          </div>
          <div>
            <p className="portal-section-kicker">{todayHighlights.date}</p>
            <h2 id="today-heading">Today in Kerala Higher Education</h2>
            <strong className="portal-phase">{todayHighlights.phase}</strong>
            <p>{todayHighlights.description}</p>
          </div>
          <div className="portal-next-event">
            <Clock3 size={18} />
            <div>
              <span>Next statewide event</span>
              <strong>Semester classes commence</strong>
              <small>03 August · in 8 days</small>
            </div>
          </div>
        </section>

        <section className="portal-section" id="journey">
          <div className="portal-section-heading">
            <div>
              <p className="portal-section-kicker">From application to outcome</p>
              <h2>Academic Year Journey</h2>
            </div>
            <p>
              Follow the six connected phases of the FYUGP academic year.
            </p>
          </div>
          <div className="portal-journey">
            {journeyPhases.map((phase, index) => {
              const Icon = journeyIcons[phase];
              return (
                <Link
                  href={`/calendar?view=journey&phase=${phase}`}
                  className="portal-journey-step"
                  key={phase}
                >
                  <span className="portal-journey-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="portal-journey-icon">
                    <Icon size={19} />
                  </span>
                  <strong>{phase}</strong>
                  <small>{journeyDetails[phase]}</small>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="portal-section portal-two-column">
          <div className="portal-exams">
            <div className="portal-section-heading compact">
              <div>
                <p className="portal-section-kicker">Plan ahead</p>
                <h2>Upcoming Examinations</h2>
              </div>
              <Link href="/calendar?view=agenda&category=Examination">
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="portal-date-list">
              {upcomingExams.map((event) => {
                const date = new Date(`${event.date}T12:00:00`);
                return (
                  <Link
                    href={`/calendar?view=agenda&event=${event.id}`}
                    className="portal-date-row"
                    key={event.id}
                  >
                    <span className="portal-date-block">
                      <small>
                        {date.toLocaleDateString("en-IN", { month: "short" })}
                      </small>
                      <strong>{String(date.getDate()).padStart(2, "0")}</strong>
                      <em>{date.getFullYear()}</em>
                    </span>
                    <span className="portal-date-copy">
                      <strong>{event.name}</strong>
                      <small>{event.semester} · {event.institutions.length === 6 ? "Statewide" : event.institutions[0]}</small>
                    </span>
                    <ChevronRight size={18} />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="portal-deadlines">
            <div className="portal-section-heading compact">
              <div>
                <p className="portal-section-kicker">Don&apos;t miss these</p>
                <h2>Important Deadlines</h2>
              </div>
            </div>
            <div className="portal-deadline-list">
              {deadlines.map((event) => (
                <Link
                  href={`/calendar?view=agenda&event=${event.id}`}
                  className="portal-deadline"
                  key={event.id}
                >
                  <span>
                    {new Date(`${event.date}T12:00:00`).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <div>
                    <strong>{event.name}</strong>
                    <small>{event.semester} · FYUGP</small>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="portal-section portal-status-section">
          <div className="portal-status-copy">
            <p className="portal-section-kicker">Verified calendar baseline</p>
            <h2>Official Calendar Status</h2>
            <p>
              The public calendar reflects the latest locked schedule approved
              for participating institutions.
            </p>
          </div>
          <div className="portal-status-card">
            <div className="portal-status-main">
              <span className="portal-status-icon"><CalendarCheck2 size={24} /></span>
              <div>
                <small>Current academic calendar</small>
                <strong>FYUGP 2026–27</strong>
                <span><Check size={14} /> Published and locked</span>
              </div>
              <b>Version {activeVersion}</b>
            </div>
            <dl>
              <div>
                <dt>Authority reference</dt>
                <dd>
                  {revisionPublished
                    ? "KSHEC/ACAD/CAL/2026/01-R1"
                    : "KSHEC/ACAD/CAL/2026/01"}
                </dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{revisionPublished ? "02 August 2026" : "26 July 2026"}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="portal-section portal-institution-section" id="institutions">
          <div className="portal-section-heading">
            <div>
              <p className="portal-section-kicker">Search the network</p>
              <h2>Find Your Institution</h2>
            </div>
            <p>Choose a fictional university or affiliated college to focus the calendar.</p>
          </div>
          <div className="portal-institution-finder">
            <div className="portal-institution-search">
              <Search size={18} />
              <label className="sr-only" htmlFor="institution-search">
                Search institutions
              </label>
              <input
                id="institution-search"
                value={institutionQuery}
                onChange={(event) => setInstitutionQuery(event.target.value)}
                placeholder="Search university or college"
              />
            </div>
            <div className="portal-institution-results">
              {visibleInstitutions.map((institution) => (
                <button
                  type="button"
                  className={selectedInstitution === institution.name ? "selected" : ""}
                  onClick={() => setSelectedInstitution(institution.name)}
                  key={institution.id}
                >
                  <span><Landmark size={17} /></span>
                  <div>
                    <strong>{institution.name}</strong>
                    <small>{institution.region} Kerala · {institution.colleges.length} sample colleges</small>
                  </div>
                  {selectedInstitution === institution.name ? <Check size={17} /> : <ChevronRight size={17} />}
                </button>
              ))}
            </div>
            <div className="portal-institution-selection">
              <MapPin size={18} />
              <div>
                <small>Selected institution</small>
                <strong>{selectedInstitution || "Choose an institution above"}</strong>
              </div>
              {selectedInstitution ? (
                <Link href={`/calendar?university=${encodeURIComponent(selectedInstitution)}`}>
                  Open calendar <ArrowRight size={15} />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="portal-section portal-revisions" id="revisions">
          <div className="portal-section-heading">
            <div>
              <p className="portal-section-kicker">Transparent updates</p>
              <h2>Latest Approved Revisions</h2>
            </div>
            <span className="portal-version-pill">Calendar v{activeVersion}</span>
          </div>
          {revisionPublished ? (
            <Link
              href="/calendar?view=agenda&event=semester-1-theory-examination"
              className="portal-revision-item"
            >
              <span className="portal-revision-mark"><Check size={18} /></span>
              <div>
                <small>Approved 02 August 2026 · CR-2026-014</small>
                <h3>Sahya Semester 1 Theory Examination revised</h3>
                <p>
                  The examination now begins on 12 December for 18 affiliated
                  colleges following severe monsoon disruption.
                </p>
              </div>
              <span className="portal-revision-status">
                Revised by Empowered Committee
              </span>
              <ChevronRight size={20} />
            </Link>
          ) : (
            <div className="portal-revisions-empty">
              <span><CalendarCheck2 size={25} /></span>
              <div>
                <h3>No revisions have been published since Version 1.0.</h3>
                <p>Approved changes will appear here with their authority reference and effective date.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
