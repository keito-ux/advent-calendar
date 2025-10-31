import type { Language } from '../lib/types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' }
];

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onLanguageChange(lang.code)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all
            ${currentLanguage === lang.code
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <span className="mr-2">{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
