import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../lib/queryClient';
import { updateCategory } from '../api';

export function useCategoryUpdate() {
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
