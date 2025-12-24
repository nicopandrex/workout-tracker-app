import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, CreateExerciseInput } from '@/types';
import { exerciseStorage } from '@/lib/storage';

const QUERY_KEY = 'exercises';

export const useExercises = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => exerciseStorage.getAll(),
  });
};

export const useExercise = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => exerciseStorage.getById(id),
    enabled: !!id,
  });
};

export const useSearchExercises = (query: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'search', query],
    queryFn: () => exerciseStorage.search(query),
    enabled: query.length > 0,
  });
};

export const useExercisesByCategory = (category: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'category', category],
    queryFn: () => exerciseStorage.filterByCategory(category),
    enabled: !!category,
  });
};

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExerciseInput) => {
      return Promise.resolve(exerciseStorage.create(input));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Exercise> }) => {
      const result = exerciseStorage.update(id, updates);
      if (!result) throw new Error('Exercise not found');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
};

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const success = exerciseStorage.delete(id);
      if (!success) throw new Error('Exercise not found');
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
