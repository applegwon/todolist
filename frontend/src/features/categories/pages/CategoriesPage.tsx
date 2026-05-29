import { useState } from 'react';
import type { Category } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { Header } from '../../common/components/Header';
import { CategoryList } from '../components/CategoryList';
import { CategoryModal } from '../components/CategoryModal';
import { useCategories } from '../hooks/useCategories';
import { useCategoryDelete } from '../hooks/useCategoryDelete';

type ModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; category: Category };

export function CategoriesPage() {
  const { t } = useLanguage();
  const { categories, isLoading, error } = useCategories();
  const deleteMutation = useCategoryDelete();

  const [modal, setModal] = useState<ModalState>({ open: false });

  const handleEdit = (category: Category) => {
    setModal({ open: true, mode: 'edit', category });
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(t.category.deleteConfirm)) {
      deleteMutation.mutate(category.id);
    }
  };

  const handleCloseModal = () => {
    setModal({ open: false });
  };

  return (
    <div className="app">
      <Header />
      <main className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{t.category.title}</h1>
          <button
            className="btn-primary"
            onClick={() => setModal({ open: true, mode: 'create' })}
          >
            + {t.category.addCategory}
          </button>
        </div>

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
          <CategoryList
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      {modal.open && modal.mode === 'create' && (
        <CategoryModal mode="create" onClose={handleCloseModal} />
      )}

      {modal.open && modal.mode === 'edit' && (
        <CategoryModal mode="edit" category={modal.category} onClose={handleCloseModal} />
      )}
    </div>
  );
}
