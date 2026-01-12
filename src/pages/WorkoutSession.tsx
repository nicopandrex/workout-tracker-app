import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Plus, Minus, Copy, Timer as TimerIcon } from "lucide-react";
import {
  useSession,
  useUpdateSetLog,
  useAddSet,
  useRemoveSet,
  useCompleteSession,
  useSessions,
} from "@/hooks/useSessions";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RestTimer } from "@/components/RestTimer";
import { toast } from "sonner";
import { detectPR, getPreviousSetData, getExercisePR } from "@/lib/prDetection";
import { formatDistance } from "date-fns";
import { ExerciseLog, SetLog } from "@/types";

function useTimer(startTime: string) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      setElapsed(Math.floor((now - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  return {
    hours,
    minutes,
    seconds,
    formatted: `${hours > 0 ? `${hours}:` : ""}${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
  };
}

function SetInputRow({
  set,
  setIndex,
  exerciseId,
  sessionId,
  exerciseLogId,
  previousSessions,
  restTimeSeconds,
  isUnilateral,
  onUpdate,
  onRemove,
  onSetCompleted,
}: {
  set: SetLog;
  setIndex: number;
  exerciseId: string;
  sessionId: string;
  exerciseLogId: string;
  previousSessions: any[];
  restTimeSeconds?: number;
  isUnilateral?: boolean;
  onUpdate: (setLogId: string, updates: Partial<SetLog>) => void;
  onRemove: () => void;
  onSetCompleted: (restSeconds: number) => void;
}) {
  const [weight, setWeight] = useState(set.weight.toString());
  const [reps, setReps] = useState(set.reps.toString());
  const [isEditing, setIsEditing] = useState(false);

  const previousData = getPreviousSetData(
    exerciseId,
    setIndex,
    previousSessions
  );
  const exercisePR = getExercisePR(exerciseId, previousSessions);
  const prResult = detectPR(
    parseFloat(weight) || 0,
    parseInt(reps) || 0,
    exerciseId,
    previousSessions
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing) {
        const w = parseFloat(weight) || 0;
        const r = parseInt(reps) || 0;
        if (w !== set.weight || r !== set.reps) {
          onUpdate(set.id, { weight: w, reps: r });

          // Trigger rest timer if both weight and reps are filled
          if (w > 0 && r > 0 && restTimeSeconds && restTimeSeconds > 0) {
            onSetCompleted(restTimeSeconds);
          }
        }
        setIsEditing(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [weight, reps, isEditing, restTimeSeconds, onSetCompleted]);

  const handleWeightChange = (value: string) => {
    setWeight(value);
    setIsEditing(true);
  };

  const handleRepsChange = (value: string) => {
    setReps(value);
    setIsEditing(true);
  };

  // For unilateral exercises, show the side badge
  const sideLabel = set.side ? (set.side === 'left' ? 'L' : 'R') : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-slate-400 w-8 text-sm">#{setIndex + 1}</span>
        {sideLabel && (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs px-1.5">
            {sideLabel}
          </Badge>
        )}
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div className="relative">
            <Input
              type="number"
              step="2.5"
              value={weight}
              onChange={(e) => handleWeightChange(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white pr-10"
              placeholder="Weight"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              lbs
            </span>
          </div>
          <div className="relative">
            <Input
              type="number"
              value={reps}
              onChange={(e) => handleRepsChange(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white pr-12"
              placeholder="Reps"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              reps
            </span>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-400"
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>
      {(previousData || exercisePR) && (
        <div className="ml-10 text-xs space-y-1">
          {previousData && (
            <div className="flex items-center gap-2 text-slate-500">
              <span>
                Last: {previousData.weight}lbs × {previousData.reps} reps
              </span>
              {prResult.isMatch && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                  ✓ Match
                </Badge>
              )}
            </div>
          )}
          {exercisePR && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">
                PR: {exercisePR.weight}lbs × {exercisePR.reps} reps
              </span>
              {prResult.isPR && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-xs">
                  ↑ NEW PR!
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExerciseSection({
  exerciseLog,
  sessionId,
  previousSessions,
  isUnilateral,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onSetCompleted,
}: {
  exerciseLog: ExerciseLog;
  sessionId: string;
  previousSessions: any[];
  isUnilateral?: boolean;
  onUpdateSet: (
    exerciseLogId: string,
    setLogId: string,
    updates: Partial<SetLog>
  ) => void;
  onAddSet: (exerciseLogId: string) => void;
  onRemoveSet: (exerciseLogId: string, setLogId: string) => void;
  onSetCompleted: (restSeconds: number) => void;
}) {
  return (
    <AccordionItem value={exerciseLog.id} className="border-slate-700">
      <AccordionTrigger className="text-white hover:text-emerald-400">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-mono">
            #{exerciseLog.order + 1}
          </span>
          <span>{exerciseLog.exerciseName}</span>
          <Badge variant="outline" className="border-slate-600 text-slate-400">
            {exerciseLog.setLogs.length} sets
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-4">
          <div className="space-y-3">
            {exerciseLog.setLogs.map((set, index) => (
              <SetInputRow
                key={set.id}
                set={set}
                setIndex={index}
                exerciseId={exerciseLog.exerciseId}
                sessionId={sessionId}
                exerciseLogId={exerciseLog.id}
                previousSessions={previousSessions}
                restTimeSeconds={exerciseLog.restTimeSeconds}
                isUnilateral={isUnilateral}
                onUpdate={(setLogId, updates) =>
                  onUpdateSet(exerciseLog.id, setLogId, updates)
                }
                onRemove={() => onRemoveSet(exerciseLog.id, set.id)}
                onSetCompleted={onSetCompleted}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddSet(exerciseLog.id)}
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Set{isUnilateral ? ' (L+R)' : ''}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function WorkoutSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: session, isLoading } = useSession(id!);
  const { data: allSessions } = useSessions();
  const { data: exercises = [] } = useExercises();
  const updateSetLog = useUpdateSetLog();
  const addSet = useAddSet();
  const removeSet = useRemoveSet();
  const completeSession = useCompleteSession();

  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(() => {
    // Restore active timer from localStorage
    const stored = localStorage.getItem('rest-timer-end-time');
    if (stored) {
      const endTime = parseInt(stored, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      return remaining > 0 ? remaining : null;
    }
    return null;
  });

  const timer = useTimer(session?.startedAt || new Date().toISOString());

  // Request notification permission on first workout
  useEffect(() => {
    const hasAsked = localStorage.getItem('notification-permission-asked');
    if (!hasAsked && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        localStorage.setItem('notification-permission-asked', 'true');
        if (permission === 'granted') {
          toast.success('Notifications enabled! You\'ll be notified when rest is complete.');
        }
      });
    }
  }, []);

  const previousSessions =
    allSessions?.filter((s) => s.id !== id && s.isCompleted) || [];

  const handleUpdateSet = useCallback(
    async (
      exerciseLogId: string,
      setLogId: string,
      updates: Partial<SetLog>
    ) => {
      if (!id) return;
      try {
        await updateSetLog.mutateAsync({
          sessionId: id,
          exerciseLogId,
          setLogId,
          updates,
        });
      } catch (error) {
        console.error("Failed to update set:", error);
      }
    },
    [id, updateSetLog]
  );

  const handleAddSet = async (exerciseLogId: string) => {
    if (!id) return;
    try {
      // Find the exercise to check if it's unilateral
      const exerciseLog = session?.exerciseLogs.find(log => log.id === exerciseLogId);
      const exercise = exercises.find(e => e.id === exerciseLog?.exerciseId);
      
      if (exercise?.isUnilateral) {
        // Add both left and right sets for unilateral exercises
        await addSet.mutateAsync({ sessionId: id, exerciseLogId, side: 'left' });
        await addSet.mutateAsync({ sessionId: id, exerciseLogId, side: 'right' });
        toast.success("Sets added (L+R)");
      } else {
        // Add a single set for bilateral exercises
        await addSet.mutateAsync({ sessionId: id, exerciseLogId });
        toast.success("Set added");
      }
    } catch (error) {
      toast.error("Failed to add set");
    }
  };

  const handleRemoveSet = async (exerciseLogId: string, setLogId: string) => {
    if (!id) return;
    try {
      await removeSet.mutateAsync({ sessionId: id, exerciseLogId, setLogId });
      toast.success("Set removed");
    } catch (error) {
      toast.error("Failed to remove set");
    }
  };

  const handleFinishWorkout = async () => {
    if (!id) return;
    try {
      await completeSession.mutateAsync(id);
      toast.success("Workout completed! 🎉");
      navigate("/routines");
    } catch (error) {
      toast.error("Failed to complete workout");
    }
  };

  const handleSetCompleted = useCallback(
    (restSeconds: number) => {
      // Start timer (will replace existing timer)
      setActiveRestTimer(restSeconds);
    },
    []
  );

  if (isLoading || !session) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-slate-800 rounded"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Timer Header */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {session.routineName}
              </h2>
              <p className="text-emerald-100 text-sm">
                Started{" "}
                {formatDistance(new Date(session.startedAt), new Date(), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-white">
                <TimerIcon className="w-5 h-5" />
                <span className="text-3xl font-mono font-bold">
                  {timer.formatted}
                </span>
              </div>
            </div>
          </div>

          {/* Rest Timer - Inline */}
          {activeRestTimer && (
            <RestTimer
              initialSeconds={activeRestTimer}
              onComplete={() => {
                toast.success("Rest complete! 💪");
                setActiveRestTimer(null);
              }}
              onDismiss={() => {
                localStorage.removeItem('rest-timer-end-time');
                setActiveRestTimer(null);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {session.exerciseLogs.map((exerciseLog) => {
              const exercise = exercises.find(e => e.id === exerciseLog.exerciseId);
              return (
                <ExerciseSection
                  key={exerciseLog.id}
                  exerciseLog={exerciseLog}
                  sessionId={session.id}
                  previousSessions={previousSessions}
                  isUnilateral={exercise?.isUnilateral}
                  onUpdateSet={handleUpdateSet}
                  onAddSet={handleAddSet}
                  onRemoveSet={handleRemoveSet}
                  onSetCompleted={handleSetCompleted}
                />
              );
            })}
          </Accordion>
        </CardContent>
      </Card>

      {/* Finish Button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-lg h-14"
          >
            <Check className="w-5 h-5 mr-2" />
            Finish Workout
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Finish Workout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to complete this workout? This will save all
              your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">
              Continue Workout
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinishWorkout}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Finish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
