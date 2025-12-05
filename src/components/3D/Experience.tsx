/**
 * Experience Component - Main 3D Scene
 * 
 * This is the root 3D scene component that contains:
 * - Theatre.js animated camera with lookAt target
 * - Scroll-to-timeline binding
 * - Environment lighting (Sky, ambient, directional)
 * - Instanced clouds for atmosphere
 * - Grass field for ground cover
 * - Simple demo objects
 * - OrbitControls for development mode
 * 
 * The camera animation is controlled by scroll position, which is mapped
 * to the Theatre.js timeline. This creates a cinematic scroll experience.
 */

import {
    Environment,
    OrbitControls,
    useScroll,
    Sky,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useCurrentSheet } from "@theatre/r3f";
import { val } from "@theatre/core";
import { editable as e } from "@theatre/r3f";
import * as THREE from "three";
import { useEffect, useRef, useState } from "react";
import { useTheatreTextPatch } from "../../hooks/useTheatreTextPatch";
import InstancedClouds from "./InstancedClouds";
import Grass from "./grass-component/grass";

// ============================================================================
// COMPONENT
// ============================================================================

interface ExperienceProps {
  /** When true, enables OrbitControls for free camera movement */
  orbitMode: boolean;
}

export function Experience({ orbitMode }: ExperienceProps) {
    // -------------------------------------------------------------------------
    // REFS & STATE
    // -------------------------------------------------------------------------
    
    /** Reference to the Theatre.js sheet for controlling animation */
    const sheet = useCurrentSheet();
    
    /** Scroll data from drei's ScrollControls */
    const scroll = useScroll();
    
    /** Reference to the camera target mesh (invisible, used for lookAt) */
    const cameraTargetRef = useRef<THREE.Mesh>(null!);
    
    /** Toggle scroll binding - disable when editing timeline in Theatre.js */
    const [enableScrollBinding, setEnableScrollBinding] = useState(true);

    // -------------------------------------------------------------------------
    // THEATRE.JS TEXT PATCH
    // -------------------------------------------------------------------------
    
    /**
     * Apply patch to prevent Theatre.js snapshot errors with drei Text components.
     * This should be called in your main Experience component.
     */
    useTheatreTextPatch();

    // -------------------------------------------------------------------------
    // KEYBOARD CONTROLS
    // -------------------------------------------------------------------------
    
    /**
     * Toggle scroll binding with 'E' key.
     * When disabled, you can freely edit the Theatre.js timeline.
     * When enabled, scroll position controls the timeline.
     */
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'e' || e.key === 'E') {
                setEnableScrollBinding(prev => {
                    const newValue = !prev;
                    console.log(`[Theatre.js] Scroll binding ${newValue ? 'ENABLED' : 'DISABLED'} - ${newValue ? 'Scroll controls camera' : 'Timeline is editable'}`);
                    return newValue;
                });
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // -------------------------------------------------------------------------
    // SCROLL → TIMELINE BINDING
    // -------------------------------------------------------------------------
    
    /**
     * Bind scroll position to Theatre.js sequence playback.
     * This is the core of the scroll-controlled animation.
     */
    useFrame(() => {
        if (!sheet || !enableScrollBinding || !scroll || orbitMode) return;
        
        // Get the total length of the Theatre.js sequence
        const sequenceLength = val(sheet.sequence.pointer.length);
        
        // Map scroll offset (0-1) to sequence position (0-sequenceLength)
        sheet.sequence.position = scroll.offset * sequenceLength;
        
        // Store position globally for UI components that need it
        if (typeof window !== 'undefined') {
            (window as unknown as { __sequencePosition: number }).__sequencePosition = sheet.sequence.position;
        }
    });

    // -------------------------------------------------------------------------
    // RESPONSIVE FOV
    // -------------------------------------------------------------------------
    
    /**
     * Adjust field of view based on screen size.
     * Wider FOV on mobile helps show more of the scene.
     */
    const [fov, setFov] = useState(90);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setFov(110); // Mobile: wider FOV
            } else if (width < 1024) {
                setFov(100); // Tablet: medium FOV
            } else {
                setFov(90); // Desktop: standard wide FOV
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <>
            {/* ---------------------------------------------------------------- */}
            {/* LIGHTING SETUP                                                   */}
            {/* ---------------------------------------------------------------- */}
            
            {/* Ambient light for overall scene brightness */}
            <ambientLight intensity={0.8} />
            
            {/* Directional light for shadows and highlights */}
            <directionalLight
                position={[50, 100, 20]}
                intensity={0.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-far={200}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
            />

            {/* Environment lighting for realistic reflections */}
            <Environment
                background={false}
                preset="sunset"
                blur={0.7}
            />
            
            {/* ---------------------------------------------------------------- */}
            {/* SKY & ATMOSPHERE                                                 */}
            {/* ---------------------------------------------------------------- */}
            
            <Sky sunPosition={[0, 100, 0]} />
            <InstancedClouds position={[0, 30, -20]} scale={1} />

            {/* ---------------------------------------------------------------- */}
            {/* GROUND PLANE                                                     */}
            {/* Simple grey ground as a base                                     */}
            {/* ---------------------------------------------------------------- */}
            
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.1, 0]}
                receiveShadow
            >
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#4a4a4a" />
            </mesh>

            {/* ---------------------------------------------------------------- */}
            {/* GRASS FIELD                                                      */}
            {/* Instanced grass with wind simulation                             */}
            {/* ---------------------------------------------------------------- */}
            
            <Grass
                size={[80, 80]}
                bladeCount={100000}
                position={[0, 0, 0]}
                bladeWidth={0.1}
                terrainColor="#2a3d21"
                baseColor="#6B9B37"
                tipColor="#9bd432"
                bladeHeight={[0.3, 0.6]}
                wind={{
                    strength: 0.2,
                    speed: 1,
                    direction: 0,
                    turbulence: 0.3,
                    gustFrequency: 1,
                    gustStrength: 0.5,
                }}
                shadows={{
                    castShadow: false,
                    receiveShadow: true,
                    terrainReceiveShadow: true,
                }}
            />

            {/* ---------------------------------------------------------------- */}
            {/* DEMO OBJECTS                                                     */}
            {/* Replace these with your actual 3D models                         */}
            {/* ---------------------------------------------------------------- */}
            
            {/* Central cube - placeholder */}
            <mesh position={[0, 1, 0]} castShadow>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#ff6b6b" />
            </mesh>

            {/* Floating sphere */}
            <mesh position={[4, 3, -2]} castShadow>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#4ecdc4" metalness={0.3} roughness={0.4} />
            </mesh>

            {/* Torus decoration */}
            <mesh position={[-4, 2, -3]} rotation={[Math.PI / 4, 0, 0]} castShadow>
                <torusGeometry args={[1.5, 0.4, 16, 32]} />
                <meshStandardMaterial color="#ffe66d" metalness={0.5} roughness={0.3} />
            </mesh>

            {/* ---------------------------------------------------------------- */}
            {/* THEATRE.JS ANIMATED CAMERA                                       */}
            {/* This camera's position is controlled by the timeline             */}
            {/* ---------------------------------------------------------------- */}
            
            <PerspectiveCamera
                theatreKey="Camera"
                makeDefault
                position={[0, 5, 20]}
                fov={fov}
                lookAt={!orbitMode ? cameraTargetRef : undefined}
            />

            {/* Camera target - invisible mesh that camera looks at */}
            <e.mesh 
                theatreKey="Camera Target" 
                ref={cameraTargetRef}
                additionalProps={{ visible: false }}
            >
                <octahedronGeometry args={[0.1, 0]} />
                <meshPhongMaterial color="red" />    
            </e.mesh>

            {/* ---------------------------------------------------------------- */}
            {/* DEVELOPMENT CONTROLS                                             */}
            {/* OrbitControls for free camera movement in orbit mode             */}
            {/* ---------------------------------------------------------------- */}
            
            {orbitMode && (
                <OrbitControls
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                />
            )}
        </>
    );
}
