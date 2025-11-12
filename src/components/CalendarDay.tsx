import { Lock, Gift, Star } from 'lucide-react';
import type { UserCalendarDay, AdventCalendar } from '../lib/types';
import ThreeViewer from './ThreeViewer';

interface CalendarDayProps {
  dayNumber: number;
  scene: UserCalendarDay | AdventCalendar | null;
  isUnlocked: boolean;
  isToday: boolean;
  onClick: () => void;
  modelUrl?: string | null; // 3DモデルのURL（オプション）
}

const christmasColors = [
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-emerald-600',
  'from-pink-500 to-rose-600',
  'from-emerald-600 to-teal-600',
  'from-rose-600 to-pink-700',
  'from-teal-500 to-emerald-600',
];

export function CalendarDay({ dayNumber, scene, isUnlocked, isToday, onClick, modelUrl }: CalendarDayProps) {
  const colorClass = christmasColors[dayNumber % christmasColors.length];

  const handleClick = () => {
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        relative aspect-square rounded-xl overflow-hidden
        transition-all duration-300 transform
        border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.5)]
        hover:scale-110 hover:shadow-2xl hover:shadow-white/60 cursor-pointer
        ${isToday ? 'ring-4 ring-rose-400 animate-pulse scale-105 shadow-[0_0_30px_rgba(244,63,94,0.6)]' : ''}
      `}
      style={{ zIndex: 10 }}
    >
      {/* 背景 - pointer-events: none でクリックイベントを遮らない */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* 3Dモデルがある場合は3Dモデルを優先表示 */}
        {modelUrl ? (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 relative">
            <ThreeViewer
              modelUrl={modelUrl}
              className="w-full h-full absolute inset-0"
            />
          </div>
        ) : scene?.image_url ? (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${scene.image_url})`,
              filter: isUnlocked ? 'brightness(0.9)' : 'brightness(0.5) grayscale(0.3)',
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colorClass}`}>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        )}
      </div>

      {/* グラデーションを下レイヤーに - pointer-events: none でクリックイベントを遮らない */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

      {/* 日付・アイコン部分 - pointer-events: none でクリックイベントを遮らない */}
      {/* 日付はWebアプリ上で直接表示（Supabaseに依存しない） */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-2 pointer-events-none">
        {/* 日付の背景を追加して視認性を向上 */}
        <div className="relative mb-1">
          {/* より濃い背景で視認性を向上 */}
          <div className="absolute inset-0 bg-black/70 rounded-full blur-lg -z-10 scale-150" />
          <div className="absolute inset-0 bg-black/40 rounded-full blur-sm -z-10 scale-125" />
          {/* 日付数字 - 白色で中央表示（必ず表示、Supabaseに依存しない） */}
          <div
            className="text-3xl md:text-5xl font-bold text-white select-none relative z-10"
            style={{ 
              fontFamily: 'serif',
              fontWeight: '900',
              letterSpacing: '0.05em'
            } as React.CSSProperties}
          >
            {dayNumber}
          </div>
        </div>

        {/* アイコン */}
        {!isUnlocked && !scene && (
          <div className="bg-gray-800/90 rounded-full p-2 shadow-xl">
            <Lock className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />
          </div>
        )}
        {isUnlocked && isToday && (
          <div className="bg-rose-500 rounded-full p-2 animate-bounce shadow-xl shadow-rose-500/50">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
          </div>
        )}
        {(isUnlocked || scene) && !isToday && (
          <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/50">
            <Gift className="w-3 h-3 md:w-4 md:h-4 text-white" />
          </div>
        )}
      </div>

      {/* タイトル - pointer-events: none でクリックイベントを遮らない */}
      {scene?.title && (
        <div className="absolute bottom-0 left-0 right-0 z-30 p-1.5 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
          <p className="text-xs md:text-sm font-bold text-white text-center truncate drop-shadow-md">
            {scene.title}
          </p>
        </div>
      )}
    </button>
  );
}
