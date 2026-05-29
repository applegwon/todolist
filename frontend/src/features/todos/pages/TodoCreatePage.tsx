import { useLanguage } from '../../../hooks/useLanguage';
import { Header } from '../../common/components/Header';
import { TodoForm } from '../components/TodoForm';
import { useCategories } from '../../categories/hooks/useCategories';

export function TodoCreatePage() {
  const { t } = useLanguage();
  const { categories } = useCategories();

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <h1 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700 }}>
          {t.todo.createTodo}
        </h1>
        <div className="card">
          <TodoForm mode="create" categories={categories} />
        </div>
      </main>
    </div>
  );
}
