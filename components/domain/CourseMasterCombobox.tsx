"use client";

import {
  BookOpenCheck,
  Check,
  ChevronDown,
  GraduationCap,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { useDemoState } from "@/lib/demo-state";

export function CourseMasterCombobox({
  value,
  onChange,
  label = "Official HEC course",
  disabled = false,
}: {
  value: string | null;
  onChange: (courseMasterId: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const { courseMasters } = useDemoState();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const activeCourses = useMemo(
    () =>
      courseMasters
        .filter((course) => course.active)
        .filter((course) =>
          `${course.courseName} ${course.shortName} ${course.courseCode}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => a.courseName.localeCompare(b.courseName)),
    [courseMasters, query],
  );
  const selected = courseMasters.find((course) => course.id === value) ?? null;

  return (
    <div className="course-master-combobox">
      <label>{label}</label>
      <button
        type="button"
        className="course-combobox-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <GraduationCap size={17} aria-hidden="true" />
        <span>
          <strong>{selected?.courseName ?? "Select an active HEC course"}</strong>
          <small>
            {selected
              ? `${selected.courseCode} · ${selected.discipline}`
              : "Search the authoritative course catalogue"}
          </small>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div className="course-combobox-popover">
          <label className="course-combobox-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Search active HEC courses</span>
            <input
              autoFocus
              value={query}
              placeholder="Search name, short name or code"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            />
          </label>
          <div className="course-combobox-options" role="listbox">
            {activeCourses.map((course) => (
              <button
                type="button"
                role="option"
                aria-selected={course.id === value}
                key={course.id}
                onClick={() => {
                  onChange(course.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <span>
                  <strong>{course.courseName}</strong>
                  <small>
                    {course.courseCode} · {course.discipline} · {course.durationYears}{" "}
                    years
                  </small>
                </span>
                {course.id === value ? <Check size={16} aria-hidden="true" /> : null}
              </button>
            ))}
            {activeCourses.length === 0 ? (
              <div className="course-combobox-empty">
                No active official courses match this search.
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="course-combobox-help"
            onClick={() => {
              setOpen(false);
              setHelpOpen(true);
            }}
          >
            Course not listed? Submit a request to HEC master-data administration.
          </button>
        </div>
      ) : null}

      <Modal
        open={helpOpen}
        title="Course Master request"
        onClose={() => setHelpOpen(false)}
      >
        <div className="modal-body course-request-copy">
          <BookOpenCheck size={27} aria-hidden="true" />
          <div>
            <strong>University users cannot create custom course names.</strong>
            <p>
              Send the proposed course name, qualification, duration and approval
              reference to HEC master-data administration. The course can be selected
              here only after HEC activates the official master record.
            </p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="button button-primary" onClick={() => setHelpOpen(false)}>
            Understood
          </button>
        </div>
      </Modal>
    </div>
  );
}
