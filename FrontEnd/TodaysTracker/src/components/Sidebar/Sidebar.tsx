import { useState, useEffect } from "react";
import type { Page } from "../../types";
import logoSrc from "../../assets/todays-tracker-logo.png";

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
};

const SETTINGS_PAGES: Page[] = ["settings", "settings-work", "settings-gym"];

export function Sidebar({
  isOpen,
  onToggle,
  currentPage,
  onNavigate,
}: SidebarProps) {
  const collapsed = !isOpen;
  const isOnSettingsPage = SETTINGS_PAGES.includes(currentPage);

  // Auto-open accordion when a settings sub-page is active
  const [settingsOpen, setSettingsOpen] = useState(isOnSettingsPage);

  useEffect(() => {
    // Only open when navigating to a settings page
    if (isOnSettingsPage && !settingsOpen) {
      setSettingsOpen(true);
    }
    // Optionally, close when leaving settings pages
    if (!isOnSettingsPage && settingsOpen) {
      setSettingsOpen(false);
    }
  }, [isOnSettingsPage]);

  function toggleSettings() {
    if (!isOpen) {
      // If sidebar is collapsed, expand it first then open settings
      onToggle();
      setSettingsOpen(true);
      return;
    }
    setSettingsOpen((o) => !o);
  }

  return (
    <aside className={`sidebar${collapsed ? " sidebar--collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar__header">
        {isOpen && (
          <img
            src={logoSrc}
            alt="TodaysTracker"
            className="sidebar__logo-img"
          />
        )}
        <button
          className="sidebar__toggle"
          onClick={onToggle}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="sidebar__body">
        {/* Navigation */}
        <nav className="sidebar__nav">
          {/* Home */}
          <button
            className={`sidebar__nav-item${currentPage === "home" ? " sidebar__nav-item--active" : ""}`}
            onClick={() => onNavigate("home")}
          >
            <span className="sidebar__nav-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12L12 3l9 9" />
                <path d="M9 21V9h6v12" />
              </svg>
            </span>
            {isOpen && <span className="sidebar__nav-label">Home</span>}
          </button>

          {/* Work (was Today) */}
          <button
            className={`sidebar__nav-item${currentPage === "today" ? " sidebar__nav-item--active" : ""}`}
            onClick={() => onNavigate("today")}
          >
            <span className="sidebar__nav-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            {isOpen && <span className="sidebar__nav-label">Work</span>}
          </button>

          {/* Dashboard */}
          <button
            className={`sidebar__nav-item${currentPage === "dashboard" ? " sidebar__nav-item--active" : ""}`}
            onClick={() => onNavigate("dashboard")}
          >
            <span className="sidebar__nav-icon">
              <svg
                width="16"
                height="16"
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
            </span>
            {isOpen && <span className="sidebar__nav-label">Dashboard</span>}
          </button>

          {/* Gym */}
          <button
            className={`sidebar__nav-item${currentPage === "gym" ? " sidebar__nav-item--active" : ""}`}
            onClick={() => onNavigate("gym")}
          >
            <span className="sidebar__nav-icon">
              <svg
                width="16"
                height="16"
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
            </span>
            {isOpen && <span className="sidebar__nav-label">Gym</span>}
          </button>

          {/* Settings — accordion */}
          <button
            className={`sidebar__nav-item${isOnSettingsPage ? " sidebar__nav-item--active" : ""}`}
            onClick={toggleSettings}
          >
            <span className="sidebar__nav-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            {isOpen && <span className="sidebar__nav-label">Settings</span>}
            {isOpen && (
              <span
                className="sidebar__nav-chevron"
                style={{
                  marginLeft: "auto",
                  transition: "transform 0.2s",
                  transform: settingsOpen ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            )}
          </button>

          {/* Settings sub-items */}
          {isOpen && settingsOpen && (
            <div className="sidebar__nav-sub">
              <button
                className={`sidebar__nav-sub-item${currentPage === "settings-work" ? " sidebar__nav-sub-item--active" : ""}`}
                onClick={() => onNavigate("settings-work")}
              >
                <span className="sidebar__nav-icon" style={{ opacity: 0.6 }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                </span>
                <span className="sidebar__nav-label">Work</span>
              </button>

              <button
                className={`sidebar__nav-sub-item${currentPage === "settings-gym" ? " sidebar__nav-sub-item--active" : ""}`}
                onClick={() => onNavigate("settings-gym")}
              >
                <span className="sidebar__nav-icon" style={{ opacity: 0.6 }}>
                  <svg
                    width="13"
                    height="13"
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
                </span>
                <span className="sidebar__nav-label">Gym</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}
