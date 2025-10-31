import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

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
          is_unlocked: false
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
