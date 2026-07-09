'use client';
import { useEffect, useState } from 'react';

export function CursorOverlay() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.innerWidth < 768;
    
    if (isTouchDevice || prefersReduced || isSmall) {
      setMounted(true);
      return; // Don't enable cursor overlay
    }

    setEnabled(true);
    setMounted(true);

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    
    const onMove = () => {
      setVisible(true);
      document.removeEventListener('mousemove', onMove);
    };
    document.addEventListener('mousemove', onMove);

    return () => {
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mousemove', onMove);
    };
  }, []);

  // Don't render anything on server or before mount
  if (!mounted) return null;
  // Don't render on touch/mobile/reduced-motion
  if (!enabled) return null;

  return (
    <div
      className="cursor-glow-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        opacity: visible ? 1 : 0,
        transition: 'opacity 300ms ease',
        background: `radial-gradient(
          220px circle at var(--cursor-x, -200px) var(--cursor-y, -200px),
          rgba(212, 165, 116, 0.12),
          transparent 70%
        )`,
        mixBlendMode: 'soft-light',
      }}
    />
  );
}
