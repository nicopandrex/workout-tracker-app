import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Play, ListChecks } from "lucide-react";
import { useRoutines, useDeleteRoutine } from "@/hooks/useRoutines";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateRoutine } from "@/hooks/useRoutines";
import { toast } from "sonner";

export function Routines() {
  const navigate = useNavigate();
  const { data: routines, isLoading } = useRoutines();
  const createRoutine = useCreateRoutine();
  const deleteRoutine = useDeleteRoutine();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineNotes, setNewRoutineNotes] = useState("");
  const [deleteRoutineId, setDeleteRoutineId] = useState<string | null>(null);

  const handleCreateRoutine = async () => {
    if (!newRoutineName.trim()) {
      toast.error("Please enter a routine name");
      return;
    }

    try {
      const routine = await createRoutine.mutateAsync({
        name: newRoutineName.trim(),
        notes: newRoutineNotes.trim() || undefined,
      });
      toast.success("Routine created!");
      setIsCreateDialogOpen(false);
      setNewRoutineName("");
      setNewRoutineNotes("");
      navigate(`/routines/${routine.id}/edit`);
    } catch (error) {
      toast.error("Failed to create routine");
    }
  };

  const handleDeleteRoutine = async () => {
    if (!deleteRoutineId) return;

    try {
      await deleteRoutine.mutateAsync(deleteRoutineId);
      toast.success("Routine deleted");
      setDeleteRoutineId(null);
    } catch (error) {
      toast.error("Failed to delete routine");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">My Routines</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Routines</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Routine
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Routine
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Give your routine a name and optional notes
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Routine Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Push Day"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this routine..."
                  value={newRoutineNotes}
                  onChange={(e) => setNewRoutineNotes(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateRoutine}
                disabled={createRoutine.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Create Routine
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {routines && routines.length === 0 ? (
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListChecks className="w-16 h-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-center mb-4">
              No routines yet. Create your first workout routine!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Routine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {routines?.map((routine) => (
            <Card
              key={routine.id}
              className="bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/50 transition-colors"
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  {routine.name}
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => navigate(`/routines/${routine.id}/edit`)}
                      className="text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteRoutineId(routine.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
                {routine.notes && (
                  <CardDescription className="text-slate-400">
                    {routine.notes}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-400">
                  {routine.exercises.length === 0 ? (
                    <p>No exercises yet</p>
                  ) : (
                    <p>
                      {routine.exercises.length} exercise
                      {routine.exercises.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  onClick={() => navigate(`/routines/${routine.id}/edit`)}
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteRoutineId}
        onOpenChange={() => setDeleteRoutineId(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Routine?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete the
              routine.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoutine}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
