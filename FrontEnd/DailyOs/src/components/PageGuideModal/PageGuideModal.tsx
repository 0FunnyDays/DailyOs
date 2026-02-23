import { createPortal } from "react-dom";
import { useLocalStorage } from "../../hooks/useLocalStorage";

type GuideStep = {
  title: string;
  text: string;
};

type PageGuideModalProps = {
  userId: string;
  pageKey: string;
  title: string;
  description: string;
  steps: GuideStep[];
  isOpen: boolean;
  onClose: () => void;
};

export function PageGuideModal({
  title,
  description,
  steps,
  isOpen,
  onClose,
}: PageGuideModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="page-guide-modal-backdrop" role="presentation">
      <section
        className="page-guide-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="page-guide-modal-title"
      >
        <div className="page-guide-modal__head">
          <div className="home__onboarding-kicker">How it works</div>
          <h2 id="page-guide-modal-title" className="page-guide-modal__title">
            {title}
          </h2>
          <p className="page-guide-modal__desc">{description}</p>
        </div>

        <div className="page-guide-modal__steps">
          {steps.map((step, index) => (
            <div key={index} className="home__onboarding-guide-card">
              <span className="home__onboarding-guide-card-index">{index + 1}</span>
              <div className="home__onboarding-guide-card-copy">
                <div className="home__onboarding-guide-card-title">{step.title}</div>
                <p className="home__onboarding-guide-card-text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="page-guide-modal__actions">
          <button
            type="button"
            className="home__next-step-btn"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function usePageGuide(userId: string, pageKey: string) {
  const [seen, setSeen] = useLocalStorage<boolean>(
    `dailyos_page_guide_${pageKey}_${userId}`,
    false,
  );

  const isOpen = !seen;

  function dismiss() {
    setSeen(true);
  }

  function reopen() {
    setSeen(false);
  }

  return { isOpen, dismiss, reopen };
}
