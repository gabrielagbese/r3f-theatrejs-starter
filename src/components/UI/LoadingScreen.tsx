/**
 * LoadingScreen Component
 * 
 * A full-screen overlay that displays while the 3D scene is loading.
 * Uses drei's useProgress hook to track loading progress.
 * 
 * Features:
 * - Full-screen coverage
 * - Loading percentage display
 * - Smooth fade-out transition when complete
 * - Customizable delay before hiding
 */

import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

// ============================================================================
// TYPES
// ============================================================================

interface LoadingScreenProps {
  /** Callback fired when loading is complete and screen is hidden */
  onFinished?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onFinished }) => {
  // Track loading progress from drei
  const { progress } = useProgress();
  
  // Control visibility of the loading screen
  const [isVisible, setIsVisible] = useState(true);

  // -------------------------------------------------------------------------
  // HIDE LOADING SCREEN WHEN COMPLETE
  // -------------------------------------------------------------------------
  
  useEffect(() => {
    // Wait for 100% progress
    if (progress === 100) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onFinished) onFinished();
      }, 800); // 800ms delay after loading complete
      
      return () => clearTimeout(timer);
    }
  }, [progress, onFinished]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  
  // Don't render anything once hidden
  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500"
      style={{ opacity: progress === 100 ? 0 : 1 }}
    >
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        
        {/* Loading Title */}
        <h1 className="text-4xl md:text-6xl mb-4 tracking-wider font-bold">
          LOADING
        </h1>
        
        {/* Progress Bar Container */}
        <div className="w-48 md:w-64 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
          {/* Progress Bar Fill */}
          <div 
            className="h-full bg-white/80 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Progress Percentage */}
        <p className="text-sm opacity-70 font-mono">
          {Math.round(progress)}%
        </p>
        
      </div>
    </div>
  );
};

export default LoadingScreen;
