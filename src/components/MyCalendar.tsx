import { useEffect, useState, useRef } from 'react';
import { CalendarDay } from './CalendarDay';
import { supabase } from '../lib/supabase';
import type { UserCalendarDay, UserCalendar } from '../lib/types';
import { Sparkles, Snowflake, Gift, Pencil, Check, X } from 'lucide-react';
import ThreeViewer from './ThreeViewer';
import UploadScene from './UploadScene';
import { ThemeSelector, themes, type ThemeType } from './ThemeSelector';

interface MyCalendarProps {
  userId: string;
  onSceneClick: (dayNumber: number, scene: UserCalendarDay | null) => void;
  modelUrl1: string;
  modelUrl2: string;
}

export function MyCalendar({ userId, onSceneClick: _onSceneClick, modelUrl1, modelUrl2 }: MyCalendarProps) {
  const [scenes, setScenes] = useState<UserCalendarDay[]>([]);
  const [calendar, setCalendar] = useState<UserCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('classic');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  
  // ✅ 無限再レンダリングを防ぐためのref
  const userIdRef = useRef<string | null>(null);
  const hasLoadedRef = useRef(false);
  const renderCountRef = useRef(0);

  // ✅ useEffectを空の依存配列にして、初回のみ実行
  useEffect(() => {
    // userIdが変更された場合のみ再読み込み
    if (userIdRef.current !== userId) {
      userIdRef.current = userId;
      hasLoadedRef.current = false;
    }
    
    // 初回のみ読み込み
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadScenes();
    }
  }, []); // 空の依存配列

  // ✅ デフォルトの12月アドベントカレンダー（1〜25日）を作成
  async function createDefaultCalendarDays(calendarId: string) {
    try {
      // 既存の日付データを確認（calendar_idベース）
      const { data: existingDays } = await supabase
        .from('user_calendar_days')
        .select('day_number')
        .eq('calendar_id', calendarId);

      const existingDayNumbers = new Set((existingDays || []).map(d => d.day_number));

      // 1〜25日のデフォルトデータを作成（存在しない日のみ）
      const defaultDays = Array.from({ length: 25 }, (_, i) => i + 1)
        .filter(dayNumber => !existingDayNumbers.has(dayNumber))
        .map(dayNumber => ({
          calendar_id: calendarId,
          day_number: dayNumber,
          title: null,
          image_url: null,
        }));

      if (defaultDays.length > 0) {
        const { error: insertError } = await supabase
          .from('user_calendar_days')
          .insert(defaultDays);

        if (insertError) {
          console.error('Error creating default calendar days:', insertError);
          console.error('Error details:', insertError);
        } else {
          console.log(`✅ Created ${defaultDays.length} default calendar days (December 1-25)`);
        }
      } else {
        console.log('✅ All 25 calendar days already exist');
      }
    } catch (error) {
      console.error('Error creating default calendar days:', error);
    }
  }

  // user_calendar_daysからデータを取得（user_id経由）
  async function loadScenes() {
    const currentUserId = userIdRef.current || userId;
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // まずユーザーのカレンダーを取得（なければ作成）
      const currentUserId = userIdRef.current || userId;
      let { data: calendars, error: calendarsError } = await supabase
        .from('user_calendars')
        .select('*')
        .eq('creator_id', currentUserId)
        .limit(1);

      if (calendarsError) {
        console.error('Error loading calendars:', calendarsError);
        // エラー時でもデフォルトカレンダーを設定して続行
        // ✅ 条件付きでsetStateを実行（ループを防ぐ）
        const defaultCalendar = {
          id: 'default',
          creator_id: currentUserId,
          title: 'My Advent Calendar',
          description: null,
          share_code: '',
          is_public: false,
          username: null,
          theme: 'classic',
          background_image: null,
          price: null,
          currency: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserCalendar;
        
        if (!calendar || calendar.id !== 'default') {
          setCalendar(defaultCalendar);
        }
        if (currentTheme !== 'classic') {
          setCurrentTheme('classic');
        }
        if (scenes.length > 0) {
          setScenes([]);
        }
        setLoading(false);
        return;
      }

      let currentCalendar: UserCalendar;

      if (!calendars || calendars.length === 0) {
        // カレンダーが存在しない場合は作成
        const { data: newCalendar, error: createError } = await supabase
          .from('user_calendars')
          .insert({
            creator_id: currentUserId,
            title: 'My Advent Calendar',
            is_public: false,
            theme: 'classic',
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating calendar:', createError);
          // エラー時でもデフォルトカレンダーを設定して続行
          const defaultCalendar = {
            id: 'default',
            creator_id: userId,
            title: 'My Advent Calendar',
            description: null,
            share_code: '',
            is_public: false,
            username: null,
            theme: 'classic',
            background_image: null,
            price: null,
            currency: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as UserCalendar;
          setCalendar(defaultCalendar);
          setCurrentTheme('classic');
          currentCalendar = defaultCalendar;
        } else {
          currentCalendar = newCalendar;
          // ✅ 条件付きでsetStateを実行
          if (!calendar || calendar.id !== currentCalendar.id) {
            setCalendar(currentCalendar);
          }
          const newTheme = (currentCalendar.theme as ThemeType) || 'classic';
          if (currentTheme !== newTheme) {
            setCurrentTheme(newTheme);
          }
          
          // ✅ カレンダー作成時に、12月のアドベントカレンダー（1〜25日）をデフォルトで作成
          await createDefaultCalendarDays(currentCalendar.id);
        }
      } else {
        currentCalendar = calendars[0];
        // ✅ 条件付きでsetStateを実行
        if (!calendar || calendar.id !== currentCalendar.id) {
          setCalendar(currentCalendar);
        }
        const newTheme = (currentCalendar.theme as ThemeType) || 'classic';
        if (currentTheme !== newTheme) {
          setCurrentTheme(newTheme);
        }
      }

      // currentCalendarが設定されている場合のみ日付データを取得
      if (!currentCalendar || currentCalendar.id === 'default') {
        setScenes([]);
        setLoading(false);
        return;
      }

      // カレンダーの日付データを取得（calendar_idベース）
      // model_urlとmessageを削除して必要なカラムのみ取得
      const { data, error } = await supabase
        .from('user_calendar_days')
        .select('id, calendar_id, day_number, title, image_url')
        .eq('calendar_id', currentCalendar.id)
        .order('day_number', { ascending: true });

      if (error) {
        console.error('Supabase error:', error.message);
        console.error('Error details:', error);
        // エラー時でも空配列を設定して続行
        setScenes([]);
      } else {
        // model_urlとmessageを除外したデータを型アサーションで設定
        const scenesData = (data || []) as unknown as UserCalendarDay[];
        
        // ✅ 既存のカレンダーでも、日付データが25日分ない場合はデフォルトデータを作成
        if (scenesData.length < 25) {
          console.log(`⚠️ Only ${scenesData.length} days found, creating default days...`);
          await createDefaultCalendarDays(currentCalendar.id);
          // デフォルトデータ作成後、再度データを取得
          const { data: updatedData } = await supabase
            .from('user_calendar_days')
            .select('id, calendar_id, day_number, title, image_url')
            .eq('calendar_id', currentCalendar.id)
            .order('day_number', { ascending: true });
          if (updatedData) {
            const updatedScenes = (updatedData || []) as unknown as UserCalendarDay[];
            // ✅ 条件付きでsetStateを実行
            if (JSON.stringify(scenes) !== JSON.stringify(updatedScenes)) {
              setScenes(updatedScenes);
            }
          }
        } else {
          // ✅ 条件付きでsetStateを実行
          if (JSON.stringify(scenes) !== JSON.stringify(scenesData)) {
            setScenes(scenesData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading scenes:', error);
      // エラー時でもデフォルト値を設定して続行
      if (!calendar) {
        setCalendar({
          id: 'default',
          creator_id: userId,
          title: 'My Advent Calendar',
          description: null,
          share_code: '',
          is_public: false,
          username: null,
          theme: 'classic',
          background_image: null,
          price: null,
          currency: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserCalendar);
        setCurrentTheme('classic');
      }
      setScenes([]);
    } finally {
      setLoading(false);
    }
  }

  function getDayUnlockDate(dayNumber: number): Date {
    const date = new Date(2025, 11, dayNumber);
    date.setHours(0, 0, 0, 0);
    return date;
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

  async function handleTitleSave() {
    if (!calendar || !editingTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_calendars')
        .update({ title: editingTitle.trim() })
        .eq('id', calendar.id);

      if (error) {
        console.error('Error updating title:', error);
        alert('タイトルの更新に失敗しました');
      } else {
        setCalendar({ ...calendar, title: editingTitle.trim() });
        setIsEditingTitle(false);
      }
    } catch (error) {
      console.error('Error updating title:', error);
      alert('タイトルの更新に失敗しました');
    }
  }

  function handleTitleEdit() {
    if (calendar) {
      setEditingTitle(calendar.title || 'My Advent Calendar');
      setIsEditingTitle(true);
    }
  }

  function handleTitleCancel() {
    setIsEditingTitle(false);
    setEditingTitle('');
  }

  // 日付はWebアプリ上で直接生成（Supabaseに依存しない）- 必ず1〜25を表示
  const days = Array.from({ length: 25 }, (_, i) => i + 1);
  const postedCount = scenes.length;
  const themeData = themes.find(t => t.id === currentTheme) || themes[0];

  // ✅ レンダリング回数をカウント（1回だけ表示）
  renderCountRef.current += 1;
  if (renderCountRef.current === 1) {
    console.log('Rendering MyCalendar (first render)');
  }

  // ローディング中でもカレンダーを表示（データがなくても1〜25の日付は表示）
  return (
    <div className={`min-h-screen bg-slate-900 text-white relative overflow-hidden bg-gradient-to-br ${themeData.colors.background}`}>
      {/* 雪のアニメーション */}
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

      {/* 雪の結晶 */}
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
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <label htmlFor="calendar-title-input" className="sr-only">カレンダータイトル</label>
                <input
                  id="calendar-title-input"
                  name="calendar-title"
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="text-4xl md:text-6xl font-bold text-white bg-white/20 backdrop-blur-sm border-2 border-white/50 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-400"
                  style={{ fontFamily: 'serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTitleSave();
                    } else if (e.key === 'Escape') {
                      handleTitleCancel();
                    }
                  }}
                />
                <button
                  onClick={handleTitleSave}
                  className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                  title="保存"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={handleTitleCancel}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="キャンセル"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl" style={{ fontFamily: 'serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                  🎄 {calendar?.title || 'My Advent Calendar'} 🎄
                </h1>
                <button
                  onClick={handleTitleEdit}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                  title="タイトルを編集"
                >
                  <Pencil className="w-5 h-5" />
                </button>
              </div>
            )}
            <Gift className="w-8 h-8 md:w-10 md:h-10 text-rose-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            {calendar && (
              <ThemeSelector
                calendarId={calendar.id}
                currentTheme={currentTheme}
                onThemeChange={(theme) => {
                  setCurrentTheme(theme);
                  loadScenes();
                }}
              />
            )}
          </div>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-6 drop-shadow-lg">
            ✨ 25 Days of Christmas Magic ✨
          </p>

          <div className="flex items-center justify-between gap-8 max-w-6xl mx-auto">
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
                  <p className="text-sm md:text-base text-slate-600 font-medium">Days Posted</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-700">{postedCount} / 25</p>
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
          {/* カレンダーグリッド: 1〜25の日付を必ず表示 */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* 日付1〜25をWebアプリ上で直接表示（Supabaseに依存しない） */}
            {days.map((dayNumber) => {
              // sceneはSupabaseから取得するが、dayNumberはWebアプリ上で直接生成
              const scene = getSceneForDay(dayNumber);
              const isToday = isDayToday(dayNumber);

              return (
                <div key={dayNumber} className="relative">
                  <CalendarDay
                    dayNumber={dayNumber}
                    scene={scene}
                    // ✅ すべてクリック可能に変更
                    isUnlocked={true}
                    isToday={isToday}
                    onClick={() => {
                      setSelectedDay(dayNumber);
                      setShowUploadModal(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center rounded-3xl">
              <div className="text-center">
                <Gift className="w-12 h-12 text-amber-400 animate-bounce mx-auto mb-4" />
                <p className="text-slate-600 text-lg font-medium">Loading your calendar...</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <p className="text-white text-sm md:text-base drop-shadow-lg font-medium">
            🎅 Merry Christmas! Open a new surprise every day! 🎁
          </p>
        </div>
      </div>

      {/* UploadSceneモーダル */}
      <UploadScene
        calendarId={calendar?.id || ''}
        userId={userId}
        onSuccess={() => {
          // ✅ Uploadが完了したら即再取得
          loadScenes();
          setShowUploadModal(false);
          setSelectedDay(null);
        }}
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedDay(null);
        }}
        initialDay={selectedDay || undefined}
        existingScene={selectedDay ? getSceneForDay(selectedDay) : null}
      />
    </div>
  );
}
