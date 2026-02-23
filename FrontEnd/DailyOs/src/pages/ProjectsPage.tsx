import { useState } from "react";
import type { Project } from "../types";
import { PageGuideModal, usePageGuide } from "../components/PageGuideModal/PageGuideModal";

type ProjectsPageProps = {
  userId: string;
  projects: Project[];
  currentDate: string;
  onAddProject: (name: string) => void;
  onUpdateProject: (projectId: string, updates: Partial<Pick<Project, "name">>) => void;
  onSetProjectDailyNote: (projectId: string, date: string, note: string) => void;
  onSetProjectFinished: (projectId: string, isFinished: boolean) => void;
};

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function formatIsoDate(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDayKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

type ProjectCardProps = {
  project: Project;
  currentDate: string;
  onSetProjectDailyNote: (projectId: string, date: string, note: string) => void;
  onSetProjectFinished: (projectId: string, isFinished: boolean) => void;
};

function ProjectCard({
  project,
  currentDate,
  onSetProjectDailyNote,
  onSetProjectFinished,
}: ProjectCardProps) {
  const todayNote = project.dailyNotes?.[currentDate] ?? "";
  const historyEntries = Object.entries(project.dailyNotes ?? {})
    .filter(([, note]) => hasText(note))
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .slice(0, 5);

  return (
    <article className={`projects-page__card${project.isFinished ? " projects-page__card--finished" : ""}`}>
      <div className="projects-page__card-head">
        <div className="projects-page__title-wrap">
          <h3 className="projects-page__project-title">{project.name}</h3>
          <div className="projects-page__meta">
            <span className={`projects-page__status${project.isFinished ? " projects-page__status--done" : ""}`}>
              {project.isFinished ? "Finished" : "Active"}
            </span>
            <span className="projects-page__meta-text">
              Created {formatIsoDate(project.createdAt)}
            </span>
            {project.isFinished && (
              <span className="projects-page__meta-text">
                Finished {formatIsoDate(project.finishedAt)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`projects-page__action-btn${
            project.isFinished ? " projects-page__action-btn--reopen" : " projects-page__action-btn--finish"
          }`}
          onClick={() => onSetProjectFinished(project.id, !project.isFinished)}
        >
          {project.isFinished ? "Reopen Project" : "Finish Project"}
        </button>
      </div>

      <div className="projects-page__body-grid">
        <label className="home__field">
          <span className="home__field-label">What I did today ({currentDate})</span>
          <textarea
            className="projects-page__note-input"
            rows={4}
            placeholder={
              project.isFinished
                ? "Project is finished. Reopen it if you need to add/update work notes."
                : "Free text: what you worked on today for this project..."
            }
            value={todayNote}
            disabled={project.isFinished}
            onChange={(e) => onSetProjectDailyNote(project.id, currentDate, e.target.value)}
          />
        </label>

        <div className="projects-page__history">
          <div className="projects-page__history-head">
            <span className="home__field-label">Recent updates</span>
            <span className="projects-page__history-count">{historyEntries.length}</span>
          </div>

          {historyEntries.length === 0 ? (
            <p className="projects-page__empty-text">No notes yet for this project.</p>
          ) : (
            <div className="projects-page__history-list">
              {historyEntries.map(([dateKey, note]) => (
                <div key={dateKey} className="projects-page__history-item">
                  <span className="projects-page__history-date">{formatDayKey(dateKey)}</span>
                  <p className="projects-page__history-note">{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

const PROJECTS_GUIDE_STEPS = [
  {
    title: "Create a project",
    text: "Give your project a name (e.g. \"Portfolio website\", \"Client invoice system\"). You can have multiple active projects.",
  },
  {
    title: "Log daily updates",
    text: "Each day, write a short note about what you worked on. This builds a timeline of progress you can look back on.",
  },
  {
    title: "Finish & reopen",
    text: "Mark a project as finished when it's done. You can always reopen it later if needed.",
  },
];

export function ProjectsPage({
  userId,
  projects,
  currentDate,
  onAddProject,
  onUpdateProject: _onUpdateProject,
  onSetProjectDailyNote,
  onSetProjectFinished,
}: ProjectsPageProps) {
  const guide = usePageGuide(userId, "projects");
  const [newProjectName, setNewProjectName] = useState("");

  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;
    if (a.updatedAt === b.updatedAt) return a.createdAt < b.createdAt ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const activeProjects = sortedProjects.filter((project) => !project.isFinished);
  const finishedProjects = sortedProjects.filter((project) => project.isFinished);

  function addProject() {
    const trimmed = newProjectName.trim();
    if (!trimmed) return;
    onAddProject(trimmed);
    setNewProjectName("");
  }

  return (
    <section className="page-renderer__section projects-page">
      <PageGuideModal
        userId={userId}
        pageKey="projects"
        title="Projects"
        description="Track your side projects, client work, or anything you're building. Log daily updates and see your progress over time."
        steps={PROJECTS_GUIDE_STEPS}
        isOpen={guide.isOpen}
        onClose={guide.dismiss}
      />
      <div className="projects-page__head">
        <div>
          <h1 className="page-renderer__title projects-page__title">Projects</h1>
          <p className="page-renderer__subtitle projects-page__subtitle">
            Create projects, log what you did today, and mark them finished when done.
          </p>
        </div>
        <div className="projects-page__head-badges">
          <button type="button" className="page-guide-trigger" onClick={guide.reopen}>
            <span className="page-guide-trigger__icon" aria-hidden="true">?</span>
            How it works
          </button>
          <span className="projects-page__head-badge">{activeProjects.length} active</span>
          <span className="projects-page__head-badge">{finishedProjects.length} finished</span>
          <span className="projects-page__head-badge">Today {currentDate}</span>
        </div>
      </div>

      <div className="projects-page__create">
        <div className="projects-page__create-head">
          <h2 className="projects-page__section-title">New Project</h2>
          <span className="projects-page__hint">Project name is required</span>
        </div>

        <form
          className="projects-page__create-form"
          onSubmit={(e) => {
            e.preventDefault();
            addProject();
          }}
        >
          <input
            type="text"
            className="home__field-input"
            placeholder="Project name (e.g. Portfolio website, Client invoice system...)"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            maxLength={120}
            aria-label="Project name"
          />
          <button
            type="submit"
            className="projects-page__action-btn projects-page__action-btn--primary"
            disabled={!hasText(newProjectName)}
          >
            Add Project
          </button>
        </form>
      </div>

      <div className="projects-page__section-block">
        <div className="projects-page__section-head">
          <h2 className="projects-page__section-title">Active Projects</h2>
          <span className="projects-page__hint">Write today&apos;s update in free text</span>
        </div>

        {activeProjects.length === 0 ? (
          <div className="projects-page__empty">
            <p className="projects-page__empty-title">No active projects yet.</p>
            <p className="projects-page__empty-text">
              Add one project above and start logging what you did today.
            </p>
          </div>
        ) : (
          <div className="projects-page__list">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentDate={currentDate}
                onSetProjectDailyNote={onSetProjectDailyNote}
                onSetProjectFinished={onSetProjectFinished}
              />
            ))}
          </div>
        )}
      </div>

      <div className="projects-page__section-block">
        <div className="projects-page__section-head">
          <h2 className="projects-page__section-title">Finished Projects</h2>
          <span className="projects-page__hint">You can reopen a project anytime</span>
        </div>

        {finishedProjects.length === 0 ? (
          <div className="projects-page__empty projects-page__empty--soft">
            <p className="projects-page__empty-text">No finished projects yet.</p>
          </div>
        ) : (
          <div className="projects-page__list">
            {finishedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentDate={currentDate}
                onSetProjectDailyNote={onSetProjectDailyNote}
                onSetProjectFinished={onSetProjectFinished}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
