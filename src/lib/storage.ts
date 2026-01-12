import {
  Exercise,
  Routine,
  Session,
  CreateExerciseInput,
  CreateRoutineInput,
  UpdateRoutineInput,
  CreateSessionInput,
  ExerciseLog,
  SetLog,
  RoutineExercise,
} from '@/types';

// Storage keys
const STORAGE_KEYS = {
  EXERCISES: 'workout_app_exercises',
  ROUTINES: 'workout_app_routines',
  SESSIONS: 'workout_app_sessions',
  INITIALIZED: 'workout_app_initialized',
} as const;

// Helper functions
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
  }
};

// Exercise Operations
export const exerciseStorage = {
  getAll: (): Exercise[] => {
    return getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
  },

  getById: (id: string): Exercise | null => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    return exercises.find((ex) => ex.id === id) || null;
  },

  create: (input: CreateExerciseInput): Exercise => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    const newExercise: Exercise = {
      id: generateId(),
      ...input,
      createdAt: new Date().toISOString(),
    };
    exercises.push(newExercise);
    saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
    return newExercise;
  },

  update: (id: string, updates: Partial<Exercise>): Exercise | null => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    const index = exercises.findIndex((ex) => ex.id === id);
    if (index === -1) return null;

    exercises[index] = { ...exercises[index], ...updates };
    saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
    return exercises[index];
  },

  delete: (id: string): boolean => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    const filtered = exercises.filter((ex) => ex.id !== id);
    if (filtered.length === exercises.length) return false;

    saveToStorage(STORAGE_KEYS.EXERCISES, filtered);
    return true;
  },

  search: (query: string): Exercise[] => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    const lowerQuery = query.toLowerCase();
    return exercises.filter((ex) =>
      ex.name.toLowerCase().includes(lowerQuery)
    );
  },

  filterByCategory: (category: string): Exercise[] => {
    const exercises = getFromStorage<Exercise>(STORAGE_KEYS.EXERCISES);
    return exercises.filter((ex) => ex.category === category);
  },
};

