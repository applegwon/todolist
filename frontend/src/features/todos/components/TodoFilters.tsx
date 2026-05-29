import { useLanguage } from '../../../hooks/useLanguage';
import { useTodoFilterStore } from '../todoStore';
import { useCategories } from '../../categories/hooks/useCategories';
import type { TodoFilters as TodoFiltersType } from '../../../types';

export function TodoFilters() {
  const { t } = useLanguage();
  const { filters, setFilters } = useTodoFilterStore();
  const { categories } = useCategories();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ category: value ? Number(value) : undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TodoFiltersType['status'];
    setFilters({ status: value || undefined });
  };

  const handleOverdueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ overdue: e.target.checked ? 'true' : undefined });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
      <select
        className="select"
        value={filters.category ?? ''}
        onChange={handleCategoryChange}
        aria-label={t.todo.categoryLabel}
      >
        <option value="">{t.todo.filterAll}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={filters.status ?? ''}
        onChange={handleStatusChange}
        aria-label={t.todo.statusLabel}
      >
        <option value="">{t.todo.filterAll}</option>
        <option value="미시작">{t.todo.notStarted}</option>
        <option value="진행중">{t.todo.inProgress}</option>
        <option value="완료">{t.todo.completed}</option>
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={filters.overdue === 'true'}
          onChange={handleOverdueChange}
        />
        {t.todo.overdueOnly}
      </label>
    </div>
  );
}
