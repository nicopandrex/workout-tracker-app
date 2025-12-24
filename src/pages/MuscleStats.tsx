import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useExercises } from "@/hooks/useExercises";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MUSCLE_GROUP_LABELS } from "@/types";
import { computeMuscleStats } from "@/lib/muscleStats";
import { cn } from "@/lib/utils";

export function MuscleStats() {
  const { data: allSessions = [] } = useSessions();
  const { data: exercises = [] } = useExercises();

  // Create exercises map
  const exercisesById = useMemo(() => {
    const map = new Map();
    exercises.forEach((ex) => map.set(ex.id, ex));
    return map;
  }, [exercises]);

  // Compute muscle stats
  const muscleStats = useMemo(() => {
    return computeMuscleStats(allSessions, exercisesById);
  }, [allSessions, exercisesById]);

  // Sort by level (highest first)
  const sortedStats = useMemo(() => {
    return [...muscleStats].sort((a, b) => b.level - a.level);
  }, [muscleStats]);

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return "bg-emerald-500";
    if (level >= 60) return "bg-blue-500";
    if (level >= 40) return "bg-yellow-500";
    if (level >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const hasData = allSessions.some((s) => s.isCompleted);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-400" />
          Muscle Stats
        </h1>
      </div>

      {hasData ? (
        <>
          {/* Overview */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Muscle Load Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">
                Muscle load is calculated based on volume, rep ranges, and
                intensity across all your workouts. Level shows your current
                performance relative to your 90-day peak.
              </p>
              <div className="space-y-4">
                {sortedStats.map((stat) => (
                  <div
                    key={stat.muscleGroup}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-medium text-lg">
                          {MUSCLE_GROUP_LABELS[stat.muscleGroup]}
                        </h3>
                        {getTrendIcon(stat.trend)}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-slate-600",
                          stat.level >= 80 &&
                            "border-emerald-500/50 text-emerald-400",
                          stat.level >= 60 &&
                            stat.level < 80 &&
                            "border-blue-500/50 text-blue-400",
                          stat.level >= 40 &&
                            stat.level < 60 &&
                            "border-yellow-500/50 text-yellow-400",
                          stat.level < 40 &&
                            "border-slate-500/50 text-slate-400"
                        )}
                      >
                        Level {stat.level}
                      </Badge>
                    </div>

                    {/* Level Bar */}
                    <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden mb-3">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          getLevelColor(stat.level)
                        )}
                        style={{ width: `${stat.level}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">
                          Last Session
                        </p>
                        <p className="text-white font-semibold">
                          {stat.lastSessionScore.toFixed(0)} pts
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">
                          Recent Avg (3 sessions)
                        </p>
                        <p className="text-white font-semibold">
                          {stat.recentAverage.toFixed(0)} pts
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-slate-900/50 border-slate-700/50">
            <CardContent className="pt-6">
              <div className="space-y-3 text-sm text-slate-400">
                <h3 className="text-white font-medium mb-2">
                  How Muscle Load is Calculated
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-emerald-400 font-medium">
                      Set Score
                    </span>{" "}
                    = Volume × Rep Range Factor × Intensity Factor
                  </p>
                  <p>
                    <span className="text-blue-400 font-medium">
                      Rep Range Factors:
                    </span>
                    <br />
                    • 1-5 reps: 1.0 (strength)
                    <br />
                    • 6-10 reps: 0.85 (hypertrophy)
                    <br />
                    • 11-15 reps: 0.70 (endurance)
                    <br />
                    • 16-25 reps: 0.50
                    <br />• 25+ reps: 0.35
                  </p>
                  <p>
                    <span className="text-purple-400 font-medium">
                      Intensity Factor:
                    </span>{" "}
                    Based on your estimated 1RM relative to your recent best
                    performance (last 90 days)
                  </p>
                  <p>
                    <span className="text-teal-400 font-medium">
                      Muscle Contribution:
                    </span>
                    <br />
                    • Primary muscle: 75% of set score (or 100% if no secondary)
                    <br />• Secondary muscle: 25% of set score
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="py-12 text-center">
            <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No muscle data yet
            </h3>
            <p className="text-slate-400 mb-4">
              Complete some workouts to see your muscle load statistics!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
