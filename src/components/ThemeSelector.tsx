import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export type ThemeType = 'classic' | 'snow' | 'golden' | 'rose' | 'ocean' | 'forest';

interface Theme {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic Christmas',
    description: '伝統的なクリスマスカラー',
    colors: {
      primary: 'from-red-600 to-green-600',
      secondary: 'from-amber-400 to-rose-500',
      accent: 'bg-white/90',
      background: 'from-slate-900 via-navy-900 to-slate-950',
    },
  },
  {
    id: 'snow',
    name: 'Winter Snow',
    description: '雪の降る冬のテーマ',
    colors: {
      primary: 'from-blue-400 to-cyan-300',
      secondary: 'from-white to-blue-100',
      accent: 'bg-white/95',
      background: 'from-blue-50 via-cyan-50 to-white',
    },
  },
  {
    id: 'golden',
    name: 'Golden Elegance',
    description: 'ゴールドのエレガントなテーマ',
    colors: {
      primary: 'from-amber-500 to-yellow-400',
      secondary: 'from-amber-600 to-rose-500',
      accent: 'bg-amber-50/95',
      background: 'from-amber-900 via-yellow-900 to-amber-950',
    },
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'ローズガーデンのテーマ',
    colors: {
      primary: 'from-pink-500 to-rose-400',
      secondary: 'from-rose-500 to-pink-500',
      accent: 'bg-rose-50/95',
      background: 'from-rose-900 via-pink-900 to-rose-950',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: '海の青をテーマに',
    colors: {
      primary: 'from-blue-500 to-cyan-400',
      secondary: 'from-cyan-500 to-blue-500',
      accent: 'bg-cyan-50/95',
      background: 'from-blue-900 via-cyan-900 to-blue-950',
    },
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: '森の緑のテーマ',
    colors: {
      primary: 'from-green-600 to-emerald-500',
      secondary: 'from-emerald-500 to-green-500',
      accent: 'bg-green-50/95',
      background: 'from-green-900 via-emerald-900 to-green-950',
    },
  },
];

interface ThemeSelectorProps {
  calendarId: string;
  currentTheme: ThemeType | null;
  onThemeChange?: (theme: ThemeType) => void;
}

export function ThemeSelector({ calendarId, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(currentTheme || 'classic');
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentTheme) {
      setSelectedTheme(currentTheme);
    }
  }, [currentTheme]);

  async function handleThemeSelect(theme: ThemeType) {
    setSelectedTheme(theme);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_calendars')
        .update({ theme: theme })
        .eq('id', calendarId);

      if (error) throw error;

      onThemeChange?.(theme);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating theme:', error);
      alert('テーマの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  }

  const currentThemeData = themes.find(t => t.id === selectedTheme) || themes[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all"
        disabled={saving}
      >
        <Palette className="w-5 h-5" />
        <span className="font-semibold">{currentThemeData.name}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">テーマを選択</h3>
              <p className="text-sm text-gray-600 mt-1">カレンダーのデザインを選びましょう</p>
            </div>

            <div className="p-4 space-y-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{theme.name}</h4>
                    {selectedTheme === theme.id && (
                      <Check className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                  <div className="flex gap-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.colors.primary}`} />
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.colors.secondary}`} />
                    <div className={`w-8 h-8 rounded-full ${theme.colors.accent}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

