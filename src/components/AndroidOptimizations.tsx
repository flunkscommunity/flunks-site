import React, { useEffect } from 'react';

// Android WebView specific optimizations
export const AndroidOptimizations: React.FC = () => {
  useEffect(() => {
    // Detect Android WebView
    const isAndroidWebView = /Android.*wv\)/.test(navigator.userAgent) || 
                            /Version\/\d\.\d.*Chrome\/\d+\.\d+\.\d+\.\d+.*Mobile Safari/.test(navigator.userAgent);
    
    if (isAndroidWebView) {
      // Add CSS optimizations for Android WebView
      const style = document.createElement('style');
      style.textContent = `
        /* Android WebView Performance Optimizations */
        * {
          -webkit-transform: translateZ(0);
          -webkit-backface-visibility: hidden;
          -webkit-perspective: 1000;
        }
        
        /* Optimize scrolling containers */
        [data-scroll-container] {
          -webkit-overflow-scrolling: touch;
          will-change: scroll-position;
          overflow-anchor: none;
        }
        
        /* Optimize images for Android WebView */
        img {
          -webkit-transform: translateZ(0);
          image-rendering: optimizeSpeed;
          image-rendering: -webkit-optimize-contrast;
        }
        
        /* Reduce layout shifts */
        .grid-item {
          contain: layout style paint;
          will-change: transform;
        }
        
        /* Optimize styled-components */
        [class*="styled-components"] {
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  return null;
};
