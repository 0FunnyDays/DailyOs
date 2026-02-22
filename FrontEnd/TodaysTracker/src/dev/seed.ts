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

function seedGymSessions(): void {
  const GYM_KEY = `todaystracker_gym_sessions_${TEST_USER_ID}`;
  if (localStorage.getItem(GYM_KEY)) return; // already seeded

  const gymSessions: Record<string, unknown> = {};

  const gymEntries: Array<{
    ago: number;
    dayTemplateId: string;
    dayName: string;
    exercises: Array<{
      name: string;
      type: 'strength' | 'cardio';
      sets: Array<[number, number]>;
    }>;
    note?: string;
  }> = [
    {
      ago: 1, dayTemplateId: 'tpl-push', dayName: 'Push',
      exercises: [
        { name: 'Bench Press',      type: 'strength', sets: [[10, 70], [8, 80], [6, 85], [6, 85]] },
        { name: 'Overhead Press',   type: 'strength', sets: [[10, 40], [8, 45], [8, 45]] },
        { name: 'Incline Dumbbell', type: 'strength', sets: [[12, 24], [10, 26], [10, 26]] },
        { name: 'Lateral Raises',   type: 'strength', sets: [[15, 10], [12, 12], [12, 12]] },
        { name: 'Tricep Pushdown',  type: 'strength', sets: [[12, 25], [10, 30], [10, 30]] },
      ],
      note: 'Felt strong today, PR on bench!',
    },
    {
      ago: 3, dayTemplateId: 'tpl-pull', dayName: 'Pull',
      exercises: [
        { name: 'Deadlift',     type: 'strength', sets: [[8, 100], [6, 120], [4, 130], [4, 130]] },
        { name: 'Barbell Row',  type: 'strength', sets: [[10, 60], [8, 65], [8, 65]] },
        { name: 'Lat Pulldown', type: 'strength', sets: [[12, 50], [10, 55], [10, 55]] },
        { name: 'Face Pulls',   type: 'strength', sets: [[15, 15], [15, 15], [12, 17.5]] },
        { name: 'Barbell Curl', type: 'strength', sets: [[12, 25], [10, 27.5], [10, 27.5]] },
      ],
    },
    {
      ago: 5, dayTemplateId: 'tpl-legs', dayName: 'Legs',
      exercises: [
        { name: 'Squat',             type: 'strength', sets: [[10, 80], [8, 90], [6, 100], [6, 100]] },
        { name: 'Romanian Deadlift', type: 'strength', sets: [[10, 70], [8, 80], [8, 80]] },
        { name: 'Leg Press',         type: 'strength', sets: [[12, 140], [10, 160], [10, 160]] },
        { name: 'Leg Curl',          type: 'strength', sets: [[12, 35], [10, 40], [10, 40]] },
        { name: 'Calf Raises',       type: 'strength', sets: [[15, 60], [15, 60], [12, 70]] },
      ],
      note: 'Heavy leg day, quads are destroyed.',
    },
    {
      ago: 7, dayTemplateId: 'tpl-push', dayName: 'Push',
      exercises: [
        { name: 'Bench Press',     type: 'strength', sets: [[10, 65], [8, 75], [6, 80], [5, 82.5]] },
        { name: 'Overhead Press',  type: 'strength', sets: [[10, 37.5], [8, 42.5], [7, 42.5]] },
        { name: 'Cable Flyes',    type: 'strength', sets: [[12, 15], [12, 15], [10, 17.5]] },
        { name: 'Lateral Raises', type: 'strength', sets: [[15, 10], [12, 10], [12, 12]] },
        { name: 'Overhead Tricep', type: 'strength', sets: [[12, 20], [10, 22.5], [10, 22.5]] },
      ],
    },
    {
      ago: 8, dayTemplateId: 'tpl-pull', dayName: 'Pull',
      exercises: [
        { name: 'Deadlift',     type: 'strength', sets: [[8, 95], [6, 110], [5, 125], [4, 125]] },
        { name: 'Barbell Row',  type: 'strength', sets: [[10, 55], [8, 60], [8, 60]] },
        { name: 'Lat Pulldown', type: 'strength', sets: [[12, 45], [10, 50], [10, 50]] },
        { name: 'Face Pulls',   type: 'strength', sets: [[15, 12.5], [15, 12.5], [12, 15]] },
        { name: 'Hammer Curl',  type: 'strength', sets: [[12, 12], [10, 14], [10, 14]] },
      ],
      note: 'Back felt tight, took it easy on deadlifts.',
    },
    {
      ago: 10, dayTemplateId: 'tpl-legs', dayName: 'Legs',
      exercises: [
        { name: 'Squat',             type: 'strength', sets: [[10, 75], [8, 85], [6, 95], [6, 95]] },
        { name: 'Romanian Deadlift', type: 'strength', sets: [[10, 65], [8, 75], [8, 75]] },
        { name: 'Leg Press',         type: 'strength', sets: [[12, 130], [10, 150], [10, 150]] },
        { name: 'Leg Extension',     type: 'strength', sets: [[12, 40], [10, 45], [10, 45]] },
        { name: 'Calf Raises',       type: 'strength', sets: [[15, 55], [15, 55], [12, 65]] },
      ],
    },
    {
      ago: 12, dayTemplateId: 'tpl-push', dayName: 'Push',
      exercises: [
        { name: 'Bench Press',      type: 'strength', sets: [[10, 60], [8, 70], [6, 77.5]] },
        { name: 'Overhead Press',   type: 'strength', sets: [[10, 35], [8, 40], [8, 40]] },
        { name: 'Incline Dumbbell', type: 'strength', sets: [[12, 22], [10, 24], [10, 24]] },
        { name: 'Tricep Pushdown',  type: 'strength', sets: [[12, 22.5], [10, 25], [10, 25]] },
      ],
    },
    {
      ago: 13, dayTemplateId: 'tpl-pull', dayName: 'Pull',
      exercises: [
        { name: 'Deadlift',     type: 'strength', sets: [[8, 90], [6, 105], [5, 120]] },
        { name: 'Barbell Row',  type: 'strength', sets: [[10, 50], [8, 55], [8, 55]] },
        { name: 'Lat Pulldown', type: 'strength', sets: [[12, 42.5], [10, 47.5], [10, 47.5]] },
        { name: 'Barbell Curl', type: 'strength', sets: [[12, 22.5], [10, 25], [10, 25]] },
      ],
    },
  ];

  let gymExIdx = 1;
  let gymSetIdx = 1;

  for (const entry of gymEntries) {
    const dateKey = dateAgo(entry.ago);
    gymSessions[dateKey] = {
      date: dateKey,
      dayTemplateId: entry.dayTemplateId,
      dayName: entry.dayName,
      exercises: entry.exercises.map((ex) => ({
        id:         `seed-gex-${String(gymExIdx++).padStart(3, '0')}`,
        templateId: `seed-gtpl-${ex.name.toLowerCase().replace(/\s+/g, '-')}`,
        name:       ex.name,
        type:       ex.type,
        sets:       ex.sets.map(([reps, weight]) => ({
          id:     `seed-gs-${String(gymSetIdx++).padStart(3, '0')}`,
          reps,
          weight,
        })),
      })),
      note: entry.note,
    };
  }

  localStorage.setItem(GYM_KEY, JSON.stringify(gymSessions));
}

export function seedTestUser(): void {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];
    const userExists = users.some((u: { id: string }) => u.id === TEST_USER_ID);

    if (userExists) {
      // User exists — just ensure gym data is seeded
      seedGymSessions();
      return;
    }

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

    seedGymSessions();
    console.info('[seed] Test account ready — username: test / password: test12');
  } catch {
    // Silently ignore storage errors
  }
}
