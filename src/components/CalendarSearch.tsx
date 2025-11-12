import { useState, useEffect } from 'react';
import { Search, User, Calendar as CalendarIcon, Eye, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserCalendar, Profile } from '../lib/types';

interface CalendarSearchProps {
  onCalendarSelect?: (calendarId: string) => void;
}

export function CalendarSearch({ onCalendarSelect }: CalendarSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'user_id' | 'username' | 'title'>('username');
  const [results, setResults] = useState<(UserCalendar & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularCalendars, setPopularCalendars] = useState<(UserCalendar & { profile?: Profile })[]>([]);
  const [newCalendars, setNewCalendars] = useState<(UserCalendar & { profile?: Profile })[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('user_calendars')
        .select('*')
        .eq('is_public', true)
        .limit(20);

      if (searchType === 'user_id') {
        query = query.eq('creator_id', searchQuery.trim());
      } else if (searchType === 'username') {
        // まずプロフィールからユーザーIDを取得
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', `%${searchQuery.trim()}%`)
          .limit(10);

        if (profiles && profiles.length > 0) {
          const userIds = profiles.map(p => p.id);
          query = query.in('creator_id', userIds);
        } else {
          setResults([]);
          setLoading(false);
          return;
        }
      } else if (searchType === 'title') {
        query = query.ilike('title', `%${searchQuery.trim()}%`);
      }

      const { data: calendars, error } = await query;

      if (error) throw error;

      // プロフィール情報を取得
      const calendarsWithProfiles = await Promise.all(
        (calendars || []).map(async (calendar) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', calendar.creator_id)
            .maybeSingle();

          return { ...calendar, profile: profile || undefined };
        })
      );

      setResults(calendarsWithProfiles);
    } catch (error) {
      console.error('Error searching calendars:', error);
      alert('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  useEffect(() => {
    loadFeaturedCalendars();
  }, []);

  async function loadFeaturedCalendars() {
    setLoadingFeatured(true);
    try {
      // 人気カレンダー（作成日順で新しいもの、または将来的にview_countでソート）
      const { data: popular, error: popularError } = await supabase
        .from('user_calendars')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (popularError) throw popularError;

      // 新規カレンダー（作成日順で新しいもの）
      const { data: newCals, error: newError } = await supabase
        .from('user_calendars')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (newError) throw newError;

      // プロフィール情報を取得
      const loadProfiles = async (calendars: UserCalendar[]) => {
        return await Promise.all(
          calendars.map(async (calendar) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', calendar.creator_id)
              .maybeSingle();

            return { ...calendar, profile: profile || undefined };
          })
        );
      };

      const popularWithProfiles = await loadProfiles(popular || []);
      const newWithProfiles = await loadProfiles(newCals || []);

      setPopularCalendars(popularWithProfiles);
      setNewCalendars(newWithProfiles);
    } catch (error) {
      console.error('Error loading featured calendars:', error);
    } finally {
      setLoadingFeatured(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Search className="w-10 h-10 text-amber-400" />
            カレンダーを検索
          </h1>
          <p className="text-white/70 text-lg">
            ユーザーID、ユーザー名、またはカレンダータイトルで検索できます
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">検索タイプ</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'user_id' | 'username' | 'title')}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="username">ユーザー名</option>
                <option value="user_id">ユーザーID</option>
                <option value="title">カレンダータイトル</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">検索キーワード</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchType === 'user_id' ? 'ユーザーIDを入力' :
                  searchType === 'username' ? 'ユーザー名を入力' :
                  'カレンダータイトルを入力'
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? '検索中...' : '検索'}
              </button>
            </div>
          </div>
        </div>

        {/* 人気カレンダーと新規カレンダー */}
        {!loadingFeatured && (popularCalendars.length > 0 || newCalendars.length > 0) && (
          <div className="space-y-8 mb-8">
            {popularCalendars.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                  人気のカレンダー
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularCalendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-amber-400/50 transition-all shadow-xl cursor-pointer"
                      onClick={() => onCalendarSelect?.(calendar.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-amber-400" />
                            {calendar.title}
                          </h3>
                          {calendar.description && (
                            <p className="text-white/70 text-sm mb-3 line-clamp-2">
                              {calendar.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {calendar.profile && (
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
                          {calendar.profile.avatar_url ? (
                            <img
                              src={calendar.profile.avatar_url}
                              alt={calendar.profile.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">
                              {calendar.profile.username[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{calendar.profile.username}</p>
                            <p className="text-xs text-white/60">@{calendar.profile.username}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          公開
                        </span>
                        <span>{new Date(calendar.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newCalendars.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-rose-400" />
                  新規に制作されたカレンダー
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newCalendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-rose-400/50 transition-all shadow-xl cursor-pointer"
                      onClick={() => onCalendarSelect?.(calendar.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-rose-400" />
                            {calendar.title}
                          </h3>
                          {calendar.description && (
                            <p className="text-white/70 text-sm mb-3 line-clamp-2">
                              {calendar.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {calendar.profile && (
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
                          {calendar.profile.avatar_url ? (
                            <img
                              src={calendar.profile.avatar_url}
                              alt={calendar.profile.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">
                              {calendar.profile.username[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{calendar.profile.username}</p>
                            <p className="text-xs text-white/60">@{calendar.profile.username}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          公開
                        </span>
                        <span>{new Date(calendar.created_at).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {loadingFeatured && (
          <div className="text-center py-12">
            <div className="text-white/60 text-lg">読み込み中...</div>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">検索結果 ({results.length}件)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((calendar) => (
                <div
                  key={calendar.id}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-amber-400/50 transition-all shadow-xl cursor-pointer"
                  onClick={() => onCalendarSelect?.(calendar.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-amber-400" />
                        {calendar.title}
                      </h3>
                      {calendar.description && (
                        <p className="text-white/70 text-sm mb-3 line-clamp-2">
                          {calendar.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {calendar.profile && (
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/20">
                      {calendar.profile.avatar_url ? (
                        <img
                          src={calendar.profile.avatar_url}
                          alt={calendar.profile.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">
                          {calendar.profile.username[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-white">{calendar.profile.username}</p>
                        <p className="text-xs text-white/60">@{calendar.profile.username}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {calendar.is_public ? '公開' : '非公開'}
                    </span>
                    <span>{new Date(calendar.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">検索結果が見つかりませんでした</p>
            <p className="text-white/40 text-sm mt-2">別のキーワードで検索してみてください</p>
          </div>
        )}

        {!searchQuery && results.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg">検索キーワードを入力してください</p>
          </div>
        )}
      </div>
    </div>
  );
}

