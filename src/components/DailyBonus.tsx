import { useEffect, useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore, DailyBonusEntry } from '../store/useStore';

interface DailyBonusProps {
  userId: string;
}

// 12月の各日に配布する3DモデルのURL（サンプル）
const DECEMBER_MODELS: Record<number, string> = {
  1: 'https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb',
  2: 'https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb',
  // 他の日付も追加可能
};

export function DailyBonus({ userId }: DailyBonusProps) {
  const [todayBonus, setTodayBonus] = useState<DailyBonusEntry | null>(null);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addBonus, bonuses, setBonuses } = useStore();

  useEffect(() => {
    loadBonuses();
    checkTodayBonus();
  }, [userId]);

  async function loadBonuses() {
    try {
      // const { data, error } = await supabase
      //   .from('calendar_purchases')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .order('day_number', { ascending: false });

      // if (error) throw error;
      // setBonuses(data || []);
      setBonuses([]);
    } catch (error) {
      console.error('Error loading bonuses:', error);
    }
  }

  async function checkTodayBonus() {
    const today = new Date();
    const dayNumber = today.getDate();

    // 12月のみ
    if (today.getMonth() !== 11) {
      return;
    }

    try {
      // const { data, error } = await supabase
      //   .from('calendar_purchases')
      //   .select('*')
      //   .eq('user_id', userId)
      //   .eq('day_number', dayNumber)
      //   .maybeSingle();

      // if (error) throw error;
      const data = null;
      setHasClaimedToday(!!data);

      // 今日のモデルURLを取得
      const modelUrl = DECEMBER_MODELS[dayNumber];
      if (modelUrl && !data) {
        setTodayBonus({
          id: '',
          user_id: userId,
          day_number: dayNumber,
          model_url: modelUrl,
          claimed_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error checking today bonus:', error);
    }
  }

  async function claimBonus() {
    if (!todayBonus || hasClaimedToday) return;

    setLoading(true);
    try {
      // const { data, error } = await supabase
      //   .from('calendar_purchases')
      //   .insert({
      //     user_id: userId,
      //     day_number: todayBonus.day_number,
      //     model_url: todayBonus.model_url,
      //   })
      //   .select()
      //   .single();

      // if (error) throw error;

      // addBonus(data);
      // setHasClaimedToday(true);
      alert('Daily bonuses are currently unavailable.');
    } catch (error) {
      console.error('Error claiming bonus:', error);
      alert('Failed to claim bonus. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const today = new Date();
  const isDecember = today.getMonth() === 11;
  const dayNumber = today.getDate();

  if (!isDecember) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-400/20 to-rose-500/20 backdrop-blur-sm rounded-xl p-4 border border-amber-400/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-amber-400 rounded-full p-3">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Daily Bonus</h3>
            <p className="text-white/80 text-sm">
              {hasClaimedToday
                ? `You've claimed today's bonus (Dec ${dayNumber})!`
                : `Claim your 3D model for December ${dayNumber}!`}
            </p>
          </div>
        </div>
        {!hasClaimedToday && todayBonus && (
          <button
            onClick={claimBonus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            {loading ? 'Claiming...' : 'Claim'}
          </button>
        )}
      </div>

      {bonuses.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/60 text-sm mb-2">Your Collection: {bonuses.length} models</p>
        </div>
      )}
    </div>
  );
}

