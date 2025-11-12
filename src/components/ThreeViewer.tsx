import { Suspense, useEffect, useRef, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface ThreeViewerProps {
  modelUrl: string
  className?: string
}

// GLTFモデルローダー（クリーンアップ付き）
function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)

  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose())
          } else {
            child.material?.dispose()
          }
        }
      })
    }
  }, [scene])

  return <primitive object={scene} scale={1.5} />
}

export default function ThreeViewer({ modelUrl, className = '' }: ThreeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // ⚙️ コンテキストロスト対策
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleLost = (e: Event) => {
      e.preventDefault()
      console.warn('⚠️ WebGL Context Lost — trying to recover...')
    }

    const handleRestored = () => {
      console.log('✅ WebGL Context Restored')
    }

    canvas.addEventListener('webglcontextlost', handleLost, false)
    canvas.addEventListener('webglcontextrestored', handleRestored, false)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost)
      canvas.removeEventListener('webglcontextrestored', handleRestored)
    }
  }, [])

  // 🔧 不要なCanvas再生成を防止
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        containerRef.current.querySelectorAll('canvas').forEach((c) => c.remove())
      }
    }
  }, [])

  // ⚙️ 環境マップをメモ化（再レンダーで破棄されないように）
  const environment = useMemo(() => <Environment preset="sunset" />, [])

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        key="three-viewer" // ← React再レンダー時も同じCanvasを再利用
        ref={canvasRef}
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true, // ← Context Lost時の再描画を助ける
          failIfMajorPerformanceCaveat: false,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = false
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

          // Context Lost防止イベント
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false)
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <directionalLight position={[-10, -10, -5]} intensity={0.6} />
          <Model url={modelUrl} />
          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={1.2}
          />
          {environment}
        </Suspense>
      </Canvas>
    </div>
  )
}
