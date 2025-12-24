import { useParams, useNavigate } from "react-router-dom";
import { useSessions } from "@/hooks/useSessions";
import { useExercises } from "@/hooks/useExercises";
import { ArrowLeft, Calendar, Dumbbell, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ExerciseHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: sessions = [] } = useSessions();
  const { data: exercises = [] } = useExercises();

  const exercise = exercises.find((e) => e.id === id);

  // Get all sessions that include this exercise
  const exerciseHistory = sessions
    .filter((session) =>
      session.exerciseLogs.some((log) => log.exerciseId === id)
    )
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )
    .map((session) => {
      const exerciseLog = session.exerciseLogs.find(
        (log) => log.exerciseId === id
      );
      return {
        session,
        exerciseLog,
      };
    })
    .filter((item) => item.exerciseLog && item.exerciseLog.setLogs.length > 0);

  // Calculate stats
  const allSets = exerciseHistory.flatMap((item) => item.exerciseLog!.setLogs);
  const maxWeight =
    allSets.length > 0 ? Math.max(...allSets.map((s) => s.weight)) : 0;
  const totalSets = allSets.length;
  const totalReps = allSets.reduce((sum, s) => sum + s.reps, 0);
  const totalVolume = allSets.reduce((sum, s) => sum + s.weight * s.reps, 0);

  if (!exercise) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/exercises")}
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exercises
        </Button>
        <p className="text-slate-400">Exercise not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/exercises")}
          className="text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exercises
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {exercise.name}
          </h1>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="border-emerald-500/50 text-emerald-400"
            >
              {exercise.category}
            </Badge>
            <Badge
              variant="outline"
              className="border-teal-500/50 text-teal-400"
            >
              {exercise.equipment}
            </Badge>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {exerciseHistory.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{maxWeight}</p>
                    <p className="text-xs text-slate-400">Max Weight</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Dumbbell className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalSets}</p>
                    <p className="text-xs text-slate-400">Total Sets</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{totalReps}</p>
                    <p className="text-xs text-slate-400">Total Reps</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {(totalVolume / 1000).toFixed(1)}k
                    </p>
                    <p className="text-xs text-slate-400">Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session History */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Session History
            </h2>
            {exerciseHistory.map(({ session, exerciseLog }) => (
              <Card
                key={session.id}
                className="bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/50 transition-colors"
              >
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-lg">
                          {format(new Date(session.startedAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-sm text-slate-400 font-normal">
                          {session.routineName}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/50 text-emerald-400"
                    >
                      {exerciseLog!.setLogs.length} sets
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exerciseLog!.setLogs.map((set, idx) => {
                      const volume = set.weight * set.reps;
                      const isMaxWeight = set.weight === maxWeight;
                      return (
                        <div
                          key={set.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            isMaxWeight
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-slate-800/50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-slate-400 text-sm font-mono w-8">
                              #{idx + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">
                                {set.weight} lbs
                              </span>
                              <span className="text-slate-400">×</span>
                              <span className="text-white font-semibold">
                                {set.reps} reps
                              </span>
                            </div>
                            {isMaxWeight && (
                              <Award className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-sm">Volume</p>
                            <p className="text-white font-semibold">
                              {volume.toLocaleString()} lbs
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <p className="text-slate-400 text-center py-8">
              No history yet. Start a workout to track your progress!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
