import { useState } from "react";
import {
  TrendingUp,
  Dumbbell,
  Calendar,
  Timer,
  Target,
  Award,
  Activity,
} from "lucide-react";
import { useSessions } from "@/hooks/useSessions";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  calculateWorkoutStats,
  calculateExerciseStats,
  getExerciseProgress,
  getPerformedExercises,
  filterSessionsByTime,
  formatDuration,
  formatVolume,
  TimeFilter,
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

const TIME_FILTERS: Array<{ value: TimeFilter; label: string }> = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

export function Analytics() {
  const { data: allSessions = [] } = useSessions();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null
  );

  const filteredSessions = filterSessionsByTime(allSessions, timeFilter);
  const workoutStats = calculateWorkoutStats(filteredSessions);
  const performedExercises = getPerformedExercises(filteredSessions);

  // Auto-select first exercise if none selected
  const displayExerciseId =
    selectedExerciseId || performedExercises[0]?.exerciseId;
  const displayStats = displayExerciseId
    ? calculateExerciseStats(displayExerciseId, filteredSessions)
    : null;
  const displayProgress = displayExerciseId
    ? getExerciseProgress(displayExerciseId, filteredSessions)
    : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-400" />
          Analytics
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/muscles")}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Activity className="w-4 h-4 mr-2" />
          Muscle Stats
        </Button>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {TIME_FILTERS.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={timeFilter === filter.value ? "default" : "outline"}
            onClick={() => setTimeFilter(filter.value)}
            className={cn(
              "min-w-[60px]",
              timeFilter === filter.value
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                : "border-slate-700 text-slate-300 hover:bg-slate-800"
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {workoutStats.totalWorkouts}
                </p>
                <p className="text-xs text-slate-400">Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Timer className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatDuration(workoutStats.totalDuration)}
                </p>
                <p className="text-xs text-slate-400">Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Dumbbell className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {workoutStats.uniqueExercises}
                </p>
                <p className="text-xs text-slate-400">Exercises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Target className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {workoutStats.totalSets}
                </p>
                <p className="text-xs text-slate-400">Sets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Award className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {workoutStats.totalReps.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400">Reps</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {formatVolume(workoutStats.totalVolume)}
                </p>
                <p className="text-xs text-slate-400">Volume (lbs)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Progress */}
      {performedExercises.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Exercise Progress</span>
              {displayStats && (
                <div className="flex gap-2 text-sm font-normal">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/50 text-emerald-400"
                  >
                    PR: {displayStats.maxWeight}lbs
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-500/50 text-blue-400"
                  >
                    e1RM: {Math.round(displayStats.estimatedOneRepMax)}lbs
                  </Badge>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exercise Selector */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {performedExercises.slice(0, 10).map((exercise) => (
                <Button
                  key={exercise.exerciseId}
                  size="sm"
                  variant={
                    displayExerciseId === exercise.exerciseId
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedExerciseId(exercise.exerciseId)}
                  className={cn(
                    "whitespace-nowrap",
                    displayExerciseId === exercise.exerciseId
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                      : "border-slate-700 text-slate-300 hover:bg-slate-800"
                  )}
                >
                  {exercise.exerciseName}
                </Button>
              ))}
            </div>

            {/* Chart Tabs */}
            {displayProgress.length > 0 && (
              <Tabs defaultValue="max" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger
                    value="max"
                    className="data-[state=active]:bg-slate-700"
                  >
                    Max Weight
                  </TabsTrigger>
                  <TabsTrigger
                    value="volume"
                    className="data-[state=active]:bg-slate-700"
                  >
                    Volume
                  </TabsTrigger>
                  <TabsTrigger
                    value="e1rm"
                    className="data-[state=active]:bg-slate-700"
                  >
                    Est. 1RM
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="max" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={displayProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="maxWeight"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="volume" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={displayProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalVolume"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="e1rm" className="mt-4">
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={displayProgress}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="estimatedOneRepMax"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Exercises Stats */}
      {performedExercises.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Exercise Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performedExercises.map((exercise) => {
                const stats = calculateExerciseStats(
                  exercise.exerciseId,
                  filteredSessions
                );
                if (!stats) return null;

                return (
                  <div
                    key={exercise.exerciseId}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">
                        {stats.exerciseName}
                      </h3>
                      <Badge
                        variant="outline"
                        className="border-slate-600 text-slate-400"
                      >
                        {stats.sessions} sessions
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 text-xs">PR Weight</p>
                        <p className="text-emerald-400 font-semibold">
                          {stats.maxWeight}lbs
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Est. 1RM</p>
                        <p className="text-blue-400 font-semibold">
                          {Math.round(stats.estimatedOneRepMax)}lbs
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Best Set</p>
                        <p className="text-purple-400 font-semibold">
                          {stats.bestSet.weight}lbs × {stats.bestSet.reps}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Total Volume</p>
                        <p className="text-teal-400 font-semibold">
                          {formatVolume(stats.totalVolume)}lbs
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {performedExercises.length === 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No workout data yet
            </h3>
            <p className="text-slate-400 mb-4">
              Complete some workouts to see your analytics and progress!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
