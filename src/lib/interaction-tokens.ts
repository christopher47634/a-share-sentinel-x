export const interaction = {
  hoverDuration: '200ms',
  pressScale: 0.98,
  cardLift: 'translateY(-3px)',
  cardGlowOpacity: 0.18,
  rowGlowOpacity: 0.10,
  pageTransition: '280ms',
  transitionEase: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  focusRing: '0 0 0 2px var(--accent)',
  reducedMotion: '@media (prefers-reduced-motion: reduce)',
} as const;
