/**
 * Main Application Component
 * 
 * This is the root component that sets up the entire application including:
 * - Theatre.js project and sheet initialization
 * - R3F Canvas with scroll-controlled camera
 * - UI layer with placeholder sections
 * - Responsive layout with aspect ratio constraints
 * 
 * Keyboard Shortcuts:
 * - Press 'O' to toggle between Orbit mode and Scroll mode
 * - Press 'E' to toggle scroll binding (for editing Theatre.js timeline)
 */

import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { Experience } from './components/3D/Experience';
import { getProject } from '@theatre/core';
import { SheetProvider } from '@theatre/r3f';
import { useState, useEffect } from 'react';
import studio from '@theatre/studio';

import Navigation from './components/UI/Navigation';
import PlaceholderSection from './components/UI/PlaceholderSection';
import LoadingScreen from './components/UI/LoadingScreen';

// Import Theatre.js state (camera animation keyframes)
import projectState from './state.json';

// ============================================================================
// THEATRE.JS INITIALIZATION
// ============================================================================

/**
 * Initialize Theatre.js Studio in development mode only.
 * This provides the visual timeline editor for creating camera animations.
 */
if (import.meta.env.DEV) {
  studio.initialize();
}

/**
 * Create Theatre.js project with pre-defined animation state.
 * The state.json file contains camera position keyframes.
 */
export const theatreProject = getProject('Starter Project', { 
  state: projectState
});

/**
 * Create a sheet for the main scene.
 * Sheets contain the actual animation data for objects.
 */
export const mainSheet = theatreProject.sheet('Main Scene');

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  /** Toggle between orbit controls (3D exploration) and scroll mode (scroll-based animation) */
  const [orbitMode, setOrbitMode] = useState(false);
  
  /** Track loading state for the 3D scene */
  const [loading, setLoading] = useState(true);
  
  /** Number of scroll pages - affects scroll sensitivity */
  const [pages, setPages] = useState(5);

  // -------------------------------------------------------------------------
  // RESPONSIVE PAGES CALCULATION
  // -------------------------------------------------------------------------
  
  /**
   * Adjust scroll pages based on viewport width.
   * Smaller screens may need slightly different values for smooth scrolling.
   */
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Adjust pages for different screen sizes if needed
      setPages(width >= 1024 ? 5 : 5.25);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -------------------------------------------------------------------------
  // KEYBOARD CONTROLS
  // -------------------------------------------------------------------------
  
  /**
   * Toggle orbit mode with 'O' key.
   * In orbit mode, mouse controls the camera instead of scroll.
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'o' || e.key === 'O') {
        setOrbitMode(prev => {
          const newValue = !prev;
          console.log(`[Mode] ${newValue ? 'ORBIT' : 'SCROLL'} mode enabled`);
          return newValue;
        });
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="w-full h-screen bg-black flex flex-col relative">
      
      {/* ------------------------------------------------------------------ */}
      {/* DECORATIVE VERTICAL LINES                                         */}
      {/* Subtle vertical lines on the sides for visual interest            */}
      {/* ------------------------------------------------------------------ */}
      <div className="hidden lg:block absolute top-0 bottom-0 left-36 w-px bg-white/10 z-0 transition-all duration-500"></div>
      <div className="hidden lg:block absolute top-0 bottom-0 right-36 w-px bg-white/10 z-0 transition-all duration-500"></div>

      {/* ------------------------------------------------------------------ */}
      {/* NAVIGATION BAR                                                    */}
      {/* ------------------------------------------------------------------ */}
      <Navigation loading={loading} />

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT CONTAINER                                            */}
      {/* Contains both the 3D scene and scrollable UI layer                */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 px-4 md:px-12 py-[10px] overflow-hidden flex items-center justify-center relative z-10">
        
        {/* Responsive container with max aspect ratio */}
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            // Constrain to 3:2 aspect ratio while respecting viewport bounds
            maxWidth: 'min(calc((100vh - 100px) * 3 / 2), calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 100px)',
            aspectRatio: 'auto',
            // Slight brightness boost for the 3D scene
            filter: 'brightness(1.15)',
          }}
        >
          
          {/* -------------------------------------------------------------- */}
          {/* 3D CANVAS                                                      */}
          {/* -------------------------------------------------------------- */}
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 75 }}
            gl={{ 
              antialias: true,
              powerPreference: 'high-performance',
              preserveDrawingBuffer: true
            }}
            onCreated={() => setLoading(false)}
          >
            {/* Theatre.js Sheet Provider - wraps entire scene */}
            <SheetProvider sheet={mainSheet}>
              
              {/* ---------------------------------------------------------- */}
              {/* SCROLL CONTROLS                                            */}
              {/* Enables scroll-based animation when not in orbit mode      */}
              {/* ---------------------------------------------------------- */}
              <ScrollControls 
                pages={pages}
                damping={0.2} 
                distance={1} 
                horizontal={false} 
                infinite={false}
                enabled={!orbitMode}
              >
                {/* 3D Scene */}
                <Experience orbitMode={orbitMode} />
                
                {/* -------------------------------------------------------- */}
                {/* UI LAYER - SCROLLABLE HTML CONTENT                       */}
                {/* This layer scrolls over the 3D scene                     */}
                {/* -------------------------------------------------------- */}
                <Scroll html style={{ width: '100%', height: '100%' }}>
                  <div className={`w-full ${orbitMode ? 'pointer-events-none opacity-30' : ''}`}>
                    
                    {/* Section 1: Introduction */}
                    <PlaceholderSection 
                      id="section-1"
                      title="Section 1"
                      subtitle="Introduction / Hero"
                      description="Add your hero content here. This section appears at the start of the scroll journey."
                    />

                    {/* Section 2: Features */}
                    <PlaceholderSection 
                      id="section-2"
                      title="Section 2"
                      subtitle="Features / Content"
                      description="Add your main content here. The camera will animate as users scroll."
                    />

                    {/* Section 3: Gallery */}
                    <PlaceholderSection 
                      id="section-3"
                      title="Section 3"
                      subtitle="Gallery / Showcase"
                      description="Perfect for showcasing images, cards, or interactive elements."
                    />

                    {/* Section 4: Contact */}
                    <PlaceholderSection 
                      id="section-4"
                      title="Section 4"
                      subtitle="Contact / Footer"
                      description="Final section - great for contact info, footer, or call-to-action."
                    />

                    {/* Buffer space for complete scroll to end */}
                    <div className="h-[50vh] w-full"></div>
                    
                  </div>
                </Scroll>
              </ScrollControls>
            </SheetProvider>
          </Canvas>

          {/* -------------------------------------------------------------- */}
          {/* LOADING SCREEN OVERLAY                                        */}
          {/* Covers the scene until 3D assets are loaded                   */}
          {/* -------------------------------------------------------------- */}
          <LoadingScreen onFinished={() => setLoading(false)} />
          
        </div>
      </div>
    </div>
  );
}

export default App;
