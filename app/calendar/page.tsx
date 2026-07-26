import type { Metadata } from "next";
import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Public Academic Calendar",
  description:
    "Search official FYUGP class dates, assessments, examinations, valuation periods, results and approved revisions.",
};

export default function CalendarPage() {
  return (
    <PublicShell>
      <section className="public-calendar-hero">
        <div>
          <p className="portal-section-kicker">
            Kerala higher education · FYUGP 2026–27
          </p>
          <h1>Your academic year, in one clear view.</h1>
          <p>
            Search official academic events, focus on your institution, and open
            any date for its complete publication details.
          </p>
        </div>
        <div className="public-calendar-hero-note">
          <span>PUBLIC CALENDAR</span>
          <strong>Official dates and approved revisions</strong>
          <small>Updated 26 July 2026</small>
        </div>
      </section>
      <section className="public-calendar-page-body">
        <AcademicCalendar />
      </section>
    </PublicShell>
  );
}
