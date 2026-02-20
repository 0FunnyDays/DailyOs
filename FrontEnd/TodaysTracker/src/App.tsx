import { useState } from 'react';
import { useAppData } from './hooks/useAppData';
import { useCurrentDay } from './hooks/useCurrentDay';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { DayView } from './components/DayView/DayView';
import type { DayData } from './types';

function App() {
  const {
    days,
    settings,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateSettings,
  } = useAppData();

  const currentDate = useCurrentDay(settings);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const currentDay: DayData = days[currentDate] ?? {
    date: currentDate,
    shifts: [],
    expenses: [],
  };

  return (
    <div className="app">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        currentDay={currentDay}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <div className="app-content">
        <Header currentDate={currentDate} />

        <main className="main">
          <div className="main-inner">
            <DayView
              day={currentDay}
              settings={settings}
              onAddShift={() => addShift(currentDate)}
              onUpdateShift={(id, updates) => updateShift(currentDate, id, updates)}
              onRemoveShift={(id) => removeShift(currentDate, id)}
              onAddExpense={() => addExpense(currentDate)}
              onUpdateExpense={(id, updates) => updateExpense(currentDate, id, updates)}
              onRemoveExpense={(id) => removeExpense(currentDate, id)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
