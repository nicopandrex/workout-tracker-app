import { Session, Exercise, SetLog, MuscleGroup } from '@/types';
import { subDays } from 'date-fns';

// Constants for muscle contribution
const PRIMARY_ONLY_CONTRIBUTION = 1.0;
const PRIMARY_WITH_SECONDARY_CONTRIBUTION = 0.75;
const SECONDARY_CONTRIBUTION = 0.25;

/**
 * Calculate estimated 1 rep max using Epley formula
 * e1RM = weight × (1 + reps/30)
 */
export function computeE1RM(weight: number, reps: number): number {
  if (weight === 0 || reps === 0) return 0;
  return weight * (1 + reps / 30);
}

/**
 * Get rep range factor based on rep count
 */
export function repRangeFactor(reps: number): number {
  if (reps >= 1 && reps <= 5) return 1.0;
  if (reps >= 6 && reps <= 10) return 0.85;
  if (reps >= 11 && reps <= 15) return 0.7;
  if (reps >= 16 && reps <= 25) return 0.5;
  return 0.35; // >25
}

/**
 * Get recent best e1RM for an exercise across last N days or sessions
 */
export function getRecentBestE1RM(
  exerciseId: string,
  allSessions: Session[],
  currentSession: Session,
  windowDays: number = 90
): number {
  const cutoffDate = subDays(new Date(), windowDays);
  
  // Collect all sessions within window (including current)
  const sessionsInWindow = [...allSessions, currentSession]
    .filter(s => s.isCompleted || s.id === currentSession.id)
    .filter(s => new Date(s.startedAt) >= cutoffDate);

  let maxE1RM = 0;

  sessionsInWindow.forEach(session => {
    const exerciseLog = session.exerciseLogs.find(log => log.exerciseId === exerciseId);
    if (!exerciseLog) return;

    exerciseLog.setLogs.forEach(setLog => {
      if (setLog.weight > 0 && setLog.reps > 0) {
        const e1rm = computeE1RM(setLog.weight, setLog.reps);
        maxE1RM = Math.max(maxE1RM, e1rm);
      }
    });
  });

  return maxE1RM;
}

/**
 * Calculate intensity factor based on set's e1RM vs recent best
 * Clamped between 0.60 and 1.20
 */
export function intensityFactor(e1rm: number, recentBest: number): number {
  if (recentBest === 0) return 1.0; // No history
  const ratio = e1rm / recentBest;
  return Math.max(0.6, Math.min(1.2, ratio));
}

/**
 * Compute score for a single set
 */
export function computeSetScore(setLog: SetLog, recentBest: number): number {
  if (setLog.weight === 0 || setLog.reps === 0) return 0;
  
  const volume = setLog.weight * setLog.reps;
  const repFactor = repRangeFactor(setLog.reps);
  const e1rm = computeE1RM(setLog.weight, setLog.reps);
  const intFactor = intensityFactor(e1rm, recentBest);
  
  return volume * repFactor * intFactor;
}

/**
 * Compute muscle scores for a session
 */
export function computeSessionMuscleScores(
  session: Session,
  allSessions: Session[],
  exercisesById: Map<string, Exercise>
): {
  muscleScores: Record<MuscleGroup, number>;
  totalScore: number;
} {
  const muscleScores: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
  
  // Initialize all muscle groups to 0
  Object.values(MuscleGroup).forEach(muscle => {
    muscleScores[muscle] = 0;
  });

  session.exerciseLogs.forEach(exerciseLog => {
    const exercise = exercisesById.get(exerciseLog.exerciseId);
    if (!exercise) return;

    // Get recent best e1RM for this exercise
    const recentBest = getRecentBestE1RM(
      exerciseLog.exerciseId,
      allSessions.filter(s => s.id !== session.id),
      session
    );

    // Calculate contribution for each set
    exerciseLog.setLogs.forEach(setLog => {
      const setScore = computeSetScore(setLog, recentBest);
      
      if (setScore === 0) return;

      // Distribute score to muscles
      if (exercise.secondaryMuscleGroup) {
        // Has secondary muscle
        muscleScores[exercise.primaryMuscleGroup] += 
          setScore * PRIMARY_WITH_SECONDARY_CONTRIBUTION;
        muscleScores[exercise.secondaryMuscleGroup] += 
          setScore * SECONDARY_CONTRIBUTION;
      } else {
        // Primary only
        muscleScores[exercise.primaryMuscleGroup] += 
          setScore * PRIMARY_ONLY_CONTRIBUTION;
      }
    });
  });

  const totalScore = Object.values(muscleScores).reduce((sum, score) => sum + score, 0);

  return { muscleScores, totalScore };
}

