/**
 * PlaceholderSection Component
 * 
 * A reusable placeholder section for the scrollable UI layer.
 * Replace these with your actual content sections.
 * 
 * Features:
 * - Title and subtitle display
 * - Description text
 * - Glass morphism styling
 * - Responsive layout
 */

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface PlaceholderSectionProps {
  /** Unique ID for scroll navigation */
  id: string;
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle: string;
  /** Section description */
  description: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  id,
  title,
  subtitle,
  description,
}) => {
  return (
    <section
      id={id}
      className="section-wrapper"
    >
      {/* ---------------------------------------------------------------------- */}
      {/* TOP SECTION - Title Area                                               */}
      {/* ---------------------------------------------------------------------- */}
      
      <div className="section-top">
        <div className="glass text-center">
          <span className="text-white/60 text-sm uppercase tracking-widest">
            {subtitle}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* BOTTOM SECTION - Content Area                                          */}
      {/* ---------------------------------------------------------------------- */}
      
      <div className="section-bottom">
        <div className="glass w-full max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            {title}
          </h2>
          <p className="text-white/70 text-center leading-relaxed">
            {description}
          </p>
          
          {/* Placeholder Content Area */}
          <div className="mt-6 p-4 border border-dashed border-white/20 rounded-lg text-center">
            <p className="text-white/40 text-sm">
              Replace this placeholder with your actual content.
              <br />
              Cards, images, forms, or any React components.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlaceholderSection;
