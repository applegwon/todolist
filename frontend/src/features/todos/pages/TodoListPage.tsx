import { useNavigate } from 'react-router-dom';
import type { Todo } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { Header } from '../../common/components/Header';
import { TodoFilters } from '../components/TodoFilters';
import { TodoList } from '../components/TodoList';
import { useTodos } from '../hooks/useTodos';
import { useTodoDelete } from '../hooks/useTodoDelete';
import { useCategories } from '../../categories/hooks/useCategories';

export function TodoListPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { todos, isLoading, error } = useTodos();
  const { categories } = useCategories();
  const deleteMutation = useTodoDelete();

  const handleEdit = (todo: Todo) => {
    navigate(`/todos/${todo.id}/edit`);
  };

  const handleDelete = (todo: Todo) => {
    if (window.confirm(t.todo.deleteConfirm)) {
      deleteMutation.mutate(todo.id);
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{t.todo.title}</h1>
          <button className="btn-primary" onClick={() => navigate('/todos/new')}>
            + {t.todo.addTodo}
          </button>
        </div>

        <TodoFilters />

        {isLoading && (
          <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {t.common.loading}
          </p>
        )}

        {error && !isLoading && (
          <div className="error-alert" role="alert">
            {t.common.error}
          </div>
        )}

        {!isLoading && !error && (
          <TodoList
            todos={todos}
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
