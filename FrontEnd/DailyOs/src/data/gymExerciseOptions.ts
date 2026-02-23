const RAW_STRENGTH_EXERCISES = [
  // Chest
  'Bench Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Dumbbell Bench Press',
  'Incline Dumbbell Press',
  'Decline Dumbbell Press',
  'Close-Grip Bench Press',
  'Spoto Press',
  'Floor Press',
  'Pin Press',
  'Smith Machine Bench Press',
  'Machine Chest Press',
  'Chest Press (Plate Loaded)',
  'Push-Up',
  'Weighted Push-Up',
  'Deficit Push-Up',
  'Ring Push-Up',
  'Dip',
  'Weighted Dip',
  'Chest Dip',
  'Cable Fly',
  'Low-to-High Cable Fly',
  'High-to-Low Cable Fly',
  'Pec Deck Fly',
  'Dumbbell Fly',
  'Incline Dumbbell Fly',
  'Svend Press',
  'Hex Press',

  // Shoulders
  'Overhead Press',
  'Seated Overhead Press',
  'Standing Dumbbell Shoulder Press',
  'Seated Dumbbell Shoulder Press',
  'Push Press',
  'Arnold Press',
  'Landmine Press',
  'Single-Arm Landmine Press',
  'Machine Shoulder Press',
  'Behind-the-Neck Press',
  'Z Press',
  'Lateral Raise',
  'Dumbbell Lateral Raise',
  'Cable Lateral Raise',
  'Machine Lateral Raise',
  'Leaning Lateral Raise',
  'Front Raise',
  'Dumbbell Front Raise',
  'Plate Front Raise',
  'Cable Front Raise',
  'Rear Delt Fly',
  'Reverse Pec Deck',
  'Bent-Over Lateral Raise',
  'Face Pull',
  'Cable Rear Delt Row',
  'Upright Row',
  'Dumbbell Upright Row',
  'Shrug',
  'Barbell Shrug',
  'Dumbbell Shrug',
  'Trap Bar Shrug',

  // Back (Vertical Pull)
  'Pull-Up',
  'Chin-Up',
  'Neutral-Grip Pull-Up',
  'Weighted Pull-Up',
  'Weighted Chin-Up',
  'Assisted Pull-Up',
  'Lat Pulldown',
  'Wide-Grip Lat Pulldown',
  'Close-Grip Lat Pulldown',
  'Neutral-Grip Lat Pulldown',
  'Single-Arm Lat Pulldown',
  'Straight-Arm Pulldown',
  'Machine Pulldown',

  // Back (Rows)
  'Barbell Row',
  'Pendlay Row',
  'Yates Row',
  'Seal Row',
  'T-Bar Row',
  'Chest-Supported Row',
  'Dumbbell Row',
  'Single-Arm Dumbbell Row',
  'Meadows Row',
  'Cable Row',
  'Seated Cable Row',
  'Wide Cable Row',
  'Close-Grip Cable Row',
  'Machine Row',
  'Hammer Strength Row',
  'Inverted Row',
  'Ring Row',

  // Deadlift / Posterior Chain
  'Deadlift',
  'Sumo Deadlift',
  'Romanian Deadlift',
  'Stiff-Leg Deadlift',
  'Deficit Deadlift',
  'Block Pull',
  'Rack Pull',
  'Trap Bar Deadlift',
  'Snatch-Grip Deadlift',
  'Single-Leg Romanian Deadlift',
  'Good Morning',
  'Back Extension',
  '45 Degree Back Extension',
  'Reverse Hyperextension',
  'Hip Hinge',

  // Glutes / Hips
  'Hip Thrust',
  'Barbell Hip Thrust',
  'Dumbbell Hip Thrust',
  'Glute Bridge',
  'Barbell Glute Bridge',
  'Single-Leg Glute Bridge',
  'Cable Pull-Through',
  'Kettlebell Swing',
  'Single-Leg Hip Thrust',
  'Frog Pump',
  'Hip Abduction Machine',
  'Cable Hip Abduction',
  'Cable Hip Adduction',

  // Quads / Squats
  'Back Squat',
  'High-Bar Squat',
  'Low-Bar Squat',
  'Front Squat',
  'Box Squat',
  'Pause Squat',
  'Tempo Squat',
  'Goblet Squat',
  'Zercher Squat',
  'Hack Squat',
  'Machine Hack Squat',
  'Smith Machine Squat',
  'Belt Squat',
  'Leg Press',
  'Single-Leg Press',
  'Pendulum Squat',
  'Sissy Squat',
  'Split Squat',
  'Bulgarian Split Squat',
  'Rear-Foot Elevated Split Squat',
  'Walking Lunge',
  'Reverse Lunge',
  'Forward Lunge',
  'Lateral Lunge',
  'Curtsy Lunge',
  'Step-Up',
  'Weighted Step-Up',
  'Pistol Squat',
  'Assisted Pistol Squat',

  // Hamstrings / Isolation
  'Lying Leg Curl',
  'Seated Leg Curl',
  'Standing Leg Curl',
  'Single-Leg Curl',
  'Nordic Curl',
  'Glute-Ham Raise',

  // Quads / Isolation
  'Leg Extension',
  'Single-Leg Extension',
  'Spanish Squat',
  'Terminal Knee Extension',

  // Calves / Tibialis
  'Standing Calf Raise',
  'Seated Calf Raise',
  'Leg Press Calf Raise',
  'Single-Leg Calf Raise',
  'Donkey Calf Raise',
  'Tibialis Raise',
  'Toe Raise',

  // Biceps
  'Barbell Curl',
  'EZ Bar Curl',
  'Dumbbell Curl',
  'Alternating Dumbbell Curl',
  'Incline Dumbbell Curl',
  'Hammer Curl',
  'Cross-Body Hammer Curl',
  'Preacher Curl',
  'Machine Preacher Curl',
  'Cable Curl',
  'High Cable Curl',
  'Bayesian Curl',
  'Concentration Curl',
  'Spider Curl',
  'Reverse Curl',
  'Zottman Curl',

  // Triceps
  'Triceps Pushdown',
  'Rope Pushdown',
  'Straight-Bar Pushdown',
  'Overhead Triceps Extension',
  'Cable Overhead Triceps Extension',
  'Dumbbell Overhead Triceps Extension',
  'Skull Crusher',
  'EZ Bar Skull Crusher',
  'JM Press',
  'Close-Grip Push-Up',
  'Bench Dip',
  'Kickback',
  'Cable Kickback',
  'Single-Arm Pushdown',

  // Forearms / Grip
  'Wrist Curl',
  'Reverse Wrist Curl',
  'Behind-the-Back Wrist Curl',
  'Farmer Carry',
  'Suitcase Carry',
  'Plate Pinch Hold',
  'Dead Hang',
  'Towel Hang',
  'Grip Trainer Squeeze',

  // Core (weighted strength-focused)
  'Cable Crunch',
  'Weighted Crunch',
  'Decline Sit-Up',
  'Weighted Sit-Up',
  'Hanging Leg Raise',
  'Hanging Knee Raise',
  'Captain Chair Leg Raise',
  'Ab Wheel Rollout',
  'Barbell Rollout',
  'Pallof Press',
  'Weighted Plank',
  'Side Plank',
  'Landmine Rotation',
  'Russian Twist',
  'Cable Woodchopper',
  'Reverse Crunch',
  'Dragon Flag',
  'Back Extension Hold',

  // Olympic / power variations (strength use-cases)
  'Power Clean',
  'Hang Power Clean',
  'Clean Pull',
  'Power Snatch',
  'Hang Power Snatch',
  'Snatch Pull',
  'Clean and Press',
  'Thruster',
  'Barbell Complex',
];

