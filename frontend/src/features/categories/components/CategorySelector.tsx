import type { Category } from '../../../types';

interface Props {
  value: number | undefined;
  onChange: (id: number) => void;
  categories: Category[];
}

export function CategorySelector({ value, onChange, categories }: Props) {
  return (
    <select
      className="select"
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}
