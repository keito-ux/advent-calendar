import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface EnhancedThreeViewerProps {
  modelUrl: string;
  className?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  onLoad?: () => void;
}

// Snow particles component
function SnowParticles({ count = 200 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null);
  const particles = useRef<Float32Array>(new Float32Array(count * 3));
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  useEffect(() => {
    for (let i = 0; i < count * 3; i += 3) {
      particles.current[i] = (Math.random() - 0.5) * 20;
      particles.current[i + 1] = Math.random() * 20;
      particles.current[i + 2] = (Math.random() - 0.5) * 20;
    }
  }, [count]);

  useEffect(() => {
    return () => {
      // クリーンアップ
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
      if (materialRef.current) {
        materialRef.current.dispose();
      }
    };
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.01;
        if (positions[i] < -10) {
          positions[i] = 10;
          positions[i - 1] = (Math.random() - 0.5) * 20;
          positions[i + 1] = (Math.random() - 0.5) * 20;
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.current}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={0.05} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
}

// Light particles (sparkles)
function LightParticles() {
  return (
    <Sparkles
      count={50}
      scale={10}
      size={2}
      speed={0.4}
      color="#FFD700"
      opacity={0.6}
    />
  );
}

// Animated model with fade-in
function AnimatedModel({ url, onLoad }: { url: string; onLoad?: () => void }) {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);
  const [opacity, setOpacity] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Fade in animation
    const timer = setTimeout(() => {
      setOpacity(1);
      onLoad?.();
    }, 100);

    return () => {
      clearTimeout(timer);
      // クリーンアップ: geometryとmaterialをdispose
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
      // cancelAnimationFrame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [scene, onLoad]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.y += 0.005;
      
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        scale={1.5}
        opacity={opacity}
        onUpdate={(self: any) => {
          if (self.material) {
            self.material.transparent = true;
            self.material.opacity = opacity;
          }
          scene.traverse((child: any) => {
            if (child.isMesh && child.material) {
              child.material.transparent = true;
              child.material.opacity = opacity;
            }
          });
        }}
      />
    </group>
  );
}

// Camera animation controller
function CameraController({ targetPosition, targetLookAt }: { targetPosition?: [number, number, number]; targetLookAt?: [number, number, number] }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...(targetPosition || [0, 2, 5])));
  const targetLook = useRef(new THREE.Vector3(...(targetLookAt || [0, 0, 0])));
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // cancelAnimationFrame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useFrame(() => {
    camera.position.lerp(targetPos.current, 0.05);
    const lookAt = targetLook.current.clone();
    camera.lookAt(lookAt);
  });

  return null;
}

// Renderer設定コンポーネント
function RendererConfig() {
  const { gl } = useThree();

  useEffect(() => {
    // WebGL Context Lostイベントのハンドリング
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL Context Lost');
    };

    const handleContextRestored = () => {
      console.log('WebGL Context Restored');
    };

    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  return null;
}

export default function EnhancedThreeViewer({
  modelUrl,
  className = '',
  autoRotate = true,
  enableZoom = true,
  onLoad,
}: EnhancedThreeViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // コンポーネントのクリーンアップ時にDOMからcanvasを削除
    return () => {
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/80 to-navy-900/80 backdrop-blur-sm rounded-lg z-10">
          <div className="text-white text-sm animate-pulse">Loading 3D model...</div>
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{
          antialias: false,
          powerPreference: 'low-power',
          preserveDrawingBuffer: false,
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = false;
        }}
      >
        <RendererConfig />
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} color="#FFD700" />
          <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#FF6B9D" />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFFFFF" />
          
          <AnimatedModel url={modelUrl} onLoad={() => setIsLoading(false)} />
          
          <SnowParticles count={150} />
          <LightParticles />
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
          
          <OrbitControls
            enableZoom={enableZoom}
            enablePan={false}
            minDistance={3}
            maxDistance={10}
            autoRotate={autoRotate}
            autoRotateSpeed={1.5}
            enableDamping
            dampingFactor={0.05}
          />
          
          <Environment preset="sunset" />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
}

