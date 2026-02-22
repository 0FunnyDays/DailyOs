type LandingPageProps = {
  onGetStarted: () => void;
  onLoginClick: () => void;
};

export function LandingPage({
  onGetStarted,
  onLoginClick,
}: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-page__stage">
        <div className="landing-page__content">
          <section className="login-hero" aria-labelledby="auth-hero-title">
            <div className="login-hero__brand">
              <div>
                <p className="login-hero__eyebrow">Daily Os</p>
                <h1 id="auth-hero-title" className="login-hero__title">
                  Track work, money, and training in one place.
                </h1>
              </div>
            </div>

            <p className="login-hero__subtitle">
              Shift tracking, expenses, dashboard insights, and gym sessions in a
              single workflow. Start with an account and continue from the same
              page.
            </p>

            <div className="login-hero__actions">
              <button
                type="button"
                className="btn btn--primary login-hero__cta"
                onClick={onGetStarted}
              >
                Get Started
              </button>
              <button
                type="button"
                className="btn btn--ghost login-hero__cta-alt"
                onClick={onLoginClick}
              >
                I already have an account
              </button>
            </div>

            <div className="login-hero__features" aria-label="App features">
              <article className="login-hero__feature">
                <div className="login-hero__feature-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="login-hero__feature-title">Shift Tracking</h3>
                <p className="login-hero__feature-desc">
                  Hours, flat shifts, tips, and automatic pay totals.
                </p>
              </article>

              <article className="login-hero__feature">
                <div className="login-hero__feature-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h3 className="login-hero__feature-title">Expenses</h3>
                <p className="login-hero__feature-desc">
                  Track daily expenses and see net earnings clearly.
                </p>
              </article>

              <article className="login-hero__feature">
                <div className="login-hero__feature-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <line x1="2" y1="20" x2="22" y2="20" />
                  </svg>
                </div>
                <h3 className="login-hero__feature-title">Dashboard</h3>
                <p className="login-hero__feature-desc">
                  Period summaries with charts for work and gym data.
                </p>
              </article>

              <article className="login-hero__feature">
                <div className="login-hero__feature-icon" aria-hidden="true">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6.5 6.5h11" />
                    <path d="M6.5 17.5h11" />
                    <path d="M3 9.5v5" />
                    <path d="M21 9.5v5" />
                    <path d="M1 11v2" />
                    <path d="M23 11v2" />
                  </svg>
                </div>
                <h3 className="login-hero__feature-title">Gym Tracker</h3>
                <p className="login-hero__feature-desc">
                  Sessions, sets, reps, and program planning in one flow.
                </p>
              </article>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
