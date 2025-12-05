/**
 * Grass Component
 * 
 * A high-performance instanced grass field with wind simulation.
 * Uses custom shaders for realistic grass blade animation.
 * 
 * Features:
 * - Instanced rendering for thousands of grass blades
 * - Procedural wind animation with gusts and turbulence
 * - Configurable terrain with height functions (flat, hills, etc.)
 * - Customizable colors, sizes, and wind parameters
 * - Shadow support
 * 
 * Usage:
 * <Grass
 *   size={[50, 50]}
 *   bladeCount={50000}
 *   baseColor="#1a5f2a"
 *   tipColor="#4ade80"
 *   wind={{ strength: 0.3, speed: 1 }}
 * />
 */

"use client"

import { useRef, useMemo, memo, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WindConfig {
  /** Wind strength (0 = no wind, higher = stronger) */
  strength?: number
  /** Wind speed multiplier */
  speed?: number
  /** Wind direction in radians (0 = +X, PI/2 = +Z) */
  direction?: number
  /** Turbulence amount (0 = uniform wind, higher = more chaotic) */
  turbulence?: number
  /** Gust frequency (how often gusts occur) */
  gustFrequency?: number
  /** Gust strength multiplier */
  gustStrength?: number
}

export interface ShadowConfig {
  /** Whether grass blades cast shadows */
  castShadow?: boolean
  /** Whether grass blades receive shadows */
  receiveShadow?: boolean
  /** Whether terrain receives shadows */
  terrainReceiveShadow?: boolean
}

export interface GrassProps {
  /** Width and depth of the grass area [width, depth] */
  size?: [number, number]
  /** Number of grass blades to render */
  bladeCount?: number
  /** Base color of grass (near ground) */
  baseColor?: string
  /** Tip color of grass (for gradient effect) */
  tipColor?: string
  /** Color of the terrain/ground plane */
  terrainColor?: string
  /** Height range [min, max] for grass blades */
  bladeHeight?: [number, number]
  /** Width of grass blades */
  bladeWidth?: number
  /** Position of the grass in 3D space [x, y, z] */
  position?: [number, number, number]
  /** Rotation of the grass [x, y, z] in radians */
  rotation?: [number, number, number]
  /** Scale of the grass [x, y, z] or uniform scale */
  scale?: [number, number, number] | number
  /** Custom height function for terrain */
  heightFunction?: (x: number, z: number) => [number, number, number, number]
  /** Number of segments for the terrain mesh */
  terrainSegments?: number
  /** Wind configuration */
  wind?: WindConfig
  /** Shadow configuration */
  shadows?: ShadowConfig
}

export interface HillConfig {
  /** Center X position of the hill */
  centerX?: number
  /** Center Z position of the hill */
  centerZ?: number
  /** Radius of the hill */
  radius?: number
  /** Maximum height of the hill */
  height?: number
  /** Roundness/sharpness: lower = rounder, higher = sharper peak */
  roundness?: number
  /** Plateau factor: 0 = no plateau, closer to 1 = flatter top */
  plateau?: number
  /** Skirt: extends flat area around base */
  skirt?: number
  /** Asymmetry: stretches hill in one direction [scaleX, scaleZ] */
  asymmetry?: [number, number]
  /** Rotation of the hill shape in radians */
  rotation?: number
  /** Ridge factor: creates a ridge-like shape */
  ridge?: number
  /** Ridge direction in radians */
  ridgeDirection?: number
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_WIND: Required<WindConfig> = {
  strength: 0.3,
  speed: 1,
  direction: 0,
  turbulence: 0.3,
  gustFrequency: 0.5,
  gustStrength: 0.5,
}

const DEFAULT_SHADOWS: Required<ShadowConfig> = {
  castShadow: false,
  receiveShadow: false,
  terrainReceiveShadow: true,
}

const DEFAULT_HILL: Required<HillConfig> = {
  centerX: 0,
  centerZ: 0,
  radius: 10,
  height: 3,
  roundness: 2,
  plateau: 0,
  skirt: 0,
  asymmetry: [1, 1],
  rotation: 0,
  ridge: 0,
  ridgeDirection: 0,
}

// ============================================================================
// TERRAIN HELPER FUNCTIONS
// ============================================================================

/**
 * Creates a flat terrain (no height variation)
 */
export function createFlatTerrain(): (x: number, z: number) => [number, number, number, number] {
  return (): [number, number, number, number] => [0, 0, 1, 0]
}

/**
 * Creates a configurable hill terrain with extensive shape options
 */
export function createHillTerrain(config: HillConfig = {}): (x: number, z: number) => [number, number, number, number] {
  const c = { ...DEFAULT_HILL, ...config }
  const { centerX, centerZ, radius, height, roundness, plateau, skirt, asymmetry, rotation, ridge, ridgeDirection } = c

  const cosRot = Math.cos(-rotation)
  const sinRot = Math.sin(-rotation)
  const cosRidge = Math.cos(-ridgeDirection)
  const sinRidge = Math.sin(-ridgeDirection)

  return (x: number, z: number): [number, number, number, number] => {
    // Translate to hill center
    const dx = x - centerX
    const dz = z - centerZ

    // Apply rotation
    const rdx = dx * cosRot - dz * sinRot
    const rdz = dx * sinRot + dz * cosRot

    // Apply asymmetry
    const adx = rdx / asymmetry[0]
    const adz = rdz / asymmetry[1]

    const dist = Math.sqrt(adx * adx + adz * adz)

    // Apply skirt (expand the effective radius)
    const effectiveRadius = radius + skirt
    if (dist >= effectiveRadius) {
      return [0, 0, 1, 0]
    }

    // Skirt region (flat at ground level)
    if (dist >= radius) {
      return [0, 0, 1, 0]
    }

    // Normalized distance (0 at center, 1 at edge of hill)
    let t = dist / radius

    // Apply plateau (flatten the center)
    if (plateau > 0 && t < plateau) {
      t = 0
    } else if (plateau > 0) {
      t = (t - plateau) / (1 - plateau)
    }

    // Ridge modification
    let ridgeFactor = 1
    if (ridge > 0) {
      const rx = adx * cosRidge - adz * sinRidge
      ridgeFactor = 1 - ridge * (1 - Math.exp(-Math.abs(rx) * 2))
    }

    // Height calculation with roundness
    const factor = Math.pow(1 - t, roundness) * ridgeFactor
    const y = height * factor

    // Compute gradient for surface normal (numerical approximation)
    const eps = 0.01
    const getHeight = (px: number, pz: number): number => {
      const ldx = px - centerX
      const ldz = pz - centerZ
      const lrdx = ldx * cosRot - ldz * sinRot
      const lrdz = ldx * sinRot + ldz * cosRot
      const ladx = lrdx / asymmetry[0]
      const ladz = lrdz / asymmetry[1]
      const ldist = Math.sqrt(ladx * ladx + ladz * ladz)
      if (ldist >= radius) return 0
      let lt = ldist / radius
      if (plateau > 0 && lt < plateau) lt = 0
      else if (plateau > 0) lt = (lt - plateau) / (1 - plateau)
      let lridgeFactor = 1
      if (ridge > 0) {
        const lrx = ladx * cosRidge - ladz * sinRidge
        lridgeFactor = 1 - ridge * (1 - Math.exp(-Math.abs(lrx) * 2))
      }
      return height * Math.pow(1 - lt, roundness) * lridgeFactor
    }

    const dhdx = (getHeight(x + eps, z) - getHeight(x - eps, z)) / (2 * eps)
    const dhdz = (getHeight(x, z + eps) - getHeight(x, z - eps)) / (2 * eps)

    const len = Math.sqrt(dhdx * dhdx + 1 + dhdz * dhdz)
    return [y, -dhdx / len, 1 / len, -dhdz / len]
  }
}

/**
 * Combines multiple terrain height functions (e.g., multiple hills)
 */
export function combineTerrains(
  ...terrains: Array<(x: number, z: number) => [number, number, number, number]>
): (x: number, z: number) => [number, number, number, number] {
  return (x: number, z: number): [number, number, number, number] => {
    let totalY = 0
    let totalNx = 0
    let totalNz = 0

    for (const terrain of terrains) {
      const [y, nx, , nz] = terrain(x, z)
      totalY += y
      totalNx += nx
      totalNz += nz
    }

    const len = Math.sqrt(totalNx * totalNx + 1 + totalNz * totalNz)
    return [totalY, totalNx / len, 1 / len, totalNz / len]
  }
}

// ============================================================================
// SHADERS
// ============================================================================

const vertexShader = `
  uniform float uTime;
  uniform float uWindStrength;
  uniform float uWindSpeed;
  uniform vec2 uWindDirection;
  uniform float uTurbulence;
  uniform float uGustFrequency;
  uniform float uGustStrength;
  
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  // Simplex noise for turbulence
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vUv = uv;
    vHeight = position.y;
    
    vec4 worldPos = instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    
    vec3 pos = position;
    
    // Base wind wave
    float windTime = uTime * uWindSpeed;
    float windPhase = dot(worldPos.xz, uWindDirection) * 0.3;
    float baseWind = sin(windTime * 2.0 + windPhase);
    
    // Turbulence using noise
    float turbulence = snoise(vec3(worldPos.xz * 0.1, windTime * 0.5)) * uTurbulence;
    
    // Gusts
    float gust = sin(windTime * uGustFrequency) * 0.5 + 0.5;
    gust = pow(gust, 4.0) * uGustStrength;
    
    // Combined wind effect - stronger at the top of blade
    float windEffect = (baseWind + turbulence + gust) * uWindStrength * position.y * position.y;
    
    // Apply wind in direction
    pos.x += windEffect * uWindDirection.x;
    pos.z += windEffect * uWindDirection.y;
    
    // Slight perpendicular sway for realism
    float sway = snoise(vec3(worldPos.xz * 0.2, windTime)) * uWindStrength * position.y * 0.3;
    pos.x += sway * uWindDirection.y;
    pos.z -= sway * uWindDirection.x;
    
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    vNormal = normalMatrix * mat3(instanceMatrix) * normal;
  }
`

const fragmentShader = `
  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  
  varying vec2 vUv;
  varying float vHeight;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    // Gradient from base to tip
    vec3 color = mix(uBaseColor, uTipColor, vHeight);
    
    // Basic lighting
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(normalize(vNormal), lightDir), 0.0);
    color *= 0.6 + diff * 0.4;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Grass = memo(function Grass({
  size = [50, 50],
  bladeCount = 15000,
  baseColor = "#1a5f2a",
  tipColor = "#4ade80",
  terrainColor = "#654321",
  bladeHeight = [0.3, 0.8],
  bladeWidth = 0.05,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  heightFunction = createFlatTerrain(),
  terrainSegments = 64,
  wind = {},
  shadows = {},
}: GrassProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const terrainRef = useRef<THREE.Mesh>(null)

  // Merge with defaults
  const windConfig = useMemo(() => ({ ...DEFAULT_WIND, ...wind }), [wind])
  const shadowConfig = useMemo(() => ({ ...DEFAULT_SHADOWS, ...shadows }), [shadows])

  // Calculate wind direction vector
  const windDirection = useMemo(() => {
    return new THREE.Vector2(Math.cos(windConfig.direction), Math.sin(windConfig.direction))
  }, [windConfig.direction])

  // Generate terrain geometry
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size[0], size[1], terrainSegments, terrainSegments)
    const posAttr = geo.attributes.position
    const vertices = posAttr.array as Float32Array

    for (let i = 0; i < posAttr.count; i++) {
      const x = vertices[i * 3]
      const z = vertices[i * 3 + 1]
      const [height] = heightFunction(x, z)
      vertices[i * 3 + 2] = height
    }

    geo.computeVertexNormals()
    return geo
  }, [size, heightFunction, terrainSegments])

  // Pre-compute instance matrices
  const instanceMatrices = useMemo(() => {
    const matrices = new Float32Array(bladeCount * 16)
    const matrix = new THREE.Matrix4()
    const position3 = new THREE.Vector3()
    const quaternion = new THREE.Quaternion()
    const scaleVec = new THREE.Vector3()
    const up = new THREE.Vector3(0, 1, 0)
    const normal = new THREE.Vector3()

    for (let i = 0; i < bladeCount; i++) {
      const x = (Math.random() - 0.5) * size[0]
      const z = (Math.random() - 0.5) * size[1]

      const [height, nx, ny, nz] = heightFunction(x, z)

      const scaleY = bladeHeight[0] + Math.random() * (bladeHeight[1] - bladeHeight[0])
      const rotationY = Math.random() * Math.PI * 2

      position3.set(x, height, z)

      normal.set(nx, ny, nz).normalize()
      if (normal.lengthSq() < 0.001) normal.set(0, 1, 0)

      quaternion.setFromUnitVectors(up, normal)
      const rotQuat = new THREE.Quaternion().setFromAxisAngle(normal, rotationY)
      quaternion.multiply(rotQuat)

      scaleVec.set(1, scaleY, 1)

      matrix.compose(position3, quaternion, scaleVec)
      matrix.toArray(matrices, i * 16)
    }

    return matrices
  }, [bladeCount, size, bladeHeight, heightFunction])

  // Create grass blade geometry
  const bladeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()

    const vertices = new Float32Array([-bladeWidth / 2, 0, 0, bladeWidth / 2, 0, 0, 0, 1, 0])

    const uvs = new Float32Array([0, 0, 1, 0, 0.5, 1])
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])

    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
    geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
    geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3))

    return geo
  }, [bladeWidth])

  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWindStrength: { value: windConfig.strength },
        uWindSpeed: { value: windConfig.speed },
        uWindDirection: { value: windDirection },
        uTurbulence: { value: windConfig.turbulence },
        uGustFrequency: { value: windConfig.gustFrequency },
        uGustStrength: { value: windConfig.gustStrength },
        uBaseColor: { value: new THREE.Color(baseColor) },
        uTipColor: { value: new THREE.Color(tipColor) },
      },
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
    })
  }, [windConfig, windDirection, baseColor, tipColor])

  // Update instance matrices on mount
  useEffect(() => {
    if (!meshRef.current) return

    const mesh = meshRef.current
    mesh.instanceMatrix.array.set(instanceMatrices)
    mesh.instanceMatrix.needsUpdate = true
  }, [instanceMatrices])

  // Update uniforms when props change
  useEffect(() => {
    if (material.uniforms) {
      material.uniforms.uBaseColor.value.set(baseColor)
      material.uniforms.uTipColor.value.set(tipColor)
      material.uniforms.uWindStrength.value = windConfig.strength
      material.uniforms.uWindSpeed.value = windConfig.speed
      material.uniforms.uWindDirection.value = windDirection
      material.uniforms.uTurbulence.value = windConfig.turbulence
      material.uniforms.uGustFrequency.value = windConfig.gustFrequency
      material.uniforms.uGustStrength.value = windConfig.gustStrength
    }
  }, [material, baseColor, tipColor, windConfig, windDirection])

  // Animate wind
  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Terrain mesh */}
      <mesh
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={shadowConfig.terrainReceiveShadow}
        geometry={terrainGeometry}
      >
        <meshStandardMaterial color={terrainColor} />
      </mesh>

      {/* Grass instances */}
      <instancedMesh
        ref={meshRef}
        args={[bladeGeometry, material, bladeCount]}
        castShadow={shadowConfig.castShadow}
        receiveShadow={shadowConfig.receiveShadow}
      />

    </group>
  )
})

export default Grass
