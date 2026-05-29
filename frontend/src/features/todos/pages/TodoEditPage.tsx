import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../hooks/useLanguage';
import { Header } from '../../common/components/Header';
import { TodoForm } from '../components/TodoForm';
import { useTodos } from '../hooks/useTodos';
import { useCategories } from '../../categories/hooks/useCategories';

export function TodoEditPage() {
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, isLoading } = useTodos();
  const { categories } = useCategories();

  const todoId = Number(id);
  const todo = todos.find((item) => item.id === todoId);

  useEffect(() => {
    if (!isLoading && !todo) {
      navigate('/');
    }
  }, [isLoading, todo, navigate]);

  if (isLoading) {
    return (
      <div className="app">
        <Header />
        <main className="page-content">
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {t.common.loading}
          </p>
        </main>
      </div>
    );
  }

  if (!todo) {
    return null;
  }

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <h1 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700 }}>
          {t.todo.editTodo}
        </h1>
        <div className="card">
          <TodoForm mode="edit" todo={todo} categories={categories} />
        </div>
      </main>
    </div>
  );
}
