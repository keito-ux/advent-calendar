import { useEffect, useState, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid, PerspectiveCamera } from '@react-three/drei';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { User3DPlacement } from '../lib/types';
import { X, Save, Trash2, RotateCw } from 'lucide-react';
import * as THREE from 'three';
import ThreeViewer from './ThreeViewer';

interface StorageModel {
  name: string;
  url: string;
}

// Ground plane for clicking
function Ground({ onPlaneClick }: { onPlaneClick: (point: THREE.Vector3) => void }) {
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);

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

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onPlaneClick(e.point);
      }}
    >
      <planeGeometry ref={geometryRef} args={[100, 100]} />
      <meshBasicMaterial ref={materialRef} transparent opacity={0} />
    </mesh>
  );
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

interface My3DSpaceProps {
  userId: string;
  onClose: () => void;
}

// 3Dモデルコンポーネント
function PlacedModel({ placement, isSelected, onSelect }: { placement: User3DPlacement; isSelected: boolean; onSelect: () => void }) {
  const { scene } = useGLTF(placement.model_url);
  const meshRef = useRef<THREE.Group>(null);
  const clonedScene = useRef<THREE.Group | null>(null);
  const selectionBoxRef = useRef<THREE.Mesh | null>(null);
  const selectionGeometryRef = useRef<THREE.BoxGeometry | null>(null);
  const selectionMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    clonedScene.current = scene.clone();
    return () => {
      // クリーンアップ: geometryとmaterialをdispose
      if (clonedScene.current) {
        clonedScene.current.traverse((child) => {
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
      if (selectionGeometryRef.current) {
        selectionGeometryRef.current.dispose();
      }
      if (selectionMaterialRef.current) {
        selectionMaterialRef.current.dispose();
      }
    };
  }, [scene]);

  useFrame(() => {
    if (meshRef.current && !isSelected) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  if (!clonedScene.current) {
    return null;
  }

  return (
    <group
      ref={meshRef}
      position={[placement.position_x, placement.position_y, placement.position_z]}
      rotation={[placement.rotation_x, placement.rotation_y, placement.rotation_z]}
      scale={placement.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <primitive object={clonedScene.current} />
      {isSelected && (
        <mesh ref={selectionBoxRef}>
          <boxGeometry ref={selectionGeometryRef} args={[2, 2, 2]} />
          <meshBasicMaterial ref={selectionMaterialRef} color="yellow" transparent opacity={0.3} wireframe />
        </mesh>
      )}
    </group>
  );
}

// 新規配置用のモデル
function NewModel({ modelUrl, position, onPlace }: { modelUrl: string; position: [number, number, number]; onPlace: () => void }) {
  const { scene } = useGLTF(modelUrl);
  const meshRef = useRef<THREE.Group>(null);
  const clonedScene = useRef<THREE.Group | null>(null);
  const previewBoxRef = useRef<THREE.Mesh | null>(null);
  const previewGeometryRef = useRef<THREE.BoxGeometry | null>(null);
  const previewMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  useEffect(() => {
    clonedScene.current = scene.clone();
    return () => {
      // クリーンアップ: geometryとmaterialをdispose
      if (clonedScene.current) {
        clonedScene.current.traverse((child) => {
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
      if (previewGeometryRef.current) {
        previewGeometryRef.current.dispose();
      }
      if (previewMaterialRef.current) {
        previewMaterialRef.current.dispose();
      }
    };
  }, [scene]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  if (!clonedScene.current) {
    return null;
  }

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onPlace();
      }}
    >
      <primitive object={clonedScene.current} />
      <mesh ref={previewBoxRef}>
        <boxGeometry ref={previewGeometryRef} args={[2, 2, 2]} />
        <meshBasicMaterial ref={previewMaterialRef} color="cyan" transparent opacity={0.3} wireframe />
      </mesh>
    </group>
  );
}

export function My3DSpace({ userId, onClose }: My3DSpaceProps) {
  const { placements, setPlacements, selectedModelUrl, setSelectedModelUrl, bonuses } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedPlacement, setSelectedPlacement] = useState<string | null>(null);
  const [newModelPosition, setNewModelPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [storageModels, setStorageModels] = useState<StorageModel[]>([]);
  const [loadingStorageModels, setLoadingStorageModels] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [previewModelUrl, setPreviewModelUrl] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    // 依存配列を空にして、マウント時のみ実行
    loadPlacements();
    loadStorageModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function loadPlacements() {
    try {
      const { data, error } = await supabase
        .from('user_3d_placements')
        .select('*')
        .eq('user_id', userIdRef.current)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlacements(data || []);
    } catch (error) {
      console.error('Error loading placements:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStorageModels() {
    setLoadingStorageModels(true);
    setStorageError(null);
    try {
      const { data, error } = await supabase.storage
        .from('advent.pics')
        .list('models/', { limit: 100 });

      if (error) {
        console.error('❌ Storage list error:', error);
        throw error;
      }

      if (!data) {
        setStorageModels([]);
        return;
      }

      const filtered = data.filter((file) => file.name.toLowerCase().endsWith('.glb'));
      const models: StorageModel[] = filtered.map((file) => {
        const { data: urlData, error: urlError } = supabase.storage
          .from('advent.pics')
          .getPublicUrl(`models/${file.name}`);

        if (urlError) {
          console.error('❌ Storage URL error:', urlError, 'file:', file.name);
          return null;
        }

        return {
          name: file.name,
          url: urlData?.publicUrl ?? '',
        };
      }).filter((model): model is StorageModel => Boolean(model && model.url));

      setStorageModels(models);
    } catch (error: any) {
      console.error('Error loading storage models:', error);
      setStorageError(error.message || 'Failed to load models');
      setStorageModels([]);
    } finally {
      setLoadingStorageModels(false);
    }
  }

  async function handlePlaceModel() {
    if (!selectedModelUrl) return;

    setIsPlacing(true);
    try {
      const { data, error } = await supabase
        .from('user_3d_placements')
        .insert({
          user_id: userIdRef.current,
          model_url: selectedModelUrl,
          position_x: newModelPosition[0],
          position_y: newModelPosition[1],
          position_z: newModelPosition[2],
          rotation_x: 0,
          rotation_y: 0,
          rotation_z: 0,
          scale: 1.0,
        })
        .select()
        .single();

      if (error) throw error;

      setPlacements([...placements, data]);
      setSelectedModelUrl(null);
      setIsPlacing(false);
      setNewModelPosition([0, 0, 0]);
    } catch (error) {
      console.error('Error placing model:', error);
      alert('Failed to place model');
      setIsPlacing(false);
    }
  }

  async function handleUpdatePlacement(id: string, updates: Partial<User3DPlacement>) {
    try {
      const { data, error } = await supabase
        .from('user_3d_placements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setPlacements(placements.map((p) => (p.id === id ? data : p)));
    } catch (error) {
      console.error('Error updating placement:', error);
      alert('Failed to update placement');
    }
  }

  async function handleDeletePlacement(id: string) {
    if (!confirm('Delete this model?')) return;

    try {
      const { error } = await supabase
        .from('user_3d_placements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlacements(placements.filter((p) => p.id !== id));
      setSelectedPlacement(null);
    } catch (error) {
      console.error('Error deleting placement:', error);
      alert('Failed to delete placement');
    }
  }

  function handlePlaneClick(point: THREE.Vector3) {
    if (selectedModelUrl) {
      setNewModelPosition([point.x, 0, point.z]);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-white text-xl">Loading 3D space...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between bg-gradient-to-r from-slate-900/95 to-navy-900/95 backdrop-blur-md rounded-lg p-4 border border-white/20">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">My 3D Space</h2>
          {selectedModelUrl && (
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 border border-cyan-400 rounded-lg">
              <span className="text-white text-sm">Placing model...</span>
              <button
                onClick={() => setSelectedModelUrl(null)}
                className="text-cyan-400 hover:text-cyan-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 mt-20">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
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
          <PerspectiveCamera makeDefault position={[5, 5, 5]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.5} />
          <Grid args={[20, 20]} cellColor="#6f6f6f" sectionColor="#9d4b4b" fadeDistance={25} />
          <Ground onPlaneClick={handlePlaneClick} />
          <Environment preset="sunset" />

          {placements.map((placement) => (
            <PlacedModel
              key={placement.id}
              placement={placement}
              isSelected={selectedPlacement === placement.id}
              onSelect={() => setSelectedPlacement(placement.id)}
            />
          ))}

          {selectedModelUrl && (
            <NewModel
              modelUrl={selectedModelUrl}
              position={newModelPosition}
              onPlace={handlePlaceModel}
            />
          )}

          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* Sidebar */}
      <div className="absolute right-4 top-24 bottom-4 w-80 bg-gradient-to-br from-slate-900/95 to-navy-900/95 backdrop-blur-md rounded-lg p-4 border border-white/20 overflow-y-auto">
        <h3 className="text-lg font-bold text-white mb-4">Storage Models</h3>
        {loadingStorageModels && (
          <div className="flex justify-center my-4">
            <div className="w-8 h-8 border-4 border-white/30 border-t-amber-400 rounded-full animate-spin" />
          </div>
        )}
        {!loadingStorageModels && storageError && (
          <p className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 mb-4">
            Failed to load models: {storageError}
          </p>
        )}
        {!loadingStorageModels && !storageError && storageModels.length === 0 && (
          <p className="text-sm text-white/60 mb-4">No models found in storage.</p>
        )}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {storageModels.map((model) => (
            <button
              key={model.name}
              onClick={() => setPreviewModelUrl(model.url)}
              className={`bg-white/10 hover:bg-white/20 border rounded-lg p-2 transition-all text-left shadow-lg ${
                selectedModelUrl === model.url ? 'border-cyan-400' : 'border-white/10'
              }`}
            >
              <div className="w-full h-28 rounded-md overflow-hidden bg-black/40">
                <ThreeViewer modelUrl={model.url} className="w-full h-28" />
              </div>
              <p className="text-xs text-white/80 mt-2 truncate">{model.name}</p>
              <p className="text-[11px] text-amber-300 mt-1">Click to preview</p>
            </button>
          ))}
        </div>

        {placements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">Your Placed Models</h3>
            <div className="space-y-2">
              {placements.map((placement) => (
                <button
                  key={placement.id}
                  onClick={() => setPreviewModelUrl(placement.model_url)}
                  className={`w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-lg p-3 transition-all ${
                    selectedPlacement === placement.id ? 'border-amber-400' : ''
                  }`}
                >
                  <div className="w-20 h-16 rounded-md overflow-hidden bg-black/40">
                    <ThreeViewer modelUrl={placement.model_url} className="w-20 h-16" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white truncate">Placement</p>
                    <p className="text-xs text-white/60 truncate">{placement.model_url}</p>
                    <p className="text-[11px] text-amber-300 mt-1">Click to preview</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-lg font-bold text-white mb-4">Available Models</h3>
        <div className="space-y-2 mb-6">
          {bonuses.map((bonus) => (
            <button
              key={bonus.id}
              onClick={() => setSelectedModelUrl(bonus.model_url)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedModelUrl === bonus.model_url
                  ? 'bg-cyan-500/30 border-2 border-cyan-400'
                  : 'bg-white/10 hover:bg-white/20 border border-white/20'
              }`}
            >
              <p className="text-white text-sm font-semibold">December {bonus.day_number}</p>
              <p className="text-white/60 text-xs">Click to place</p>
            </button>
          ))}
        </div>

        {selectedPlacement && (
          <div className="border-t border-white/20 pt-4">
            <h3 className="text-lg font-bold text-white mb-4">Edit Placement</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const placement = placements.find((p) => p.id === selectedPlacement);
                  if (placement) {
                    handleUpdatePlacement(selectedPlacement, {
                      rotation_y: placement.rotation_y + Math.PI / 4,
                    });
                  }
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <RotateCw className="w-4 h-4" />
                Rotate
              </button>
              <button
                onClick={() => handleDeletePlacement(selectedPlacement)}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {selectedModelUrl && (
          <div className="border-t border-white/20 pt-4 mt-4">
            <button
              onClick={handlePlaceModel}
              disabled={isPlacing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded-lg hover:from-amber-500 hover:to-rose-600 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isPlacing ? 'Placing...' : 'Place Model'}
            </button>
            <p className="text-white/60 text-xs mt-2 text-center">Click on the ground to position</p>
          </div>
        )}
      </div>
      {previewModelUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-slate-950 border border-white/20 rounded-2xl shadow-2xl p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Model Preview</h3>
              <button
                onClick={() => setPreviewModelUrl(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="w-full h-96 rounded-xl overflow-hidden bg-black/40 mb-6">
              <ThreeViewer modelUrl={previewModelUrl} className="w-full h-96" />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedModelUrl(previewModelUrl);
                  setPreviewModelUrl(null);
                }}
                className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all"
              >
                Use this model
              </button>
              <button
                onClick={() => setPreviewModelUrl(null)}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

