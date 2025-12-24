import { Session } from '@/types';
import { format, subMonths, subYears, isAfter } from 'date-fns';

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number; // in seconds
  totalSets: number;
  totalReps: number;
  totalVolume: number; // weight × reps
  uniqueExercises: number;
}

export interface ExerciseStats {
  exerciseId: string;
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
  bestSet: { weight: number; reps: number; volume: number };
  estimatedOneRepMax: number;
  sessions: number;
}

export interface ExerciseProgressPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  estimatedOneRepMax: number;
}

export type TimeFilter = 'all' | '1m' | '3m' | '6m' | '1y';

/**
 * Calculate estimated 1 rep max using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Filter sessions by time range
 */
export function filterSessionsByTime(
  sessions: Session[],
  timeFilter: TimeFilter
): Session[] {
  if (timeFilter === 'all') return sessions;

  const now = new Date();
  let cutoffDate: Date;

  switch (timeFilter) {
    case '1m':
      cutoffDate = subMonths(now, 1);
      break;
    case '3m':
      cutoffDate = subMonths(now, 3);
      break;
    case '6m':
      cutoffDate = subMonths(now, 6);
      break;
    case '1y':
      cutoffDate = subYears(now, 1);
      break;
    default:
      return sessions;
  }

  return sessions.filter((session) =>
    isAfter(new Date(session.startedAt), cutoffDate)
  );
}

/**
 * Calculate overall workout statistics
 */
export function calculateWorkoutStats(sessions: Session[]): WorkoutStats {
  const completedSessions = sessions.filter((s) => s.isCompleted);

  let totalDuration = 0;
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  const exerciseIds = new Set<string>();

  completedSessions.forEach((session) => {
    // Calculate duration
    if (session.endedAt) {
      const duration =
        new Date(session.endedAt).getTime() -
        new Date(session.startedAt).getTime();
      totalDuration += Math.floor(duration / 1000);
    }

    // Calculate sets, reps, volume
    session.exerciseLogs.forEach((exerciseLog) => {
      exerciseIds.add(exerciseLog.exerciseId);

      exerciseLog.setLogs.forEach((setLog) => {
        if (setLog.weight > 0 && setLog.reps > 0) {
          totalSets++;
          totalReps += setLog.reps;
          totalVolume += setLog.weight * setLog.reps;
        }
      });
    });
  });

  return {
    totalWorkouts: completedSessions.length,
    totalDuration,
    totalSets,
    totalReps,
    totalVolume,
    uniqueExercises: exerciseIds.size,
  };
}

/**
 * Calculate statistics for a specific exercise
 */
export function calculateExerciseStats(
  exerciseId: string,
  sessions: Session[]
): ExerciseStats | null {
  const completedSessions = sessions.filter((s) => s.isCompleted);
  
  let exerciseName = '';
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let maxWeight = 0;
  let bestSet = { weight: 0, reps: 0, volume: 0 };
  let maxOneRepMax = 0;
  let sessionsCount = 0;

  completedSessions.forEach((session) => {
    const exerciseLog = session.exerciseLogs.find(
      (log) => log.exerciseId === exerciseId
    );

    if (!exerciseLog) return;

    if (!exerciseName) exerciseName = exerciseLog.exerciseName;
    sessionsCount++;

    exerciseLog.setLogs.forEach((setLog) => {
      if (setLog.weight > 0 && setLog.reps > 0) {
        totalSets++;
        totalReps += setLog.reps;
        const volume = setLog.weight * setLog.reps;
        totalVolume += volume;

        if (setLog.weight > maxWeight) {
          maxWeight = setLog.weight;
        }

        if (volume > bestSet.volume) {
          bestSet = {
            weight: setLog.weight,
            reps: setLog.reps,
            volume,
          };
        }

        const oneRepMax = calculateOneRepMax(setLog.weight, setLog.reps);
        if (oneRepMax > maxOneRepMax) {
          maxOneRepMax = oneRepMax;
        }
      }
    });
  });

  if (totalSets === 0) return null;

  return {
    exerciseId,
    exerciseName,
    totalSets,
    totalReps,
    totalVolume,
    maxWeight,
    bestSet,
    estimatedOneRepMax: maxOneRepMax,
    sessions: sessionsCount,
  };
}

/**
 * Get exercise progress over time for graphing
 */
export function getExerciseProgress(
  exerciseId: string,
  sessions: Session[]
): ExerciseProgressPoint[] {
  const completedSessions = sessions
    .filter((s) => s.isCompleted)
    .sort(
      (a, b) =>
        new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
    );

  const progressPoints: ExerciseProgressPoint[] = [];

  completedSessions.forEach((session) => {
    const exerciseLog = session.exerciseLogs.find(
      (log) => log.exerciseId === exerciseId
    );

    if (!exerciseLog || exerciseLog.setLogs.length === 0) return;

    let sessionMaxWeight = 0;
    let sessionVolume = 0;
    let sessionMaxOneRepMax = 0;

    exerciseLog.setLogs.forEach((setLog) => {
      if (setLog.weight > 0 && setLog.reps > 0) {
        sessionMaxWeight = Math.max(sessionMaxWeight, setLog.weight);
        sessionVolume += setLog.weight * setLog.reps;

        const oneRepMax = calculateOneRepMax(setLog.weight, setLog.reps);
        sessionMaxOneRepMax = Math.max(sessionMaxOneRepMax, oneRepMax);
      }
    });

    if (sessionMaxWeight > 0) {
      progressPoints.push({
        date: format(new Date(session.startedAt), 'MMM dd'),
        maxWeight: sessionMaxWeight,
        totalVolume: sessionVolume,
        estimatedOneRepMax: Math.round(sessionMaxOneRepMax),
      });
    }
  });

  return progressPoints;
}

/**
 * Get all exercises that have been performed
 */
export function getPerformedExercises(sessions: Session[]): Array<{
  exerciseId: string;
  exerciseName: string;
  lastPerformed: string;
}> {
  const exerciseMap = new Map<
    string,
    { exerciseName: string; lastPerformed: Date }
  >();

  sessions
    .filter((s) => s.isCompleted)
    .forEach((session) => {
      session.exerciseLogs.forEach((exerciseLog) => {
        const hasValidSets = exerciseLog.setLogs.some(
          (set) => set.weight > 0 && set.reps > 0
        );

        if (hasValidSets) {
          const sessionDate = new Date(session.startedAt);
          const existing = exerciseMap.get(exerciseLog.exerciseId);

          if (!existing || sessionDate > existing.lastPerformed) {
            exerciseMap.set(exerciseLog.exerciseId, {
              exerciseName: exerciseLog.exerciseName,
              lastPerformed: sessionDate,
            });
          }
        }
      });
    });

  return Array.from(exerciseMap.entries())
    .map(([exerciseId, data]) => ({
      exerciseId,
      exerciseName: data.exerciseName,
      lastPerformed: data.lastPerformed.toISOString(),
    }))
    .sort(
      (a, b) =>
        new Date(b.lastPerformed).getTime() -
        new Date(a.lastPerformed).getTime()
    );
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format volume with appropriate units
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  }
  return volume.toFixed(0);
}
