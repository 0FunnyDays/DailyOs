import { useState, useEffect, useCallback } from 'react';
import type { Page, Session, User, DayData } from './types';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { useGymData } from './hooks/useGymData';
import { useCurrentDay } from './hooks/useCurrentDay';
import { applyTheme } from './utils/themeUtils';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { DayView } from './components/DayView/DayView';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkSettingsPage } from './pages/WorkSettingsPage';
import { GymSettingsPage } from './pages/GymSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { GymPage } from './pages/GymPage';

// Root component — handles auth guard + landing vs login
function App() {
  const { session, users, register, login, logout, updateAvatar, updatePassword } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (!session) {
    if (showLogin) {
      return <LoginPage onRegister={register} onLogin={login} onBack={() => setShowLogin(false)} />;
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
  onUpdatePassword: (userId: string, oldPw: string, newPw: string) => Promise<{ ok: boolean; error?: string }>;
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

  const { gymProgram, gymSessions, updateGymProgram, upsertGymSession } = useGymData(session.userId);

  const currentDate = useCurrentDay(settings);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Hash-based page routing ───────────────────────────────────────────────
  const VALID_PAGES: Page[] = ['today', 'dashboard', 'settings', 'settings-work', 'settings-gym', 'profile', 'gym'];

  function readHashPage(): Page {
    const hash = window.location.hash.replace('#', '');
    return VALID_PAGES.includes(hash as Page) ? (hash as Page) : 'today';
  }

  const [page, setPageState] = useState<Page>(readHashPage);

  const navigate = useCallback((p: Page) => {
    setPageState(p);
    window.location.hash = p;
  }, []);

  // Browser back/forward button support
  useEffect(() => {
    const validPages: Page[] = ['today', 'dashboard', 'settings', 'settings-work', 'settings-gym', 'profile', 'gym'];
    function onHashChange() {
      const hash = window.location.hash.replace('#', '');
      setPageState(validPages.includes(hash as Page) ? (hash as Page) : 'today');
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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

  // ── Render main content based on current page ───────────────────────────────
  function renderContent() {
    switch (page) {
      case 'dashboard':
        return <DashboardPage days={days} settings={settings} />;

      case 'settings':
        return <SettingsPage onNavigate={navigate} />;

      case 'settings-work':
        return (
          <WorkSettingsPage
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        );

      case 'settings-gym':
        return (
          <GymSettingsPage
            gymProgram={gymProgram}
            onUpdateGymProgram={updateGymProgram}
          />
        );

      case 'profile':
        return currentUser ? (
          <ProfilePage
            user={currentUser}
            onUpdateAvatar={onUpdateAvatar}
            onUpdatePassword={onUpdatePassword}
          />
        ) : null;

      case 'gym':
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
            onUpdateShift={(id, updates) => updateShift(currentDate, id, updates)}
            onRemoveShift={(id) => removeShift(currentDate, id)}
            onAddExpense={() => addExpense(currentDate)}
            onUpdateExpense={(id, updates) => updateExpense(currentDate, id, updates)}
            onRemoveExpense={(id) => removeExpense(currentDate, id)}
            onUpdateNote={(note) => updateDayNote(currentDate, note)}
          />
        );
    }
  }

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
          currentDate={currentDate}
          session={session}
          avatar={currentUser?.avatar ?? null}
          theme={settings.theme}
          onToggleTheme={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          onNavigate={(p) => navigate(p)}
          onLogout={onLogout}
        />

        <main className="main">
          <div className="main-inner">
            {renderContent()}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
