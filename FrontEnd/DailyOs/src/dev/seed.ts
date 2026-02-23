/**
 * Dev-only seed — runs once to populate localStorage with a test account.
 * username: test  |  password: test12
 * Safe to delete or leave in — it only writes if the test user doesn't exist yet.
 */

const TEST_USER_ID = 'seed-user-test-001';
const USERS_KEY    = 'dailyos_users';
const DAYS_KEY     = `dailyos_days_${TEST_USER_ID}`;

const SEED_MOODS = ['bad', 'meh', 'good', 'great'] as const;
const SEED_WINS = [
  'Finished the important thing first.',
  'Kept momentum even with low energy.',
  'Logged everything on time.',
  'Handled work stress better than usual.',
  'Stayed consistent and did not skip.',
  'Closed loops instead of postponing.',
];
const SEED_REFLECTIONS = [
  'Good pace today; keep the same start tomorrow.',
  'Energy dipped midday but recovered well.',
  'Less overthinking, more action worked.',
  'Need a cleaner evening routine.',
  'Solid day overall; sleep earlier tonight.',
  'Small progress, but still progress.',
];
const SEED_FOCUS_TASKS = [
  'Finish the most important work block before noon.',
  'Protect focus and avoid context switching.',
  'Close open tasks from earlier this week.',
  'Ship one concrete thing today.',
  'Keep the day simple and execute the plan.',
  'Prioritize output over busy work.',
];
const SEED_MUST_DOS = [
  'Complete the must-do before checking stats.',
  'Log work and expenses before the day ends.',
  'Do one focused block with no distractions.',
  'Finish the hardest task first.',
  'Wrap the day with a short reflection.',
];
const SEED_PRIORITIES = [
  'Main work block',
  'Log shifts and tips',
  'Review expenses',
  'Gym session or recovery',
  'Project next step',
  'Admin cleanup',
  'Meal prep / groceries',
  'Inbox cleanup',
  'Sleep routine setup',
  'Plan tomorrow',
];
const SEED_RECOVERY_NOTES = [
  'Slept okay but energy dipped after lunch.',
  'Better sleep than yesterday, felt more stable.',
  'Low sleep, keep training lighter today.',
  'Recovery feels good, push the main task early.',
  'Late sleep but manageable energy.',
  '',
  '',
];

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

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function buildSeedTopPriorities(dateKey: string): string[] {
  const used = new Set<number>();
  const items: string[] = [];
  let offset = 0;

  while (items.length < 3 && offset < 10) {
    const idx = hashString(`${dateKey}-prio-${offset}`) % SEED_PRIORITIES.length;
    offset += 1;
    if (used.has(idx)) continue;
    used.add(idx);
    items.push(SEED_PRIORITIES[idx]);
  }

  return items;
}

