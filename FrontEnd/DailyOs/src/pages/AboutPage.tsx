import type { Page } from "../types";
import "../styles/AboutPage.css";

type AboutPageProps = {
  onNavigate: (page: Page) => void;
};

const FEATURES = [
  {
    title: "Daily planning",
    text: "Track priorities, must-do tasks, focus, and quick notes so each day starts with a clear plan.",
  },
  {
    title: "Work tracking",
    text: "Log shifts, expenses, tips, and saved jobs (hourly or flat) to see what you earned and what you spent.",
  },
  {
    title: "Gym + recovery",
    text: "Keep a simple workout log and combine it with sleep/recovery notes so progress is easier to review.",
  },
  {
    title: "Projects + dashboard",
    text: "Organize ongoing projects and use the dashboard to spot trends in work, sleep, and consistency.",
  },
];

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="page about-page">
      <div className="page__header about-page__header">
        <div className="about-page__hero">
          <p className="about-page__eyebrow">About</p>
          <h1 className="page__title about-page__title">What Daily Os Is For</h1>
          <p className="about-page__lead">
            Daily Os is a personal life/work tracker that helps you manage your day,
            record your shifts, track habits like gym and sleep, and review your progress
            in one place.
          </p>
        </div>
      </div>

      <div className="page__content about-page__content">
        <section className="about-page__panel about-page__panel--intro" aria-labelledby="about-why-title">
          <div className="about-page__panel-head">
            <h2 id="about-why-title" className="about-page__panel-title">Why it is useful</h2>
          </div>
          <div className="about-page__chips" aria-label="Key benefits">
            <span className="about-page__chip">One place for daily life</span>
            <span className="about-page__chip">Track work + earnings</span>
            <span className="about-page__chip">Build consistency</span>
            <span className="about-page__chip">Review progress over time</span>
          </div>
          <p className="about-page__text">
            Instead of using separate notes, spreadsheets, and apps, you can keep your
            daily planning, shift logging, and habit tracking together. This makes it
            easier to understand what is working and what needs adjustment.
          </p>
        </section>

        <section className="about-page__grid" aria-label="Main features">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="about-page__card">
              <h3 className="about-page__card-title">{feature.title}</h3>
              <p className="about-page__card-text">{feature.text}</p>
            </article>
          ))}
        </section>

        <section className="about-page__panel" aria-labelledby="about-how-title">
          <div className="about-page__panel-head">
            <h2 id="about-how-title" className="about-page__panel-title">Typical use flow</h2>
          </div>
          <ol className="about-page__steps">
            <li className="about-page__step">
              Set up your work jobs and gym program in Settings.
            </li>
            <li className="about-page__step">
              Use Home/Priorities to plan your day, then log shifts and expenses in Work.
            </li>
            <li className="about-page__step">
              Review sleep, gym, and dashboard trends to improve routine and consistency.
            </li>
          </ol>
        </section>

        <section className="about-page__panel" aria-labelledby="about-data-title">
          <div className="about-page__panel-head">
            <h2 id="about-data-title" className="about-page__panel-title">Data and privacy (current website)</h2>
          </div>
          <p className="about-page__text">
            Your data is currently stored in your browser on this device (local storage).
            That means it is fast and simple for personal use, but you should still keep
            backups if the data becomes important.
          </p>
        </section>

        <div className="about-page__actions">
          <button type="button" className="about-page__action about-page__action--primary" onClick={() => onNavigate("home")}>
            Go Home
          </button>
          <button type="button" className="about-page__action" onClick={() => onNavigate("settings-work")}>
            Open Work Settings
          </button>
          <button type="button" className="about-page__action" onClick={() => onNavigate("today")}>
            Open Work Page
          </button>
        </div>
      </div>
    </div>
  );
}
