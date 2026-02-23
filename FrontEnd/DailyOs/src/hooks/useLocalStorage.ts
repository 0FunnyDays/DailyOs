import { useState } from 'react';

function getLegacyKey(key: string): string | null {
  if (key.startsWith('dailyos')) {
    return key.replace(/^dailyos/, 'todaystracker');
  }
  return null;
}

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;

      const legacyKey = getLegacyKey(key);
      if (legacyKey) {
        const legacyStored = localStorage.getItem(legacyKey);
        if (legacyStored !== null) {
          localStorage.setItem(key, legacyStored);
          return JSON.parse(legacyStored) as T;
        }
      }

      return defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = (value: T) => {
    setState(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded — data not saved');
      }
    }
  };

  return [state, setValue];
}
