import { Lock, Gift, Star } from 'lucide-react';
import type { Scene } from '../lib/types';

interface CalendarDayProps {
  dayNumber: number;
  scene: Scene | null;
  isUnlocked: boolean;
  isToday: boolean;
  onClick: () => void;
}

const christmasColors = [
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-emerald-600',
  'from-pink-500 to-rose-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-700',
  'from-teal-500 to-emerald-600',
];

export function CalendarDay({ dayNumber, scene, isUnlocked, isToday, onClick }: CalendarDayProps) {
  const colorClass = christmasColors[dayNumber % christmasColors.length];

  return (
    <button
      onClick={onClick}
      className={`
        relative aspect-square rounded-xl overflow-hidden
        transition-all duration-300 transform
        border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]
        hover:scale-110 hover:shadow-2xl hover:shadow-white/60 cursor-pointer
        ${!isUnlocked ? 'opacity-60' : ''}
        ${isToday ? 'ring-4 ring-rose-400 animate-pulse scale-105 shadow-[0_0_30px_rgba(244,63,94,0.6)]' : ''}
      `}
    >
      {scene?.image_url ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${scene.image_url})`,
            filter: isUnlocked ? 'brightness(0.9)' : 'brightness(0.5) grayscale(0.2) saturate(0.7)'
          }}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass}`}>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white/60 to-transparent rounded-t-xl" />
      <div className="absolute top-1 left-2 w-4 h-2 bg-white/80 rounded-full blur-[2px]" />
      <div className="absolute top-1 right-3 w-3 h-2 bg-white/80 rounded-full blur-[2px]" />
      <div className="absolute top-2 left-1/2 w-2 h-1 bg-white/80 rounded-full blur-[1px]" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div className={`text-3xl md:text-5xl font-bold mb-1 ${
          isUnlocked ? 'text-white drop-shadow-lg' : 'text-gray-400'
        }`} style={{ fontFamily: 'serif' }}>
          {dayNumber}
        </div>

        {!isUnlocked && (
          <div className="bg-gray-800/90 rounded-full p-2 shadow-xl">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </div>
        )}

        {isUnlocked && isToday && (
          <div className="bg-rose-500 rounded-full p-2 animate-bounce shadow-xl shadow-rose-500/50">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
          </div>
        )}

        {isUnlocked && !isToday && (
          <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/50">
            <Gift className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </div>
        )}
      </div>

      {scene?.title && isUnlocked && (
        <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
          <p className="text-xs md:text-sm font-bold text-white text-center truncate drop-shadow-md">
            {scene.title}
          </p>
        </div>
      )}

      {isToday && (
        <div className="absolute top-1 right-1 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/50 border-2 border-white animate-pulse">
          TODAY
        </div>
      )}

      {!isUnlocked && (
        <div className="absolute top-1 left-1 bg-gray-800/90 text-white text-xs px-1.5 py-0.5 rounded-md shadow-lg">
          Dec {dayNumber}
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {isUnlocked && (
          <>
            <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.3s' }} />
            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.6s' }} />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" style={{ animationDelay: '0.9s' }} />
          </>
        )}
      </div>
    </button>
  );
}