const RAW_CARDIO_EXERCISES = [
  'Running',
  'Treadmill Run',
  'Jogging',
  'Walking',
  'Incline Walk',
  'Cycling',
  'Stationary Bike',
  'Air Bike',
  'Rowing',
  'Rower Intervals',
  'Elliptical',
  'Stair Climber',
  'Jump Rope',
  'Swimming',
  'Hiking',
  'Sled Push',
  'Sled Pull',
];

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function lower(value: string): string {
  return value.toLowerCase();
}

function includesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function isPushExercise(name: string): boolean {
  const v = lower(name);
  if (includesAny(v, ['leg press', 'pallof press', 'cable pull-through'])) return false;

  return includesAny(v, [
    'bench',
    'chest press',
    'push-up',
    'push press',
    'overhead press',
    'shoulder press',
    'arnold press',
    'landmine press',
    'z press',
    'spoto press',
    'pin press',
    'floor press',
    'close-grip bench',
    'hex press',
    'svend press',
    'thruster',
    'clean and press',
    'fly',
    'pec deck',
    'dip',
    'lateral raise',
    'front raise',
    'upright row',
    'triceps',
    'pushdown',
    'skull crusher',
    'jm press',
    'kickback',
  ]);
}

function isChestExercise(name: string): boolean {
  const v = lower(name);

  return includesAny(v, [
    'bench',
    'chest press',
    'push-up',
    'chest dip',
    'weighted dip',
    'dip',
    'fly',
    'pec deck',
    'svend press',
    'hex press',
    'floor press',
    'spoto press',
    'pin press',
  ]) && !includesAny(v, [
    'close-grip',
    'bench dip',
    'jm press',
    'triceps',
    'pushdown',
    'kickback',
  ]);
}

