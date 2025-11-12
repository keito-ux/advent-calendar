import { X } from 'lucide-react';
import type { AdventCalendar } from '../lib/types';

interface HomeSceneDetailProps {
  dayNumber: number;
  scene: AdventCalendar | null;
  onClose: () => void;
}

export function HomeSceneDetail({ dayNumber, scene, onClose }: HomeSceneDetailProps) {
  if (!scene) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 via-navy-900 to-slate-950 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {scene.image_url ? (
            <img
              src={scene.image_url}
              alt={scene.title || `Day ${dayNumber}`}
              className="w-full h-80 md:h-[500px] object-contain bg-gradient-to-br from-slate-900 to-navy-900"
            />
          ) : (
            <div className="w-full h-80 md:h-[500px] bg-gradient-to-br from-amber-400/20 to-rose-500/20 flex items-center justify-center">
              <span className="text-white/60">No image available</span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-rose-500/80 hover:bg-rose-600 rounded-full p-3 transition-all shadow-xl hover:scale-110 border-2 border-white/50"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl" style={{ fontFamily: 'serif' }}>
              {scene.title || `Day ${dayNumber}`}
            </h2>
            <p className="text-white/95 text-lg drop-shadow-lg">Day {dayNumber} - December {dayNumber}, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}

