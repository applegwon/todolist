import type { Category } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';

interface Props {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export function CategoryList({ categories, onEdit, onDelete }: Props) {
  const { t } = useLanguage();

  if (categories.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__message">{t.category.emptyList}</p>
      </div>
    );
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {categories.map((category) => {
        const isDefault = category.user_id === null;
        return (
          <li key={category.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{category.name}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-ghost"
                onClick={() => onEdit(category)}
                disabled={isDefault}
              >
                {t.common.edit}
              </button>
              <button
                className="btn-danger"
                onClick={() => onDelete(category)}
                disabled={isDefault}
              >
                {t.common.delete}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