function isPullExercise(name: string): boolean {
  const v = lower(name);
  if (includesAny(v, ['leg curl', 'cable pull-through'])) return false;

  return includesAny(v, [
    'pull-up',
    'chin-up',
    'pulldown',
    'straight-arm pulldown',
    'row',
    'deadlift',
    'rack pull',
    'block pull',
    'snatch pull',
    'clean pull',
    'shrug',
    'face pull',
    'rear delt',
    'reverse pec deck',
    'curl',
    'farmer carry',
    'suitcase carry',
    'dead hang',
    'towel hang',
    'grip trainer',
    'good morning',
    'back extension',
    'reverse hyper',
    'glute-ham raise',
    'nordic curl',
  ]);
}

function isBackExercise(name: string): boolean {
  const v = lower(name);
  if (includesAny(v, ['leg curl', 'cable pull-through'])) return false;

  return includesAny(v, [
    'pull-up',
    'chin-up',
    'pulldown',
    'straight-arm pulldown',
    'row',
    'deadlift',
    'rack pull',
    'block pull',
    'clean pull',
    'snatch pull',
    'shrug',
    'meadows row',
    'face pull',
    'rear delt',
    'reverse pec deck',
    'good morning',
    'back extension',
    'reverse hyper',
    'inverted row',
    'ring row',
  ]);
}

function isShouldersExercise(name: string): boolean {
  const v = lower(name);

  return includesAny(v, [
    'overhead press',
    'shoulder press',
    'push press',
    'arnold press',
    'landmine press',
    'z press',
    'lateral raise',
    'front raise',
    'rear delt',
    'reverse pec deck',
    'face pull',
    'upright row',
    'shrug',
  ]);
}

function isArmsExercise(name: string): boolean {
  const v = lower(name);

  return includesAny(v, [
    'curl',
    'triceps',
    'pushdown',
    'overhead triceps',
    'skull crusher',
    'jm press',
    'kickback',
    'close-grip push-up',
    'bench dip',
    'wrist curl',
    'reverse wrist curl',
    'grip',
    'farmer carry',
    'suitcase carry',
    'plate pinch',
    'dead hang',
    'towel hang',
  ]);
}

