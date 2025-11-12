import { useState, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Comment, Profile } from '../lib/types';

interface CommentBoxProps {
  sceneId: string;
  userId: string | null;
}

export function CommentBox({ sceneId, userId }: CommentBoxProps) {
  const [comments, setComments] = useState<(Comment & { profile?: Profile })[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadComments();
  }, [sceneId]);

  async function loadComments() {
    try {
      // Note: 'comments' table may not exist in current schema
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('scene_id', sceneId)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Comments table not available:', error.message);
        setComments([]);
        return;
      }

      // Load profiles for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', comment.user_id)
            .maybeSingle();

          return { ...comment, profile: profile || undefined };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !newComment.trim()) return;

    setLoading(true);
    try {
      // Note: 'comments' table may not exist in current schema
      const { error } = await supabase
        .from('comments')
        .insert({
          scene_id: sceneId,
          user_id: userId,
          content: newComment.trim(),
        });

      if (error) {
        console.warn('Comments table not available:', error.message);
        alert('Comment feature is currently unavailable');
        return;
      }

      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Comment feature is currently unavailable');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (!userId) return;
    if (!confirm('Delete this comment?')) return;

    try {
      // Note: 'comments' table may not exist in current schema
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) {
        console.warn('Comments table not available:', error.message);
        alert('Comment feature is currently unavailable');
        return;
      }
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Comment feature is currently unavailable');
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-semibold">{comments.length}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 z-50 max-h-96 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">Comments</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {comment.profile?.avatar_url ? (
                        <img
                          src={comment.profile.avatar_url}
                          alt={comment.profile.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-bold">
                          {comment.profile?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {comment.profile?.username || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {userId === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          {userId && (
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !newComment.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

