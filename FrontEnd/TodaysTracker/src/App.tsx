import { useState, useEffect, useCallback } from "react";
import type { Page, Session, User, DayData } from "./types";

import { useAuth } from "./hooks/useAuth";
import { useAppData } from "./hooks/useAppData";
import { useGymData } from "./hooks/useGymData";
import { useCurrentDay } from "./hooks/useCurrentDay";
import { applyTheme, getSavedTheme } from "./utils/themeUtils";

import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { DayView } from "./components/DayView/DayView";

import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkSettingsPage } from "./pages/WorkSettingsPage";
import { GymSettingsPage } from "./pages/GymSettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GymPage } from "./pages/GymPage";

const VALID_PAGES: Page[] = [
  "home",
  "today",
  "dashboard",
  "settings",
  "settings-work",
  "settings-gym",
  "profile",
  "gym",
];

// Root component — handles auth guard + landing vs login
function App() {
  const {
    session,
    users,
    register,
    login,
    logout,
    updateAvatar,
    updatePassword,
  } = useAuth();

  // Apply saved theme on mount (covers landing/login pages)
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  if (!session) {
    return <LoginPage onRegister={register} onLogin={login} />;
  }

  return (
    <AuthenticatedApp
      session={session}
      users={users}
      onLogout={logout}
      onUpdateAvatar={updateAvatar}
      onUpdatePassword={updatePassword}
    />
  );
}

// Post-auth component — all data hooks live here (Rules of Hooks: never conditional)
type AuthenticatedAppProps = {
  session: Session;
  users: User[];
  onLogout: () => void;
  onUpdateAvatar: (userId: string, base64: string) => void;
  onUpdatePassword: (
    userId: string,
    oldPw: string,
    newPw: string,
  ) => Promise<{ ok: boolean; error?: string }>;
};

function AuthenticatedApp({
  session,
  users,
  onLogout,
  onUpdateAvatar,
  onUpdatePassword,
}: AuthenticatedAppProps) {
  const {
    days,
    settings,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateDayNote,
    updateSettings,
  } = useAppData(session.userId);

  const { gymProgram, gymSessions, updateGymProgram, upsertGymSession } =
    useGymData(session.userId);

  const currentDate = useCurrentDay(settings);

  // ── Hash-based page routing ───────────────────────────────────────────────
  const readHashPage = useCallback((): Page => {
    const hash = window.location.hash.replace("#", "");
    return VALID_PAGES.includes(hash as Page) ? (hash as Page) : "home";
  }, []);

  const [page, setPageState] = useState<Page>(readHashPage);

  const navigate = useCallback((p: Page) => {
    setPageState(p);
    window.location.hash = p;
  }, []);

  // Browser back/forward button support
  useEffect(() => {
    function onHashChange() {
      setPageState(readHashPage());
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [readHashPage]);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  const currentDay: DayData = days[currentDate] ?? {
    date: currentDate,
    shifts: [],
    expenses: [],
  };

  const currentUser = users.find((u) => u.id === session.userId) ?? null;

  return (
    <div className="app">
      <div className="app-shell">
        <div className="app-content">
          <div className="app-topbar">
            <Header
              currentPage={page}
              onNavigate={navigate}
              session={session}
              avatar={currentUser?.avatar ?? null}
              theme={settings.theme}
              onToggleTheme={() =>
                updateSettings({
                  theme: settings.theme === "dark" ? "light" : "dark",
                })
              }
              onLogout={onLogout}
            />
          </div>

          <main className="main">
            <div className="main-inner">
              <div className="page-renderer">
                <div className="page-renderer__content">
                  {(() => {
                    switch (page) {
                      case "home":
                        return (
                          <HomePage
                            session={session}
                            currentDay={currentDay}
                            settings={settings}
                            onNavigate={navigate}
                          />
                        );
                      case "dashboard":
                        return (
                          <DashboardPage
                            days={days}
                            settings={settings}
                            gymSessions={gymSessions}
                          />
                        );
                      case "settings":
                        return <SettingsPage onNavigate={navigate} />;
                      case "settings-work":
                        return (
                          <WorkSettingsPage
                            settings={settings}
                            onUpdateSettings={updateSettings}
                          />
                        );
                      case "settings-gym":
                        return (
                          <GymSettingsPage
                            gymProgram={gymProgram}
                            onUpdateGymProgram={updateGymProgram}
                          />
                        );
                      case "profile":
                        return currentUser ? (
                          <ProfilePage
                            user={currentUser}
                            onUpdateAvatar={onUpdateAvatar}
                            onUpdatePassword={onUpdatePassword}
                          />
                        ) : null;
                      case "gym":
                        return (
                          <GymPage
                            gymProgram={gymProgram}
                            gymSessions={gymSessions}
                            currentDate={currentDate}
                            onUpsertSession={upsertGymSession}
                            onNavigate={navigate}
                          />
                        );
                      default:
                        return (
                          <DayView
                            day={currentDay}
                            settings={settings}
                            onAddShift={() => addShift(currentDate)}
                            onUpdateShift={(id, updates) =>
                              updateShift(currentDate, id, updates)
                            }
                            onRemoveShift={(id) => removeShift(currentDate, id)}
                            onAddExpense={() => addExpense(currentDate)}
                            onUpdateExpense={(id, updates) =>
                              updateExpense(currentDate, id, updates)
                            }
                            onRemoveExpense={(id) => removeExpense(currentDate, id)}
                            onUpdateNote={(note) =>
                              updateDayNote(currentDate, note)
                            }
                          />
                        );
                    }
                  })()}
                </div>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
