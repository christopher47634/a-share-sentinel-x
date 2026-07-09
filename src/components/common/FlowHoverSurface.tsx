'use client'

import { useRef, useState, useCallback, CSSProperties } from 'react'

interface FlowHoverSurfaceProps {
  variant?: 'card' | 'row' | 'subtle'
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function FlowHoverSurface({
  variant = 'card',
  children,
  className = '',
  disabled = false,
}: FlowHoverSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setPosition({ x, y })
    },
    [disabled]
  )

  const style: CSSProperties = {
    '--mouse-x': `${position.x}%`,
    '--mouse-y': `${position.y}%`,
  } as CSSProperties

  return (
    <div
      ref={ref}
      className={`flow-hover flow-hover--${variant} ${isHovered ? 'flow-hover--active' : ''} ${className}`}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && <div className="flow-hover__glow" />}
    </div>
  )
}
