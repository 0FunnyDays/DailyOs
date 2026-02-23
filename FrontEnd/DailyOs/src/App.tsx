import { useState, useEffect, useCallback, useRef } from "react";
import type { Page, Session, User, DayData } from "./types";

import { useAuth } from "./hooks/useAuth";
import { useAppData } from "./hooks/useAppData";
import { useGymData } from "./hooks/useGymData";
import { useCurrentDay } from "./hooks/useCurrentDay";

import { Header } from "./components/Header/Header";
import { Footer } from "./components/Footer/Footer";
import { DayView } from "./components/DayView/DayView";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/HomePage";
import { AboutPage } from "./pages/AboutPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ContactPage } from "./pages/ContactPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { TravelPage } from "./pages/TravelPage";
import { PrioritiesPage } from "./pages/PrioritiesPage";
import { SleepPage } from "./pages/SleepPage";
import { WorkSettingsPage } from "./pages/WorkSettingsPage";
import { GymSettingsPage } from "./pages/GymSettingsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { GymPage } from "./pages/GymPage";

const VALID_PAGES: Page[] = [
  "home",
  "about",
  "privacy",
  "contact",
  "priorities",
  "today",
  "dashboard",
  "projects",
  "travel",
  "sleep",
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
  const [authScreen, setAuthScreen] = useState<
    "landing" | "login" | "register"
  >("landing");
  const [authOutgoingScreen, setAuthOutgoingScreen] = useState<
    "landing" | "login" | "register" | null
  >(null);
  const [isExiting, setIsExiting] = useState(false);
  const authNavTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!session) {
      setAuthScreen("landing");
      setAuthOutgoingScreen(null);
      setIsExiting(false);
    }
  }, [session]);

  useEffect(() => {
    return () => {
      if (authNavTimeoutRef.current !== null) {
        window.clearTimeout(authNavTimeoutRef.current);
      }
    };
  }, []);

  /** Animate out current page, then switch to the next one */
  const navigateAuth = useCallback((next: "landing" | "login" | "register") => {
    if (isExiting || next === authScreen) return;

    if (authNavTimeoutRef.current !== null) {
      window.clearTimeout(authNavTimeoutRef.current);
      authNavTimeoutRef.current = null;
    }

    setAuthOutgoingScreen(authScreen);
    setAuthScreen(next);
    setIsExiting(true);

    // Keep the outgoing screen mounted long enough to play its exit animation.
    authNavTimeoutRef.current = window.setTimeout(() => {
      setAuthOutgoingScreen(null);
      setIsExiting(false);
      authNavTimeoutRef.current = null;
    }, 400); // matches auth-exit duration
  }, [authScreen, isExiting]);

  const renderAuthScreen = useCallback(
    (
      screen: "landing" | "login" | "register",
      options?: { exiting?: boolean; instanceKey?: string },
    ) => {
      if (screen === "landing") {
        return (
          <LandingPage
            key={options?.instanceKey ?? "landing"}
            onGetStarted={() => navigateAuth("register")}
            onLoginClick={() => navigateAuth("login")}
            exiting={options?.exiting}
          />
        );
      }

      return (
        <LoginPage
          key={options?.instanceKey ?? screen}
          initialMode={screen === "register" ? "register" : "login"}
          onBack={() => navigateAuth("landing")}
          onRegister={register}
          onLogin={login}
          exiting={options?.exiting}
        />
      );
    },
    [login, navigateAuth, register],
  );

  if (!session) {
    return (
      <>
        {renderAuthScreen(authScreen, { exiting: false, instanceKey: `auth-current-${authScreen}` })}
        {authOutgoingScreen && authOutgoingScreen !== authScreen
          ? renderAuthScreen(authOutgoingScreen, {
              exiting: isExiting,
              instanceKey: `auth-outgoing-${authOutgoingScreen}`,
            })
          : null}
      </>
    );
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
    projects,
    travelTrips,
    settings,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateDayNote,
    updateDayMeta,
    addProject,
    updateProject,
    setProjectDailyNote,
    setProjectFinished,
    addTravelTrip,
    updateTravelTrip,
    setTravelTripFinished,
    addJob,
    updateJob,
    removeJob,
    updateSettings,
  } = useAppData(session.userId);

  const { gymProgram, gymSessions, updateGymProgram, upsertGymSession } =
    useGymData(session.userId);

  const currentDate = useCurrentDay(settings);
  const [workPageDate, setWorkPageDate] = useState(currentDate);
  const previousLogicalDateRef = useRef(currentDate);

  useEffect(() => {
    // If the user is viewing the logical "today", keep it in sync after day rollover.
    setWorkPageDate((selectedDate) =>
      selectedDate === previousLogicalDateRef.current ? currentDate : selectedDate,
    );
    previousLogicalDateRef.current = currentDate;
  }, [currentDate]);

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

  const currentDay: DayData = days[currentDate] ?? {
    date: currentDate,
    shifts: [],
    expenses: [],
  };
  const selectedWorkDay: DayData = days[workPageDate] ?? {
    date: workPageDate,
    shifts: [],
    expenses: [],
  };

  const currentUser = users.find((u) => u.id === session.userId) ?? null;

  return (
    <div className="app">
      <div className="app-shell">
        <div className="app-content">
          <main className="main">
            <div className="app-topbar">
              <Header
                currentPage={page}
                onNavigate={navigate}
                session={session}
                avatar={currentUser?.avatar ?? null}
                onLogout={onLogout}
              />
            </div>
            <div className="main-inner">
              <div className="page-renderer">
                <div className="page-renderer__content">
                  {(() => {
                    switch (page) {
                      case "home":
                        return (
                          <HomePage
                            currentDay={currentDay}
                            settings={settings}
                            gymProgram={gymProgram}
                            gymSessions={gymSessions}
                            onNavigate={navigate}
                            onUpdateDayMeta={(updates) =>
                              updateDayMeta(currentDate, updates)
                            }
                          />
                        );
                      case "about":
                        return <AboutPage onNavigate={navigate} />;
                      case "privacy":
                        return <PrivacyPage onNavigate={navigate} />;
                      case "contact":
                        return <ContactPage onNavigate={navigate} />;
                      case "dashboard":
                        return (
                          <DashboardPage
                            days={days}
                            settings={settings}
                            gymSessions={gymSessions}
                          />
                        );
                      case "priorities":
                        return (
                          <PrioritiesPage
                            day={currentDay}
                            onUpdateDayMeta={(updates) =>
                              updateDayMeta(currentDate, updates)
                            }
                            onNavigate={navigate}
                          />
                        );
                      case "projects":
                        return (
                          <ProjectsPage
                            projects={projects}
                            currentDate={currentDate}
                            onAddProject={addProject}
                            onUpdateProject={updateProject}
                            onSetProjectDailyNote={setProjectDailyNote}
                            onSetProjectFinished={setProjectFinished}
                          />
                        );
                      case "travel":
                        return (
                          <TravelPage
                            trips={travelTrips}
                            currency={settings.currency}
                            onAddTrip={addTravelTrip}
                            onUpdateTrip={updateTravelTrip}
                            onSetTripFinished={setTravelTripFinished}
                          />
                        );
                      case "sleep":
                        return (
                          <SleepPage
                            currentDate={currentDate}
                            days={days}
                            onUpdateDayMeta={updateDayMeta}
                            onNavigate={navigate}
                          />
                        );
                      case "settings":
                        return (
                          <WorkSettingsPage
                            settings={settings}
                            onUpdateSettings={updateSettings}
                            onAddJob={addJob}
                            onUpdateJob={updateJob}
                            onRemoveJob={removeJob}
                          />
                        );
                      case "settings-work":
                        return (
                          <WorkSettingsPage
                            settings={settings}
                            onUpdateSettings={updateSettings}
                            onAddJob={addJob}
                            onUpdateJob={updateJob}
                            onRemoveJob={removeJob}
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
                            day={selectedWorkDay}
                            settings={settings}
                            selectedDate={workPageDate}
                            todayDate={currentDate}
                            onSelectDate={setWorkPageDate}
                            onNavigate={navigate}
                            onAddShift={(jobId) => addShift(workPageDate, jobId)}
                            onUpdateShift={(id, updates) =>
                              updateShift(workPageDate, id, updates)
                            }
                            onRemoveShift={(id) => removeShift(workPageDate, id)}
                            onAddExpense={() => addExpense(workPageDate)}
                            onUpdateExpense={(id, updates) =>
                              updateExpense(workPageDate, id, updates)
                            }
                            onRemoveExpense={(id) => removeExpense(workPageDate, id)}
                            onUpdateNote={(note) =>
                              updateDayNote(workPageDate, note)
                            }
                          />
                        );
                    }
                  })()}
                </div>
              </div>
            </div>
            <Footer />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
