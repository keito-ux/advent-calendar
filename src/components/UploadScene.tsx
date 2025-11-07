import { useState } from 'react';
import { Upload, Image, Box, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImage, uploadModel } from '../lib/supabase';

interface UploadSceneProps {
  calendarId?: string;
  onSuccess?: () => void;
}

export default function UploadScene({ calendarId, onSuccess }: UploadSceneProps) {
  const [day, setDay] = useState(1);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!imageFile && !modelFile) {
      alert('Please select an image or 3D model');
      return;
    }
    
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!calendarId) {
      alert('Please select a calendar first');
      return;
    }

    setUploading(true);
    try {
      let imageUrl: string | null = null;
      let modelUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          setUploading(false);
          return;
        }
      }

      if (modelFile) {
        modelUrl = await uploadModel(modelFile);
        if (!modelUrl) {
          setUploading(false);
          return;
        }
      }

      // Save to user_calendar_days
      const { error } = await supabase
        .from('user_calendar_days')
        .upsert({
          calendar_id: calendarId,
          day_number: day,
          title: title.trim(),
          message: message.trim() || null,
          image_url: imageUrl,
          model_url: modelUrl,
        }, {
          onConflict: 'calendar_id,day_number'
        });

      if (error) {
        throw error;
      }

      alert('🎉 Scene uploaded successfully!');
      setTitle('');
      setMessage('');
      setImageFile(null);
      setModelFile(null);
      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error uploading scene:', error);
      alert('Failed to upload scene: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all shadow-lg"
      >
        <Upload className="w-5 h-5" />
        Upload Scene
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-xl p-6 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Upload Scene</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Day (1–25) *</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={day}
                  onChange={(e) => setDay(+e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  rows={3}
                  placeholder="Optional message..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-400 file:text-white hover:file:bg-amber-500"
                />
                {imageFile && (
                  <p className="text-white/60 text-sm mt-1">{imageFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  3D Model (GLB)
                </label>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"
                />
                {modelFile && (
                  <p className="text-white/60 text-sm mt-1">{modelFile.name}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading || (!imageFile && !modelFile)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload Scene'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
