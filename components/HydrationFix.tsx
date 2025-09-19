'use client';

import { useEffect } from 'react';

export default function HydrationFix() {
  useEffect(() => {
    // Clean up any browser extension modifications that cause hydration mismatches
    const cleanupExtensionModifications = () => {
      const html = document.documentElement;
      const body = document.body;
      
      // Ensure lang attribute is consistent
      if (html.lang !== 'en') {
        html.lang = 'en';
      }
      
      // Remove any extension-added styles that cause hydration mismatches
      if (html.style.getPropertyValue('--eq-body-width')) {
        html.style.removeProperty('--eq-body-width');
      }
      if (html.style.getPropertyValue('transition-property')) {
        html.style.removeProperty('transition-property');
      }
      if (html.style.getPropertyValue('margin-right')) {
        html.style.removeProperty('margin-right');
      }
      
      // Remove extension-added classes that cause hydration mismatches
      const classesToRemove = ['eqlCkr_side_left', 'eqlCkr_side_right'];
      classesToRemove.forEach(className => {
        if (body.classList.contains(className)) {
          body.classList.remove(className);
        }
      });
    };
    
    // Run cleanup immediately after hydration
    cleanupExtensionModifications();
    
    // Also run cleanup if DOM mutations are detected (extensions modifying after hydration)
    const observer = new MutationObserver(() => {
      cleanupExtensionModifications();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'style', 'class'],
      subtree: true
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      subtree: false
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}