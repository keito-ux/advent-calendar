import { useEffect, useState } from 'react';
import { CalendarDay } from './CalendarDay';
import { supabase } from '../lib/supabase';
import type { Scene } from '../lib/types';
import { Sparkles, Snowflake, Gift } from 'lucide-react';
import ThreeViewer from './ThreeViewer';

interface CalendarGridProps {
  onSceneClick: (dayNumber: number, scene: Scene | null) => void;
  modelUrl1: string;
  modelUrl2: string;
}

export function CalendarGrid({ onSceneClick, modelUrl1, modelUrl2 }: CalendarGridProps) {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenes();
  }, []);

  async function loadScenes() {
    try {
      const { data, error } = await supabase
        .from('advent_calendar')
        .select('*')
        .order('day_number', { ascending: true });

      if (error) throw error;
      setScenes(data || []);
    } catch (error) {
      console.error('Error loading scenes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function unlockDay(dayNumber: number) {
    try {
      const scene = getSceneForDay(dayNumber);
      if (scene && !scene.is_unlocked) {
        const { error } = await supabase
          .from('advent_calendar')
          .update({ is_unlocked: true })
          .eq('id', scene.id);

        if (error) throw error;
        await loadScenes();
      }
    } catch (error) {
      console.error('Error unlocking day:', error);
    }
  }

  function getDayUnlockDate(dayNumber: number): Date {
    const date = new Date(2025, 11, dayNumber);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function isDayUnlocked(dayNumber: number): boolean {
    const scene = getSceneForDay(dayNumber);
    if (!scene) return false;
    return scene.is_unlocked;
  }

  function isDayToday(dayNumber: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unlockDate = getDayUnlockDate(dayNumber);
    return unlockDate.getTime() === today.getTime();
  }

  function getSceneForDay(dayNumber: number): Scene | null {
    return scenes.find(s => s.day_number === dayNumber) || null;
  }

  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  const unlockedCount = days.filter(day => isDayUnlocked(day)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Gift className="w-12 h-12 text-rose-200 animate-bounce mx-auto mb-4" />
          <p className="text-white text-lg">Loading Christmas magic...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(120)].map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 8;
          const duration = 15 + Math.random() * 15;
          const size = 1.5 + Math.random() * 3;
          return (
            <div
              key={i}
              className="absolute animate-snowfall"
              style={{
                left: `${left}%`,
                top: '-20px',
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              <div className="w-full h-full bg-white rounded-full opacity-90 shadow-lg" />
            </div>
          );
        })}
      </div>

      <div className="absolute inset-0 opacity-30">
        <Snowflake className="absolute top-10 left-10 w-8 h-8 text-white animate-pulse" />
        <Snowflake className="absolute top-20 right-20 w-6 h-6 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Snowflake className="absolute top-40 left-1/4 w-10 h-10 text-white animate-pulse" style={{ animationDelay: '1s' }} />
        <Snowflake className="absolute bottom-20 right-1/3 w-8 h-8 text-white animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Snowflake className="absolute top-60 right-10 w-6 h-6 text-white animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        <header className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-emerald-200 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl" style={{ fontFamily: 'serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              🎄 Christmas Advent Calendar 🎄
            </h1>
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-rose-200 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-6 drop-shadow-lg">
            ✨ 25 Days of Christmas Magic ✨
          </p>

          <div className="flex items-center justify-between gap-8 max-w-6xl mx-auto">
            <ThreeViewer
              modelUrl={modelUrl1}
              className="w-48 h-48"
            />
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl px-6 md:px-8 py-4 md:py-5 border-3 border-emerald-400 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full" />
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-emerald-600 animate-pulse" />
                <div className="text-left">
                  <p className="text-sm md:text-base text-slate-600 font-medium">Days Unlocked</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-700">{unlockedCount} / 25</p>
                </div>
              </div>
            </div>
            <ThreeViewer
              modelUrl={modelUrl2}
              className="w-48 h-48"
            />
          </div>
        </header>

        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 border-3 border-white shadow-2xl relative">
          <div className="absolute -top-2 left-10 w-8 h-8 bg-white rounded-full blur-sm" />
          <div className="absolute -top-1 left-20 w-6 h-6 bg-white rounded-full blur-sm" />
          <div className="absolute -top-2 right-16 w-7 h-7 bg-white rounded-full blur-sm" />
          <div className="absolute -top-1 right-32 w-5 h-5 bg-white rounded-full blur-sm" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
            {days.map((dayNumber) => {
              const scene = getSceneForDay(dayNumber);
              const isUnlocked = isDayUnlocked(dayNumber);
              const isToday = isDayToday(dayNumber);

              return (
                <CalendarDay
                  key={dayNumber}
                  dayNumber={dayNumber}
                  scene={scene}
                  isUnlocked={isUnlocked}
                  isToday={isToday}
                  onClick={async () => {
                    const scene = getSceneForDay(dayNumber);
                    if (scene && !isUnlocked) {
                      await unlockDay(dayNumber);
                    }
                    const updatedScene = getSceneForDay(dayNumber);
                    if (updatedScene) {
                      onSceneClick(dayNumber, updatedScene);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white text-sm md:text-base drop-shadow-lg font-medium">
            🎅 Merry Christmas! Open a new surprise every day! 🎁
          </p>
        </div>
      </div>
    </div>
  );
}
