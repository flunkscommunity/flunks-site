import React, { useEffect, useState } from 'react';

interface CustomCursorProps {
  type?: 'default' | 'retro' | 'pixel' | 'glitch';
  color?: string;
}

const CustomCursor: React.FC<CustomCursorProps> = ({ 
  type = 'retro', 
  color = '#ff69b4' 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getCursorStyle = () => {
    const baseStyle = {
      position: 'fixed' as const,
      left: position.x,
      top: position.y,
      pointerEvents: 'none' as const,
      zIndex: 9999,
      transform: 'translate(-50%, -50%)',
      transition: 'transform 0.1s ease-out',
    };

    switch (type) {
      case 'retro':
        return {
          ...baseStyle,
          width: '20px',
          height: '20px',
          background: color,
          borderRadius: '50%',
          border: '2px solid #000',
          boxShadow: isClicking 
            ? `0 0 20px ${color}, 0 0 40px ${color}` 
            : `0 0 10px ${color}`,
          transform: isClicking 
            ? 'translate(-50%, -50%) scale(1.5)' 
            : 'translate(-50%, -50%) scale(1)',
        };

      case 'pixel':
        return {
          ...baseStyle,
          width: '16px',
          height: '16px',
          background: `
            linear-gradient(45deg, 
              ${color} 25%, 
              transparent 25%, 
              transparent 75%, 
              ${color} 75%
            ),
            linear-gradient(45deg, 
              ${color} 25%, 
              transparent 25%, 
              transparent 75%, 
              ${color} 75%
            )
          `,
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0, 2px 2px',
          imageRendering: 'pixelated' as any,
          border: '1px solid #000',
          transform: isClicking 
            ? 'translate(-50%, -50%) scale(2)' 
            : 'translate(-50%, -50%) scale(1)',
        };

      case 'glitch':
        return {
          ...baseStyle,
          width: '24px',
          height: '24px',
          background: isClicking ? '#ff0000' : color,
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
          animation: isClicking ? 'glitch 0.3s infinite' : 'none',
          filter: isClicking ? 'hue-rotate(90deg)' : 'none',
        };

      default:
        return baseStyle;
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes glitch {
          0% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
          10% { clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%); }
          20% { clip-path: polygon(0% 15%, 100% 0%, 100% 100%, 0% 100%); }
          30% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 85%); }
          40% { clip-path: polygon(0% 0%, 100% 15%, 100% 100%, 0% 100%); }
          50% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
          60% { clip-path: polygon(0% 0%, 100% 0%, 100% 90%, 0% 100%); }
          70% { clip-path: polygon(0% 10%, 100% 0%, 100% 100%, 0% 100%); }
          80% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 90%); }
          90% { clip-path: polygon(0% 0%, 100% 10%, 100% 100%, 0% 100%); }
          100% { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
        }
        
        * {
          cursor: none !important;
        }
      `}</style>
      <div style={getCursorStyle()} />
    </>
  );
};

export default CustomCursor;
