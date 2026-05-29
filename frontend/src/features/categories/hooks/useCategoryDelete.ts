import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../lib/queryClient';
import { deleteCategory } from '../api';

export function useCategoryDelete() {
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
