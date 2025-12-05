/**
 * InstancedClouds Component
 * 
 * Renders multiple cloud billboards efficiently using individual meshes
 * with billboard behavior (always facing camera) and gentle drift animation.
 * 
 * Features:
 * - Billboard rotation (clouds always face the camera)
 * - Random positions, sizes, and texture selection
 * - Subtle drifting animation
 * - Configurable count, position, and scale
 * 
 * Usage:
 * <InstancedClouds count={20} position={[0, 30, -20]} scale={1} />
 */

import { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// TYPES
// ============================================================================

interface InstancedCloudsProps {
  /** Number of clouds to render (default: 20) */
  count?: number;
  /** Position of the cloud group [x, y, z] */
  position?: [number, number, number];
  /** Scale of the entire group */
  scale?: number | [number, number, number];
}

interface CloudInstanceData {
  position: [number, number, number];
  size: number;
  textureIndex: number;
  driftSpeed: number;
  driftDirection: number;
  initialX: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function InstancedClouds({ 
  count = 20, 
  position = [0, 0, 0], 
  scale = 1 
}: InstancedCloudsProps) {
  
  // References to cloud meshes for animation
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  
  // -------------------------------------------------------------------------
  // TEXTURES
  // -------------------------------------------------------------------------
  
  /**
   * Load cloud textures.
   * Add your cloud PNG files to public/clouds/ directory.
   * Clouds should be white/light colored with transparent backgrounds.
   */
  const cloudTextures = useLoader(THREE.TextureLoader, [
    '/clouds/cloud1.png',
    '/clouds/cloud2.png',
    '/clouds/cloud3.png',
    '/clouds/cloud4.png',
  ])

  // -------------------------------------------------------------------------
  // INSTANCE DATA GENERATION
  // -------------------------------------------------------------------------
  
  // Size parameters
  const MIN_SIZE = 20
  const MAX_SIZE = 40

  /**
   * Generate random data for each cloud instance.
   * This runs once on mount and when count changes.
   */
  const instanceData = useMemo(() => {
    const data: CloudInstanceData[] = []
    
    for (let i = 0; i < count; i++) {
      // Random position within bounds
      const x = (Math.random() - 0.5) * 120 // Spread across X
      const y = 15 + Math.random() * 15 // Height between 15-30
      const z = -10 - Math.random() * 50 // Depth from -10 to -60
      
      // Random size
      const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE)
      
      // Random texture from available options
      const textureIndex = Math.floor(Math.random() * cloudTextures.length)
      
      // Random drift animation parameters
      const driftSpeed = 0.1 + Math.random() * 0.3 // 0.1 to 0.4
      const driftDirection = Math.random() * Math.PI * 2 // Random angle
      
      data.push({
        position: [x, y, z],
        size,
        textureIndex,
        driftSpeed,
        driftDirection,
        initialX: x,
      })
    }
    
    return data
  }, [count, cloudTextures.length])

  // -------------------------------------------------------------------------
  // MATERIALS
  // -------------------------------------------------------------------------
  
  /**
   * Create transparent materials for each cloud texture.
   * Uses NormalBlending for soft, natural look.
   */
  const materials = useMemo(() => {
    return cloudTextures.map(texture => {
      texture.colorSpace = THREE.SRGBColorSpace
      return new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.25, // Semi-transparent for soft look
        side: THREE.DoubleSide,
        depthWrite: false, // Prevents z-fighting
        blending: THREE.NormalBlending,
        color: new THREE.Color(1.0, 1.0, 1.0),
      })
    })
  }, [cloudTextures])

  // -------------------------------------------------------------------------
  // ANIMATION
  // -------------------------------------------------------------------------
  
  /**
   * Update clouds every frame:
   * - Billboard rotation (face camera)
   * - Gentle horizontal drift
   */
  useFrame(({ camera, clock }) => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        // Billboard - always face the camera
        mesh.lookAt(camera.position)
        
        // Gentle drift motion using sine wave
        const data = instanceData[i]
        const drift = Math.sin(clock.elapsedTime * data.driftSpeed) * 3
        mesh.position.x = data.initialX + Math.cos(data.driftDirection) * drift
      }
    })
  })

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <group position={position} scale={scale}>
      {instanceData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el }}
          position={data.position}
          scale={[data.size, data.size, 1]}
        >
          <planeGeometry args={[1, 0.6]} />
          <primitive 
            object={materials[data.textureIndex].clone()} 
            attach="material"
          />
        </mesh>
      ))}
    </group>
  )
}
