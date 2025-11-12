import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { HomeCalendar } from './components/HomeCalendar';
import { MyCalendar } from './components/MyCalendar';
import { HomeSceneDetail } from './components/HomeSceneDetail';
import { MySceneDetail } from './components/MySceneDetail';
import { Navbar } from './components/Navbar';
import { DailyBonus } from './components/DailyBonus';
import { CalendarSearch } from './components/CalendarSearch';
import { CalendarGrid } from './components/CalendarGrid';
import AuthPage from './components/AuthPage';
import type { AdventCalendar, UserCalendarDay } from './lib/types';
import type { User } from '@supabase/supabase-js';

type View =
  | { type: 'home' }
  | { type: 'home-scene'; dayNumber: number; scene: AdventCalendar | null }
  | { type: 'my-calendar' }
  | { type: 'my-scene'; dayNumber: number; scene: UserCalendarDay | null }
  | { type: 'ranking' }
  | { type: '3d-space' }
  | { type: 'search' }
  | { type: 'calendar-view'; calendarId: string };

export default function App() {
  const [view, setView] = useState<View>({ type: 'home' });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleHomeSceneClick(dayNumber: number, scene: AdventCalendar | null) {
    setView({ type: 'home-scene', dayNumber, scene });
  }

  function handleMySceneClick(dayNumber: number, scene: UserCalendarDay | null) {
    setView({ type: 'my-scene', dayNumber, scene });
  }

  function handleNavigate(viewType: string) {
    if (viewType === 'home') {
      setView({ type: 'home' });
    } else if (viewType === 'my-calendar') {
      if (user) {
        setView({ type: 'my-calendar' });
      }
    } else if (viewType === 'search') {
      setView({ type: 'search' });
    }
  }

  function handleCalendarSelect(calendarId: string) {
    setView({ type: 'calendar-view', calendarId });
  }

  function handleAuthSuccess() {
    // Auth state will be updated via the onAuthStateChange listener
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setView({ type: 'home' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth page only if user tries to access my-calendar without being logged in
  if (!user && view.type === 'my-calendar') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  const currentViewName = view.type === 'home' || view.type === 'home-scene' ? 'home' :
                          view.type === 'my-calendar' || view.type === 'my-scene' ? 'my-calendar' :
                          view.type === 'search' || view.type === 'calendar-view' ? 'search' : 'home';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950">
      <Navbar
        user={user}
        currentView={currentViewName}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        onSignIn={() => setView({ type: 'my-calendar' })}
      />

      {/* Main Content */}
      {view.type === 'home' && (
        <HomeCalendar
          onSceneClick={handleHomeSceneClick}
          modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
          modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
        />
      )}

      {view.type === 'home-scene' && (
        <HomeSceneDetail
          dayNumber={view.dayNumber}
          scene={view.scene}
          onClose={() => setView({ type: 'home' })}
        />
      )}

      {view.type === 'my-calendar' && user && (
        <div className="p-4 space-y-4">
          <DailyBonus userId={user.id} />
          <MyCalendar
            userId={user.id}
            onSceneClick={handleMySceneClick}
            modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
            modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
          />
        </div>
      )}
      
      {/* デバッグ用: テストユーザーIDで強制表示 */}
      {view.type === 'my-calendar' && !user && (
        <div className="p-4 space-y-4">
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-4">
            <p className="text-yellow-200 text-sm">⚠️ Debug Mode: Using test userId</p>
          </div>
          <MyCalendar
            userId="debug-user"
            onSceneClick={handleMySceneClick}
            modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
            modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
          />
        </div>
      )}

      {view.type === 'my-scene' && (
        <MySceneDetail
          dayNumber={view.dayNumber}
          scene={view.scene}
          onClose={() => setView({ type: 'my-calendar' })}
        />
      )}

      {view.type === 'search' && (
        <CalendarSearch onCalendarSelect={handleCalendarSelect} />
      )}

      {view.type === 'calendar-view' && (
        <CalendarGrid
          calendarId={view.calendarId}
          onSceneClick={(dayNumber, sceneId, calendarId) => {
            // Find the scene from the calendar
            const scene = null; // Will be loaded by SceneDetail
            setView({ type: 'my-scene', dayNumber, scene });
          }}
          modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
          modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
        />
      )}
    </div>
  );
}
