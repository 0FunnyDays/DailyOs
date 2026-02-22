import { useState } from "react";
import type { Session } from "../../types";
import { Avatar } from "../Avatar/Avatar";

type HeaderProps = {
  session: Session;
  avatar: string | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (page: "profile" | "settings") => void;
  onLogout: () => void;
};

export function Header({
  session,
  avatar,
  theme,
  onToggleTheme,
  onNavigate,
  onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  function navigate(page: "profile" | "settings") {
    setMenuOpen(false);
    onNavigate(page);
  }

  return (
    <header className="header">
      <div className="header__left">{/* Date removed */}</div>
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
        <div className="header__avatar-wrapper">
          <button
            type="button"
            className="header__avatar"
            onClick={() => setMenuOpen((o) => !o)}
            title="User menu"
            aria-haspopup="true"
            aria-expanded={menuOpen ? "true" : "false"}
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
