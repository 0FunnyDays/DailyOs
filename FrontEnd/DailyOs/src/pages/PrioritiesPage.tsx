import { useState } from "react";
import type { DayData, Page } from "../types";
import { PageGuideModal, usePageGuide } from "../components/PageGuideModal/PageGuideModal";

type PrioritiesMetaUpdates = Partial<Pick<DayData, "focusTask" | "topPriorities" | "mustDo">>;

type PrioritiesPageProps = {
  userId: string;
  day: DayData;
  onUpdateDayMeta: (updates: PrioritiesMetaUpdates) => void;
  onNavigate: (page: Page) => void;
};

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

const PRIORITIES_GUIDE_STEPS = [
  {
    title: "Main task",
    text: "Pick the one thing that matters most today. This keeps your focus sharp when distractions pile up.",
  },
  {
    title: "Top 3 priorities",
    text: "Add up to three priorities for the day. These sit below your main task and help you stay on track.",
  },
  {
    title: "Non-negotiable",
    text: "\"If nothing else, do this\" — your fallback task. Even on a bad day, this one gets done.",
  },
];

export function PrioritiesPage({
  userId,
  day,
  onUpdateDayMeta,
  onNavigate,
}: PrioritiesPageProps) {
  const guide = usePageGuide(userId, "priorities");
  const [newPriorityName, setNewPriorityName] = useState("");
  const focusTask = day.focusTask ?? "";
  const mustDo = day.mustDo ?? "";
  const priorities = (day.topPriorities ?? []).slice(0, 3);

  function savePriorities(nextValues: string[]) {
    const cleaned = nextValues
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .slice(0, 3);
    onUpdateDayMeta({ topPriorities: cleaned.length > 0 ? cleaned : undefined });
  }

  function updatePriority(index: number, value: string) {
    const next = [...priorities];
    next[index] = value;
    onUpdateDayMeta({ topPriorities: next });
  }

  function blurPriority(index: number) {
    const next = [...priorities];
    if (index >= next.length) return;
    next[index] = next[index].trim();
    savePriorities(next);
  }

  function removePriority(index: number) {
    const next = priorities.filter((_, i) => i !== index);
    savePriorities(next);
  }

  function addPriority() {
    const trimmed = newPriorityName.trim();
    if (!trimmed || priorities.length >= 3) return;
    savePriorities([...priorities, trimmed]);
    setNewPriorityName("");
  }

  return (
    <section className="page-renderer__section">
      <PageGuideModal
        userId={userId}
        pageKey="priorities"
        title="Priorities"
        description="Set the day before it gets noisy: one main focus, top three priorities, and one non-negotiable."
        steps={PRIORITIES_GUIDE_STEPS}
        isOpen={guide.isOpen}
        onClose={guide.dismiss}
      />
      <div className="home__section-head">
        <h1 className="page-renderer__title" style={{ marginBottom: 0 }}>Priorities</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="home__section-kicker">{day.date}</span>
          <button type="button" className="page-guide-trigger" onClick={guide.reopen}>
            <span className="page-guide-trigger__icon" aria-hidden="true">?</span>
            How it works
          </button>
        </div>
      </div>

      <p className="page-renderer__subtitle" style={{ marginBottom: 0 }}>
        Set the day before it gets noisy: one main focus, top three priorities, and one non-negotiable.
      </p>

      <div className="home__panel home__focus-panel" style={{ marginTop: 16 }}>
        <div className="home__panel-head">
          <span className="home__panel-title">Today&apos;s Focus</span>
          <span className="home__panel-badge">
            {priorities.filter((p) => hasText(p)).length}/3 priorities
          </span>
        </div>

        <label className="home__field">
          <span className="home__field-label">Main task</span>
          <input
            className="home__field-input home__field-input--focus"
            type="text"
            maxLength={140}
            placeholder="One thing that matters most today"
            value={focusTask}
            onChange={(e) =>
              onUpdateDayMeta({
                focusTask: e.target.value || undefined,
              })
            }
          />
        </label>

        <div className="home__field">
          <span className="home__field-label">Top priorities (up to 3)</span>

          <div className="home__priority-list">
            {priorities.length === 0 ? (
              <p className="home__panel-subtle home__priority-empty">
                No priorities yet. Add the first one below.
              </p>
            ) : (
              priorities.map((priority, index) => (
                <div key={index} className="home__priority-row home__priority-row--editable">
                  <span className="home__priority-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <input
                    className="home__field-input home__priority-input"
                    type="text"
                    maxLength={120}
                    placeholder={`Priority ${index + 1}`}
                    value={priority}
                    onChange={(e) => updatePriority(index, e.target.value)}
                    onBlur={() => blurPriority(index)}
                  />
                  <button
                    type="button"
                    className="home__priority-remove"
                    onClick={() => removePriority(index)}
                    aria-label={`Remove priority ${index + 1}`}
                    title="Remove priority"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          <form
            className="home__priority-add"
            onSubmit={(e) => {
              e.preventDefault();
              addPriority();
            }}
          >
            <input
              className="home__field-input home__priority-input"
              type="text"
              maxLength={120}
              placeholder={
                priorities.length >= 3 ? "You already have 3 priorities" : "Add priority name"
              }
              value={newPriorityName}
              onChange={(e) => setNewPriorityName(e.target.value)}
              disabled={priorities.length >= 3}
              aria-label="New priority name"
            />
            <button
              type="submit"
              className="home__ghost-btn"
              disabled={priorities.length >= 3 || !hasText(newPriorityName)}
            >
              Add Priority
            </button>
          </form>
        </div>

        <label className="home__field home__field--mustdo">
          <span className="home__field-label">If nothing else, do this</span>
          <input
            className="home__field-input home__field-input--mustdo"
            type="text"
            maxLength={140}
            placeholder="Your non-negotiable task"
            value={mustDo}
            onChange={(e) =>
              onUpdateDayMeta({
                mustDo: e.target.value || undefined,
              })
            }
          />
        </label>

        <div className="home__focus-actions">
          <button type="button" className="home__ghost-btn" onClick={() => onNavigate("home")}>
            Back to Home
          </button>
          <button type="button" className="home__ghost-btn" onClick={() => onNavigate("today")}>
            Open Work
          </button>
          <button type="button" className="home__ghost-btn" onClick={() => onNavigate("projects")}>
            Open Projects
          </button>
        </div>
      </div>
    </section>
  );
}
