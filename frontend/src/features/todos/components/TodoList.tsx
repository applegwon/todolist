import type { Todo, Category } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { TodoCard } from './TodoCard';

interface Props {
  todos: Todo[];
  categories: Category[];
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

export function TodoList({ todos, categories, onEdit, onDelete }: Props) {
  const { t } = useLanguage();

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__message">{t.todo.emptyList}</p>
      </div>
    );
  }

  const getCategoryName = (categoryId: number): string => {
    return categories.find((c) => c.id === categoryId)?.name ?? '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          categoryName={getCategoryName(todo.category_id)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
