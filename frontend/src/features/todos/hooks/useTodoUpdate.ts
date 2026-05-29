import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../../lib/queryClient';
import { updateTodo } from '../api';
import type { UpdateTodoRequest } from '../../../types';

export function useTodoUpdate() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTodoRequest }) =>
      updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      navigate('/');
    },
  });
}
