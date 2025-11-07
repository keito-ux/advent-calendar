import { useState } from 'react';
import { X, Heart, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TipModalProps {
  artistId: string;
  artistName: string;
  sceneId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const presetAmounts = [5, 10, 25, 50];

export function TipModal({ artistId, artistName, sceneId, onClose, onSuccess }: TipModalProps) {
  const [amount, setAmount] = useState<number | string>(10);
  const [customAmount, setCustomAmount] = useState('');
  const [tipperName, setTipperName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handlePresetClick(preset: number) {
    setAmount(preset);
    setCustomAmount('');
  }

  function handleCustomAmountChange(value: string) {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const finalAmount = typeof amount === 'number' ? amount : parseFloat(String(amount));

    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('tips')
        .insert({
          artist_id: artistId,
          scene_id: sceneId || null,
          amount: finalAmount,
          currency: 'USD',
          tipper_name: tipperName || null,
          message: message || null,
          stripe_payment_id: null
        });

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting tip:', err);
      setError('Failed to process tip. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Heart className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Support Artist</h2>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-gray-700 mb-2">
              You're supporting <span className="font-semibold">{artistName}</span>
            </p>
            <p className="text-sm text-gray-500">
              Your contribution helps artists continue creating beautiful work.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Amount (USD)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  className={`
                    py-3 rounded-lg font-medium transition-all
                    ${amount === preset
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  ${preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              placeholder="Anonymous"
              value={tipperName}
              onChange={(e) => setTipperName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Artist (Optional)
            </label>
            <textarea
              placeholder="Thank you for your beautiful work!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Stripe Integration Coming Soon</p>
                <p className="text-xs text-blue-700 mt-1">
                  For now, tips are recorded in the system. Payment processing will be added when you configure Stripe.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Send $${typeof amount === 'number' ? amount.toFixed(2) : amount} Tip`}
          </button>

          <p className="text-xs text-center text-gray-500">
            100% of your tip goes directly to the artist
          </p>
        </form>
      </div>
    </div>
  );
}
