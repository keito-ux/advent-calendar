import { useState } from 'react'
import { CalendarGrid } from './components/CalendarGrid'
import { SceneDetail } from './components/SceneDetail'
import { ArtistProfile } from './components/ArtistProfile'
import { TipModal } from './components/TipModal'
import UploadScene from './components/UploadScene'
import type { Scene } from './lib/types'

type View =
  | { type: 'calendar' }
  | { type: 'scene'; dayNumber: number; scene: Scene | null }
  | { type: 'artist'; artistId: string }
  | { type: 'tip'; artistId: string; artistName: string; sceneId?: string }

export default function App() {
  const [view, setView] = useState<View>({ type: 'calendar' })

  function handleSceneClick(dayNumber: number, scene: Scene | null) {
    setView({ type: 'scene', dayNumber, scene })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950">
      <h1 className="text-center text-2xl font-bold pt-4 text-white">🎄 Picture Book Advent Calendar</h1>
      <UploadScene />

      <CalendarGrid
        onSceneClick={handleSceneClick}
        modelUrl1="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150859_texture.glb"
        modelUrl2="https://cxhpdgmlnfumkxwsyopq.supabase.co/storage/v1/object/public/advent.pics/uploads/Pixar_style_snowy_fai_1030150921_texture.glb"
      />

      {view.type === 'scene' && view.scene && (
        <SceneDetail
          dayNumber={view.dayNumber}
          scene={view.scene}
          onClose={() => setView({ type: 'calendar' })}
        />
      )}

      {view.type === 'artist' && (
        <ArtistProfile
          artistId={view.artistId}
          onClose={() => setView({ type: 'calendar' })}
        />
      )}

      {view.type === 'tip' && (
        <TipModal
          artistId={view.artistId}
          artistName={view.artistName}
          sceneId={view.sceneId}
          onClose={() => setView({ type: 'calendar' })}
          onSuccess={() => setView({ type: 'calendar' })}
        />
      )}
    </div>
  )
}
