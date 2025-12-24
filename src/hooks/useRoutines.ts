import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Routine,
  CreateRoutineInput,
  UpdateRoutineInput,
  RoutineExercise,
} from '@/types';
import { routineStorage } from '@/lib/storage';

const QUERY_KEY = 'routines';

export const useRoutines = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => routineStorage.getAll(),
  });
};

export const useRoutine = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => routineStorage.getById(id),
    enabled: !!id,
  });
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoutineInput) => {
      return Promise.resolve(routineStorage.create(input));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRoutineInput) => {
      const result = routineStorage.update(input);
      if (!result) throw new Error('Routine not found');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const success = routineStorage.delete(id);
      if (!success) throw new Error('Routine not found');
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useAddExerciseToRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      exercise,
    }: {
      routineId: string;
      exercise: Omit<RoutineExercise, 'id' | 'order'>;
    }) => {
      const result = routineStorage.addExercise(routineId, exercise);
      if (!result) throw new Error('Failed to add exercise to routine');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.routineId] });
    },
  });
};

export const useRemoveExerciseFromRoutine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      exerciseId,
    }: {
      routineId: string;
      exerciseId: string;
    }) => {
      const result = routineStorage.removeExercise(routineId, exerciseId);
      if (!result) throw new Error('Failed to remove exercise from routine');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.routineId] });
    },
  });
};

export const useReorderRoutineExercises = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      routineId,
      exercises,
    }: {
      routineId: string;
      exercises: RoutineExercise[];
    }) => {
      const result = routineStorage.reorderExercises(routineId, exercises);
      if (!result) throw new Error('Failed to reorder exercises');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.routineId] });
    },
  });
};
