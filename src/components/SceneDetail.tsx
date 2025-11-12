import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserCalendarDay, UserCalendar, Profile } from '../lib/types';
import { LikeButton } from './LikeButton';
import { CommentBox } from './CommentBox';
// EnhancedThreeViewer is commented out for future use
// import EnhancedThreeViewer from './EnhancedThreeViewer';

interface SceneDetailProps {
  dayNumber: number;
  sceneId: string;
  calendarId: string;
  onClose: () => void;
}

export function SceneDetail({ dayNumber, sceneId, calendarId, onClose }: SceneDetailProps) {
  const [scene, setScene] = useState<UserCalendarDay | null>(null);
  const [_calendar, setCalendar] = useState<UserCalendar | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadSceneDetails();
    loadCurrentUser();
  }, [sceneId, calendarId]);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  }

  async function loadSceneDetails() {
    try {
      const [sceneRes, calendarRes] = await Promise.all([
        supabase
          .from('user_calendar_days')
          .select('id, calendar_id, day_number, title, image_url, like_count, price, currency, created_at, updated_at')
          .eq('id', sceneId)
          .single(),
        supabase
          .from('user_calendars')
          .select('*')
          .eq('id', calendarId)
          .single()
      ]);

      if (sceneRes.error) throw sceneRes.error;
      if (calendarRes.error) throw calendarRes.error;

      setScene(sceneRes.data);
      setCalendar(calendarRes.data);

      // Load creator profile
      if (calendarRes.data.creator_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', calendarRes.data.creator_id)
          .maybeSingle();

        setCreatorProfile(profile || null);
      }
    } catch (error) {
      console.error('Error loading scene details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !scene) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-slate-800 via-navy-900 to-slate-950 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          {/* model_urlは削除: テーブルに存在しないカラム */}
          {/* {scene.model_url ? (
            <div className="w-full h-80 md:h-[500px] bg-gradient-to-br from-slate-900 to-navy-900">
              <EnhancedThreeViewer
                modelUrl={scene.model_url}
                className="w-full h-full"
                autoRotate={true}
                enableZoom={true}
              />
            </div>
          ) : */} {scene.image_url ? (
            <img
              src={scene.image_url}
              alt={scene.title || `Day ${dayNumber}`}
              className="w-full h-80 md:h-[500px] object-contain bg-gradient-to-br from-slate-900 to-navy-900"
            />
          ) : (
            <div className="w-full h-80 md:h-[500px] bg-gradient-to-br from-amber-400/20 to-rose-500/20 flex items-center justify-center">
              <span className="text-white/60">No content available</span>
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

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <LikeButton
              sceneId={sceneId}
              initialLikeCount={scene.like_count || 0}
              userId={userId}
            />
            <CommentBox sceneId={sceneId} userId={userId} />
          </div>

          {/* messageは削除: テーブルに存在しないカラム */}
          {/* {scene.message && (
            <div className="prose max-w-none">
              <p className="text-lg text-white/90 leading-relaxed">
                {scene.message}
              </p>
            </div>
          )} */}

          {creatorProfile && (
            <div className="border-t border-white/20 pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 text-white">Creator</h3>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {creatorProfile.avatar_url ? (
                  <img
                    src={creatorProfile.avatar_url}
                    alt={creatorProfile.username}
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-400/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-amber-400/50">
                    {creatorProfile.username[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-white">{creatorProfile.username}</h4>
                  {creatorProfile.bio && (
                    <p className="text-white/70 mt-2">{creatorProfile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
