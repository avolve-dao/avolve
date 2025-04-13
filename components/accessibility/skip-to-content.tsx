'use client';

/**
 * Skip to Content Component
 * 
 * Provides a keyboard-accessible way to skip navigation and go directly to main content
 * Copyright © 2025 Avolve DAO. All rights reserved.
 */

import { useEffect, useRef } from 'react';

export function SkipToContent() {
  const linkRef = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    // Add event listener for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip link when Tab is pressed at the beginning of the page
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        linkRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Find the main content element
    const mainContent = document.getElementById('main-content');
    
    if (mainContent) {
      // Set focus to the main content
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      
      // Scroll to main content
      mainContent.scrollIntoView();
    }
  };
  
  return (
    <a
      ref={linkRef}
      href="#main-content"
      className="skip-to-content"
      onClick={handleClick}
    >
      Skip to content
    </a>
  );
}
