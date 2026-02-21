import { useState } from "react";
import type { Session } from "../../types";
import { formatDateDisplay } from "../../utils/dateUtils";
import { Avatar } from "../Avatar/Avatar";

type HeaderProps = {
  currentDate: string;
  session: Session;
  avatar: string | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (page: "profile" | "settings") => void;
  onLogout: () => void;
};

export function Header({
  currentDate,
  session,
  avatar,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const parts = formatDateDisplay(currentDate).split(", ");
  const weekday = parts[0];
  const rest = parts.slice(1).join(", ");

  function navigate(page: "profile" | "settings") {
    setMenuOpen(false);
    onNavigate(page);
  }

  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__date">{weekday}</h1>
        <p>{rest}</p>
      </div>
      <div className="header__right">
        {/* Theme toggle */}
        <button
          className="header__theme-toggle"
          onClick={onToggleTheme}
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            /* Sun icon */
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
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon icon */
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
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        {/* Avatar + dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="header__avatar"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <Avatar username={session.username} avatar={avatar} size="sm" />
          </button>
          {menuOpen && (
            <div className="user-menu" onMouseLeave={() => setMenuOpen(false)}>
              <button
                className="user-menu__item"
                onClick={() => navigate("profile")}
              >
                Profile
              </button>
              <button
                className="user-menu__item"
                onClick={() => navigate("settings")}
              >
                Settings
              </button>
              <button
                className="user-menu__item user-menu__item--danger"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
