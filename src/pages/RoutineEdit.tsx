import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, GripVertical, Trash2, Save } from "lucide-react";
import {
  useRoutine,
  useUpdateRoutine,
  useAddExerciseToRoutine,
  useRemoveExerciseFromRoutine,
  useReorderRoutineExercises,
} from "@/hooks/useRoutines";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RoutineExercise } from "@/types";

function SortableExerciseItem({
  exercise,
  onRemove,
}: {
  exercise: RoutineExercise;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-white touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h4 className="text-white font-medium">{exercise.exerciseName}</h4>
          <p className="text-sm text-slate-400">
            {exercise.defaultSets} sets × {exercise.defaultRepRangeMin}-
            {exercise.defaultRepRangeMax} reps
            {exercise.restTimeSeconds && exercise.restTimeSeconds > 0 && (
              <span className="text-slate-500">
                {" "}
                • {Math.floor(exercise.restTimeSeconds / 60)}:
                {(exercise.restTimeSeconds % 60).toString().padStart(2, "0")}{" "}
                rest
              </span>
            )}
          </p>
          {exercise.notes && (
            <p className="text-xs text-slate-500 mt-1">{exercise.notes}</p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-400 hover:bg-slate-800"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function RoutineEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: routine, isLoading } = useRoutine(id!);
  const { data: allExercises } = useExercises();
  const updateRoutine = useUpdateRoutine();
  const addExercise = useAddExerciseToRoutine();
  const removeExercise = useRemoveExerciseFromRoutine();
  const reorderExercises = useReorderRoutineExercises();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [newExercise, setNewExercise] = useState({
    defaultSets: 3,
    defaultRepRangeMin: 8,
    defaultRepRangeMax: 12,
    restTimeSeconds: 120, // Default 2 minutes
    notes: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (routine) {
      setName(routine.name);
      setNotes(routine.notes || "");
      setExercises(routine.exercises);
    }
  }, [routine]);

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateRoutine.mutateAsync({
        id,
        name: name.trim(),
        notes: notes.trim() || undefined,
        exercises,
      });
      toast.success("Routine saved!");
    } catch (error) {
      toast.error("Failed to save routine");
    }
  };

  const handleAddExercise = async () => {
    if (!id || !selectedExerciseId) {
      toast.error("Please select an exercise");
      return;
    }

    const exercise = allExercises?.find((ex) => ex.id === selectedExerciseId);
    if (!exercise) return;

    try {
      const updated = await addExercise.mutateAsync({
        routineId: id,
        exercise: {
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          defaultSets: newExercise.defaultSets,
          defaultRepRangeMin: newExercise.defaultRepRangeMin,
          defaultRepRangeMax: newExercise.defaultRepRangeMax,
          restTimeSeconds: newExercise.restTimeSeconds,
          notes: newExercise.notes || undefined,
        },
      });
      setExercises(updated.exercises);
      setIsAddDialogOpen(false);
      setSelectedExerciseId("");
      setNewExercise({
        defaultSets: 3,
        defaultRepRangeMin: 8,
        defaultRepRangeMax: 12,
        restTimeSeconds: 120,
        notes: "",
      });
      toast.success("Exercise added!");
    } catch (error) {
      toast.error("Failed to add exercise");
    }
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!id) return;

    try {
      const updated = await removeExercise.mutateAsync({
        routineId: id,
        exerciseId,
      });
      setExercises(updated.exercises);
      toast.success("Exercise removed");
    } catch (error) {
      toast.error("Failed to remove exercise");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = exercises.findIndex((ex) => ex.id === active.id);
    const newIndex = exercises.findIndex((ex) => ex.id === over.id);

    const reordered = arrayMove(exercises, oldIndex, newIndex);
    setExercises(reordered);

    if (id) {
      try {
        await reorderExercises.mutateAsync({
          routineId: id,
          exercises: reordered,
        });
      } catch (error) {
        toast.error("Failed to reorder exercises");
        setExercises(exercises);
      }
    }
  };

  if (isLoading || !routine) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/routines")}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-800 rounded w-1/3"></div>
          <div className="h-32 bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/routines")}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateRoutine.isPending}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Routine Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routine-name" className="text-white">
              Name
            </Label>
            <Input
              id="routine-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="routine-notes" className="text-white">
              Notes
            </Label>
            <Textarea
              id="routine-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">
              Exercises ({exercises.length})
            </CardTitle>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Exercise</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Select an exercise and configure defaults
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-white">Exercise</Label>
                    <Select
                      value={selectedExerciseId}
                      onValueChange={setSelectedExerciseId}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {allExercises?.map((ex) => (
                          <SelectItem
                            key={ex.id}
                            value={ex.id}
                            className="text-white"
                          >
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Sets</Label>
                      <Input
                        type="number"
                        value={newExercise.defaultSets}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            defaultSets: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-slate-800 border-slate-700 text-white"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Min Reps</Label>
                      <Input
                        type="number"
                        value={newExercise.defaultRepRangeMin}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            defaultRepRangeMin: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-slate-800 border-slate-700 text-white"
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Max Reps</Label>
                      <Input
                        type="number"
                        value={newExercise.defaultRepRangeMax}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            defaultRepRangeMax: parseInt(e.target.value) || 0,
                          })
                        }
                        className="bg-slate-800 border-slate-700 text-white"
                        min={1}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Rest Time (seconds)</Label>
                    <Input
                      type="number"
                      value={newExercise.restTimeSeconds}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          restTimeSeconds: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 120 for 2 minutes"
                      className="bg-slate-800 border-slate-700 text-white"
                      min={0}
                      step={15}
                    />
                    <p className="text-xs text-slate-500">
                      Rest time between sets (0 to disable timer)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Notes (Optional)</Label>
                    <Textarea
                      value={newExercise.notes}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          notes: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-700 text-white"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="border-slate-700 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddExercise}
                    disabled={addExercise.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    Add Exercise
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>No exercises yet. Add your first exercise!</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={exercises.map((ex) => ex.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {exercises.map((exercise) => (
                    <SortableExerciseItem
                      key={exercise.id}
                      exercise={exercise}
                      onRemove={() => handleRemoveExercise(exercise.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
