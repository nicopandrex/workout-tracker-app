/**
 * Calculate estimated 1 rep max using Epley formula
 * Formula: weight × (1 + reps / 30)
 */
export const calculateE1RM = (weight: number, reps: number): number => {
  if (reps === 1) return weight;
  if (weight === 0 || reps === 0) return 0;
  
  return Math.round(weight * (1 + reps / 30));
};

/**
 * Calculate total volume for a set (weight × reps)
 */
export const calculateSetVolume = (weight: number, reps: number): number => {
  return weight * reps;
};

/**
 * Calculate total volume for multiple sets
 */
export const calculateTotalVolume = (
  sets: Array<{ weight: number; reps: number }>
): number => {
  return sets.reduce((total, set) => total + calculateSetVolume(set.weight, set.reps), 0);
};

/**
 * Calculate average weight across sets
 */
export const calculateAverageWeight = (
  sets: Array<{ weight: number; reps: number }>
): number => {
  if (sets.length === 0) return 0;
  const total = sets.reduce((sum, set) => sum + set.weight, 0);
  return Math.round(total / sets.length);
};

/**
 * Calculate average reps across sets
 */
export const calculateAverageReps = (
  sets: Array<{ weight: number; reps: number }>
): number => {
  if (sets.length === 0) return 0;
  const total = sets.reduce((sum, set) => sum + set.reps, 0);
  return Math.round(total / sets.length);
};

/**
 * Find the best e1RM from a list of sets
 */
export const findBestE1RM = (
  sets: Array<{ weight: number; reps: number }>
): number => {
  if (sets.length === 0) return 0;
  
  const e1rms = sets.map((set) => calculateE1RM(set.weight, set.reps));
  return Math.max(...e1rms);
};

/**
 * Find the top set (highest weight) from a list of sets
 */
export const findTopSet = (
  sets: Array<{ weight: number; reps: number }>
): { weight: number; reps: number } | null => {
  if (sets.length === 0) return null;
  
  return sets.reduce((best, current) => {
    if (current.weight > best.weight) return current;
    if (current.weight === best.weight && current.reps > best.reps) return current;
    return best;
  });
};

/**
 * Calculate workout duration in minutes
 */
export const calculateDuration = (startedAt: string, endedAt: string): number => {
  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();
  return Math.round((end - start) / 1000 / 60); // Convert to minutes
};

/**
 * Format duration from minutes to human-readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Calculate percentage increase between two values
 */
export const calculatePercentageIncrease = (
  oldValue: number,
  newValue: number
): number => {
  if (oldValue === 0) return 0;
  return Math.round(((newValue - oldValue) / oldValue) * 100);
};
