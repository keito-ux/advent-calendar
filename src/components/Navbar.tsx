import { LogOut } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-end items-center">
        {user && (
          <button
            onClick={onSignOut}
            className="bg-red-600/80 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <LogOut className="w-4 h-4 inline mr-2" />
            Sign Out
          </button>
        )}
      </div>
    </nav>
  );
}

