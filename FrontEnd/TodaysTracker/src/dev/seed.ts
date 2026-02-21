/**
 * Dev-only seed — runs once to populate localStorage with a test account.
 * username: test  |  password: test12
 * Safe to delete or leave in — it only writes if the test user doesn't exist yet.
 */

const TEST_USER_ID = 'seed-user-test-001';
const USERS_KEY    = 'todaystracker_users';

/** Returns YYYY-MM-DD for N days ago (respects 4 AM reset) */
function dateAgo(daysBack: number): string {
  const now = new Date();
  if (now.getHours() < 4) daysBack += 1; // before reset → still "yesterday"
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

function sid(n: number): string { return `seed-s-${String(n).padStart(3, '0')}`; }
function eid(n: number): string { return `seed-e-${String(n).padStart(3, '0')}`; }

export function seedTestUser(): void {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    if (users.some((u: { id: string }) => u.id === TEST_USER_ID)) return;

    // ── User ──────────────────────────────────────────────────────────────────
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, {
      id:           TEST_USER_ID,
      username:     'test',
      passwordHash: 'a98ec5c5044800c88e862f007b98d89815fc40ca155d6ce7909530d792e909ce',
      avatar:       null,
      createdAt:    '2026-01-15T08:00:00.000Z',
    }]));

    // ── Settings ──────────────────────────────────────────────────────────────
    localStorage.setItem(`todaystracker_settings_${TEST_USER_ID}`, JSON.stringify({
      dayResetHour:        4,
      currency:            '€',
      monthlyFlatSalary:   1100,
      workingDaysPerMonth: 22,
      theme:               'dark',
    }));

    // ── Days ──────────────────────────────────────────────────────────────────
    // Each entry: [daysAgo, shifts[], expenses[], note]
    // shift shape: [startTime, endTime, payType, payAmount, tips]
    // expense shape: [amount, description]
    const days: Record<string, unknown> = {};

    const entries: Array<{
      ago: number;
      shifts: Array<[string, string, 'flat' | 'hourly', number, number]>;
      expenses: Array<[number, string]>;
      note: string;
    }> = [
      // today
      {
        ago: 0,
        shifts: [
          ['09:00', '17:00', 'flat',   0, 0  ],
          ['18:00', '21:00', 'hourly', 6, 2.5],
        ],
        expenses: [[3.40, 'Καφές / νερό'], [8.50, 'Μεσημεριανό']],
        note: 'Καλή μέρα, δύο βάρδιες. Η βραδινή ήταν ήρεμη.',
      },
      // 1 day ago
      {
        ago: 1,
        shifts: [
          ['10:00', '18:00', 'flat', 0, 5],
        ],
        expenses: [[4.20, 'Καφές'], [6.00, 'Μεταφορικά']],
        note: 'Χθες ήρεμη μέρα, καλά tips.',
      },
      // 2
      {
        ago: 2,
        shifts: [
          ['08:00', '14:00', 'hourly', 7, 0  ],
          ['15:00', '19:00', 'hourly', 7, 4.0],
        ],
        expenses: [[5.50, 'Μεσημεριανό'], [2.00, 'Νερό']],
        note: 'Δύο βάρδιες ωριαίες. Το απόγευμα πιο πολυάσχολο.',
      },
      // 3
      {
        ago: 3,
        shifts: [
          ['09:00', '17:30', 'flat', 0, 0],
        ],
        expenses: [[9.00, 'Μεσημεριανό + καφές']],
        note: '',
      },
      // 4
      {
        ago: 4,
        shifts: [
          ['12:00', '20:00', 'flat',   0, 8  ],
          ['21:00', '01:00', 'hourly', 8, 3.0],
        ],
        expenses: [[3.00, 'Καφές'], [7.50, 'Φαγητό']],
        note: 'Νυχτερινή βάρδια μετά τη σταθερή. Καλά tips.',
      },
      // 5 — day off, no data
      // 6
      {
        ago: 6,
        shifts: [
          ['09:00', '17:00', 'flat', 0, 12],
        ],
        expenses: [[4.50, 'Καφές / νερό'], [8.00, 'Μεσημεριανό']],
        note: 'Πολύ καλές μέρες tips αυτή την εβδομάδα.',
      },
      // 7
      {
        ago: 7,
        shifts: [
          ['10:00', '16:00', 'hourly', 6.5, 0],
        ],
        expenses: [[3.80, 'Καφές']],
        note: '',
      },
      // 8
      {
        ago: 8,
        shifts: [
          ['08:30', '17:00', 'flat',   0, 0  ],
          ['18:30', '22:30', 'hourly', 7, 5.5],
        ],
        expenses: [[6.00, 'Μεσημεριανό'], [2.50, 'Νερά']],
        note: 'Βαριά μέρα αλλά καλά λεφτά.',
      },
      // 9
      {
        ago: 9,
        shifts: [
          ['09:00', '13:00', 'hourly', 7, 0],
        ],
        expenses: [],
        note: 'Μικρή βάρδια σήμερα.',
      },
      // 10
      {
        ago: 10,
        shifts: [
          ['09:00', '17:00', 'flat', 0, 6],
          ['18:00', '20:00', 'hourly', 7, 0],
        ],
        expenses: [[4.00, 'Καφές'], [9.50, 'Μεσημεριανό']],
        note: '',
      },
      // 11
      {
        ago: 11,
        shifts: [
          ['11:00', '19:00', 'flat', 0, 0],
        ],
        expenses: [[5.00, 'Φαγητό']],
        note: 'Κανονική μέρα χωρίς εκπλήξεις.',
      },
      // 12 — day off
      // 13
      {
        ago: 13,
        shifts: [
          ['09:00', '17:00', 'flat',   0, 15 ],
          ['22:00', '02:00', 'hourly', 9, 6.0],
        ],
        expenses: [[3.50, 'Καφές'], [10.00, 'Γεύμα'], [5.00, 'Μεταφορά νύχτας']],
        note: 'Μεγάλη μέρα με νυχτερινή — αξίζει τον κόπο.',
      },
      // 14
      {
        ago: 14,
        shifts: [
          ['08:00', '16:00', 'flat', 0, 0],
        ],
        expenses: [[4.20, 'Καφές / νερό'], [7.00, 'Μεσημεριανό']],
        note: 'Πριν 2 εβδομάδες, αρχή της εβδομάδας.',
      },
    ];

    let shiftIdx = 10;
    let expIdx   = 10;

    for (const entry of entries) {
      const dateKey = dateAgo(entry.ago);
      days[dateKey] = {
        date: dateKey,
        note: entry.note,
        shifts: entry.shifts.map(([start, end, type, amount, tips]) => ({
          id:        sid(shiftIdx++),
          startTime: start,
          endTime:   end,
          payType:   type,
          payAmount: amount,
          tips,
        })),
        expenses: entry.expenses.map(([amount, description]) => ({
          id:          eid(expIdx++),
          amount,
          description,
        })),
      };
    }

    localStorage.setItem(`todaystracker_days_${TEST_USER_ID}`, JSON.stringify(days));
    console.info('[seed] Test account ready — username: test / password: test12');
  } catch {
    // Silently ignore storage errors
  }
}
