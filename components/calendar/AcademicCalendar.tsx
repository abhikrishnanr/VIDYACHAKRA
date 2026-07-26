"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileDown,
  Filter,
  History,
  LayoutGrid,
  List,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getPublicCalendarEvents,
  journeyPhases,
  publicEventCategories,
  publicInstitutions,
  type JourneyPhase,
  type PublicCalendarEvent,
  type PublicEventCategory,
} from "@/lib/public-data";
import { useDemoState } from "@/lib/demo-state";

type CalendarView = "month" | "agenda" | "journey";

const viewOptions: Array<{
  id: CalendarView;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "month", label: "Month", icon: LayoutGrid },
  { id: "agenda", label: "Agenda", icon: List },
  { id: "journey", label: "Academic Journey", icon: CalendarDays },
];

const categoryClass: Record<PublicEventCategory, string> = {
  "Academic activity": "academic",
  Admission: "admission",
  Assessment: "assessment",
  Examination: "examination",
  Valuation: "valuation",
  Result: "result",
  "Holiday or break": "holiday",
  "Official revision": "revision",
};

function monthDays(cursor: Date) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days: Date[] = [];
  let day = start;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

function EventStatus({ event }: { event: PublicCalendarEvent }) {
  return (
    <span className={`public-status-label ${event.publicationStatus === "Official" ? "official" : "revised"}`}>
      <Check size={13} />
      {event.publicationStatus}
    </span>
  );
}

