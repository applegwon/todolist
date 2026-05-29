import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signup } from '../api';

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      navigate('/login');
    },
  });
}
