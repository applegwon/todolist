import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../lib/queryClient';
import { useAuthStore } from '../../auth/authStore';
import { getMe, updateMe } from '../api';

export function useProfileQuery() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getMe,
  });

  return {
    profile: data,
    isLoading,
    error,
  };
}

export function useProfileUpdate() {
  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: updateMe,
    onSuccess: (updatedUser) => {
      const token = localStorage.getItem('token') ?? '';
      useAuthStore.getState().setAuth(token, updatedUser);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    updateProfile: mutate,
    isPending,
    isSuccess,
    mutationError: error,
  };
}
