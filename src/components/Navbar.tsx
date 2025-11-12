import { Home, Calendar, Trophy, User as UserIcon, LogOut, LogIn, Box } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export function Navbar({ user, currentView, onNavigate, onSignOut, onSignIn }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-40 bg-gradient-to-r from-slate-900/95 via-navy-900/95 to-slate-950/95 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">🎄 Advent Calendar</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === 'home'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          {user && (
            <>
              <button
                onClick={() => onNavigate('my-calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === 'my-calendar'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Calendar className="w-4 h-4" />
                My Calendar
              </button>
              <button
                onClick={() => onNavigate('3d-space')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  currentView === '3d-space'
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Box className="w-4 h-4" />
                3D Space
              </button>
            </>
          )}
          <button
            onClick={() => onNavigate('ranking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              currentView === 'ranking'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Ranking
          </button>
          {user ? (
            <>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={onSignOut}
                className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <LogOut className="w-4 h-4 inline mr-2" />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="bg-gradient-to-r from-amber-400 to-rose-500 hover:from-amber-500 hover:to-rose-600 text-white px-4 py-2 rounded-lg text-sm transition-all"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

