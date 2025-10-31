import { useState } from 'react'
import { uploadImage, saveScene } from '../lib/supabase'

export default function UploadScene() {
  const [day, setDay] = useState(1)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return alert('画像を選択してください')
    if (!title) return alert('タイトルを入力してください')

    setUploading(true)
    try {
      const imageUrl = await uploadImage(file)
      if (!imageUrl) return

      const success = await saveScene(day, imageUrl, title, null)
      if (success) {
        alert('🎉 シーンを登録しました！')
        setTitle('')
        setFile(null)
        window.location.reload()
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto mt-6 bg-white/60 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2 text-center">Upload Scene</h2>

      <label>Day (1–25)</label>
      <input
        type="number"
        min="1"
        max="25"
        value={day}
        onChange={e => setDay(+e.target.value)}
        className="border rounded p-2 w-full mb-2"
        required
      />

      <label>Title</label>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border rounded p-2 w-full mb-2"
        required
      />

      <label>Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={e => setFile(e.target.files?.[0] || null)}
        className="border rounded p-2 w-full mb-3"
        required
      />

      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded p-2 w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Scene'}
      </button>
    </form>
  )
}
