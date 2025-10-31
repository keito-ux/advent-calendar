import { useEffect, useState } from 'react';
import { X, Heart, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Artist, Scene, Tip } from '../lib/types';

interface ArtistProfileProps {
  artistId: string;
  onClose: () => void;
  onTipArtist: (artistId: string) => void;
  onSceneClick: (scene: Scene) => void;
}

export function ArtistProfile({ artistId, onClose, onTipArtist, onSceneClick }: ArtistProfileProps) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtistProfile();
  }, [artistId]);

  async function loadArtistProfile() {
    try {
      const [artistRes, scenesRes, tipsRes] = await Promise.all([
        supabase
          .from('artists')
          .select('*')
          .eq('id', artistId)
          .maybeSingle(),
        supabase
          .from('scenes')
          .select('*')
          .eq('artist_id', artistId)
          .order('day_number', { ascending: true }),
        supabase
          .from('tips')
          .select('*')
          .eq('artist_id', artistId)
          .order('created_at', { ascending: false })
      ]);

      if (artistRes.error) throw artistRes.error;
      if (scenesRes.error) throw scenesRes.error;
      if (tipsRes.error) throw tipsRes.error;

      setArtist(artistRes.data);
      setScenes(scenesRes.data || []);
      setTips(tipsRes.data || []);
    } catch (error) {
      console.error('Error loading artist profile:', error);
    } finally {
      setLoading(false);
    }
  }

  const totalTips = tips.reduce((sum, tip) => sum + Number(tip.amount), 0);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Loading artist profile...</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">Artist not found.</p>
          <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b z-10 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Artist Profile</h2>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {artist.profile_image_url && (
              <img
                src={artist.profile_image_url}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">{artist.name}</h3>
              {artist.country && (
                <p className="text-gray-500 mb-3">{artist.country}</p>
              )}
              {artist.bio && (
                <p className="text-gray-700 leading-relaxed mb-4">{artist.bio}</p>
              )}
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Tips Received</p>
                  <p className="text-2xl font-bold text-green-600">${totalTips.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Tips</p>
                  <p className="text-2xl font-bold text-blue-600">{tips.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Scenes Created</p>
                  <p className="text-2xl font-bold text-purple-600">{scenes.length}</p>
                </div>
              </div>
              <button
                onClick={() => onTipArtist(artist.id)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg transition-colors shadow-md"
              >
                <Heart className="w-5 h-5" />
                Support This Artist
              </button>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-600" />
              Artwork in Calendar
            </h4>
            {scenes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => onSceneClick(scene)}
                    className="group relative aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform shadow-md"
                  >
                    <img
                      src={scene.image_url}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm font-medium transform translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="font-bold">Day {scene.day_number}</p>
                      <p className="text-xs">{scene.title}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No scenes available yet.</p>
            )}
          </div>

          {tips.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h4 className="text-xl font-semibold mb-4">Recent Support</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {tips.slice(0, 10).map((tip) => (
                  <div key={tip.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900">
                        {tip.tipper_name || 'Anonymous'}
                      </span>
                      <span className="text-green-600 font-bold">${Number(tip.amount).toFixed(2)}</span>
                    </div>
                    {tip.message && (
                      <p className="text-sm text-gray-600 italic">"{tip.message}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(tip.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
