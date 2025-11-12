import { createClient } from '@supabase/supabase-js'

// 環境変数のキーを利用
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

// ✅ 画像アップロード（安定版）
export async function uploadImage(file: File) {
  const filePath = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const { data, error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file, { upsert: false })

  if (error) {
    console.error('❌ Upload error:', error)
    alert('画像アップロードに失敗しました: ' + error.message)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('advent.pics')
    .getPublicUrl(filePath)

  return urlData?.publicUrl || null
}

// ✅ 3Dモデルアップロード（GLB対応）
export async function uploadModel(file: File) {
  const filePath = `models/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
  const { data, error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file, { upsert: false })

  if (error) {
    console.error('❌ Model upload error:', error)
    alert('モデルアップロードに失敗しました: ' + error.message)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('advent.pics')
    .getPublicUrl(filePath)

  return urlData?.publicUrl || null
}

// ✅ カレンダーへの登録（user_calendar_days）
export async function saveScene({
  calendarId,
  dayNumber,
  imageUrl,
  modelUrl,
  title,
  message,
}: {
  calendarId: string
  dayNumber: number
  imageUrl?: string | null
  modelUrl?: string | null
  title: string
  message?: string | null
}) {
  const { error } = await supabase.from('user_calendar_days').upsert(
    [
      {
        calendar_id: calendarId,
        day_number: dayNumber,
        title,
        message,
        image_url: imageUrl,
        model_url: modelUrl,
      },
    ],
    { onConflict: 'calendar_id,day_number' }
  )

  if (error) {
    console.error('❌ DB save error:', error)
    alert('カレンダーへの登録に失敗しました: ' + error.message)
    return false
  }

  console.log('✅ Scene saved successfully to user_calendar_days')
  return true
}
