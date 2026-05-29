import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '../../../lib/queryClient';
import { createTodo } from '../api';

export function useTodoCreate() {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      navigate('/');
    },
  });
}
