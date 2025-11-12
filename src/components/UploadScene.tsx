import { useState, useEffect } from 'react';
import { Upload, Image, Box, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { uploadImage, uploadModel } from '../lib/supabase';
import type { UserCalendarDay } from '../lib/types';

interface UploadSceneProps {
  calendarId?: string;
  userId?: string;
  onSuccess?: () => void;
  initialDay?: number;
  isOpen?: boolean;
  onClose?: () => void;
  existingScene?: UserCalendarDay | null;
}

export default function UploadScene({ calendarId, userId, onSuccess, initialDay, isOpen: externalIsOpen, onClose: externalOnClose, existingScene }: UploadSceneProps) {
  const [day, setDay] = useState(initialDay || 1);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [initialTitle, setInitialTitle] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setTitle('');
    setMessage('');
    setImageFile(null);
    setModelFile(null);
    setInitialTitle('');
    setInitialMessage('');
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (initialDay) {
      setDay(initialDay);
    }
  }, [initialDay]);

  useEffect(() => {
    if (existingScene) {
      setInitialTitle(existingScene.title || '');
      setInitialMessage(existingScene.message || '');
      setTitle(existingScene.title || '');
      setMessage(existingScene.message || '');
    } else {
      setInitialTitle('');
      setInitialMessage('');
      setTitle('');
      setMessage('');
    }
    setImageFile(null);
    setModelFile(null);
  }, [existingScene, isOpen]);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hasExistingAsset = Boolean(existingScene?.image_url || existingScene?.model_url);
    if (!imageFile && !modelFile && !hasExistingAsset) {
      alert('Please select an image or 3D model');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!calendarId && !userId) {
      alert('Please select a calendar first');
      return;
    }

    if (!currentUserId) {
      alert('Please sign in to upload scenes');
      return;
    }

    if (userId && userId !== currentUserId) {
      alert('You can only upload to your own calendar');
      return;
    }

    if (calendarId) {
      const { data: calendar, error: calendarError } = await supabase
        .from('user_calendars')
        .select('creator_id')
        .eq('id', calendarId)
        .single();

      if (calendarError || !calendar) {
        alert('Calendar not found');
        return;
      }

      if (calendar.creator_id !== currentUserId) {
        alert('You can only upload to your own calendar');
        return;
      }
    }

    setUploading(true);
    try {
      let imageUrl: string | null = existingScene?.image_url || null;
      let modelUrl: string | null = existingScene?.model_url || null;

      if (imageFile) {
        console.log('Uploading image file:', imageFile.name, imageFile.size);
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          console.error('Image upload failed');
          setUploading(false);
          return;
        }
        console.log('Image uploaded successfully:', imageUrl);
      }

      if (modelFile) {
        console.log('Uploading model file:', modelFile.name, modelFile.size);
        modelUrl = await uploadModel(modelFile);
        if (!modelUrl) {
          console.error('Model upload failed');
          setUploading(false);
          return;
        }
        console.log('Model uploaded successfully:', modelUrl);
      }

      if (!imageUrl && !modelUrl) {
        alert('Please upload at least an image or a 3D model');
        setUploading(false);
        return;
      }

      if (!calendarId) {
        alert('Calendar ID is required');
        setUploading(false);
        return;
      }

      const payload: Record<string, any> = {
        calendar_id: calendarId,
        day_number: day,
        title: title.trim(),
        message: message.trim() || null,
        image_url: imageUrl,
        model_url: modelUrl,
      };

      // Save to user_calendar_days
      const { error } = await supabase
        .from('user_calendar_days')
        .upsert(payload, { onConflict: 'calendar_id,day_number' });

      if (error) {
        console.error('=== Database Save Error ===');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error);
        console.error('Table: user_calendar_days');
        console.error('Calendar ID:', calendarId);
        console.error('Day Number:', day);
        console.error('==========================');
        throw error;
      }

      console.log('✅ Scene saved to database successfully');
      alert('🎉 Scene uploaded successfully!');
      setTitle('');
      setMessage('');
      setImageFile(null);
      setModelFile(null);
      setInitialTitle('');
      setInitialMessage('');
      handleClose();
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
      {externalIsOpen === undefined && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all shadow-lg"
        >
          <Upload className="w-5 h-5" />
          Upload Scene
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-navy-900 rounded-xl p-6 max-w-md w-full border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{existingScene ? `Edit Scene for Day ${day}` : `Upload Scene for Day ${day}`}</h2>
              <button
                onClick={handleClose}
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
                  Image {existingScene?.image_url ? '(leave empty to keep current image)' : ''}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-400 file:text-white hover:file:bg-amber-500"
                />
                {existingScene?.image_url && !imageFile && (
                  <p className="text-white/60 text-sm mt-1">Current image will be kept</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white flex items-center gap-2">
                  <Box className="w-4 h-4" />
                  3D Model (GLB) {existingScene?.model_url ? '(leave empty to keep current model)' : ''}
                </label>
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-rose-500 file:text-white hover:file:bg-rose-600"
                />
                {existingScene?.model_url && !modelFile && (
                  <p className="text-white/60 text-sm mt-1">Current model will be kept</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {uploading ? 'Uploading...' : existingScene ? 'Update Scene' : 'Upload Scene'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
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
