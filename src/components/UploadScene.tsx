
import { useState, useEffect } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { supabase, uploadImage } from '../lib/supabase';
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

export default function UploadScene({
  calendarId,
  userId,
  onSuccess,
  initialDay,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  existingScene,
}: UploadSceneProps) {
  const [day, setDay] = useState(initialDay || 1);
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isOpen = externalIsOpen ?? internalIsOpen;

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (initialDay) setDay(initialDay);
  }, [initialDay]);

  useEffect(() => {
    if (existingScene) {
      setTitle(existingScene.title || '');
    } else {
      setTitle('');
    }
    setImageFile(null);
  }, [existingScene, isOpen]);

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 画像または既存の画像URLが必要
    if (!imageFile && !existingScene?.image_url) {
      alert('画像を選択してください');
      return;
    }
    if (!title.trim()) {
      alert('タイトルを入力してください');
      return;
    }
    if (!currentUserId) {
      alert('サインインしてください');
      return;
    }
    if (!calendarId) {
      alert('カレンダーIDが必要です');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = existingScene?.image_url || null;

      // 1️⃣ 新しい画像が選択された場合、Supabase Storageにアップロード
      if (imageFile) {
        console.log('📤 Starting image upload process...');
        
        // calendarIdとdayNumberを渡して、ユーザー要求の形式でファイルパスを生成
        imageUrl = await uploadImage(imageFile, currentUserId, calendarId, day);
        
        if (!imageUrl) {
          throw new Error('画像のアップロードに失敗しました');
        }
        
        console.log('✅ Image uploaded successfully to Storage');
        console.log('✅ Image URL:', imageUrl);
      } else if (existingScene?.image_url) {
        // 既存の画像URLを使用
        imageUrl = existingScene.image_url;
        console.log('📋 Using existing image URL:', imageUrl);
      }

      // 2️⃣ user_calendar_daysテーブルに保存（新規作成または更新）
      const payload = {
        calendar_id: calendarId,
        day_number: day,
        title: title.trim(),
        image_url: imageUrl,
      };

      console.log('💾 Saving to user_calendar_days:', {
        calendar_id: calendarId,
        day_number: day,
        title: title.trim(),
        image_url: imageUrl ? '✅ Set' : '❌ Not set',
      });

      const { data, error } = await supabase
        .from('user_calendar_days')
        .upsert(payload, { onConflict: 'calendar_id,day_number' })
        .select();

      if (error) {
        console.error('❌ DB save error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        throw new Error('データベースへの保存に失敗しました: ' + error.message);
      }

      console.log('✅ Successfully saved to user_calendar_days:', data);
      console.log('✅ Record ID:', data?.[0]?.id);
      
      alert('🎉 アップロード成功！');
      setTitle('');
      setImageFile(null);
      handleClose();
      
      // 3️⃣ 成功コールバックを呼び出し（親コンポーネントでデータを再読み込み）
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      console.error('Error type:', typeof err);
      console.error('Error message:', err?.message);
      alert('アップロードに失敗しました: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  const handleClose = () => {
    if (externalOnClose) externalOnClose();
    else setInternalIsOpen(false);
    setTitle('');
    setImageFile(null);
  };

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
              <h2 className="text-2xl font-bold text-white">
                {existingScene ? `Edit Day ${day}` : `Upload for Day ${day}`}
              </h2>
              <button
                onClick={handleClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white">
                  Day (1–25) *
                </label>
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
                <label className="block text-sm font-semibold mb-2 text-white">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  required
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
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 disabled:opacity-50 transition-all font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
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
