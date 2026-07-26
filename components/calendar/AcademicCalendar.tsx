"use client";

import { format, parseISO } from "date-fns";
import {
  BellPlus,
  Bookmark,
  BookmarkCheck,
  CalendarRange,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { statewideEvents } from "@/lib/demo-data";
import { useDemoState } from "@/lib/demo-state";

const categories = ["All", "Academic", "Examination", "Governance", "Holiday"];

export function AcademicCalendar() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { bookmarkedEvents, toggleBookmark, toast } = useDemoState();

  const filteredEvents = useMemo(
    () =>
      statewideEvents.filter((event) => {
        const matchesCategory = category === "All" || event.category === category;
        const haystack = `${event.title} ${event.audience} ${event.owner}`.toLowerCase();
        return matchesCategory && haystack.includes(search.toLowerCase());
      }),
    [category, search],
  );

  return (
    <div className="calendar-surface">
      <div className="calendar-toolbar">
        <div className="search-field">
          <Search size={17} />
          <label className="sr-only" htmlFor="calendar-search">
            Search calendar
          </label>
          <input
            id="calendar-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dates, owners or audiences"
          />
        </div>
        <div className="calendar-tools">
          <label className="filter-select">
            <Filter size={16} />
            <span className="sr-only">Filter by category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button
            className="button button-secondary"
            onClick={() =>
              toast(
                "Calendar prepared",
                "A demonstration .ics export has been prepared for academic year 2026–27.",
              )
            }
          >
            <Download size={16} /> Export calendar
          </button>
        </div>
      </div>

      <div className="month-rail" aria-label="Academic year months">
        {["AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "APR", "MAY"].map(
          (month, index) => (
            <button
              key={month}
              className={index === 0 ? "active" : ""}
              onClick={() =>
                toast(
                  `${month} selected`,
                  index === 0
                    ? "The August agenda is already in view."
                    : "This prototype keeps the detailed agenda focused on August.",
                )
              }
            >
              <span>{month}</span>
              <small>{index < 5 ? "2026" : "2027"}</small>
            </button>
          ),
        )}
      </div>

      <div className="calendar-list-head">
        <div>
          <p className="eyebrow">Statewide agenda</p>
          <h2>{filteredEvents.length} coordinated milestones</h2>
        </div>
        <span className="legend-note">
          <CalendarRange size={16} /> Dates shown in Indian Standard Time
        </span>
      </div>

      {filteredEvents.length ? (
        <div className="agenda-list">
          {filteredEvents.map((event) => {
            const bookmarked = bookmarkedEvents.includes(event.id);
            return (
              <article className="agenda-item" key={event.id}>
                <div className="agenda-date">
                  <span>{format(parseISO(event.start), "MMM")}</span>
                  <strong>{format(parseISO(event.start), "dd")}</strong>
                  {event.end ? (
                    <small>to {format(parseISO(event.end), "dd MMM")}</small>
                  ) : (
                    <small>{format(parseISO(event.start), "EEE")}</small>
                  )}
                </div>
                <div className="agenda-copy">
                  <span className={`event-type ${event.category.toLowerCase()}`}>
                    {event.category}
                  </span>
                  <h3>{event.title}</h3>
                  <p>{event.audience}</p>
                  <span className="agenda-owner">{event.owner}</span>
                </div>
                <button
                  className={`bookmark-button ${bookmarked ? "saved" : ""}`}
                  onClick={() => toggleBookmark(event.id)}
                  aria-label={
                    bookmarked
                      ? `Remove reminder for ${event.title}`
                      : `Save reminder for ${event.title}`
                  }
                >
                  {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  <span>{bookmarked ? "Saved" : "Remind me"}</span>
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          onReset={() => {
            setCategory("All");
            setSearch("");
          }}
        />
      )}

      <div className="calendar-note">
        <BellPlus size={20} />
        <div>
          <strong>Institutional dates remain locally governed.</strong>
          <p>
            This calendar provides the statewide academic baseline. Approved
            institutional variations appear inside role-specific workspaces.
          </p>
        </div>
      </div>
    </div>
  );
}