function isLegExercise(name: string): boolean {
  const v = lower(name);

  return includesAny(v, [
    'squat',
    'lunge',
    'step-up',
    'leg press',
    'leg curl',
    'leg extension',
    'hip thrust',
    'glute bridge',
    'glute',
    'hip abduction',
    'hip adduction',
    'cable pull-through',
    'kettlebell swing',
    'deadlift',
    'romanian deadlift',
    'stiff-leg deadlift',
    'single-leg romanian deadlift',
    'good morning',
    'calf raise',
    'tibialis',
    'toe raise',
    'split squat',
    'bulgarian',
    'rear-foot elevated',
    'hack squat',
    'belt squat',
    'pendulum squat',
    'sissy squat',
    'nordic curl',
    'glute-ham raise',
    'frog pump',
    'spanish squat',
    'terminal knee extension',
    'pistol squat',
  ]);
}

// ── Default exercises per program type / day ────────────────────────────

type DefaultExercise = { name: string; type: 'strength' | 'cardio' };

export const DEFAULT_EXERCISES_BY_PROGRAM: Record<string, Record<string, DefaultExercise[]>> = {
  'push-pull-legs': {
    'Push A': [
      { name: 'Bench Press', type: 'strength' },
      { name: 'Incline Dumbbell Press', type: 'strength' },
      { name: 'Overhead Press', type: 'strength' },
      { name: 'Cable Fly', type: 'strength' },
      { name: 'Lateral Raise', type: 'strength' },
      { name: 'Triceps Pushdown', type: 'strength' },
    ],
    'Pull A': [
      { name: 'Barbell Row', type: 'strength' },
      { name: 'Pull-Up', type: 'strength' },
      { name: 'Seated Cable Row', type: 'strength' },
      { name: 'Face Pull', type: 'strength' },
      { name: 'Barbell Curl', type: 'strength' },
      { name: 'Hammer Curl', type: 'strength' },
    ],
    'Legs A': [
      { name: 'Back Squat', type: 'strength' },
      { name: 'Romanian Deadlift', type: 'strength' },
      { name: 'Leg Press', type: 'strength' },
      { name: 'Leg Curl', type: 'strength' },
      { name: 'Leg Extension', type: 'strength' },
      { name: 'Standing Calf Raise', type: 'strength' },
    ],
    'Push B': [
      { name: 'Incline Bench Press', type: 'strength' },
      { name: 'Dumbbell Bench Press', type: 'strength' },
      { name: 'Seated Dumbbell Shoulder Press', type: 'strength' },
      { name: 'Pec Deck Fly', type: 'strength' },
      { name: 'Cable Lateral Raise', type: 'strength' },
      { name: 'Overhead Triceps Extension', type: 'strength' },
    ],
    'Pull B': [
      { name: 'Deadlift', type: 'strength' },
      { name: 'Lat Pulldown', type: 'strength' },
      { name: 'Dumbbell Row', type: 'strength' },
      { name: 'Rear Delt Fly', type: 'strength' },
      { name: 'EZ Bar Curl', type: 'strength' },
      { name: 'Incline Dumbbell Curl', type: 'strength' },
    ],
    'Legs B': [
      { name: 'Front Squat', type: 'strength' },
      { name: 'Hip Thrust', type: 'strength' },
      { name: 'Bulgarian Split Squat', type: 'strength' },
      { name: 'Seated Leg Curl', type: 'strength' },
      { name: 'Leg Extension', type: 'strength' },
      { name: 'Seated Calf Raise', type: 'strength' },
    ],
  },
  'bro-split': {
    'Chest': [
      { name: 'Bench Press', type: 'strength' },
      { name: 'Incline Dumbbell Press', type: 'strength' },
      { name: 'Cable Fly', type: 'strength' },
      { name: 'Pec Deck Fly', type: 'strength' },
      { name: 'Dip', type: 'strength' },
    ],
    'Back': [
      { name: 'Deadlift', type: 'strength' },
      { name: 'Barbell Row', type: 'strength' },
      { name: 'Lat Pulldown', type: 'strength' },
      { name: 'Seated Cable Row', type: 'strength' },
      { name: 'Face Pull', type: 'strength' },
    ],
    'Shoulders': [
      { name: 'Overhead Press', type: 'strength' },
      { name: 'Lateral Raise', type: 'strength' },
      { name: 'Rear Delt Fly', type: 'strength' },
      { name: 'Face Pull', type: 'strength' },
      { name: 'Shrug', type: 'strength' },
    ],
    'Arms': [
      { name: 'Barbell Curl', type: 'strength' },
      { name: 'Hammer Curl', type: 'strength' },
      { name: 'Preacher Curl', type: 'strength' },
      { name: 'Triceps Pushdown', type: 'strength' },
      { name: 'Skull Crusher', type: 'strength' },
      { name: 'Overhead Triceps Extension', type: 'strength' },
    ],
    'Legs': [
      { name: 'Back Squat', type: 'strength' },
      { name: 'Romanian Deadlift', type: 'strength' },
      { name: 'Leg Press', type: 'strength' },
      { name: 'Leg Curl', type: 'strength' },
      { name: 'Leg Extension', type: 'strength' },
      { name: 'Standing Calf Raise', type: 'strength' },
    ],
  },
  'full-body': {
    'Full Body A': [
      { name: 'Back Squat', type: 'strength' },
      { name: 'Bench Press', type: 'strength' },
      { name: 'Barbell Row', type: 'strength' },
      { name: 'Overhead Press', type: 'strength' },
      { name: 'Barbell Curl', type: 'strength' },
    ],
    'Full Body B': [
      { name: 'Deadlift', type: 'strength' },
      { name: 'Incline Dumbbell Press', type: 'strength' },
      { name: 'Pull-Up', type: 'strength' },
      { name: 'Lateral Raise', type: 'strength' },
      { name: 'Triceps Pushdown', type: 'strength' },
    ],
    'Full Body C': [
      { name: 'Front Squat', type: 'strength' },
      { name: 'Dumbbell Bench Press', type: 'strength' },
      { name: 'Seated Cable Row', type: 'strength' },
      { name: 'Face Pull', type: 'strength' },
      { name: 'Hammer Curl', type: 'strength' },
    ],
  },
  'cardio': {
    'Cardio A': [
      { name: 'Running', type: 'cardio' },
      { name: 'Jump Rope', type: 'cardio' },
    ],
    'Cardio B': [
      { name: 'Cycling', type: 'cardio' },
      { name: 'Rowing', type: 'cardio' },
    ],
    'Cardio C': [
      { name: 'Swimming', type: 'cardio' },
      { name: 'Stair Climber', type: 'cardio' },
    ],
  },
  'calisthenics': {
    'Push': [
      { name: 'Push-Up', type: 'strength' },
      { name: 'Dip', type: 'strength' },
      { name: 'Deficit Push-Up', type: 'strength' },
      { name: 'Close-Grip Push-Up', type: 'strength' },
    ],
    'Pull': [
      { name: 'Pull-Up', type: 'strength' },
      { name: 'Chin-Up', type: 'strength' },
      { name: 'Inverted Row', type: 'strength' },
      { name: 'Hanging Leg Raise', type: 'strength' },
    ],
    'Legs': [
      { name: 'Pistol Squat', type: 'strength' },
      { name: 'Bulgarian Split Squat', type: 'strength' },
      { name: 'Walking Lunge', type: 'strength' },
      { name: 'Nordic Curl', type: 'strength' },
    ],
    'Skills': [
      { name: 'Ring Push-Up', type: 'strength' },
      { name: 'Ring Row', type: 'strength' },
      { name: 'Ab Wheel Rollout', type: 'strength' },
      { name: 'Weighted Plank', type: 'strength' },
    ],
  },
};

export const STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES);
export const CARDIO_EXERCISE_OPTIONS = uniqueSorted(RAW_CARDIO_EXERCISES);
export const CHEST_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isChestExercise));
export const BACK_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isBackExercise));
export const SHOULDERS_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isShouldersExercise));
export const ARMS_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isArmsExercise));
export const PUSH_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isPushExercise));
export const PULL_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isPullExercise));
export const LEGS_STRENGTH_EXERCISE_OPTIONS = uniqueSorted(RAW_STRENGTH_EXERCISES.filter(isLegExercise));
