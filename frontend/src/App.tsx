import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ProtectedRoute } from './features/common/components/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { CategoriesPage } from './features/categories/pages/CategoriesPage';
import { TodoListPage } from './features/todos/pages/TodoListPage';
import { TodoCreatePage } from './features/todos/pages/TodoCreatePage';
import { TodoEditPage } from './features/todos/pages/TodoEditPage';

import { ProfilePage } from './features/users/pages/ProfilePage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<ProtectedRoute><TodoListPage /></ProtectedRoute>} />
          <Route path="/todos/new" element={<ProtectedRoute><TodoCreatePage /></ProtectedRoute>} />
          <Route path="/todos/:id/edit" element={<ProtectedRoute><TodoEditPage /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
