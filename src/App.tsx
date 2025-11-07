import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { CalendarGrid } from './components/CalendarGrid';
import { SceneDetail } from './components/SceneDetail';
import { ArtistProfile } from './components/ArtistProfile';
import { UserProfile } from './components/UserProfile';
import { RankingPage } from './components/RankingPage';
import { MyCalendarPage } from './components/MyCalendarPage';
import { TipModal } from './components/TipModal';
import UploadScene from './components/UploadScene';
import AuthPage from './components/AuthPage';
import type { Scene, UserCalendar } from './lib/types';
import type { User } from '@supabase/supabase-js';
import { Trophy, Calendar, User as UserIcon, Home } from 'lucide-react';

type View =
  | { type: 'home' }
  | { type: 'my-calendars' }
  | { type: 'ranking' }
  | { type: 'calendar'; calendarId: string }
  | { type: 'scene'; dayNumber: number; sceneId: string; calendarId: string }
  | { type: 'artist'; artistId: string }
  | { type: 'user-profile'; userId: string }
  | { type: 'tip'; artistId: string; artistName: string; sceneId?: string };

export default function App() {
  const [view, setView] = useState<View>({ type: 'home' });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

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

  function handleSceneClick(dayNumber: number, sceneId: string, calendarId: string) {
    setView({ type: 'scene', dayNumber, sceneId, calendarId });
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

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/95 via-navy-900/95 to-slate-950/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">🎄 Advent Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView({ type: 'home' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                view.type === 'home'
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => setView({ type: 'my-calendars' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                view.type === 'my-calendars'
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              My Calendars
            </button>
            <button
              onClick={() => setView({ type: 'ranking' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                view.type === 'ranking'
                  ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Rankings
            </button>
            <button
              onClick={() => setView({ type: 'user-profile', userId: user.id })}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {view.type === 'home' && (
        <div className="p-4">
          {selectedCalendarId ? (
            <CalendarGrid
              calendarId={selectedCalendarId}
              onSceneClick={handleSceneClick}
              modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
              modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
            />
          ) : (
            <div className="max-w-4xl mx-auto mt-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to Advent Calendar!</h2>
              <p className="text-white/70 mb-8">Select a calendar from "My Calendars" or create a new one to get started.</p>
              <button
                onClick={() => setView({ type: 'my-calendars' })}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all shadow-lg"
              >
                Go to My Calendars
              </button>
            </div>
          )}
        </div>
      )}

      {view.type === 'my-calendars' && (
        <MyCalendarPage
          userId={user.id}
          onCalendarSelect={(calendarId) => {
            setSelectedCalendarId(calendarId);
            setView({ type: 'calendar', calendarId });
          }}
        />
      )}

      {view.type === 'calendar' && (
        <div className="p-4">
          <CalendarGrid
            calendarId={view.calendarId}
            onSceneClick={handleSceneClick}
            modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
            modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
          />
        </div>
      )}

      {view.type === 'ranking' && <RankingPage />}

      {view.type === 'scene' && (
        <SceneDetail
          dayNumber={view.dayNumber}
          sceneId={view.sceneId}
          calendarId={view.calendarId}
          onClose={() => setView({ type: 'calendar', calendarId: view.calendarId })}
        />
      )}

      {view.type === 'artist' && (
        <ArtistProfile
          artistId={view.artistId}
          onClose={() => setView({ type: 'home' })}
          onTipArtist={(artistId) => setView({ type: 'tip', artistId, artistName: '' })}
          onSceneClick={() => {}}
        />
      )}

      {view.type === 'user-profile' && (
        <UserProfile
          userId={view.userId}
          onClose={() => setView({ type: 'home' })}
          onCalendarClick={(calendarId) => setView({ type: 'calendar', calendarId })}
        />
      )}

      {view.type === 'tip' && (
        <TipModal
          artistId={view.artistId}
          artistName={view.artistName}
          sceneId={view.sceneId}
          onClose={() => setView({ type: 'home' })}
          onSuccess={() => setView({ type: 'home' })}
        />
      )}
    </div>
  );
}
