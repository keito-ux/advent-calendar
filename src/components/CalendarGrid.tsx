import { useEffect, useState } from 'react';
import { CalendarDay } from './CalendarDay';
import { supabase } from '../lib/supabase';
import type { UserCalendarDay } from '../lib/types';
import { Sparkles, Snowflake, Gift, Upload } from 'lucide-react';
import ThreeViewer from './ThreeViewer';
import UploadScene from './UploadScene';

interface CalendarGridProps {
  calendarId: string;
  onSceneClick: (dayNumber: number, sceneId: string, calendarId: string) => void;
  modelUrl1: string;
  modelUrl2: string;
}

export function CalendarGrid({ calendarId, onSceneClick, modelUrl1, modelUrl2 }: CalendarGridProps) {
  const [scenes, setScenes] = useState<UserCalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarTitle, setCalendarTitle] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId !== null) {
      loadCalendar();
    }
  }, [calendarId, currentUserId]);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }

  async function loadCalendar() {
    try {
      // まずカレンダー情報を取得
      const { data: calendar, error: calendarError } = await supabase
        .from('user_calendars')
        .select('*')
        .eq('id', calendarId)
        .single();

      if (calendarError) {
        console.error('Supabase error:', calendarError.message);
        console.error('Error details:', calendarError);
        throw calendarError;
      }

      if (!calendar) {
        throw new Error('Calendar not found');
      }

      setCalendarTitle(calendar.title);

      // user_idベースでuser_calendar_daysを取得
      const { data: scenesData, error: scenesError } = await supabase
        .from('user_calendar_days')
        .select('*')
        .eq('user_id', calendar.creator_id)
        .order('day_number', { ascending: true });

      if (scenesError) {
        console.error('Supabase error:', scenesError.message);
        console.error('Error details:', scenesError);
        throw scenesError;
      }

      // カレンダーが現在のユーザーのものか、または公開されている場合のみ表示
      if (currentUserId && calendar.creator_id === currentUserId) {
        // 自分のカレンダー: すべて表示
        setScenes(scenesData || []);
      } else if (calendar.is_public) {
        // 公開カレンダー: すべて表示
        setScenes(scenesData || []);
      } else {
        // 非公開の他人のカレンダー: 空
        setScenes([]);
      }
    } catch (error) {
      console.error('Error loading calendar:', error);
    } finally {
      setLoading(false);
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
    const unlockDate = getDayUnlockDate(dayNumber);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return unlockDate.getTime() <= today.getTime();
  }

  function isDayToday(dayNumber: number): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unlockDate = getDayUnlockDate(dayNumber);
    return unlockDate.getTime() === today.getTime();
  }

  function getSceneForDay(dayNumber: number): UserCalendarDay | null {
    return scenes.find(s => s.day_number === dayNumber) || null;
  }

  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  const unlockedCount = days.filter(day => isDayUnlocked(day)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Gift className="w-12 h-12 text-amber-400 animate-bounce mx-auto mb-4" />
          <p className="text-white text-lg">Loading calendar magic...</p>
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
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-amber-400 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl" style={{ fontFamily: 'serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              {calendarTitle || '🎄 Advent Calendar 🎄'}
            </h1>
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-rose-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-6 drop-shadow-lg">
            ✨ 25 Days of Magic ✨
          </p>

          <div className="flex items-center justify-between gap-8 max-w-6xl mx-auto mb-6">
            <ThreeViewer
              modelUrl={modelUrl1}
              className="w-48 h-48"
            />
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl px-6 md:px-8 py-4 md:py-5 border-3 border-amber-400 relative">
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full" />
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-amber-600 animate-pulse" />
                <div className="text-left">
                  <p className="text-sm md:text-base text-slate-600 font-medium">Days Unlocked</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-700">{unlockedCount} / 25</p>
                </div>
              </div>
            </div>
            <ThreeViewer
              modelUrl={modelUrl2}
              className="w-48 h-48"
            />
          </div>

          <div className="flex justify-center">
            <UploadScene 
              calendarId={calendarId} 
              onSuccess={loadCalendar}
              isOpen={showUploadModal}
              onClose={() => {
                setShowUploadModal(false);
                setSelectedDay(null);
              }}
              initialDay={selectedDay || undefined}
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
                <div key={dayNumber} className="relative">
                  <CalendarDay
                    dayNumber={dayNumber}
                    scene={scene}
                    isUnlocked={isUnlocked}
                    isToday={isToday}
                    onClick={() => {
                      if (scene && isUnlocked) {
                        onSceneClick(dayNumber, scene.id, calendarId);
                      } else if (isUnlocked) {
                        // 未登録の日付をクリックした場合、UploadSceneモーダルを開く
                        setSelectedDay(dayNumber);
                        setShowUploadModal(true);
                      }
                    }}
                  />
                  {!scene && isUnlocked && (
                    <button
                      onClick={() => {
                        setSelectedDay(dayNumber);
                        setShowUploadModal(true);
                      }}
                      className="absolute top-2 right-2 bg-amber-400 hover:bg-amber-500 text-white rounded-full p-2 shadow-lg transition-all z-10"
                      title="Add scene"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white text-sm md:text-base drop-shadow-lg font-medium">
            🎅 Open a new surprise every day! 🎁
          </p>
        </div>
      </div>
    </div>
  );
}
