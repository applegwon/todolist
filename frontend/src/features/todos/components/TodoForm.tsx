import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Todo, Category } from '../../../types';
import { useLanguage } from '../../../hooks/useLanguage';
import { isoToDateInputValue } from '../../../utils/dateUtils';
import { CategorySelector } from '../../categories/components/CategorySelector';
import { useTodoCreate } from '../hooks/useTodoCreate';
import { useTodoUpdate } from '../hooks/useTodoUpdate';

interface Props {
  mode: 'create' | 'edit';
  todo?: Todo;
  categories: Category[];
}

export function TodoForm({ mode, todo, categories }: Props) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [categoryId, setCategoryId] = useState<number | undefined>(todo?.category_id);
  const [startDate, setStartDate] = useState(isoToDateInputValue(todo?.start_date ?? null));
  const [endDate, setEndDate] = useState(isoToDateInputValue(todo?.end_date ?? null));
  const [status, setStatus] = useState<Todo['status']>(todo?.status ?? '미시작');

  const [titleError, setTitleError] = useState('');
  const [dateError, setDateError] = useState('');

  const createMutation = useTodoCreate();
  const updateMutation = useTodoUpdate();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const validate = (): boolean => {
    let valid = true;

    if (!title.trim()) {
      setTitleError(t.error.required);
      valid = false;
    } else {
      setTitleError('');
    }

    if (endDate && startDate && endDate < startDate) {
      setDateError(t.error.dateRange);
      valid = false;
    } else {
      setDateError('');
    }

    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const baseData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category_id: categoryId,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    };

    if (mode === 'create') {
      createMutation.mutate(baseData);
    } else if (todo) {
      updateMutation.mutate({
        id: todo.id,
        data: { ...baseData, status },
      });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label required">{t.todo.titleLabel}</label>
        <input
          className="input-outlined"
          type="text"
          placeholder={t.todo.titlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleError && <p className="form-error">{titleError}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">{t.todo.descriptionLabel}</label>
        <textarea
          className="input-textarea"
          placeholder={t.todo.descriptionPlaceholder}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.todo.categoryLabel}</label>
        <CategorySelector
          value={categoryId}
          onChange={setCategoryId}
          categories={categories}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.todo.startDateLabel}</label>
        <input
          className="input-outlined"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.todo.endDateLabel}</label>
        <input
          className="input-outlined"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        {dateError && <p className="form-error">{dateError}</p>}
      </div>

      {mode === 'edit' && (
        <div className="form-group">
          <label className="form-label">{t.todo.statusLabel}</label>
          <select
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as Todo['status'])}
          >
            <option value="미시작">{t.todo.notStarted}</option>
            <option value="진행중">{t.todo.inProgress}</option>
            <option value="완료">{t.todo.completed}</option>
          </select>
        </div>
      )}

      <div className="modal__footer" style={{ marginTop: '24px' }}>
        <button
          type="button"
          className="btn-ghost"
          onClick={handleCancel}
          disabled={isPending}
        >
          {t.common.cancel}
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
        >
          {t.common.save}
        </button>
      </div>
    </form>
  );
}
