import { useState, useEffect } from 'react';
import { Trophy, Heart, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserCalendarDay, UserCalendar, Profile } from '../lib/types';

interface RankingItem extends UserCalendarDay {
  calendar?: UserCalendar;
  creatorProfile?: Profile;
}

export function RankingPage() {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'likes' | 'recent'>('likes');

  useEffect(() => {
    loadRankings();
  }, [sortBy]);

  async function loadRankings() {
    setLoading(true);
    try {
      let query = supabase
        .from('user_calendar_days')
        .select(`
          *,
          calendar:user_calendars(*)
        `)
        .not('image_url', 'is', null)
        .or('image_url.neq.,model_url.neq.');

      if (sortBy === 'likes') {
        query = query.order('like_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Load creator profiles
      const rankingsWithProfiles = await Promise.all(
        (data || []).map(async (item) => {
          if (item.calendar?.creator_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', item.calendar.creator_id)
              .maybeSingle();

            return { ...item, creatorProfile: profile || undefined };
          }
          return item;
        })
      );

      setRankings(rankingsWithProfiles as RankingItem[]);
    } catch (error) {
      console.error('Error loading rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading rankings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-bold">Rankings</h1>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setSortBy('likes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              sortBy === 'likes'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Heart className="w-5 h-5 inline mr-2" />
            Most Liked
          </button>
          <button
            onClick={() => setSortBy('recent')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              sortBy === 'recent'
                ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Most Recent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankings.map((item, index) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:border-amber-400/50 transition-all hover:scale-105 shadow-xl"
            >
              <div className="relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title || `Day ${item.day_number}`}
                    className="w-full h-64 object-cover"
                  />
                ) : item.model_url ? (
                  <div className="w-full h-64 bg-gradient-to-br from-amber-400/20 to-rose-500/20 flex items-center justify-center">
                    <span className="text-white/80">3D Model</span>
                  </div>
                ) : null}
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${index < 3 ? 'text-amber-400' : 'text-white/60'}`} />
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span className="text-white font-semibold text-sm">{item.like_count}</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">
                  {item.title || `Day ${item.day_number}`}
                </h3>
                {item.calendar && (
                  <div className="flex items-center gap-2 mb-2">
                    {item.creatorProfile?.avatar_url ? (
                      <img
                        src={item.creatorProfile.avatar_url}
                        alt={item.creatorProfile.username}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-rose-500" />
                    )}
                    <span className="text-white/80 text-sm">
                      {item.creatorProfile?.username || 'Anonymous'}
                    </span>
                  </div>
                )}
                <p className="text-white/60 text-sm">
                  {item.calendar?.title || 'Untitled Calendar'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {rankings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60 text-lg">No rankings available yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

