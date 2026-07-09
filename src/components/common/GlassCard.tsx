"use client";

import { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  onClick?: () => void;
  delay?: number;
}

export default function GlassCard({
  children,
  className,
  tilt = true,
  glow = true,
  onClick,
  delay = 0,
}: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -4;
      const rotY = ((x - centerX) / centerX) * 4;
      setRotateX(rotX);
      setRotateY(rotY);

      // Update glow position
      ref.current.style.setProperty("--mouse-x", `${x}px`);
      ref.current.style.setProperty("--mouse-y", `${y}px`);
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: delay * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      className={cn(
        "glass glow-card",
        onClick && "cursor-pointer",
        className
      )}
      style={{
        transform: tilt
          ? `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
          : undefined,
        transition: "transform 0.15s ease-out, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div className="relative z-10">{children}</div>
      {glow && isHovered && (
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), var(--accent-glow), transparent 40%)`,
            opacity: 0.6,
          }}
        />
      )}
    </motion.div>
  );
}
