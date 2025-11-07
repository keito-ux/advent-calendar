import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient'
import { CalendarGrid } from './components/CalendarGrid'
import { SceneDetail } from './components/SceneDetail'
import { ArtistProfile } from './components/ArtistProfile'
import { TipModal } from './components/TipModal'
import UploadScene from './components/UploadScene'
import AuthPage from './components/AuthPage'
import type { Scene } from './lib/types'
import type { User } from '@supabase/supabase-js'

type View =
  | { type: 'calendar' }
  | { type: 'scene'; dayNumber: number; scene: Scene | null }
  | { type: 'artist'; artistId: string }
  | { type: 'tip'; artistId: string; artistName: string; sceneId?: string }

export default function App() {
  const [view, setView] = useState<View>({ type: 'calendar' })
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  function handleSceneClick(dayNumber: number, scene: Scene | null) {
    setView({ type: 'scene', dayNumber, scene })
  }

  function handleAuthSuccess() {
    // Auth state will be updated via the onAuthStateChange listener
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950">
      <div className="flex justify-between items-center pt-4 px-4 mb-4">
        <h1 className="text-center text-2xl font-bold text-white">🎄 Picture Book Advent Calendar</h1>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
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
