'use client';
import { useCallback, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  color?: string;
}

export function ClickRipple({ children, className = '', color = 'rgba(212,165,116,0.3)' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: ${color};
      transform: translate(-50%, -50%);
      pointer-events: none;
      animation: ripple-expand 600ms ease-out forwards;
    `;
    
    containerRef.current.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  }, [color]);

  return (
    <div
      ref={containerRef}
      className={`click-ripple-container ${className}`}
      onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {children}
    </div>
  );
}
