import { Session, SetLog, PRResult } from '@/types';

/**
 * Detect if a set is a PR (Personal Record) by comparing to previous sessions
 */
export const detectPR = (
  currentWeight: number,
  currentReps: number,
  exerciseId: string,
  previousSessions: Session[]
): PRResult => {
  // Filter sessions for the specific exercise and get all completed sets
  const previousSets: Array<SetLog & { date: string }> = [];

  previousSessions
    .filter((session) => session.isCompleted)
    .forEach((session) => {
      const exerciseLog = session.exerciseLogs.find(
        (log) => log.exerciseId === exerciseId
      );
      if (exerciseLog) {
        exerciseLog.setLogs.forEach((set) => {
          if (set.weight > 0 && set.reps > 0) {
            previousSets.push({
              ...set,
              date: session.startedAt,
            });
          }
        });
      }
    });

  // If no previous data, it's not a PR yet
  if (previousSets.length === 0) {
    return { isPR: false, isMatch: false };
  }

  // Find the best previous performance
  let bestPrevious = previousSets[0];
  let bestScore = bestPrevious.weight * bestPrevious.reps;

  previousSets.forEach((set) => {
    const score = set.weight * set.reps;
    if (score > bestScore) {
      bestScore = score;
      bestPrevious = set;
    }
  });

  const currentScore = currentWeight * currentReps;
  const previousScore = bestPrevious.weight * bestPrevious.reps;

  // Check if it's a PR (better than previous best)
  const isPR = currentScore > previousScore;

  // Check if it matches the previous best
  const isMatch =
    !isPR &&
    currentWeight === bestPrevious.weight &&
    currentReps === bestPrevious.reps;

  return {
    isPR,
    isMatch,
    previousBest: {
      weight: bestPrevious.weight,
      reps: bestPrevious.reps,
      date: bestPrevious.date,
    },
  };
};

/**
 * Get previous set data for display (from last completed session)
 */
export const getPreviousSetData = (
  exerciseId: string,
  setIndex: number,
  previousSessions: Session[]
): { weight: number; reps: number } | null => {
  // Find the most recent completed session with this exercise
  const completedSessions = previousSessions
    .filter((session) => session.isCompleted)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  for (const session of completedSessions) {
    const exerciseLog = session.exerciseLogs.find(
      (log) => log.exerciseId === exerciseId
    );

    if (exerciseLog && exerciseLog.setLogs[setIndex]) {
      const set = exerciseLog.setLogs[setIndex];
      if (set.weight > 0 && set.reps > 0) {
        return {
          weight: set.weight,
          reps: set.reps,
        };
      }
    }
  }

  return null;
};

/**
 * Get all previous session data for an exercise
 */
export const getPreviousSessionData = (
  exerciseId: string,
  previousSessions: Session[]
): Session | null => {
  const completedSessions = previousSessions
    .filter((session) => session.isCompleted)
    .filter((session) =>
      session.exerciseLogs.some((log) => log.exerciseId === exerciseId)
    )
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return completedSessions[0] || null;
};

/**
 * Compare two sets to determine if one is better than the other
 * Returns: 1 if set1 is better, -1 if set2 is better, 0 if equal
 */
export const compareSets = (
  set1: { weight: number; reps: number },
  set2: { weight: number; reps: number }
): number => {
  const score1 = set1.weight * set1.reps;
  const score2 = set2.weight * set2.reps;

  if (score1 > score2) return 1;
  if (score1 < score2) return -1;

  // If scores are equal, prefer higher weight
  if (set1.weight > set2.weight) return 1;
  if (set1.weight < set2.weight) return -1;

  return 0;
};

/**
 * Get the personal record (best performance) for an exercise
 */
export const getExercisePR = (
  exerciseId: string,
  previousSessions: Session[]
): { weight: number; reps: number; date: string } | null => {
  const previousSets: Array<SetLog & { date: string }> = [];

  previousSessions
    .filter((session) => session.isCompleted)
    .forEach((session) => {
      const exerciseLog = session.exerciseLogs.find(
        (log) => log.exerciseId === exerciseId
      );
      if (exerciseLog) {
        exerciseLog.setLogs.forEach((set) => {
          if (set.weight > 0 && set.reps > 0) {
            previousSets.push({
              ...set,
              date: session.startedAt,
            });
          }
        });
      }
    });

  if (previousSets.length === 0) return null;

  // Find the best performance by volume (weight × reps)
  let bestSet = previousSets[0];
  let bestScore = bestSet.weight * bestSet.reps;

  previousSets.forEach((set) => {
    const score = set.weight * set.reps;
    if (score > bestScore) {
      bestScore = score;
      bestSet = set;
    }
  });

  return {
    weight: bestSet.weight,
    reps: bestSet.reps,
    date: bestSet.date,
  };
};
