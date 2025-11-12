import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

// ✅ 画像アップロード（安定版）
export async function uploadImage(file: File, userId?: string, calendarId?: string, dayNumber?: number) {
  // ユーザーIDを取得
  const { data: { user } } = await supabase.auth.getUser();
  const uploadUserId = userId || user?.id || 'anonymous';
  
  // ファイル名をサニタイズ
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/:::/g, '/');
  
  // ファイルパスを生成（calendarIdとdayNumberが指定されている場合はそれを使用）
  let filePath: string;
  if (calendarId && dayNumber) {
    // ユーザー要求の形式: calendar/{calendarId}/{dayNumber}-{timestamp}-{filename}
    filePath = `calendar/${calendarId}/${dayNumber}-${Date.now()}-${sanitizedFileName}`;
  } else {
    // 既存の形式: {userId}/{timestamp}_{filename}
    filePath = `${uploadUserId}/${Date.now()}_${sanitizedFileName}`;
  }
  
  console.log('📤 Uploading image to Supabase Storage:');
  console.log('  - File name:', file.name);
  console.log('  - File size:', file.size, 'bytes');
  console.log('  - File type:', file.type);
  console.log('  - File path:', filePath);
  console.log('  - User ID:', uploadUserId);
  if (calendarId) console.log('  - Calendar ID:', calendarId);
  if (dayNumber) console.log('  - Day number:', dayNumber);
  
  const { data: _uploadData, error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file, { upsert: false })

  if (error) {
    console.error('❌ Storage upload error:', error);
    console.error('  - Error message:', error.message);
    console.error('  - File path:', filePath);
    console.error('  - File name:', file.name);
    console.error('  - File size:', file.size);
    alert('画像アップロードに失敗しました: ' + error.message);
    return null;
  }

  console.log('✅ Image uploaded to Storage successfully');

  // パブリックURLを取得
  const { data: urlData } = supabase.storage
    .from('advent.pics')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    console.error('❌ Failed to get public URL for:', filePath);
    return null;
  }

  console.log('✅ Public URL generated:', urlData.publicUrl);
  return urlData.publicUrl;
}

// ✅ 3Dモデルアップロード（GLB対応）
export async function uploadModel(file: File, userId?: string) {
  // ユーザーIDを取得
  const { data: { user } } = await supabase.auth.getUser();
  const uploadUserId = userId || user?.id || 'anonymous';
  
  // パスを修正（:::を/に置換、ユーザーIDを含める）
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/:::/g, '/');
  const filePath = `models/${uploadUserId}/${Date.now()}_${sanitizedFileName}`;
  
  const { data: _modelUploadData, error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file, { upsert: false })

  if (error) {
    console.error('❌ Model upload error:', error);
    console.error('Error message:', error.message);
    console.error('File path:', filePath);
    console.error('File name:', file.name);
    console.error('File size:', file.size);
    alert('モデルアップロードに失敗しました: ' + error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('advent.pics')
    .getPublicUrl(filePath);

  if (!urlData?.publicUrl) {
    console.error('Failed to get public URL');
    return null;
  }

  return urlData.publicUrl;
}

// ✅ カレンダーへの登録（user_calendar_days）- user_idベース
export async function saveScene({
  userId,
  dayNumber,
  imageUrl,
  modelUrl,
  title,
  message,
}: {
  userId: string
  dayNumber: number
  imageUrl?: string | null
  modelUrl?: string | null
  title: string
  message?: string | null
}) {
  const { error } = await supabase.from('user_calendar_days').upsert(
    [
      {
        user_id: userId,
        day_number: dayNumber,
        title,
        message,
        image_url: imageUrl,
        model_url: modelUrl,
      },
    ],
    { onConflict: 'user_id,day_number' }
  )

  if (error) {
    console.error('❌ DB save error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', error);
    alert('カレンダーへの登録に失敗しました: ' + error.message);
    return false;
  }

  console.log('✅ Scene saved successfully to user_calendar_days');
  return true;
}
