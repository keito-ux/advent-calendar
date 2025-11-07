import { createClient } from '@supabase/supabase-js'

// ✅ あなたの Supabase プロジェクトの URL と anon key をここに入れる！
const supabaseUrl = 'https://cxhpdgmlnfumkxwsyopq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4aHBkZ21sbmZ1bWt4d3N5b3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MjUxNjYsImV4cCI6MjA3NTQwMTE2Nn0.puSvcLWZKfrSanjXXyZi-LeH6E5AGNJYUFifEka-ZFQ' // anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 画像アップロード関数
export async function uploadImage(file: File) {
  const filePath = `uploads/${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file)

  if (error) {
    alert('アップロード失敗: ' + error.message)
    return null
  }

  const { data } = supabase.storage.from('advent.pics').getPublicUrl(filePath)
  return data.publicUrl
}

// GLBモデルアップロード関数
export async function uploadModel(file: File) {
  const filePath = `models/${Date.now()}-${file.name}`
  const { error } = await supabase.storage
    .from('advent.pics')
    .upload(filePath, file)

  if (error) {
    alert('アップロード失敗: ' + error.message)
    return null
  }

  const { data } = supabase.storage.from('advent.pics').getPublicUrl(filePath)
  return data.publicUrl
}

// データベースに保存
export async function saveScene(
  day: number,
  imageUrl: string,
  title: string,
  artistId: string | null
) {
  const { error } = await supabase
    .from('advent_calendar')
    .upsert(
      [
        {
          day_number: day,
          image_url: imageUrl,
          title,
          is_unlocked: false,
        },
      ],
      { onConflict: 'day_number' }
    )

  if (error) {
    alert('テーブルに保存できませんでした: ' + error.message)
    return false
  }

  console.log('✅ DBに保存完了')
  return true
}
