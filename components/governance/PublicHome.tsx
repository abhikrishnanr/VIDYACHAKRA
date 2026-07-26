import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";

const journey = [
  "Plan",
  "Align",
  "Publish",
  "Teach",
  "Assess",
  "Examine",
  "Report",
  "Improve",
];

export function PublicHome() {
  return (
    <PublicShell>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <Sparkles size={15} />
            Kerala Higher Education Academic &amp; Examination Calendar
          </div>
          <h1>
            One State.
            <br />
            <em>One Academic Rhythm.</em>
          </h1>
          <p className="hero-lede">
            VIDYACHAKRA brings academic planning, examination windows and
            institutional coordination into one trusted statewide calendar.
          </p>
          <div className="hero-actions">
            <Link href="/calendar" className="button button-primary">
              Explore the state calendar <ArrowRight size={17} />
            </Link>
            <Link href="/login" className="button button-secondary">
              Enter the prototype
            </Link>
          </div>
          <div className="hero-trust">
            <span>
              <CheckCircle2 size={16} /> Shared milestones
            </span>
            <span>
              <CheckCircle2 size={16} /> Transparent coordination
            </span>
            <span>
              <CheckCircle2 size={16} /> Accountable timelines
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-label="Kerala academic campus illustration">
          <div className="hero-visual-label">
            <span>ACADEMIC YEAR</span>
            <strong>2026–27</strong>
          </div>
          <Image
            src="/brand/kerala-academic-landscape.svg"
            alt="Students walking through a green Kerala university campus in soft monsoon daylight"
            width={1200}
            height={760}
          />
          <div className="hero-date-card">
            <span className="date-card-icon">
              <CalendarCheck2 size={18} />
            </span>
            <div>
              <small>Next shared milestone</small>
              <strong>Odd semester begins · 03 August</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="rhythm-strip" aria-label="The eight-stage academic journey">
        <div className="section-intro compact">
          <p className="eyebrow">The academic cycle</p>
          <h2>Eight stages, one continuous journey</h2>
        </div>
        <div className="journey-rail">
          {journey.map((item, index) => (
            <div className="journey-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="platform-section" id="governance">
        <div className="section-intro">
          <p className="eyebrow">A common coordination layer</p>
          <h2>Clarity from council to campus</h2>
          <p>
            A shared source of truth helps every participating institution plan
            locally while remaining aligned to statewide academic priorities.
          </p>
        </div>
        <div className="platform-grid">
          <article className="feature-panel feature-panel-lead">
            <span className="feature-icon">
              <Network size={23} />
            </span>
            <div>
              <p className="eyebrow">Statewide alignment</p>
              <h3>Coordinate the moments that matter</h3>
              <p>
                Publish academic baselines, manage justified variations and
                follow execution without losing the institutional context.
              </p>
            </div>
            <div className="alignment-visual" aria-hidden="true">
              <span className="alignment-core">VC</span>
              <span className="node node-one">HEC</span>
              <span className="node node-two">UNI</span>
              <span className="node node-three">COL</span>
              <span className="node node-four">EXM</span>
            </div>
          </article>
          <article className="feature-panel">
            <span className="feature-icon gold">
              <CalendarCheck2 size={22} />
            </span>
            <div>
              <p className="eyebrow">Calendar integrity</p>
              <h3>A dependable academic baseline</h3>
              <p>
                Keep teaching days, assessment windows and examination cycles
                legible in one calm, human-centred view.
              </p>
            </div>
          </article>
          <article className="feature-panel">
            <span className="feature-icon green">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="eyebrow">Responsible governance</p>
              <h3>Decisions with a visible trail</h3>
              <p>
                Trace submissions, approvals and revisions so academic
                coordination remains explainable and accountable.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="public-calendar-preview">
        <div className="preview-heading">
          <div>
            <p className="eyebrow">August 2026</p>
            <h2>The month at a glance</h2>
          </div>
          <Link href="/calendar" className="text-link">
            Open full calendar <ArrowRight size={16} />
          </Link>
        </div>
        <div className="preview-timeline">
          <div className="preview-event">
            <div className="preview-date">
              <span>AUG</span>
              <strong>03</strong>
            </div>
            <div>
              <span className="event-type academic">Academic</span>
              <h3>Odd semester instruction begins</h3>
              <p>Common baseline for undergraduate institutions.</p>
            </div>
          </div>
          <div className="preview-event">
            <div className="preview-date">
              <span>AUG</span>
              <strong>14</strong>
            </div>
            <div>
              <span className="event-type governance">Governance</span>
              <h3>First-year enrolment data freeze</h3>
              <p>University nodal officers confirm institutional returns.</p>
            </div>
          </div>
          <div className="preview-event">
            <div className="preview-date">
              <span>AUG</span>
              <strong>24</strong>
            </div>
            <div>
              <span className="event-type holiday">Holiday</span>
              <h3>Onam academic recess</h3>
              <p>Statewide recess through 01 September.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-cta">
        <Image
          src="/brand/kerala-pattern.svg"
          alt=""
          aria-hidden="true"
          width={720}
          height={160}
        />
        <div>
          <p className="eyebrow">Built for shared stewardship</p>
          <h2>A calmer way to keep Kerala&apos;s academic year in motion.</h2>
        </div>
        <Link href="/login" className="button button-light">
          Choose a demonstration role <ArrowRight size={17} />
        </Link>
      </section>
    </PublicShell>
  );
}
