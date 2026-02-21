import type { DayData, Page, Session, User } from "../../types/index";
import { DayView } from "../DayView/DayView";

import { HomePage } from "../../pages/HomePage";
import { DashboardPage } from "../../pages/DashboardPage";
import { SettingsPage } from "../../pages/SettingsPage";
import { WorkSettingsPage } from "../../pages/WorkSettingsPage";
import { GymSettingsPage } from "../../pages/GymSettingsPage";
import { ProfilePage } from "../../pages/ProfilePage";
import { GymPage } from "../../pages/GymPage";

type Props = {
  page: Page;
  session: Session;
  currentDay: DayData;
  currentDate: string;
  days: Record<string, DayData>;
  settings: any;

  gymProgram: any;
  gymSessions: any;

  currentUser: User | null;

  navigate: (p: Page) => void;

  addShift: (date: string) => void;
  updateShift: (date: string, id: string, updates: any) => void;
  removeShift: (date: string, id: string) => void;

  addExpense: (date: string) => void;
  updateExpense: (date: string, id: string, updates: any) => void;
  removeExpense: (date: string, id: string) => void;

  updateDayNote: (date: string, note: string) => void;

  updateSettings: (updates: any) => void;

  updateGymProgram: (program: any) => void;
  upsertGymSession: (payload: any) => void;

  onUpdateAvatar: (userId: string, base64: string) => void;
  onUpdatePassword: (
    userId: string,
    oldPw: string,
    newPw: string,
  ) => Promise<{ ok: boolean; error?: string }>;
};

export function PageRenderer(props: Props) {
  const {
    page,
    session,
    currentDay,
    currentDate,
    days,
    settings,
    gymProgram,
    gymSessions,
    currentUser,
    navigate,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateDayNote,
    updateSettings,
    updateGymProgram,
    upsertGymSession,
    onUpdateAvatar,
    onUpdatePassword,
  } = props;

  return (
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
              return <DashboardPage days={days} settings={settings} />;
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
            // "today" και ό,τι άλλο πέφτει εδώ
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
                  onUpdateNote={(note) => updateDayNote(currentDate, note)}
                />
              );
          }
        })()}
      </div>
    </div>
  );
}
