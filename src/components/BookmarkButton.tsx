import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BookmarkButtonProps {
  calendarUserId: string;
  currentUserId: string | null;
}

export function BookmarkButton({ calendarUserId, currentUserId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUserId) {
      checkBookmarkStatus();
    }
  }, [calendarUserId, currentUserId]);

  async function checkBookmarkStatus() {
    if (!currentUserId) return;

    try {
      // Note: 'bookmarks' table may not exist in current schema
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', currentUserId)
        .eq('calendar_user_id', calendarUserId)
        .maybeSingle();

      if (error) {
        console.warn('Bookmarks table not available:', error.message);
        setIsBookmarked(false);
        return;
      }
      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      setIsBookmarked(false);
    }
  }

  async function handleToggleBookmark() {
    if (!currentUserId) {
      alert('Please sign in to bookmark calendars');
      return;
    }

    if (currentUserId === calendarUserId) {
      alert('You cannot bookmark your own calendar');
      return;
    }

    setLoading(true);
    try {
      // Note: 'bookmarks' table may not exist in current schema
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', currentUserId)
          .eq('calendar_user_id', calendarUserId);

        if (error) {
          console.warn('Bookmarks table not available:', error.message);
          alert('Bookmark feature is currently unavailable');
          return;
        }
        setIsBookmarked(false);
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: currentUserId,
            calendar_user_id: calendarUserId,
          });

        if (error) {
          console.warn('Bookmarks table not available:', error.message);
          alert('Bookmark feature is currently unavailable');
          return;
        }
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Bookmark feature is currently unavailable');
    } finally {
      setLoading(false);
    }
  }

  if (!currentUserId) {
    return null;
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading || currentUserId === calendarUserId}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isBookmarked
          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg'
          : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${currentUserId === calendarUserId ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={currentUserId === calendarUserId ? 'Cannot bookmark your own calendar' : isBookmarked ? 'Remove bookmark' : 'Bookmark this calendar'}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-5 h-5" />
      ) : (
        <Bookmark className="w-5 h-5" />
      )}
      <span className="font-semibold">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
    </button>
  );
}

