import type { Todo } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDateDisplay } from '../../../utils/dateUtils';

interface Props {
  todo: Todo;
  categoryName: string;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

function getStatusBadgeClass(status: Todo['status']): string {
  if (status === '진행중') return 'badge badge-progress';
  if (status === '완료') return 'badge badge-success';
  return 'badge badge-default';
}

function getCardClass(todo: Todo): string {
  if (todo.is_overdue) return 'card overdue';
  if (todo.status === '완료') return 'card completed';
  return 'card';
}

export function TodoCard({ todo, categoryName, onEdit, onDelete }: Props) {
  const { t } = useLanguage();

  return (
    <div className={getCardClass(todo)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span className="chip">{categoryName}</span>
            <span className={getStatusBadgeClass(todo.status)}>
              {todo.status === '미시작' && t.todo.notStarted}
              {todo.status === '진행중' && t.todo.inProgress}
              {todo.status === '완료' && t.todo.completed}
            </span>
            {todo.is_overdue && (
              <span className="badge badge-overdue">{t.todo.overdue}</span>
            )}
          </div>
          <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{todo.title}</p>
          {(todo.start_date || todo.end_date) && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {formatDateDisplay(todo.start_date)} ~ {formatDateDisplay(todo.end_date)}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button className="btn-ghost" onClick={() => onEdit(todo)}>
            {t.common.edit}
          </button>
          <button className="btn-danger" onClick={() => onDelete(todo)}>
            {t.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}
