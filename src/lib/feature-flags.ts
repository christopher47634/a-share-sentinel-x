/**
 * Feature flag: NEXT_PUBLIC_ENABLE_CANVAS_VISUALS
 * 
 * Controls whether Canvas 2D visuals are rendered on sector cards
 * (homepage HotSectorGrid) and sector detail page hero.
 * 
 * Default: ENABLED (true)
 * Set NEXT_PUBLIC_ENABLE_CANVAS_VISUALS=false to disable.
 */
export const isCanvasVisualsEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_ENABLE_CANVAS_VISUALS !== 'false';
