import { useState } from 'react';
import type { Category, ApiError } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { useCategoryCreate } from '../hooks/useCategoryCreate';
import { useCategoryUpdate } from '../hooks/useCategoryUpdate';

interface Props {
  mode: 'create' | 'edit';
  category?: Category;
  onClose: () => void;
}

export function CategoryModal({ mode, category, onClose }: Props) {
  const { t } = useLanguage();
  const [name, setName] = useState(category?.name ?? '');

  const createMutation = useCategoryCreate();
  const updateMutation = useCategoryUpdate();

  const activeMutation = mode === 'create' ? createMutation : updateMutation;
  const isPending = activeMutation.isPending;
  const error = activeMutation.isError ? (activeMutation.error as ApiError) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'create') {
      createMutation.mutate(name.trim(), { onSuccess: onClose });
    } else if (category) {
      updateMutation.mutate({ id: category.id, name: name.trim() }, { onSuccess: onClose });
    }
  };

  const title = mode === 'create' ? t.category.addCategory : t.category.editCategory;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label={t.common.close}>
          ✕
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required" htmlFor="category-name">
              {t.category.nameLabel}
            </label>
            <input
              id="category-name"
              className={`input-outlined${error ? ' error' : ''}`}
              type="text"
              placeholder={t.category.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && (
              <span className="form-error">
                {error.code === 'CATEGORY_NAME_DUPLICATE'
                  ? t.category.nameDuplicate
                  : error.message}
              </span>
            )}
          </div>
          <div className="modal__footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isPending || !name.trim()}
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
