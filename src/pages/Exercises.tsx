import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
} from "@/hooks/useExercises";
import {
  ExerciseCategory,
  Equipment,
  MuscleGroup,
  MUSCLE_GROUP_LABELS,
  Exercise,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function Exercises() {
  const navigate = useNavigate();
  const { data: exercises, isLoading } = useExercises();
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: ExerciseCategory.OTHER,
    equipment: Equipment.OTHER,
    primaryMuscleGroup: MuscleGroup.CHEST,
    secondaryMuscleGroup: undefined as MuscleGroup | undefined,
    isUnilateral: false,
  });

  const handleCreateExercise = async () => {
    if (!newExercise.name.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }

    try {
      await createExercise.mutateAsync(newExercise);
      toast.success("Exercise created!");
      setIsCreateDialogOpen(false);
      setNewExercise({
        name: "",
        category: ExerciseCategory.OTHER,
        equipment: Equipment.OTHER,
        primaryMuscleGroup: MuscleGroup.CHEST,
        secondaryMuscleGroup: undefined,
        isUnilateral: false,
      });
    } catch (error) {
      toast.error("Failed to create exercise");
    }
  };

  const handleEditExercise = (exercise: Exercise, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExercise(exercise);
    setIsEditDialogOpen(true);
  };

  const handleUpdateExercise = async () => {
    if (!editingExercise || !editingExercise.name.trim()) {
      toast.error("Please enter an exercise name");
      return;
    }

    try {
      await updateExercise.mutateAsync({
        id: editingExercise.id,
        updates: {
          name: editingExercise.name,
          category: editingExercise.category,
          equipment: editingExercise.equipment,
          primaryMuscleGroup: editingExercise.primaryMuscleGroup,
          secondaryMuscleGroup: editingExercise.secondaryMuscleGroup,
          isUnilateral: editingExercise.isUnilateral,
        },
      });
      toast.success("Exercise updated!");
      setIsEditDialogOpen(false);
      setEditingExercise(null);
    } catch (error) {
      toast.error("Failed to update exercise");
    }
  };

  const handleDeleteExercise = async (
    exerciseId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this exercise?")) return;

    try {
      await deleteExercise.mutateAsync(exerciseId);
      toast.success("Exercise deleted!");
    } catch (error) {
      toast.error("Failed to delete exercise");
    }
  };

  const filteredExercises = exercises?.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Exercises</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Exercise
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Create New Exercise
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new exercise to your library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exercise-name" className="text-white">
                  Exercise Name
                </Label>
                <Input
                  id="exercise-name"
                  placeholder="e.g., Bench Press"
                  value={newExercise.name}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, name: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-white">
                  Category
                </Label>
                <Select
                  value={newExercise.category}
                  onValueChange={(value) =>
                    setNewExercise({
                      ...newExercise,
                      category: value as ExerciseCategory,
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(ExerciseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="equipment" className="text-white">
                  Equipment
                </Label>
                <Select
                  value={newExercise.equipment}
                  onValueChange={(value) =>
                    setNewExercise({
                      ...newExercise,
                      equipment: value as Equipment,
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(Equipment).map((eq) => (
                      <SelectItem key={eq} value={eq} className="text-white">
                        {eq.charAt(0).toUpperCase() + eq.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-muscle" className="text-white">
                  Primary Muscle Group <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={newExercise.primaryMuscleGroup}
                  onValueChange={(value) =>
                    setNewExercise({
                      ...newExercise,
                      primaryMuscleGroup: value as MuscleGroup,
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(MuscleGroup).map((muscle) => (
                      <SelectItem
                        key={muscle}
                        value={muscle}
                        className="text-white"
                      >
                        {MUSCLE_GROUP_LABELS[muscle]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-muscle" className="text-white">
                  Secondary Muscle Group{" "}
                  <span className="text-slate-500 text-sm">(Optional)</span>
                </Label>
                <Select
                  value={newExercise.secondaryMuscleGroup || "none"}
                  onValueChange={(value) =>
                    setNewExercise({
                      ...newExercise,
                      secondaryMuscleGroup:
                        value === "none" ? undefined : (value as MuscleGroup),
                    })
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-slate-400">
                      None
                    </SelectItem>
                    {Object.values(MuscleGroup).map((muscle) => (
                      <SelectItem
                        key={muscle}
                        value={muscle}
                        className="text-white"
                      >
                        {MUSCLE_GROUP_LABELS[muscle]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="unilateral"
                  checked={newExercise.isUnilateral}
                  onChange={(e) =>
                    setNewExercise({
                      ...newExercise,
                      isUnilateral: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <Label htmlFor="unilateral" className="text-white cursor-pointer">
                  Unilateral (track left & right separately)
                </Label>
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
                onClick={handleCreateExercise}
                disabled={createExercise.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Create Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Exercise Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-white">
                  Exercise Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingExercise?.name || ""}
                  onChange={(e) =>
                    setEditingExercise(
                      editingExercise
                        ? { ...editingExercise, name: e.target.value }
                        : null
                    )
                  }
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="e.g., Bench Press"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-white">
                  Category
                </Label>
                <Select
                  value={editingExercise?.category}
                  onValueChange={(value) =>
                    setEditingExercise(
                      editingExercise
                        ? {
                            ...editingExercise,
                            category: value as ExerciseCategory,
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(ExerciseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-equipment" className="text-white">
                  Equipment
                </Label>
                <Select
                  value={editingExercise?.equipment}
                  onValueChange={(value) =>
                    setEditingExercise(
                      editingExercise
                        ? { ...editingExercise, equipment: value as Equipment }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(Equipment).map((eq) => (
                      <SelectItem key={eq} value={eq} className="text-white">
                        {eq.charAt(0).toUpperCase() + eq.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-primary-muscle" className="text-white">
                  Primary Muscle Group <span className="text-red-400">*</span>
                </Label>
                <Select
                  value={editingExercise?.primaryMuscleGroup}
                  onValueChange={(value) =>
                    setEditingExercise(
                      editingExercise
                        ? {
                            ...editingExercise,
                            primaryMuscleGroup: value as MuscleGroup,
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.values(MuscleGroup).map((muscle) => (
                      <SelectItem
                        key={muscle}
                        value={muscle}
                        className="text-white"
                      >
                        {MUSCLE_GROUP_LABELS[muscle]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-secondary-muscle" className="text-white">
                  Secondary Muscle Group{" "}
                  <span className="text-slate-500 text-sm">(Optional)</span>
                </Label>
                <Select
                  value={editingExercise?.secondaryMuscleGroup || "none"}
                  onValueChange={(value) =>
                    setEditingExercise(
                      editingExercise
                        ? {
                            ...editingExercise,
                            secondaryMuscleGroup:
                              value === "none"
                                ? undefined
                                : (value as MuscleGroup),
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="none" className="text-slate-400">
                      None
                    </SelectItem>
                    {Object.values(MuscleGroup).map((muscle) => (
                      <SelectItem
                        key={muscle}
                        value={muscle}
                        className="text-white"
                      >
                        {MUSCLE_GROUP_LABELS[muscle]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-unilateral"
                  checked={editingExercise?.isUnilateral || false}
                  onChange={(e) =>
                    setEditingExercise(
                      editingExercise
                        ? {
                            ...editingExercise,
                            isUnilateral: e.target.checked,
                          }
                        : null
                    )
                  }
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                />
                <Label htmlFor="edit-unilateral" className="text-white cursor-pointer">
                  Unilateral (track left & right separately)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateExercise}
                disabled={updateExercise.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Update Exercise
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-700 text-white"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="bg-slate-900/50 border-slate-700/50 animate-pulse"
            >
              <CardHeader className="h-24"></CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExercises?.map((exercise) => (
            <Card
              key={exercise.id}
              className="bg-slate-900/50 border-slate-700/50 hover:border-emerald-500/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/exercises/${exercise.id}/history`)}
            >
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{exercise.name}</span>
                  <div className="flex gap-2 items-center">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-emerald-400"
                      onClick={(e) => handleEditExercise(exercise, e)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-400"
                      onClick={(e) => handleDeleteExercise(exercise.id, e)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
