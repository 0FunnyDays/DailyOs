import { useState, useEffect } from 'react';
import type { Page, Session, User, DayData } from './types';
import { useAuth } from './hooks/useAuth';
import { useAppData } from './hooks/useAppData';
import { useGymData } from './hooks/useGymData';
import { useCurrentDay } from './hooks/useCurrentDay';
import { applyTheme } from './utils/themeUtils';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { DayView } from './components/DayView/DayView';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkSettingsPage } from './pages/WorkSettingsPage';
import { GymSettingsPage } from './pages/GymSettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { GymPage } from './pages/GymPage';

// Root component — handles auth guard only
function App() {
  const { session, users, register, login, logout, updateAvatar, updatePassword } = useAuth();

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
  const [page, setPage] = useState<Page>('today');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      case 'settings':
        return <SettingsPage onNavigate={setPage} />;

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
            onNavigate={setPage}
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
        onNavigate={setPage}
      />

      <div className="app-content">
        <Header
          currentDate={currentDate}
          session={session}
          avatar={currentUser?.avatar ?? null}
          theme={settings.theme}
          onToggleTheme={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
          onNavigate={(p) => setPage(p)}
          onLogout={onLogout}
        />

        <main className="main">
          <div className="main-inner">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
