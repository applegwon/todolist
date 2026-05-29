import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../lib/queryClient';
import { createCategory } from '../api';

export function useCategoryCreate() {
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
