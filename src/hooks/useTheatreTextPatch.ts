/**
 * Theatre.js Text Clone Patch Hook
 * 
 * This hook patches the THREE.Object3D clone method to prevent Theatre.js
 * snapshot errors when using drei's Text component.
 * 
 * Problem:
 * Theatre.js tries to clone the entire scene for snapshots, but Text components
 * use custom materials (troika-three-text) that don't support standard cloning.
 * 
 * Solution:
 * We wrap the clone method to catch errors and return placeholder objects
 * for problematic components.
 * 
 * Usage:
 * Call this hook once in your main Experience component:
 * 
 * function Experience() {
 *   useTheatreTextPatch();
 *   // ... rest of your scene
 * }
 */

import { useEffect } from 'react';
import * as THREE from 'three';

export function useTheatreTextPatch() {
  useEffect(() => {
    // Store the original Object3D clone method
    const originalClone = THREE.Object3D.prototype.clone;

    // Override the clone method with error handling
    THREE.Object3D.prototype.clone = function (recursive?: boolean) {
      try {
        // Try the original clone first
        return originalClone.call(this, recursive);
      } catch (error) {
        // If cloning fails (likely a Text component or other complex object),
        // return a simple placeholder instead
        console.warn(
          '[Theatre.js] Clone failed for object, using placeholder:',
          this.name || this.type,
          error
        );
        
        // Create a placeholder group with the same transform
        const placeholder = new THREE.Group();
        placeholder.name = (this.name || 'unknown') + '_placeholder';
        placeholder.position.copy(this.position);
        placeholder.rotation.copy(this.rotation);
        placeholder.scale.copy(this.scale);
        placeholder.visible = this.visible;
        
        // If recursive, try to clone children individually
        if (recursive && this.children && this.children.length > 0) {
          for (const child of this.children) {
            try {
              const clonedChild = child.clone(true);
              placeholder.add(clonedChild);
            } catch (childError) {
              // Skip children that fail to clone
              console.warn(
                '[Theatre.js] Skipped child that failed to clone:',
                child.name || child.type
              );
            }
          }
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return placeholder as any;
      }
    };

    console.log('[Theatre.js] Text clone patch applied');

    // Cleanup: restore original clone method when component unmounts
    return () => {
      THREE.Object3D.prototype.clone = originalClone;
      console.log('[Theatre.js] Text clone patch removed');
    };
  }, []);
}
