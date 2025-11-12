import { useEffect, useState } from 'react';
import { X, Twitter, Instagram, Globe, Calendar, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile, UserCalendar, UserCalendarDay } from '../lib/types';

interface CalendarWithLikes extends UserCalendar {
  totalLikes: number;
  daysCount: number;
}

interface UserProfileProps {
  userId: string;
  onClose: () => void;
  onCalendarClick?: (calendarId: string) => void;
}

export function UserProfile({ userId, onClose, onCalendarClick }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [calendars, setCalendars] = useState<CalendarWithLikes[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  async function loadUserProfile() {
    try {
      const [profileRes, calendarsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_calendars')
          .select('*')
          .eq('creator_id', userId)
          .order('created_at', { ascending: false })
      ]);

      if (profileRes.error) throw profileRes.error;
      if (calendarsRes.error) throw calendarsRes.error;

      setProfile(profileRes.data);

      // 各カレンダーのいいね数と日数を取得
      const calendarsWithLikes = await Promise.all(
        (calendarsRes.data || []).map(async (calendar) => {
          // カレンダーの日付データを取得（calendar_idでフィルタリング）
          const { data: daysData, error: daysError } = await supabase
            .from('user_calendar_days')
            .select('id, like_count')
            .eq('calendar_id', calendar.id);

          if (daysError) {
            console.error('Error loading calendar days:', daysError);
            // calendar_idが存在しない場合はuser_idで試す
            const { data: daysDataByUser, error: daysErrorByUser } = await supabase
              .from('user_calendar_days')
              .select('id, like_count')
              .eq('user_id', userId);

            if (daysErrorByUser) {
              console.error('Error loading calendar days by user_id:', daysErrorByUser);
              return {
                ...calendar,
                totalLikes: 0,
                daysCount: 0,
              };
            }

            // いいね数の合計を計算
            const totalLikes = (daysDataByUser || []).reduce((sum, day) => sum + (day.like_count || 0), 0);
            const daysCount = daysDataByUser?.length || 0;

            return {
              ...calendar,
              totalLikes,
              daysCount,
            };
          }

          // いいね数の合計を計算
          const totalLikes = (daysData || []).reduce((sum, day) => sum + (day.like_count || 0), 0);
          const daysCount = daysData?.length || 0;

          return {
            ...calendar,
            totalLikes,
            daysCount,
          };
        })
      );

      setCalendars(calendarsWithLikes);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-lg p-8 border border-white/20">
          <p className="text-white">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-lg p-8 border border-white/20">
          <p className="text-white mb-4">Profile not found.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 via-navy-900 to-slate-950 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-navy-900 border-b border-white/20 z-10 px-6 py-4 flex justify-between items-center backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-amber-400/50"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-amber-400/50">
                {profile.username[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-2">{profile.username}</h3>
              {profile.bio && (
                <p className="text-white/80 leading-relaxed mb-4">{profile.bio}</p>
              )}
              
              {/* SNS Links */}
              <div className="flex items-center gap-4 mb-4">
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                  >
                    <Twitter className="w-5 h-5" />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                  >
                    <Instagram className="w-5 h-5" />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-white/60">Calendars Created</p>
                  <p className="text-2xl font-bold text-amber-400">{calendars.length}</p>
                </div>
                <div>
                  <p className="text-sm text-white/60">Total Likes</p>
                  <p className="text-2xl font-bold text-rose-400 flex items-center gap-1">
                    <Heart className="w-5 h-5 fill-rose-400" />
                    {calendars.reduce((sum, cal) => sum + cal.totalLikes, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendars List */}
          <div className="border-t border-white/20 pt-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
              <Calendar className="w-6 h-6 text-amber-400" />
              My Calendars
            </h4>
            {calendars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendars.map((calendar) => (
                  <button
                    key={calendar.id}
                    onClick={() => onCalendarClick?.(calendar.id)}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-amber-400/50 transition-all text-left"
                  >
                    <h5 className="font-bold text-white mb-2">{calendar.title}</h5>
                    {calendar.description && (
                      <p className="text-white/70 text-sm mb-2 line-clamp-2">
                        {calendar.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-rose-400">
                        <Heart className="w-4 h-4 fill-rose-400" />
                        <span className="text-sm font-semibold">{calendar.totalLikes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>{calendar.daysCount} days</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>{calendar.is_public ? 'Public' : 'Private'}</span>
                      <span>{new Date(calendar.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white/60 italic">No calendars created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

