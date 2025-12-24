import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { useRoutines } from "@/hooks/useRoutines";
import { useCreateSession } from "@/hooks/useSessions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export function StartWorkout() {
  const navigate = useNavigate();
  const { data: routines, isLoading } = useRoutines();
  const createSession = useCreateSession();

  const handleStartWorkout = async (routineId: string, routineName: string) => {
    try {
      const session = await createSession.mutateAsync({
        routineId,
        routineName,
      });
      toast.success("Workout started!");
      navigate(`/workout/${session.id}`);
    } catch (error) {
      toast.error("Failed to start workout");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Start Workout</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="bg-slate-900/50 border-slate-700/50 animate-pulse"
            >
              <CardHeader className="h-32"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Start Workout</h1>
      <p className="text-slate-400">Select a routine to begin your workout</p>

      {routines && routines.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-center mb-4">
              No routines available. Create a routine first!
            </p>
            <Button
              onClick={() => navigate("/routines")}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              Go to Routines
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routines?.map((routine) => (
            <Card
              key={routine.id}
              className="bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => handleStartWorkout(routine.id, routine.name)}
            >
              <CardHeader>
                <CardTitle className="text-white">{routine.name}</CardTitle>
                {routine.notes && (
                  <CardDescription className="text-slate-400">
                    {routine.notes}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-400">
                  {routine.exercises.length} exercise
                  {routine.exercises.length !== 1 ? "s" : ""}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  disabled={createSession.isPending}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Workout
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
