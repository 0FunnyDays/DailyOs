import type { AppSettings } from '../../types';

type SettingsPanelProps = {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onClose: () => void;
};

export function SettingsPanel({ settings, onUpdateSettings, onClose }: SettingsPanelProps) {
  return (
    <div className="bg-gray-850 border-b border-gray-700 px-4 py-4 bg-gray-900">
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap gap-6">
          {/* Day reset hour */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400">Day resets at hour</span>
            <input
              type="number"
              min={0}
              max={23}
              value={settings.dayResetHour}
              onChange={(e) => {
                const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                onUpdateSettings({ dayResetHour: val });
              }}
              className="
                w-20 bg-gray-800 border border-gray-600 rounded-md px-2.5 py-1.5
                text-sm text-gray-100
                focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                transition-colors
              "
            />
            <span className="text-xs text-gray-500 max-w-xs">
              If you work past midnight, the new day starts at this hour (0–23).
              Currently: <strong className="text-gray-300">{settings.dayResetHour}:00</strong>
            </span>
          </label>

          {/* Currency */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-gray-400">Currency symbol</span>
            <input
              type="text"
              maxLength={3}
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ currency: e.target.value || '€' })}
              className="
                w-20 bg-gray-800 border border-gray-600 rounded-md px-2.5 py-1.5
                text-sm text-gray-100
                focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400
                transition-colors
              "
            />
          </label>
        </div>
      </div>
    </div>
  );
}
