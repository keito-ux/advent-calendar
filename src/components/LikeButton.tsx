import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { UserCalendarDay } from '../lib/types';

interface LikeButtonProps {
  sceneId: string;
  initialLikeCount: number;
  userId: string | null;
  onLikeChange?: (count: number, isLiked: boolean) => void;
}

export function LikeButton({ sceneId, initialLikeCount, userId, onLikeChange }: LikeButtonProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikeStatus();
  }, [sceneId, userId]);

  async function checkLikeStatus() {
    if (!userId) {
      setIsLiked(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('scene_id', sceneId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setIsLiked(!!data);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }

  async function handleLike() {
    if (!userId) {
      alert('Please sign in to like posts');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('scene_id', sceneId)
          .eq('user_id', userId);

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        onLikeChange?.(likeCount - 1, false);
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            scene_id: sceneId,
            user_id: userId,
          });

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        onLikeChange?.(likeCount + 1, true);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading || !userId}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
        ${isLiked
          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg'
          : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${!userId ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
      <span className="font-semibold">{likeCount}</span>
    </button>
  );
}

