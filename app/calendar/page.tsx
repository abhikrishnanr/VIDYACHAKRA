import type { Metadata } from "next";
import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "State Academic Calendar",
  description:
    "Explore the shared academic and examination milestones for Kerala higher education.",
};

export default function CalendarPage() {
  return (
    <PublicShell>
      <section className="public-page-hero calendar-page-hero">
        <div>
          <p className="eyebrow">State academic baseline · 2026–27</p>
          <h1>A shared view of the academic year</h1>
          <p>
            Explore coordinated teaching, assessment, examination and governance
            milestones across Kerala&apos;s participating higher education institutions.
          </p>
        </div>
        <div className="calendar-hero-seal">
          <span>VERSION</span>
          <strong>1.4</strong>
          <small>Published 26 Jul 2026</small>
        </div>
      </section>
      <section className="calendar-page-body">
        <AcademicCalendar />
      </section>
    </PublicShell>
  );
}