export function AcademicCalendar() {
  const { revisionPublicationState, toast } = useDemoState();
  const revisionPublished = revisionPublicationState === "published";
  const events = useMemo(
    () => getPublicCalendarEvents(revisionPublished),
    [revisionPublished],
  );
  const [view, setView] = useState<CalendarView>("agenda");
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("2026–27");
  const [programme, setProgramme] = useState("FYUGP");
  const [semester, setSemester] = useState("All semesters");
  const [university, setUniversity] = useState("All universities");
  const [college, setCollege] = useState("All colleges");
  const [category, setCategory] = useState<
    PublicEventCategory | "All event types"
  >("All event types");
  const [monthCursor, setMonthCursor] = useState(new Date(2026, 7, 1));
  const [selectedEvent, setSelectedEvent] = useState<PublicCalendarEvent | null>(
    null,
  );
  const [selectedPhase, setSelectedPhase] = useState<JourneyPhase | "All phases">(
    "All phases",
  );

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedView = params.get("view");
      if (
        requestedView === "month" ||
        requestedView === "agenda" ||
        requestedView === "journey"
      ) {
        setView(requestedView);
      } else if (window.matchMedia("(min-width: 761px)").matches) {
        setView("month");
      }
      const requestedQuery = params.get("q");
      const requestedCategory = params.get("category");
      const requestedSemester = params.get("semester");
      const requestedUniversity = params.get("university");
      const requestedCollege = params.get("college");
      const requestedEvent = params.get("event");
      const requestedPhase = params.get("phase");

      if (requestedQuery) setSearch(requestedQuery);
      if (publicEventCategories.includes(requestedCategory as PublicEventCategory)) {
        setCategory(requestedCategory as PublicEventCategory);
      }
      if (requestedSemester === "Semester 1" || requestedSemester === "Semester 3") {
        setSemester(requestedSemester);
      }
      if (requestedUniversity) setUniversity(requestedUniversity);
      if (requestedCollege) setCollege(requestedCollege);
      if (journeyPhases.includes(requestedPhase as JourneyPhase)) {
        setSelectedPhase(requestedPhase as JourneyPhase);
      }
      if (requestedEvent) {
        const match = events.find((event) => event.id === requestedEvent);
        if (match) {
          setSelectedEvent(match);
          setMonthCursor(startOfMonth(parseISO(match.date)));
        }
      }
    }, 0);
    return () => window.clearTimeout(initializationTimer);
  }, [events]);

  const selectedUniversity = publicInstitutions.find(
    (institution) => institution.name === university,
  );

  const filteredEvents = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSearch =
        !loweredSearch ||
        `${event.name} ${event.summary} ${event.semester} ${event.institutions.join(" ")} ${event.authorityReference}`
          .toLowerCase()
          .includes(loweredSearch);
      const matchesCategory =
        category === "All event types" || event.category === category;
      const matchesSemester =
        semester === "All semesters" ||
        event.semester === "All semesters" ||
        event.semester === semester;
      const matchesUniversity =
        university === "All universities" || event.institutions.includes(university);
      const matchesCollege =
        college === "All colleges" ||
        (selectedUniversity
          ? event.institutions.includes(selectedUniversity.name)
          : true);
      const matchesPhase =
        selectedPhase === "All phases" || event.journeyPhase === selectedPhase;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSemester &&
        matchesUniversity &&
        matchesCollege &&
        matchesPhase
      );
    });
  }, [
    category,
    college,
    events,
    search,
    selectedPhase,
    selectedUniversity,
    semester,
    university,
  ]);

  const visibleMonthEvents = filteredEvents.filter((event) =>
    isSameMonth(parseISO(event.date), monthCursor),
  );
  const days = monthDays(monthCursor);
  const filterCount = [
    search,
    semester !== "All semesters",
    university !== "All universities",
    college !== "All colleges",
    category !== "All event types",
    selectedPhase !== "All phases",
  ].filter(Boolean).length;

  function resetFilters() {
    setSearch("");
    setAcademicYear("2026–27");
    setProgramme("FYUGP");
    setSemester("All semesters");
    setUniversity("All universities");
    setCollege("All colleges");
    setCategory("All event types");
    setSelectedPhase("All phases");
  }

  function openEvent(event: PublicCalendarEvent) {
    setSelectedEvent(event);
  }

  return (
    <div className="public-calendar-explorer" id="explorer">
      <div className="calendar-explorer-topline">
        <div>
          <p className="portal-section-kicker">Official public calendar</p>
          <h2>Explore FYUGP 2026–27</h2>
          <p>All dates are shown in Indian Standard Time.</p>
        </div>
        <div className="calendar-version-public">
          <span><Check size={14} /> Published and locked</span>
          <strong>Version {revisionPublished ? "1.1" : "1.0"}</strong>
        </div>
      </div>

      <div className="calendar-view-switcher" aria-label="Calendar view">
        {viewOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              type="button"
              key={option.id}
              className={view === option.id ? "active" : ""}
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
            >
              <Icon size={17} />
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="public-calendar-filterbar">
        <div className="public-calendar-search">
          <Search size={18} />
          <label className="sr-only" htmlFor="public-calendar-search">
            Search calendar
          </label>
          <input
            id="public-calendar-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events or institutions"
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
        <div className="public-filter-grid">
          <label>
            <span>Academic year</span>
            <select
              value={academicYear}
              onChange={(event) => setAcademicYear(event.target.value)}
            >
              <option>2026–27</option>
            </select>
          </label>
          <label>
            <span>Programme</span>
            <select value={programme} onChange={(event) => setProgramme(event.target.value)}>
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
            <span>Event type</span>
            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as PublicEventCategory | "All event types",
                )
              }
            >
              {publicEventCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="public-filter-summary">
          <span><Filter size={15} /> {filterCount ? `${filterCount} filters applied` : "Showing the full official calendar"}</span>
          {filterCount ? (
            <button type="button" onClick={resetFilters}>Clear all</button>
          ) : null}
        </div>
      </div>

      <div className="public-calendar-results">
        <div className="public-calendar-results-heading">
          <div>
            <strong>{filteredEvents.length} events</strong>
            <span>matching your calendar view</span>
          </div>
          <button
            type="button"
            className="public-export-button"
            onClick={() =>
              toast(
                "Calendar export prepared",
                "Your filtered FYUGP 2026–27 calendar is ready as a demonstration download.",
              )
            }
          >
            <Download size={16} /> Export filtered calendar
          </button>
        </div>

        {view === "month" ? (
          <section className="public-month-view" aria-label="Month calendar view">
            <div className="public-month-heading">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setMonthCursor((current) => subMonths(current, 1))}
              >
                <ChevronLeft size={19} />
              </button>
              <div>
                <strong>{format(monthCursor, "MMMM yyyy")}</strong>
                <small>{visibleMonthEvents.length} visible events</small>
              </div>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setMonthCursor((current) => addMonths(current, 1))}
              >
                <ChevronRight size={19} />
              </button>
            </div>
            <div className="public-month-weekdays" aria-hidden="true">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="public-month-grid">
              {days.map((day) => {
                const dayEvents = visibleMonthEvents.filter((event) =>
                  isSameDay(parseISO(event.date), day),
                );
                return (
                  <div
                    className={`public-month-day ${isSameMonth(day, monthCursor) ? "" : "outside"}`}
                    key={day.toISOString()}
                  >
                    <span>{format(day, "d")}</span>
                    <div>
                      {dayEvents.slice(0, 2).map((event) => (
                        <button
                          type="button"
                          className={`public-month-event ${categoryClass[event.category]}`}
                          onClick={() => openEvent(event)}
                          key={event.id}
                        >
                          {event.name}
                        </button>
                      ))}
                      {dayEvents.length > 2 ? <small>+{dayEvents.length - 2} more</small> : null}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="public-mobile-month-list">
              {visibleMonthEvents.length ? (
                visibleMonthEvents.map((event) => (
                  <EventAgendaRow event={event} onOpen={openEvent} key={event.id} />
                ))
              ) : (
                <CalendarEmpty onReset={resetFilters} />
              )}
            </div>
          </section>
        ) : null}

        {view === "agenda" ? (
          <section className="public-agenda-view" aria-label="Agenda calendar view">
            {filteredEvents.length ? (
              filteredEvents.map((event) => (
                <EventAgendaRow event={event} onOpen={openEvent} key={event.id} />
              ))
            ) : (
              <CalendarEmpty onReset={resetFilters} />
            )}
          </section>
        ) : null}

        {view === "journey" ? (
          <section className="public-journey-view" aria-label="Academic journey view">
            <div className="public-phase-filter">
              <button
                type="button"
                className={selectedPhase === "All phases" ? "active" : ""}
                onClick={() => setSelectedPhase("All phases")}
              >
                Full journey
              </button>
              {journeyPhases.map((phase) => (
                <button
                  type="button"
                  className={selectedPhase === phase ? "active" : ""}
                  onClick={() => setSelectedPhase(phase)}
                  key={phase}
                >
                  {phase}
                </button>
              ))}
            </div>
            <div className="public-journey-timeline">
              {journeyPhases.map((phase, index) => {
                const phaseEvents = filteredEvents.filter(
                  (event) => event.journeyPhase === phase,
                );
                if (!phaseEvents.length) return null;
                return (
                  <article className="public-journey-phase" key={phase}>
                    <div className="public-journey-phase-heading">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{phase}</h3>
                        <small>{phaseEvents.length} official milestones</small>
                      </div>
                    </div>
                    <div className="public-journey-events">
                      {phaseEvents.map((event) => (
                        <button type="button" onClick={() => openEvent(event)} key={event.id}>
                          <time dateTime={event.date}>{format(parseISO(event.date), "dd MMM")}</time>
                          <span>{event.name}</span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>

      <div className="public-calendar-legend" aria-label="Event category colours">
        {publicEventCategories.slice(1).map((item) => (
          <span key={item}>
            <i className={categoryClass[item as PublicEventCategory]} />
            {item}
          </span>
        ))}
      </div>

      {selectedEvent ? (
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onToast={toast}
        />
      ) : null}
    </div>
  );
}

function EventAgendaRow({
  event,
  onOpen,
}: {
  event: PublicCalendarEvent;
  onOpen: (event: PublicCalendarEvent) => void;
}) {
  const date = parseISO(event.date);
  return (
    <button type="button" className="public-agenda-row" onClick={() => onOpen(event)}>
      <time dateTime={event.date}>
        <span>{format(date, "MMM")}</span>
        <strong>{format(date, "dd")}</strong>
        <small>{format(date, "EEE")}</small>
      </time>
      <span className={`public-category-line ${categoryClass[event.category]}`} />
      <span className="public-agenda-row-copy">
        <span className={`public-category-chip ${categoryClass[event.category]}`}>
          {event.category}
        </span>
        <strong>{event.name}</strong>
        <small>{event.semester} · {event.institutions.length === 6 ? "All participating institutions" : event.institutions[0]}</small>
      </span>
      <EventStatus event={event} />
      <ChevronRight size={19} />
    </button>
  );
}

function CalendarEmpty({ onReset }: { onReset: () => void }) {
  return (
    <div className="public-calendar-empty">
      <span><Search size={24} /></span>
      <h3>No events match these filters.</h3>
      <p>Try another semester, institution or event type.</p>
      <button type="button" onClick={onReset}>Clear all filters</button>
    </div>
  );
}

function EventDetailDrawer({
  event,
  onClose,
  onToast,
}: {
  event: PublicCalendarEvent;
  onClose: () => void;
  onToast: (title: string, message: string) => void;
}) {
  return (
    <div className="public-drawer-layer">
      <button
        type="button"
        className="public-drawer-backdrop"
        aria-label="Close event details"
        onClick={onClose}
      />
      <aside
        className="public-event-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-event-drawer-title"
      >
        <div className={`public-event-drawer-accent ${categoryClass[event.category]}`} />
        <header>
          <div>
            <span className={`public-category-chip ${categoryClass[event.category]}`}>
              {event.category}
            </span>
            <h2 id="public-event-drawer-title">{event.name}</h2>
            <EventStatus event={event} />
          </div>
          <button type="button" aria-label="Close event details" onClick={onClose}>
            <X size={21} />
          </button>
        </header>

        <div className="public-event-date-hero">
          <CalendarDays size={22} />
          <div>
            <small>Official Council date</small>
            <strong>{format(parseISO(event.councilDate), "EEEE, dd MMMM yyyy")}</strong>
            {event.date !== event.councilDate ? (
              <span>Approved date: {format(parseISO(event.date), "dd MMMM yyyy")}</span>
            ) : null}
          </div>
        </div>

        <p className="public-event-summary">{event.summary}</p>

        <dl className="public-event-details">
          <div>
            <dt>Applicable programme</dt>
            <dd>{event.programme}</dd>
          </div>
          <div>
            <dt>Semester</dt>
            <dd>{event.semester}</dd>
          </div>
          <div>
            <dt>Applicable institutions</dt>
            <dd>
              <MapPin size={14} />
              {event.institutions.length === 6
                ? "All participating institutions"
                : event.institutions.join(", ")}
            </dd>
          </div>
          <div>
            <dt>Event category</dt>
            <dd>{event.category}</dd>
          </div>
          <div>
            <dt>Official version</dt>
            <dd>Version {event.officialVersion}</dd>
          </div>
          <div>
            <dt>Publication status</dt>
            <dd>{event.publicationStatus}</dd>
          </div>
          <div>
            <dt>Authority reference</dt>
            <dd>{event.authorityReference}</dd>
          </div>
        </dl>

        <div className="public-event-history">
          <div>
            <History size={17} />
            <strong>Approved revision history</strong>
          </div>
          <ul>
            {event.revisionHistory.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </div>

        <div className="public-event-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              onToast(
                "Added to calendar",
                `${event.name} has been prepared as a demonstration calendar reminder.`,
              )
            }
          >
            <CalendarDays size={17} /> Add to Calendar
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              onToast(
                "Event notice prepared",
                `The official notice for ${event.authorityReference} is ready as a demonstration download.`,
              )
            }
          >
            <FileDown size={17} /> Download Event Notice
          </button>
        </div>
        <footer>
          <Clock3 size={15} />
          Dates shown in Indian Standard Time
        </footer>
      </aside>
    </div>
  );
}
