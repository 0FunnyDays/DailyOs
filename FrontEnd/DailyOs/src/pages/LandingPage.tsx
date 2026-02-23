type LandingPageProps = {
  onGetStarted: () => void;
  onLoginClick: () => void;
  exiting?: boolean;
};

export function LandingPage({
  onGetStarted,
  onLoginClick,
  exiting,
}: LandingPageProps) {
  return (
    <div className={`landing-page${exiting ? " landing-page--exiting" : ""}`}>
      <div className="landing-page__stage">
        <div className="landing-page__content">
          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="landing-hero" aria-labelledby="hero-title">
            <p className="landing-hero__eyebrow">Daily Os</p>
            <h1 id="hero-title" className="landing-hero__title">
              Plan better days. Track work, recovery
              <br />
              <span className="landing-hero__title--accent">and progress in one place.</span>
            </h1>
            <p className="landing-hero__subtitle">
              Daily planning, shift logs, expenses, sleep tracking, gym sessions,
              and project progress in one simple workflow. Create an account and
              pick up where you left off.
            </p>

            <div className="landing-hero__actions">
              <button
                type="button"
                className="btn btn--primary landing-hero__cta"
                onClick={onGetStarted}
              >
                Get Started
              </button>
              <button
                type="button"
                className="btn btn--ghost landing-hero__cta"
                onClick={onLoginClick}
              >
                Sign in
              </button>
            </div>
          </section>

          {/* ── Feature grid ──────────────────────────────────── */}
          <div className="landing-features" aria-label="Features">
            {FEATURES.map((f) => (
              <article key={f.title} className="landing-feature">
                <div className="landing-feature__icon" aria-hidden="true">
                  {f.icon}
                </div>
                <div className="landing-feature__text">
                  <h3 className="landing-feature__title">{f.title}</h3>
                  <p className="landing-feature__desc">{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature data ─────────────────────────────────────────── */

const ICO = {
  width: 22,
  height: 22,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FEATURES = [
  {
    title: "Shift Tracking",
    desc: "Hours, flat shifts, tips, and automatic pay totals.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Expenses",
    desc: "Track daily expenses and see net earnings clearly.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Dashboard",
    desc: "Period summaries and charts to review your progress and trends over time.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  },
  {
    title: "Projects",
    desc: "Track active projects, next steps, and daily progress notes.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Sleep Tracker",
    desc: "Log sleep hours, quality, and recovery to support your day.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
    ),
  },
  {
    title: "Gym Tracker",
    desc: "Sessions, sets, reps, and program planning in one flow.",
    icon: (
      <svg {...ICO} viewBox="0 0 24 24">
        <path d="M6.5 6.5h11" />
        <path d="M6.5 17.5h11" />
        <path d="M3 9.5v5" />
        <path d="M21 9.5v5" />
        <path d="M1 11v2" />
        <path d="M23 11v2" />
      </svg>
    ),
  },
];
