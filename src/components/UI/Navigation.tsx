/**
 * Navigation Component
 * 
 * A responsive navigation bar with:
 * - Logo placeholder
 * - Desktop navigation links
 * - Mobile hamburger menu
 * - Shows/hides based on loading state
 * 
 * Customize this component to match your brand and navigation structure.
 */

import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface NavigationProps {
  /** When true, hides navigation links (during loading) */
  loading: boolean;
}

// ============================================================================
// NAVIGATION SEGMENTS
// ============================================================================

/**
 * Define your navigation segments here.
 * Each segment corresponds to a section in your UI layer.
 */
const segments = [
  { id: 'section-1', label: 'Introduction' },
  { id: 'section-2', label: 'Features' },
  { id: 'section-3', label: 'Gallery' },
  { id: 'section-4', label: 'Contact' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function Navigation({ loading }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Smooth scroll to a section when navigation link is clicked.
   * Note: This works with the HTML layer inside ScrollControls.
   */
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="relative">
      
      {/* ---------------------------------------------------------------------- */}
      {/* NAVIGATION BAR                                                        */}
      {/* ---------------------------------------------------------------------- */}
      
      <nav className="bg-black px-4 md:px-12 py-2 md:py-4 flex items-center justify-between border-b border-white/10 relative z-20">
        
        {/* -------------------------------------------------------------------- */}
        {/* LOGO                                                                 */}
        {/* Replace with your own logo                                          */}
        {/* -------------------------------------------------------------------- */}
        
        <div className="flex items-center gap-2">
          {/* Logo icon */}
          <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded flex items-center justify-center">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l-5.5 9h11z M7 12l-5 8h20l-5-8z"/>
            </svg>
          </div>
          
          {/* Logo text */}
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-bold text-white">R3F Starter</span>
            <span className="text-[10px] md:text-xs text-gray-400">Theatre.js</span>
          </div>
        </div>

        {/* -------------------------------------------------------------------- */}
        {/* DESKTOP NAV LINKS                                                    */}
        {/* Hidden on mobile, shown on md: breakpoint and above                  */}
        {/* -------------------------------------------------------------------- */}
        
        {!loading && (
          <div className="hidden md:flex items-center gap-8">
            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => handleNavClick(segment.id)}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {segment.label}
              </button>
            ))}
          </div>
        )}

        {/* -------------------------------------------------------------------- */}
        {/* MOBILE MENU BUTTON                                                   */}
        {/* -------------------------------------------------------------------- */}
        
        {!loading && (
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        )}
      </nav>

      {/* ---------------------------------------------------------------------- */}
      {/* MOBILE MENU DROPDOWN                                                   */}
      {/* Slides down when hamburger menu is clicked                             */}
      {/* ---------------------------------------------------------------------- */}
      
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10 z-50">
          <div className="flex flex-col px-4 py-3 gap-3">
            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => handleNavClick(segment.id)}
                className="text-sm text-gray-300 hover:text-white transition-colors py-2 text-left"
              >
                {segment.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
