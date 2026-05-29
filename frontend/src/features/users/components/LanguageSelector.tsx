import { useLanguage } from '../../../hooks/useLanguage';

interface Props {
  value: 'ko' | 'en' | 'ja';
  onChange: (language: 'ko' | 'en' | 'ja') => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  const { setLanguage, t } = useLanguage();

  const handleChange = (language: 'ko' | 'en' | 'ja') => {
    setLanguage(language);
    onChange(language);
  };

  return (
    <div className="form-group">
      <span className="form-label">{t.profile.language}</span>
      <div>
        <label>
          <input
            type="radio"
            name="language"
            value="ko"
            checked={value === 'ko'}
            onChange={() => handleChange('ko')}
          />
          {' '}{t.profile.korean}
        </label>
        {' '}
        <label>
          <input
            type="radio"
            name="language"
            value="en"
            checked={value === 'en'}
            onChange={() => handleChange('en')}
          />
          {' '}{t.profile.english}
        </label>
        {' '}
        <label>
          <input
            type="radio"
            name="language"
            value="ja"
            checked={value === 'ja'}
            onChange={() => handleChange('ja')}
          />
          {' '}{t.profile.japanese}
        </label>
      </div>
    </div>
  );
}
