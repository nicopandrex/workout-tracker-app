// Enums
export enum ExerciseCategory {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  CORE = 'core',
  CARDIO = 'cardio',
  OTHER = 'other',
}

export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  MACHINE = 'machine',
  CABLE = 'cable',
  BODYWEIGHT = 'bodyweight',
  KETTLEBELL = 'kettlebell',
  OTHER = 'other',
}

// Muscle Groups
export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  QUADS = 'quads',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  ABS = 'abs',
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Chest',
  [MuscleGroup.BACK]: 'Back',
  [MuscleGroup.SHOULDERS]: 'Shoulders',
  [MuscleGroup.BICEPS]: 'Biceps',
  [MuscleGroup.TRICEPS]: 'Triceps',
  [MuscleGroup.QUADS]: 'Quads',
  [MuscleGroup.HAMSTRINGS]: 'Hamstrings',
  [MuscleGroup.GLUTES]: 'Glutes',
  [MuscleGroup.CALVES]: 'Calves',
  [MuscleGroup.ABS]: 'Abs',
};

// Exercise Entity
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup?: MuscleGroup;
  isUnilateral?: boolean; // Track left and right sides separately
  createdAt: string;
}

// Routine Exercise Entry
export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  defaultSets: number;
  defaultRepRangeMin: number;
  defaultRepRangeMax: number;
  restTimeSeconds?: number; // Rest time between sets in seconds
  notes?: string;
}

// Routine Entity
export interface Routine {
  id: string;
  name: string;
  notes?: string;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// Set Log Entry
export interface SetLog {
  id: string;
  setIndex: number;
  weight: number;
  reps: number;
  rpe?: number;
  notes?: string;
  side?: 'left' | 'right'; // For unilateral exercises
  createdAt: string;
}

// Exercise Log Entry (within a session)
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  setLogs: SetLog[];
  restTimeSeconds?: number;
}

// Session Entity
export interface Session {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: string;
  endedAt?: string;
  isCompleted: boolean;
  exerciseLogs: ExerciseLog[];
  createdAt: string;
  updatedAt: string;
}

// Forms and Inputs
export interface CreateExerciseInput {
  name: string;
  category: ExerciseCategory;
  equipment: Equipment;
  primaryMuscleGroup: MuscleGroup;
  secondaryMuscleGroup?: MuscleGroup;
}

export interface CreateRoutineInput {
  name: string;
  notes?: string;
}

export interface UpdateRoutineInput {
  id: string;
  name?: string;
  notes?: string;
  exercises?: RoutineExercise[];
}

export interface CreateSessionInput {
  routineId: string;
  routineName: string;
}

export interface UpdateSetLogInput {
  sessionId: string;
  exerciseLogId: string;
  setLog: Partial<SetLog>;
}

// Stats and Analytics
export interface ExerciseStats {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  bestE1RM: number;
  totalSessions: number;
  lastSession?: string;
}

export interface SessionSummary {
  sessionId: string;
  date: string;
  routineName: string;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  duration?: number;
}

// Time Filters
export enum TimeFilter {
  ALL_TIME = 'all',
  ONE_MONTH = '1m',
  THREE_MONTHS = '3m',
  SIX_MONTHS = '6m',
  ONE_YEAR = '1y',
}

// Chart Data
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// PR Detection Results
export interface PRResult {
  isPR: boolean;
  isMatch: boolean;
  previousBest?: {
    weight: number;
    reps: number;
    date: string;
  };
}

// Export/Import Data Structure
export interface ExportData {
  version: string;
  exportDate: string;
  exercises: Exercise[];
  routines: Routine[];
  sessions: Session[];
}
