import type { Page } from "../types";
import "../styles/ContactPage.css";

type ContactPageProps = {
  onNavigate: (page: Page) => void;
};

export function ContactPage({ onNavigate }: ContactPageProps) {
  return (
    <div className="page contact-page">
      <div className="page__header contact-page__header">
        <div className="contact-page__hero">
          <p className="contact-page__eyebrow">Contact</p>
          <h1 className="page__title contact-page__title">Get in Touch</h1>
          <p className="contact-page__lead">
            If you have feedback, improvement ideas, or want to share changes you made,
            feel free to reach out.
          </p>
        </div>
      </div>

      <div className="page__content contact-page__content">
        <section className="contact-page__panel" aria-labelledby="contact-direct-title">
          <h2 id="contact-direct-title" className="contact-page__panel-title">Direct contact</h2>

          <div className="contact-page__links">
            <a
              className="contact-page__link contact-page__link--email"
              href="mailto:dritan_douka@outlook.com"
            >
              <span className="contact-page__link-label">Email</span>
              <span className="contact-page__link-value">dritan_douka@outlook.com</span>
            </a>

            <a
              className="contact-page__link contact-page__link--instagram"
              href="https://www.instagram.com/driiitann/"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-page__link-label">Instagram</span>
              <span className="contact-page__link-value">@driiitann</span>
            </a>
          </div>
        </section>

        <section className="contact-page__panel contact-page__panel--soft" aria-labelledby="contact-note-title">
          <h2 id="contact-note-title" className="contact-page__panel-title">What to send</h2>
          <ul className="contact-page__list">
            <li className="contact-page__list-item">Bug reports or things that feel confusing on the website</li>
            <li className="contact-page__list-item">UI/UX improvement ideas</li>
            <li className="contact-page__list-item">Feature suggestions (work, gym, sleep, dashboard, etc.)</li>
            <li className="contact-page__list-item">Your own custom version ideas / improvements</li>
          </ul>
          <p className="contact-page__text">
            Feel free to change the project however you like and send improvement ideas.
          </p>
        </section>

        <div className="contact-page__actions">
          <button
            type="button"
            className="contact-page__action contact-page__action--primary"
            onClick={() => onNavigate("home")}
          >
            Go Home
          </button>
          <button
            type="button"
            className="contact-page__action"
            onClick={() => onNavigate("about")}
          >
            About
          </button>
          <button
            type="button"
            className="contact-page__action"
            onClick={() => onNavigate("privacy")}
          >
            Privacy
          </button>
        </div>
      </div>
    </div>
  );
}
