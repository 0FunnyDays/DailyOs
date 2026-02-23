import type { Page } from "../types";
import "../styles/PrivacyPage.css";

type PrivacyPageProps = {
  onNavigate: (page: Page) => void;
};

export function PrivacyPage({ onNavigate }: PrivacyPageProps) {
  return (
    <div className="page privacy-page">
      <div className="page__header privacy-page__header">
        <div className="privacy-page__hero">
          <p className="privacy-page__eyebrow">Privacy</p>
          <h1 className="page__title privacy-page__title">How Your Data Is Stored (For Now)</h1>
          <p className="privacy-page__lead">
            Daily Os currently stores your data locally in your browser on your device.
            This is a local-first setup for now and there is no cloud sync yet.
          </p>
        </div>
      </div>

      <div className="page__content privacy-page__content">
        <section className="privacy-page__panel" aria-labelledby="privacy-storage-title">
          <h2 id="privacy-storage-title" className="privacy-page__panel-title">What this means</h2>
          <ul className="privacy-page__list">
            <li className="privacy-page__list-item">
              Your data is saved locally in the browser (on this device/browser profile).
            </li>
            <li className="privacy-page__list-item">
              If you open the website from another device, your data will not be available there.
            </li>
            <li className="privacy-page__list-item">
              If you clear browser storage/data, you may lose your saved website data.
            </li>
            <li className="privacy-page__list-item">
              Browser private/incognito mode may not keep data after the session ends.
            </li>
          </ul>
        </section>

        <section className="privacy-page__panel privacy-page__panel--accent" aria-labelledby="privacy-open-source-title">
          <h2 id="privacy-open-source-title" className="privacy-page__panel-title">Open source</h2>
          <p className="privacy-page__text">
            The code for this project is open source and available on GitHub:
          </p>
          <a
            className="privacy-page__link"
            href="https://github.com/0FunnyDays/DailyOs"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/0FunnyDays/DailyOs
          </a>
          <p className="privacy-page__text">
            Feel free to change it however you like or send me improvement ideas.
          </p>
        </section>

        <section className="privacy-page__panel" aria-labelledby="privacy-future-title">
          <h2 id="privacy-future-title" className="privacy-page__panel-title">Future direction</h2>
          <p className="privacy-page__text">
            A future version could add optional account sync / backup across devices, but
            the current version is designed for simple personal use with local browser storage.
          </p>
        </section>

        <div className="privacy-page__actions">
          <button
            type="button"
            className="privacy-page__action privacy-page__action--primary"
            onClick={() => onNavigate("home")}
          >
            Go Home
          </button>
          <button
            type="button"
            className="privacy-page__action"
            onClick={() => onNavigate("about")}
          >
            About Daily Os
          </button>
        </div>
      </div>
    </div>
  );
}
