import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Session, CreateSessionInput, SetLog } from '@/types';
import { sessionStorage, routineStorage } from '@/lib/storage';

const QUERY_KEY = 'sessions';

export const useSessions = () => {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => sessionStorage.getAll(),
  });
};

export const useSession = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => sessionStorage.getById(id),
    enabled: !!id,
  });
};

export const useActiveSession = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'active'],
    queryFn: () => sessionStorage.getActiveSession(),
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
};

export const useSessionsByExercise = (exerciseId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'exercise', exerciseId],
    queryFn: () => sessionStorage.getByExerciseId(exerciseId),
    enabled: !!exerciseId,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const routine = routineStorage.getById(input.routineId);
      if (!routine) throw new Error('Routine not found');
      return Promise.resolve(sessionStorage.create(input, routine));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Session> }) => {
      const result = sessionStorage.update(id, updates);
      if (!result) throw new Error('Session not found');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useUpdateSetLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseLogId,
      setLogId,
      updates,
    }: {
      sessionId: string;
      exerciseLogId: string;
      setLogId: string;
      updates: Partial<SetLog>;
    }) => {
      const result = sessionStorage.updateSetLog(
        sessionId,
        exerciseLogId,
        setLogId,
        updates
      );
      if (!result) throw new Error('Failed to update set');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useAddSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseLogId,
      side,
    }: {
      sessionId: string;
      exerciseLogId: string;
      side?: 'left' | 'right';
    }) => {
      const result = sessionStorage.addSet(sessionId, exerciseLogId, side);
      if (!result) throw new Error('Failed to add set');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useRemoveSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseLogId,
      setLogId,
    }: {
      sessionId: string;
      exerciseLogId: string;
      setLogId: string;
    }) => {
      const result = sessionStorage.removeSet(sessionId, exerciseLogId, setLogId);
      if (!result) throw new Error('Failed to remove set');
      return Promise.resolve(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const result = sessionStorage.completeSession(id);
      if (!result) throw new Error('Session not found');
      return Promise.resolve(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const success = sessionStorage.delete(id);
      if (!success) throw new Error('Session not found');
      return Promise.resolve(success);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
