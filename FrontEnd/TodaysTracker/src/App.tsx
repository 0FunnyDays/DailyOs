import { useState, useEffect, useCallback } from "react";
import type { Page, Session, User, DayData } from "./types";

import { useAuth } from "./hooks/useAuth";
import { useAppData } from "./hooks/useAppData";
import { useGymData } from "./hooks/useGymData";
import { useCurrentDay } from "./hooks/useCurrentDay";
import { applyTheme, getSavedTheme } from "./utils/themeUtils";

import { Sidebar } from "./components/Sidebar/Sidebar";
import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";

import { PageRenderer } from "./components/PageRenderer/PageRenderer";

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

  const [showLogin, setShowLogin] = useState(false);

  // Apply saved theme on mount (covers landing/login pages)
  useEffect(() => {
    applyTheme(getSavedTheme());
  }, []);

  if (!session) {
    if (showLogin) {
      return (
        <LoginPage
          onRegister={register}
          onLogin={login}
          onBack={() => setShowLogin(false)}
        />
      );
    }
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Hash-based page routing ───────────────────────────────────────────────
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
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        currentPage={page}
        onNavigate={navigate}
      />

      <div className="app-content">
        <Header
          session={session}
          avatar={currentUser?.avatar ?? null}
          theme={settings.theme}
          onToggleTheme={() =>
            updateSettings({
              theme: settings.theme === "dark" ? "light" : "dark",
            })
          }
          onNavigate={(p) => navigate(p)}
          onLogout={onLogout}
        />

        <main className="main">
          <div className="main-inner">
            <PageRenderer
              page={page}
              session={session}
              currentDay={currentDay}
              currentDate={currentDate}
              days={days}
              settings={settings}
              gymProgram={gymProgram}
              gymSessions={gymSessions}
              currentUser={currentUser}
              navigate={navigate}
              addShift={addShift}
              updateShift={updateShift}
              removeShift={removeShift}
              addExpense={addExpense}
              updateExpense={updateExpense}
              removeExpense={removeExpense}
              updateDayNote={updateDayNote}
              updateSettings={updateSettings}
              updateGymProgram={updateGymProgram}
              upsertGymSession={(payload) => {
                // payload should have date and session properties
                upsertGymSession(payload.date, payload.session);
              }}
              onUpdateAvatar={onUpdateAvatar}
              onUpdatePassword={onUpdatePassword}
            />
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
