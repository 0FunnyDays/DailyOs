import { useEffect, useRef, useState } from "react";
import type { Page, Session } from "../../types";
import { Avatar } from "../Avatar/Avatar";

type HeaderProps = {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  session: Session;
  avatar: string | null;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout: () => void;
};

const MAIN_NAV_ITEMS: Array<{ page: Page; label: string }> = [
  { page: "home", label: "Home" },
  { page: "priorities", label: "Priorities" },
  { page: "today", label: "Work" },
  { page: "dashboard", label: "Dashboard" },
  { page: "projects", label: "Projects" },
  // { page: "travel", label: "Travel" },
  { page: "sleep", label: "Sleep" },
  { page: "gym", label: "Gym" },
];

const SETTINGS_PAGES: Page[] = ["settings", "settings-work", "settings-gym"];
const SETTINGS_DROPDOWN_ITEMS: Array<{ page: Page; label: string }> = [
  { page: "settings-work", label: "Work Settings" },
  { page: "settings-gym", label: "Gym Settings" },
];

export function Header({
  currentPage,
  onNavigate,
  session,
  avatar,
  theme,
  onToggleTheme,
  onLogout,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const settingsCloseTimeoutRef = useRef<number | null>(null);
  const isOnSettingsPage = SETTINGS_PAGES.includes(currentPage);

  function clearSettingsCloseTimeout() {
    if (settingsCloseTimeoutRef.current === null) return;
    window.clearTimeout(settingsCloseTimeoutRef.current);
    settingsCloseTimeoutRef.current = null;
  }

  function openSettingsMenu() {
    clearSettingsCloseTimeout();
    setSettingsMenuOpen(true);
  }

  function closeSettingsMenuSoon() {
    clearSettingsCloseTimeout();
    settingsCloseTimeoutRef.current = window.setTimeout(() => {
      setSettingsMenuOpen(false);
      settingsCloseTimeoutRef.current = null;
    }, 180);
  }

  useEffect(() => {
    if (!menuOpen && !settingsMenuOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (menuOpen && !userMenuRef.current?.contains(target)) {
        setMenuOpen(false);
      }
      if (settingsMenuOpen && !settingsMenuRef.current?.contains(target)) {
        clearSettingsCloseTimeout();
        setSettingsMenuOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen, settingsMenuOpen]);

  useEffect(() => {
    return () => {
      clearSettingsCloseTimeout();
    };
  }, []);

  function navigate(page: Page) {
    setMenuOpen(false);
    clearSettingsCloseTimeout();
    setSettingsMenuOpen(false);
    onNavigate(page);
  }

  return (
    <nav className="header-nav" aria-label="Primary navigation">
      <div className="header-nav__brand-shell">
        <button
          type="button"
          className="header-nav__nav-item header-nav__brand"
          onClick={() => navigate("home")}
          title="Go to Home"
        >
          Daily Os
        </button>
      </div>

      <div className="header-nav__nav" aria-label="Navigation">
        {MAIN_NAV_ITEMS.map((item) => (
          <button
            key={item.page}
            type="button"
            className={`header-nav__nav-item${
              currentPage === item.page ? " header-nav__nav-item--active" : ""
            }`}
            onClick={() => navigate(item.page)}
            aria-current={currentPage === item.page ? "page" : undefined}
          >
            <span className="header-nav__nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div
        ref={settingsMenuRef}
        className="header-nav__settings-shell header-nav__settings-dropdown"
        onMouseEnter={openSettingsMenu}
        onMouseLeave={closeSettingsMenuSoon}
      >
        <button
          type="button"
          className={`header-nav__nav-item header-nav__settings-btn${
            isOnSettingsPage ? " header-nav__nav-item--active" : ""
          }`}
          onClick={() => {
            clearSettingsCloseTimeout();
            setMenuOpen(false);
            setSettingsMenuOpen((open) => !open);
          }}
          aria-expanded={settingsMenuOpen}
          aria-haspopup="menu"
          aria-current={isOnSettingsPage ? "page" : undefined}
          title="Settings"
        >
          <span className="header-nav__nav-label">Settings</span>
          <svg
            className={`header-nav__settings-chevron${settingsMenuOpen ? " header-nav__settings-chevron--open" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {settingsMenuOpen && (
          <div className="header-nav__settings-menu" role="menu" aria-label="Settings menu">
            {SETTINGS_DROPDOWN_ITEMS.map((item) => (
              <button
                key={item.page}
                type="button"
                className={`header-nav__settings-menu-item${
                  currentPage === item.page ? " header-nav__settings-menu-item--active" : ""
                }`}
                onClick={() => navigate(item.page)}
                role="menuitem"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="header__right header-nav__tools">
        <button
          type="button"
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
        <div ref={userMenuRef} className="header__avatar-wrapper">
          <button
            type="button"
            className="header__avatar"
            onClick={() => {
              setSettingsMenuOpen(false);
              setMenuOpen((open) => !open);
            }}
            title="User menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Avatar username={session.username} avatar={avatar} size="sm" />
          </button>

          {menuOpen && (
            <div className="user-menu" role="menu">
              <button
                type="button"
                className="user-menu__item"
                onClick={() => navigate("profile")}
                role="menuitem"
              >
                Profile
              </button>
              <button
                type="button"
                className="user-menu__item"
                onClick={() => navigate("settings-work")}
                role="menuitem"
              >
                Settings
              </button>
              <button
                type="button"
                className="user-menu__item user-menu__item--danger"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                role="menuitem"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
