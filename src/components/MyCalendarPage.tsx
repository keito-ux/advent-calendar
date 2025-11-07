import { useState, useEffect } from 'react';
import { Plus, Calendar, Settings, Share2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserCalendar } from '../lib/types';

interface MyCalendarPageProps {
  userId: string;
  onCalendarSelect?: (calendarId: string) => void;
}

export function MyCalendarPage({ userId, onCalendarSelect }: MyCalendarPageProps) {
  const [calendars, setCalendars] = useState<UserCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCalendarTitle, setNewCalendarTitle] = useState('');
  const [newCalendarDescription, setNewCalendarDescription] = useState('');

  useEffect(() => {
    loadCalendars();
  }, [userId]);

  async function loadCalendars() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_calendars')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalendars(data || []);
    } catch (error) {
      console.error('Error loading calendars:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCalendar() {
    if (!newCalendarTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_calendars')
        .insert({
          creator_id: userId,
          title: newCalendarTitle,
          description: newCalendarDescription || null,
        })
        .select()
        .single();

      if (error) throw error;

      setCalendars([data, ...calendars]);
      setShowCreateModal(false);
      setNewCalendarTitle('');
      setNewCalendarDescription('');
    } catch (error) {
      console.error('Error creating calendar:', error);
      alert('Failed to create calendar');
    }
  }

  async function handleDeleteCalendar(calendarId: string) {
    if (!confirm('Are you sure you want to delete this calendar?')) return;

    try {
      const { error } = await supabase
        .from('user_calendars')
        .delete()
        .eq('id', calendarId)
        .eq('creator_id', userId);

      if (error) throw error;
      setCalendars(calendars.filter(c => c.id !== calendarId));
    } catch (error) {
      console.error('Error deleting calendar:', error);
      alert('Failed to delete calendar');
    }
  }

  function handleShare(calendar: UserCalendar) {
    const shareUrl = `${window.location.origin}/calendar/${calendar.share_code}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading your calendars...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-bold">My Calendars</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Create Calendar
          </button>
        </div>

        {calendars.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-4">You haven't created any calendars yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all"
            >
              Create Your First Calendar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calendars.map((calendar) => (
              <div
                key={calendar.id}
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-amber-400/50 transition-all shadow-xl cursor-pointer"
                onClick={() => onCalendarSelect?.(calendar.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold flex-1">{calendar.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(calendar);
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCalendar(calendar.id);
                      }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {calendar.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">{calendar.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{calendar.is_public ? 'Public' : 'Private'}</span>
                  <span>{new Date(calendar.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-xl p-6 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold mb-4">Create New Calendar</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title *</label>
                  <input
                    type="text"
                    value={newCalendarTitle}
                    onChange={(e) => setNewCalendarTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="My Advent Calendar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={newCalendarDescription}
                    onChange={(e) => setNewCalendarDescription(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="Describe your calendar..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateCalendar}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewCalendarTitle('');
                      setNewCalendarDescription('');
                    }}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

