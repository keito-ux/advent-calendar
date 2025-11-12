import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { HomeCalendar } from './components/HomeCalendar';
import { MyCalendar } from './components/MyCalendar';
import { HomeSceneDetail } from './components/HomeSceneDetail';
import { MySceneDetail } from './components/MySceneDetail';
import { RankingPage } from './components/RankingPage';
import { UserProfile } from './components/UserProfile';
import { Navbar } from './components/Navbar';
import { DailyBonus } from './components/DailyBonus';
import { My3DSpace } from './components/My3DSpace';
import AuthPage from './components/AuthPage';
import type { AdventCalendar, UserCalendarDay } from './lib/types';
import type { User } from '@supabase/supabase-js';

type View =
  | { type: 'home' }
  | { type: 'home-scene'; dayNumber: number; scene: AdventCalendar | null }
  | { type: 'my-calendar' }
  | { type: 'my-scene'; dayNumber: number; scene: UserCalendarDay | null }
  | { type: 'ranking' }
  | { type: 'profile'; userId: string }
  | { type: '3d-space' };

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
    } else if (viewType === '3d-space') {
      if (user) {
        setView({ type: '3d-space' });
      }
    } else if (viewType === 'ranking') {
      setView({ type: 'ranking' });
    } else if (viewType === 'profile') {
      if (user) {
        setView({ type: 'profile', userId: user.id });
      }
    }
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
                          view.type === 'ranking' ? 'ranking' :
                          view.type === 'profile' ? 'profile' :
                          view.type === '3d-space' ? '3d-space' : 'home';

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

      {view.type === '3d-space' && user && (
        <My3DSpace userId={user.id} onClose={() => setView({ type: 'my-calendar' })} />
      )}

      {view.type === 'my-scene' && (
        <MySceneDetail
          dayNumber={view.dayNumber}
          scene={view.scene}
          onClose={() => setView({ type: 'my-calendar' })}
        />
      )}

      {view.type === 'ranking' && <RankingPage />}

      {view.type === 'profile' && user && (
        <UserProfile
          userId={view.userId}
          onClose={() => setView({ type: 'home' })}
          onCalendarClick={() => {}}
        />
      )}
    </div>
  );
}
