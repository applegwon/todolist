import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../lib/queryClient';
import { deleteTodo } from '../api';

export function useTodoDelete() {
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