// Routine Operations
export const routineStorage = {
  getAll: (): Routine[] => {
    return getFromStorage<Routine>(STORAGE_KEYS.ROUTINES);
  },

  getById: (id: string): Routine | null => {
    const routines = getFromStorage<Routine>(STORAGE_KEYS.ROUTINES);
    return routines.find((r) => r.id === id) || null;
  },

  create: (input: CreateRoutineInput): Routine => {
    const routines = getFromStorage<Routine>(STORAGE_KEYS.ROUTINES);
    const now = new Date().toISOString();
    const newRoutine: Routine = {
      id: generateId(),
      ...input,
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    routines.push(newRoutine);
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
    return newRoutine;
  },

  update: (input: UpdateRoutineInput): Routine | null => {
    const routines = getFromStorage<Routine>(STORAGE_KEYS.ROUTINES);
    const index = routines.findIndex((r) => r.id === input.id);
    if (index === -1) return null;

    routines[index] = {
      ...routines[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.ROUTINES, routines);
    return routines[index];
  },

  delete: (id: string): boolean => {
    const routines = getFromStorage<Routine>(STORAGE_KEYS.ROUTINES);
    const filtered = routines.filter((r) => r.id !== id);
    if (filtered.length === routines.length) return false;

    saveToStorage(STORAGE_KEYS.ROUTINES, filtered);
    return true;
  },

  addExercise: (routineId: string, exercise: Omit<RoutineExercise, 'id' | 'order'>): Routine | null => {
    const routine = routineStorage.getById(routineId);
    if (!routine) return null;

    const newExercise: RoutineExercise = {
      id: generateId(),
      ...exercise,
      order: routine.exercises.length,
    };

    routine.exercises.push(newExercise);
    return routineStorage.update({
      id: routineId,
      exercises: routine.exercises,
    });
  },

  removeExercise: (routineId: string, exerciseId: string): Routine | null => {
    const routine = routineStorage.getById(routineId);
    if (!routine) return null;

    const filtered = routine.exercises.filter((ex) => ex.id !== exerciseId);
    const reordered = filtered.map((ex, index) => ({ ...ex, order: index }));

    return routineStorage.update({
      id: routineId,
      exercises: reordered,
    });
  },

  reorderExercises: (routineId: string, exercises: RoutineExercise[]): Routine | null => {
    return routineStorage.update({
      id: routineId,
      exercises: exercises.map((ex, index) => ({ ...ex, order: index })),
    });
  },
};

// Session Operations
export const sessionStorage = {
  getAll: (): Session[] => {
    return getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
  },

  getById: (id: string): Session | null => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    return sessions.find((s) => s.id === id) || null;
  },

  getActiveSession: (): Session | null => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    return sessions.find((s) => !s.isCompleted) || null;
  },

  getByExerciseId: (exerciseId: string): Session[] => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    return sessions.filter((s) =>
      s.exerciseLogs.some((log) => log.exerciseId === exerciseId)
    );
  },

  create: (input: CreateSessionInput, routine: Routine): Session => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    const now = new Date().toISOString();

    // Create exercise logs from routine exercises
    const exerciseLogs: ExerciseLog[] = routine.exercises.map((ex) => ({
      id: generateId(),
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      order: ex.order,
      restTimeSeconds: ex.restTimeSeconds,
      setLogs: Array.from({ length: ex.defaultSets }, (_, i) => ({
        id: generateId(),
        setIndex: i,
        weight: 0,
        reps: 0,
        createdAt: now,
      })),
    }));

    const newSession: Session = {
      id: generateId(),
      ...input,
      startedAt: now,
      isCompleted: false,
      exerciseLogs,
      createdAt: now,
      updatedAt: now,
    };

    sessions.push(newSession);
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  update: (id: string, updates: Partial<Session>): Session | null => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    const index = sessions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    sessions[index] = {
      ...sessions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    return sessions[index];
  },

  updateSetLog: (
    sessionId: string,
    exerciseLogId: string,
    setLogId: string,
    updates: Partial<SetLog>
  ): Session | null => {
    const session = sessionStorage.getById(sessionId);
    if (!session) return null;

    const exerciseLog = session.exerciseLogs.find((log) => log.id === exerciseLogId);
    if (!exerciseLog) return null;

    const setLog = exerciseLog.setLogs.find((set) => set.id === setLogId);
    if (!setLog) return null;

    Object.assign(setLog, updates);

    return sessionStorage.update(sessionId, {
      exerciseLogs: session.exerciseLogs,
    });
  },

  addSet: (sessionId: string, exerciseLogId: string, side?: 'left' | 'right'): Session | null => {
    const session = sessionStorage.getById(sessionId);
    if (!session) return null;

    const exerciseLog = session.exerciseLogs.find((log) => log.id === exerciseLogId);
    if (!exerciseLog) return null;

    const newSet: SetLog = {
      id: generateId(),
      setIndex: exerciseLog.setLogs.length,
      weight: 0,
      reps: 0,
      createdAt: new Date().toISOString(),
      ...(side && { side }),
    };

    exerciseLog.setLogs.push(newSet);

    return sessionStorage.update(sessionId, {
      exerciseLogs: session.exerciseLogs,
    });
  },

  removeSet: (sessionId: string, exerciseLogId: string, setLogId: string): Session | null => {
    const session = sessionStorage.getById(sessionId);
    if (!session) return null;

    const exerciseLog = session.exerciseLogs.find((log) => log.id === exerciseLogId);
    if (!exerciseLog) return null;

    exerciseLog.setLogs = exerciseLog.setLogs
      .filter((set) => set.id !== setLogId)
      .map((set, index) => ({ ...set, setIndex: index }));

    return sessionStorage.update(sessionId, {
      exerciseLogs: session.exerciseLogs,
    });
  },

  completeSession: (id: string): Session | null => {
    return sessionStorage.update(id, {
      isCompleted: true,
      endedAt: new Date().toISOString(),
    });
  },

  delete: (id: string): boolean => {
    const sessions = getFromStorage<Session>(STORAGE_KEYS.SESSIONS);
    const filtered = sessions.filter((s) => s.id !== id);
    if (filtered.length === sessions.length) return false;

    saveToStorage(STORAGE_KEYS.SESSIONS, filtered);
    return true;
  },
};

// Data Management
export const dataStorage = {
  exportAll: () => {
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      exercises: exerciseStorage.getAll(),
      routines: routineStorage.getAll(),
      sessions: sessionStorage.getAll(),
    };
  },

  importAll: (data: {
    exercises: Exercise[];
    routines: Routine[];
    sessions: Session[];
  }): void => {
    saveToStorage(STORAGE_KEYS.EXERCISES, data.exercises);
    saveToStorage(STORAGE_KEYS.ROUTINES, data.routines);
    saveToStorage(STORAGE_KEYS.SESSIONS, data.sessions);
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.EXERCISES);
    localStorage.removeItem(STORAGE_KEYS.ROUTINES);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  },

  isInitialized: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  },

  markInitialized: (): void => {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  getCounts: () => {
    return {
      exercises: exerciseStorage.getAll().length,
      routines: routineStorage.getAll().length,
      sessions: sessionStorage.getAll().length,
    };
  },
};
