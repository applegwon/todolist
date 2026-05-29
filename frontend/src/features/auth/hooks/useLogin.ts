import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuthStore } from '../authStore';
import { useSettingsStore } from '../../users/settingsStore';

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { setTheme, setLanguage } = useSettingsStore();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      // UC-205: 로그인 시 DB에 저장된 테마/언어 즉시 적용
      setTheme(data.user.theme);
      setLanguage(data.user.language);
      navigate('/');
    },
  });
}
