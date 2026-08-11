import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringCyan, setIsHoveringCyan] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const updateCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Debounce or limit elementFromPoint for performance if needed,
      // but doing it on mousemove is usually fine for simple checks.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const computedStyle = window.getComputedStyle(el);
        const bg = computedStyle.backgroundColor;
        
        let isCyan = false;
        
        // Cyan-600 in tailwind is #0891b2 -> rgb(8, 145, 178)
        if (bg === 'rgb(8, 145, 178)' || bg === 'rgba(8, 145, 178, 1)') {
          isCyan = true;
        } else if (el.closest('.bg-cyan-600')) {
          isCyan = true;
        } else {
            // Also check text color just in case it's exposed to cyan-600 text
            const color = computedStyle.color;
            if (color === 'rgb(8, 145, 178)' || color === 'rgba(8, 145, 178, 1)') {
                isCyan = true;
            } else if (el.closest('.text-cyan-600')) {
                isCyan = true;
            }
        }
        
        setIsHoveringCyan(isCyan);
      }
    };

    const handleMouseMove = (e) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => updateCursor(e));
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-[9999] rounded-full transition-colors duration-150"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '24px',
        height: '24px',
        transform: 'translate(-50%, -50%)',
        backgroundColor: isHoveringCyan ? '#ffffff' : '#0891b2',
        // Optional: add a slight shadow when white so it's visible on other light bg if overlap happens
        boxShadow: isHoveringCyan ? '0 0 4px rgba(0,0,0,0.1)' : 'none',
        // Ensure it stays on top and ignores pointer events
        pointerEvents: 'none'
      }}
    />
  );
}