/**
 * Get muscle trend data over time
 */
export function computeMuscleTrend(
  muscleId: MuscleGroup,
  allSessions: Session[],
  exercisesById: Map<string, Exercise>
): Array<{ date: string; score: number; level: number }> {
  const completedSessions = allSessions
    .filter(s => s.isCompleted)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const trendData: Array<{ date: string; score: number; level: number }> = [];
  const cutoffDate = subDays(new Date(), 90);

  // Calculate scores for all sessions
  completedSessions.forEach(session => {
    const { muscleScores } = computeSessionMuscleScores(
      session,
      completedSessions.filter(s => s.id !== session.id),
      exercisesById
    );

    trendData.push({
      date: session.startedAt,
      score: muscleScores[muscleId] || 0,
      level: 0, // Will calculate below
    });
  });

  // Calculate max score in last 90 days for normalization
  const recentScores = trendData.filter(
    point => new Date(point.date) >= cutoffDate
  );
  const maxScore = Math.max(...recentScores.map(p => p.score), 1);

  // Normalize to level (0-100)
  trendData.forEach(point => {
    point.level = Math.round((point.score / maxScore) * 100);
  });

  return trendData;
}

/**
 * Get muscle summary stats
 */
export interface MuscleStats {
  muscleGroup: MuscleGroup;
  lastSessionScore: number;
  recentAverage: number; // Last 3 sessions average
  level: number; // 0-100 based on 90-day max
  trend: 'up' | 'down' | 'stable';
}

export function computeMuscleStats(
  allSessions: Session[],
  exercisesById: Map<string, Exercise>
): MuscleStats[] {
  const completedSessions = allSessions
    .filter(s => s.isCompleted)
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  if (completedSessions.length === 0) {
    return Object.values(MuscleGroup).map(muscle => ({
      muscleGroup: muscle,
      lastSessionScore: 0,
      recentAverage: 0,
      level: 0,
      trend: 'stable' as const,
    }));
  }

  const muscleData = new Map<MuscleGroup, number[]>();
  
  // Initialize
  Object.values(MuscleGroup).forEach(muscle => {
    muscleData.set(muscle, []);
  });

  // Collect scores from sessions
  completedSessions.forEach((session, index) => {
    if (index >= 10) return; // Only look at last 10 sessions for recent data
    
    const { muscleScores } = computeSessionMuscleScores(
      session,
      completedSessions.filter(s => s.id !== session.id),
      exercisesById
    );

    Object.entries(muscleScores).forEach(([muscle, score]) => {
      muscleData.get(muscle as MuscleGroup)?.push(score);
    });
  });

  // Calculate 90-day max for each muscle
  const cutoffDate = subDays(new Date(), 90);
  const ninetyDayMax = new Map<MuscleGroup, number>();

  completedSessions
    .filter(s => new Date(s.startedAt) >= cutoffDate)
    .forEach(session => {
      const { muscleScores } = computeSessionMuscleScores(
        session,
        completedSessions.filter(s => s.id !== session.id),
        exercisesById
      );

      Object.entries(muscleScores).forEach(([muscle, score]) => {
        const currentMax = ninetyDayMax.get(muscle as MuscleGroup) || 0;
        ninetyDayMax.set(muscle as MuscleGroup, Math.max(currentMax, score));
      });
    });

  // Build stats
  return Object.values(MuscleGroup).map(muscle => {
    const scores = muscleData.get(muscle) || [];
    const lastScore = scores[0] || 0;
    const recentAverage = scores.length > 0
      ? scores.slice(0, 3).reduce((sum, s) => sum + s, 0) / Math.min(3, scores.length)
      : 0;
    
    const maxScore = ninetyDayMax.get(muscle) || 1;
    const level = Math.round((lastScore / maxScore) * 100);

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (scores.length >= 2) {
      const previous = scores[1];
      if (lastScore > previous * 1.1) trend = 'up';
      else if (lastScore < previous * 0.9) trend = 'down';
    }

    return {
      muscleGroup: muscle,
      lastSessionScore: lastScore,
      recentAverage,
      level: Math.min(100, level),
      trend,
    };
  });
}
