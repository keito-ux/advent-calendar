import { useEffect, useState } from 'react';
import { X, Volume2, User, Heart, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Scene, Translation, Artist, Language } from '../lib/types';
import { LanguageSelector } from './LanguageSelector';

interface SceneDetailProps {
  dayNumber: number;
  scene: Scene | null;
  onClose: () => void;
  onTipArtist?: (artistId: string) => void;
  onViewArtist?: (artistId: string) => void;
}

export function SceneDetail({ dayNumber, scene, onClose, onTipArtist, onViewArtist }: SceneDetailProps) {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scene) {
      loadSceneDetails();
    } else {
      setLoading(false);
    }
  }, [scene?.id]);

  async function loadSceneDetails() {
    if (!scene) return;

    try {
      const [translationsRes, artistRes] = await Promise.all([
        supabase
          .from('translations')
          .select('*')
          .eq('scene_id', scene.id),
        scene.artist_id
          ? supabase
              .from('artists')
              .select('*')
              .eq('id', scene.artist_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null })
      ]);

      if (translationsRes.error) throw translationsRes.error;
      if (artistRes.error) throw artistRes.error;

      setTranslations(translationsRes.data || []);
      setArtist(artistRes.data);
    } catch (error) {
      console.error('Error loading scene details:', error);
    } finally {
      setLoading(false);
    }
  }

  const currentTranslation = translations.find(t => t.language_code === currentLanguage);

  function playAudio() {
    if (currentTranslation?.audio_url) {
      const audio = new Audio(currentTranslation.audio_url);
      audio.play();
    }
  }

  if (!scene) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-white via-rose-50 to-emerald-50 rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border-4 border-white" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img
            src={scene.image_url}
            alt={scene.title}
            className="w-full h-80 md:h-[500px] object-contain bg-gradient-to-br from-gray-900 to-gray-800"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-rose-500 hover:bg-rose-600 rounded-full p-3 transition-all shadow-xl hover:scale-110 border-2 border-white"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-2xl" style={{ fontFamily: 'serif' }}>{scene.title}</h2>
            <p className="text-white/95 text-lg drop-shadow-lg">Day {scene.day_number} - December {scene.day_number}, 2025</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />

            {currentTranslation?.audio_url && (
              <button
                onClick={playAudio}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <Volume2 className="w-5 h-5" />
                Listen
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading story...</p>
            </div>
          ) : (
            <>
              {currentTranslation ? (
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {currentTranslation.text_content}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Translation not available in this language.</p>
              )}

              {artist && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">About the Artist</h3>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {artist.profile_image_url && (
                      <img
                        src={artist.profile_image_url}
                        alt={artist.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900">{artist.name}</h4>
                      {artist.country && (
                        <p className="text-sm text-gray-500">{artist.country}</p>
                      )}
                      {artist.bio && (
                        <p className="text-gray-600 mt-2">{artist.bio}</p>
                      )}
                      {(onViewArtist || onTipArtist) && (
                        <div className="flex gap-3 mt-4">
                          {onViewArtist && (
                            <button
                              onClick={() => onViewArtist(artist.id)}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" />
                              View Profile
                            </button>
                          )}
                          {onTipArtist && (
                            <button
                              onClick={() => onTipArtist(artist.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg transition-colors shadow-md"
                            >
                              <Heart className="w-4 h-4" />
                              Tip Artist
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
