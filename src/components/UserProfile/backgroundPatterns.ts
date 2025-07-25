// Background Pattern Options for RPG Profile Form

export const backgroundStyles = {
  // Current: Smooth gradient
  gradient: `linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)`,
  
  // Option 1: Diagonal stripes (original style)
  diagonal: `
    linear-gradient(45deg, #d97706 25%, #f59e0b 25%, #f59e0b 50%, #d97706 50%, #d97706 75%, #f59e0b 75%);
    background-size: 16px 16px;
  `,
  
  // Option 2: Retro dots pattern
  dots: `
    radial-gradient(circle at 25% 25%, #f59e0b 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, #d97706 2px, transparent 2px),
    linear-gradient(135deg, #f59e0b, #d97706);
    background-size: 20px 20px, 20px 20px, 100% 100%;
  `,
  
  // Option 3: Checkerboard pattern
  checkerboard: `
    linear-gradient(45deg, #d97706 25%, transparent 25%), 
    linear-gradient(-45deg, #d97706 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f59e0b 75%), 
    linear-gradient(-45deg, transparent 75%, #f59e0b 75%);
    background-size: 12px 12px;
    background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
  `,
  
  // Option 4: Hexagon pattern
  hexagon: `
    linear-gradient(30deg, #d97706 12%, transparent 12.5%, transparent 87%, #d97706 87.5%, #d97706),
    linear-gradient(150deg, #d97706 12%, transparent 12.5%, transparent 87%, #d97706 87.5%, #d97706),
    linear-gradient(30deg, #d97706 12%, transparent 12.5%, transparent 87%, #d97706 87.5%, #d97706),
    linear-gradient(150deg, #d97706 12%, transparent 12.5%, transparent 87%, #d97706 87.5%, #d97706),
    #f59e0b;
    background-size: 24px 42px;
    background-position: 0 0, 0 0, 12px 21px, 12px 21px;
  `,
  
  // Option 5: Crosshatch pattern
  crosshatch: `
    linear-gradient(90deg, #d97706 50%, transparent 50%),
    linear-gradient(#f59e0b 50%, transparent 50%);
    background-size: 8px 8px;
  `,
  
  // Option 6: Circuit board pattern
  circuit: `
    linear-gradient(90deg, #d97706 2px, transparent 2px),
    linear-gradient(#f59e0b 2px, transparent 2px);
    background-size: 20px 20px;
    background-color: #fbbf24;
  `,
};

// Usage in styled component:
// background: ${backgroundStyles.dots}