function seedHomeMetaForDays(): void {
  const raw = localStorage.getItem(DAYS_KEY);
  if (!raw) return;

  try {
    const days = JSON.parse(raw) as Record<string, any>;
    let changed = false;

    for (const [dateKey, day] of Object.entries(days)) {
      if (!day || typeof day !== 'object') continue;

      const hasActivity = (day.shifts?.length ?? 0) > 0 || (day.expenses?.length ?? 0) > 0;
      if (!hasActivity) continue;

      const idx = hashString(dateKey) % SEED_WINS.length;
      const moodIdx = hashString(`${dateKey}-mood`) % SEED_MOODS.length;

      if (!day.mood) {
        day.mood = SEED_MOODS[moodIdx];
        changed = true;
      }
      if (!day.winOfDay) {
        day.winOfDay = SEED_WINS[idx];
        changed = true;
      }
      if (!day.reflectionLine) {
        day.reflectionLine = SEED_REFLECTIONS[idx % SEED_REFLECTIONS.length];
        changed = true;
      }
      if (!day.focusTask) {
        const focusIdx = hashString(`${dateKey}-focus`) % SEED_FOCUS_TASKS.length;
        day.focusTask = SEED_FOCUS_TASKS[focusIdx];
        changed = true;
      }
      if (!day.mustDo) {
        const mustDoIdx = hashString(`${dateKey}-mustdo`) % SEED_MUST_DOS.length;
        day.mustDo = SEED_MUST_DOS[mustDoIdx];
        changed = true;
      }
      if (!Array.isArray(day.topPriorities) || day.topPriorities.length === 0) {
        day.topPriorities = buildSeedTopPriorities(dateKey);
        changed = true;
      }
      if (typeof day.sleepHours !== 'number') {
        const base = 5 + (hashString(`${dateKey}-sleep-hours`) % 9) * 0.5; // 5h - 9h
        day.sleepHours = Math.min(10, Math.max(4, base));
        changed = true;
      }
      if (typeof day.sleepQuality !== 'number') {
        day.sleepQuality = ((hashString(`${dateKey}-sleep-quality`) % 5) + 1) as 1 | 2 | 3 | 4 | 5;
        changed = true;
      }
      if (typeof day.energyLevel !== 'number') {
        day.energyLevel = ((hashString(`${dateKey}-energy`) % 5) + 1) as 1 | 2 | 3 | 4 | 5;
        changed = true;
      }
      if (!day.recoveryNote) {
        const rIdx = hashString(`${dateKey}-recovery-note`) % SEED_RECOVERY_NOTES.length;
        const note = SEED_RECOVERY_NOTES[rIdx];
        if (note) {
          day.recoveryNote = note;
          changed = true;
        }
      }

      // Make end-of-day visible in Home for testing even during daytime.
      const isToday = dateKey === dateAgo(0);
      const shouldMarkClosed = isToday || hashString(`${dateKey}-closed`) % 3 === 0;
      if (!day.closedAt && shouldMarkClosed) {
        day.closedAt = `${dateKey}T21:30:00.000Z`;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(DAYS_KEY, JSON.stringify(days));
    }
  } catch {
    // Ignore malformed dev data
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function pick<T>(items: T[]): T {
  return items[randInt(0, items.length - 1)];
}

function roundStep(value: number, step = 0.5): number {
  return Math.round(value / step) * step;
}

function toTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const h = String(Math.floor(normalized / 60)).padStart(2, '0');
  const m = String(normalized % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function buildRandomDaysSeed(): Record<string, unknown> {
  const days: Record<string, unknown> = {};

  const expenseLabels = [
    'Coffee',
    'Lunch',
    'Snack',
    'Transport',
    'Water',
    'Fuel',
    'Groceries',
    'Takeaway',
  ];
  const notes = [
    'Solid day, stayed on top of tasks.',
    'Busy shift but good rhythm.',
    'Energy was lower than usual after lunch.',
    'Tips were decent and workflow felt smooth.',
    'Heavy day but still productive.',
    'Kept things simple and consistent.',
    'Good pace, need better sleep tonight.',
    '',
    '',
  ];

  let shiftIdx = 1000;
  let expIdx = 1000;

  for (let ago = 0; ago < 90; ago += 1) {
    const dateKey = dateAgo(ago);
    const shifts: Array<{
      id: string;
      startTime: string;
      endTime: string;
      payType: 'flat' | 'hourly';
      payAmount: number;
      tips: number;
    }> = [];

    const expenses: Array<{
      id: string;
      amount: number;
      description: string;
    }> = [];

    const hasMainShift = ago === 0 ? chance(0.9) : chance(0.72);
    if (hasMainShift) {
      const startHour = pick([8, 9, 10, 11, 12]);
      const startMinute = chance(0.35) ? 30 : 0;
      const durationHours = randInt(6, 9);
      const durationMinutes = chance(0.25) ? 30 : 0;
      const startTotal = startHour * 60 + startMinute;
      const endTotal = startTotal + durationHours * 60 + durationMinutes;
      const payType = chance(0.62) ? 'flat' : 'hourly';
      const payAmount = payType === 'hourly' ? roundStep(randInt(6, 11) + (chance(0.35) ? 0.5 : 0), 0.5) : 0;
      const tips = chance(0.68) ? roundStep(randInt(0, 18) + (chance(0.4) ? 0.5 : 0), 0.5) : 0;

      shifts.push({
        id: sid(shiftIdx++),
        startTime: toTime(startTotal),
        endTime: toTime(endTotal),
        payType,
        payAmount,
        tips,
      });
    }

    if (hasMainShift && chance(0.22)) {
      const startHour = pick([17, 18, 19, 20, 21, 22]);
      const startMinute = chance(0.35) ? 30 : 0;
      const durationHours = randInt(2, 5);
      const durationMinutes = chance(0.3) ? 30 : 0;
      const startTotal = startHour * 60 + startMinute;
      const endTotal = startTotal + durationHours * 60 + durationMinutes;

      shifts.push({
        id: sid(shiftIdx++),
        startTime: toTime(startTotal),
        endTime: toTime(endTotal),
        payType: 'hourly',
        payAmount: roundStep(randInt(6, 10) + (chance(0.45) ? 0.5 : 0), 0.5),
        tips: chance(0.55) ? roundStep(randInt(0, 10) + (chance(0.3) ? 0.5 : 0), 0.5) : 0,
      });
    }

    const expenseCount =
      shifts.length > 0
        ? randInt(0, 2) + (chance(0.25) ? 1 : 0)
        : (chance(0.16) ? 1 : 0);

    for (let i = 0; i < expenseCount; i += 1) {
      const amount =
        chance(0.75)
          ? roundStep(randInt(2, 12) + (chance(0.3) ? 0.5 : 0), 0.5)
          : roundStep(randInt(12, 35) + (chance(0.25) ? 0.5 : 0), 0.5);

      expenses.push({
        id: eid(expIdx++),
        amount,
        description: pick(expenseLabels),
      });
    }

    // Keep some true days off missing entirely from the record.
    if (shifts.length === 0 && expenses.length === 0 && chance(0.75)) {
      continue;
    }

    days[dateKey] = {
      date: dateKey,
      note: pick(notes),
      shifts,
      expenses,
    };
  }

  return days;
}

function ensureThreeMonthDaysSeed(): void {
  const raw = localStorage.getItem(DAYS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (Object.keys(parsed).length >= 70) {
        seedHomeMetaForDays();
        return;
      }
    } catch {
      // Rebuild malformed data below
    }
  }

  localStorage.setItem(DAYS_KEY, JSON.stringify(buildRandomDaysSeed()));
  seedHomeMetaForDays();
}

function buildRandomGymSessionsSeed(): Record<string, unknown> {
  const sessions: Record<string, unknown> = {};

  const templates = [
    {
      dayTemplateId: 'tpl-push',
      dayName: 'Push',
      exercises: [
        { name: 'Bench Press', baseWeight: 75, reps: [10, 8, 6, 6] },
        { name: 'Overhead Press', baseWeight: 42.5, reps: [10, 8, 8] },
        { name: 'Incline Dumbbell', baseWeight: 24, reps: [12, 10, 10] },
        { name: 'Lateral Raises', baseWeight: 10, reps: [15, 12, 12] },
        { name: 'Tricep Pushdown', baseWeight: 27.5, reps: [12, 10, 10] },
      ],
    },
    {
      dayTemplateId: 'tpl-pull',
      dayName: 'Pull',
      exercises: [
        { name: 'Deadlift', baseWeight: 115, reps: [8, 6, 4, 4] },
        { name: 'Barbell Row', baseWeight: 60, reps: [10, 8, 8] },
        { name: 'Lat Pulldown', baseWeight: 50, reps: [12, 10, 10] },
        { name: 'Face Pulls', baseWeight: 15, reps: [15, 15, 12] },
        { name: 'Barbell Curl', baseWeight: 25, reps: [12, 10, 10] },
      ],
    },
    {
      dayTemplateId: 'tpl-legs',
      dayName: 'Legs',
      exercises: [
        { name: 'Squat', baseWeight: 90, reps: [10, 8, 6, 6] },
        { name: 'Romanian Deadlift', baseWeight: 75, reps: [10, 8, 8] },
        { name: 'Leg Press', baseWeight: 150, reps: [12, 10, 10] },
        { name: 'Leg Curl', baseWeight: 37.5, reps: [12, 10, 10] },
        { name: 'Calf Raises', baseWeight: 60, reps: [15, 15, 12] },
      ],
    },
  ] as const;

  const notes = [
    'Felt strong today.',
    'Good session, solid tempo.',
    'Energy was average but got it done.',
    'Form focus day.',
    'Short session, still productive.',
    '',
    '',
  ];

  let gymExIdx = 1;
  let gymSetIdx = 1;
  let templateRotation = randInt(0, templates.length - 1);

  for (let ago = 0; ago < 90; ago += 1) {
    const shouldTrain = ago === 0 ? chance(0.45) : chance(0.42);
    if (!shouldTrain) continue;

    const dateKey = dateAgo(ago);
    const template = templates[templateRotation % templates.length];
    templateRotation += 1;

    sessions[dateKey] = {
      date: dateKey,
      dayTemplateId: template.dayTemplateId,
      dayName: template.dayName,
      exercises: template.exercises.map((exercise) => ({
        id: `seed-gex-${String(gymExIdx++).padStart(3, '0')}`,
        templateId: `seed-gtpl-${exercise.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: exercise.name,
        type: 'strength',
        sets: exercise.reps.map((reps) => ({
          id: `seed-gs-${String(gymSetIdx++).padStart(3, '0')}`,
          reps: Math.max(1, reps + randInt(-1, 1)),
          weight: Math.max(0, roundStep(exercise.baseWeight + randInt(-10, 10) * 0.5, 0.5)),
        })),
      })),
      note: pick(notes) || undefined,
    };
  }

  return sessions;
}

function seedGymSessions(): void {
  const GYM_KEY = `dailyos_gym_sessions_${TEST_USER_ID}`;
  const existingRaw = localStorage.getItem(GYM_KEY);
  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw) as Record<string, unknown>;
      if (Object.keys(parsed).length >= 28) return; // ~3 months with ~3-4 sessions/week
    } catch {
      // Rebuild malformed data below
    }
  }

  localStorage.setItem(GYM_KEY, JSON.stringify(buildRandomGymSessionsSeed()));
  return;

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
      ensureThreeMonthDaysSeed();
      // User exists — just ensure gym data is seeded
      seedGymSessions();
      seedHomeMetaForDays();
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
    localStorage.setItem(`dailyos_settings_${TEST_USER_ID}`, JSON.stringify({
      dayResetHour:        4,
      currency:            '€',
      monthlyFlatSalary:   1100,
      workingDaysPerMonth: 22,
      theme:               'dark',
    }));
    ensureThreeMonthDaysSeed();
    seedGymSessions();
    console.info('[seed] Test account ready â€” username: test / password: test12');
    return;

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

    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
    seedHomeMetaForDays();

    seedGymSessions();
    console.info('[seed] Test account ready — username: test / password: test12');
  } catch {
    // Silently ignore storage errors
  }
}

