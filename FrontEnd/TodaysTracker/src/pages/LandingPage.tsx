import logoSrc from "../assets/todays-tracker-logo.png";
import { Footer } from "../components/Footer/Footer";

type LandingPageProps = {
  onGetStarted: () => void;
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing">
      {/* Hero */}
      <header className="landing__hero">
        <img src={logoSrc} alt="Daily Os" className="landing__logo" />
        <h1 className="landing__title">Daily Os</h1>
        <p className="landing__subtitle">
          Track your shifts, earnings &amp; expenses — all in one place.
        </p>
        <button
          className="btn btn--primary landing__cta"
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </header>

      {/* Features */}
      <section className="landing__features">
        <div className="landing__feature">
          <div className="landing__feature-icon">
            <svg
              width="28"
              height="28"
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
          <h3 className="landing__feature-title">Shift Tracking</h3>
          <p className="landing__feature-desc">
            Log hourly and flat-rate shifts with start/end times, tips, and
            automatic pay calculation.
          </p>
        </div>

        <div className="landing__feature">
          <div className="landing__feature-icon">
            <svg
              width="28"
              height="28"
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
          <h3 className="landing__feature-title">Expense Management</h3>
          <p className="landing__feature-desc">
            Keep track of daily expenses and see your net earnings at a glance.
          </p>
        </div>

        <div className="landing__feature">
          <div className="landing__feature-icon">
            <svg
              width="28"
              height="28"
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
          <h3 className="landing__feature-title">Dashboard</h3>
          <p className="landing__feature-desc">
            Weekly and monthly summaries with stats cards so you always know
            where you stand.
          </p>
        </div>

        <div className="landing__feature">
          <div className="landing__feature-icon">
            <svg
              width="28"
              height="28"
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
          <h3 className="landing__feature-title">Gym Tracker</h3>
          <p className="landing__feature-desc">
            Log your workouts, track sets &amp; reps, and build your training
            program.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
