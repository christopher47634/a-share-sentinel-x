"use client";

import { useRef, useEffect, useCallback } from "react";

interface RoboticsCanvasProps {
  width: number;
  height: number;
  animationsEnabled?: boolean;
  hovered?: boolean;
  hoverIntensity?: number;
}

/**
 * Canvas 2D visual for Robotics — Engineering Blueprint style
 * - Clear mechanical arm structure: base → upper arm → elbow → forearm → end-effector
 * - Joint breathing: joints slowly pulse in radius (±2px, period 8-12s)
 * - Trajectory arc: dashed arc showing arm motion range, slowly draws itself
 * - Coordinate system: faint axes through base joint with tick marks
 * - Angle markings: small arc segments near base and elbow
 * - Hover: end-effector glow + positioning rectangle, joints brighten
 * - Colors: orange #f59e0b, amber #d97706
 * - Feel: engineering schematic, industrial precision
 */
export default function RoboticsCanvas({
  width,
  height,
  animationsEnabled = true,
  hovered = false,
  hoverIntensity = 0,
}: RoboticsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const timeRef = useRef(0);
  const hoveredRef = useRef(false);
  const animEnabledRef = useRef(animationsEnabled);
  const hoverIntensityRef = useRef(0);

  useEffect(() => {
    hoveredRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    animEnabledRef.current = animationsEnabled;
  }, [animationsEnabled]);

  useEffect(() => {
    hoverIntensityRef.current = hoverIntensity ?? 0;
  }, [hoverIntensity]);

  const draw = useCallback(
    (w: number, h: number, t: number, isHover: boolean, animOn: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      try {
        ctx.clearRect(0, 0, w, h);

        const orange = "#f59e0b";
        const amber = "#d97706";

        // --- Arm shadow (depth effect) ---
        const shadowOffset = 3;

        // --- Mechanical arm structure ---
        // Base joint (bottom-left area)
        const baseX = w * 0.22;
        const baseY = h * 0.72;
        const baseR = 10; // radius 10px - clearly visible

        // Elbow joint (center area)
        const elbowX = w * 0.52;
        const elbowY = h * 0.42;
        const elbowR = 8; // radius 8px - clearly visible

        // End-effector (upper-right area)
        const eeX = w * 0.78;
        const eeY = h * 0.25;
        const eeR = 6; // radius 6px - clearly visible

        // Joint breathing: pulse radius ±2px, period 8-12s
        const basePulse = animOn ? baseR + 2.0 * Math.sin(t * ((2 * Math.PI) / 10)) : baseR;
        const elbowPulse = animOn ? elbowR + 2.0 * Math.sin(t * ((2 * Math.PI) / 8) + 1.0) : elbowR;
        const eePulse = animOn ? eeR + 2.0 * Math.sin(t * ((2 * Math.PI) / 12) + 2.0) : eeR;

        // --- Arm shadow (very faint copy offset for depth) ---
        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(baseX + shadowOffset, baseY + shadowOffset);
        ctx.lineTo(elbowX + shadowOffset, elbowY + shadowOffset);
        ctx.stroke();
        ctx.strokeStyle = amber;
        ctx.beginPath();
        ctx.moveTo(elbowX + shadowOffset, elbowY + shadowOffset);
        ctx.lineTo(eeX + shadowOffset, eeY + shadowOffset);
        ctx.stroke();
        // Shadow joints
        [{ x: baseX, y: baseY, r: basePulse }, { x: elbowX, y: elbowY, r: elbowPulse }, { x: eeX, y: eeY, r: eePulse }].forEach((j) => {
          ctx.beginPath();
          ctx.arc(j.x + shadowOffset, j.y + shadowOffset, j.r, 0, Math.PI * 2);
          ctx.stroke();
        });

        // --- Coordinate system: faint axes through base joint ---
        ctx.globalAlpha = 0.10;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(w * 0.05, baseY);
        ctx.lineTo(w * 0.95, baseY);
        ctx.stroke();

        // Y-axis (vertical through base)
        ctx.beginPath();
        ctx.moveTo(baseX, h * 0.05);
        ctx.lineTo(baseX, h * 0.95);
        ctx.stroke();

        // Tick marks every ~20px along axes
        ctx.globalAlpha = 0.08;
        const tickLen = 3;
        for (let x = w * 0.10; x < w * 0.95; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, baseY - tickLen);
          ctx.lineTo(x, baseY + tickLen);
          ctx.stroke();
        }
        for (let y = h * 0.10; y < h * 0.95; y += 20) {
          ctx.beginPath();
          ctx.moveTo(baseX - tickLen, y);
          ctx.lineTo(baseX + tickLen, y);
          ctx.stroke();
        }

        // --- Angle markings near base joint ---
        const hoverAlpha = isHover ? 1.3 : 1;

        ctx.globalAlpha = 0.12 * hoverAlpha;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 1.0;

        // Angle arc at base: shows upper arm angle
        const baseAngleR = baseR * 2.5;
        const upperArmAngle = Math.atan2(elbowY - baseY, elbowX - baseX);
        const angleOffset = animOn ? Math.sin(t * ((2 * Math.PI) / 14)) * 0.05 : 0;
        ctx.beginPath();
        ctx.arc(baseX, baseY, baseAngleR, upperArmAngle - 0.4 + angleOffset, upperArmAngle + 0.4 + angleOffset, false);
        ctx.stroke();

        // Angle tick marks at base
        ctx.globalAlpha = 0.10 * hoverAlpha;
        for (let a = -0.3; a <= 0.3; a += 0.15) {
          const angle = upperArmAngle + a + angleOffset;
          ctx.beginPath();
          ctx.moveTo(baseX + Math.cos(angle) * baseAngleR, baseY + Math.sin(angle) * baseAngleR);
          ctx.lineTo(baseX + Math.cos(angle) * (baseAngleR + 4), baseY + Math.sin(angle) * (baseAngleR + 4));
          ctx.stroke();
        }

        // Angle arc at elbow
        ctx.globalAlpha = 0.12 * hoverAlpha;
        ctx.lineWidth = 1.0;
        const elbowAngleR = elbowR * 2.2;
        const forearmAngle = Math.atan2(eeY - elbowY, eeX - elbowX);
        ctx.beginPath();
        ctx.arc(elbowX, elbowY, elbowAngleR, forearmAngle - 0.3, forearmAngle + 0.3, false);
        ctx.stroke();

        // --- Trajectory arc: dashed line showing arm motion range ---
        const trajProgress = animOn
          ? (t * 0.08) % 1
          : 0.5;

        ctx.setLineDash([6, 10]);
        ctx.globalAlpha = 0.20 * hoverAlpha;
        ctx.strokeStyle = amber;
        ctx.lineWidth = 1.5;

        const trajCx = w * 0.50;
        const trajCy = h * 0.55;
        const trajRx = w * 0.32;
        const trajRy = h * 0.28;

        ctx.beginPath();
        ctx.ellipse(
          trajCx, trajCy,
          trajRx, trajRy,
          0.3,
          -Math.PI * 0.7,
          -Math.PI * 0.7 + trajProgress * Math.PI * 1.4,
          false
        );
        ctx.stroke();
        ctx.setLineDash([]);

        // --- Upper arm: line from base to elbow ---
        ctx.globalAlpha = 0.25 * hoverAlpha;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(elbowX, elbowY);
        ctx.stroke();

        // --- Forearm: line from elbow to end-effector ---
        ctx.globalAlpha = 0.22 * hoverAlpha;
        ctx.strokeStyle = amber;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(eeX, eeY);
        ctx.stroke();

        // --- End-effector crosshair ---
        const crossSize = eeR * 2;
        ctx.globalAlpha = 0.18 * hoverAlpha;
        ctx.strokeStyle = orange;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(eeX - crossSize, eeY);
        ctx.lineTo(eeX + crossSize, eeY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eeX, eeY - crossSize);
        ctx.lineTo(eeX, eeY + crossSize);
        ctx.stroke();

        // Small crosshair ticks
        const cTick = 2;
        ctx.globalAlpha = 0.14 * hoverAlpha;
        ctx.beginPath();
        ctx.moveTo(eeX - cTick, eeY - crossSize);
        ctx.lineTo(eeX + cTick, eeY - crossSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eeX - cTick, eeY + crossSize);
        ctx.lineTo(eeX + cTick, eeY + crossSize);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eeX - crossSize, eeY - cTick);
        ctx.lineTo(eeX - crossSize, eeY + cTick);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(eeX + crossSize, eeY - cTick);
        ctx.lineTo(eeX + crossSize, eeY + cTick);
        ctx.stroke();

        // --- Joint nodes (circles with breathing) ---
        const joints = [
          { x: baseX, y: baseY, r: basePulse, color: orange },
          { x: elbowX, y: elbowY, r: elbowPulse, color: amber },
          { x: eeX, y: eeY, r: eePulse, color: orange },
        ];

        joints.forEach((joint, i) => {
          const pulseAlpha = animOn
            ? 0.22 + 0.08 * Math.sin(t * ((2 * Math.PI) / 10) + i * 1.5)
            : 0.28;

          // Fill with opacity
          ctx.globalAlpha = Math.min(pulseAlpha * 0.12 * hoverAlpha + hoverIntensityRef.current * 0.04, 0.34);
          ctx.fillStyle = joint.color;
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, joint.r, 0, Math.PI * 2);
          ctx.fill();

          // Outer ring
          ctx.globalAlpha = Math.min(pulseAlpha * hoverAlpha, 0.35);
          ctx.strokeStyle = joint.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, joint.r, 0, Math.PI * 2);
          ctx.stroke();

          // Inner dot
          ctx.globalAlpha = Math.min(pulseAlpha * 0.6 * hoverAlpha, 0.30);
          ctx.fillStyle = joint.color;
          ctx.beginPath();
          ctx.arc(joint.x, joint.y, joint.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        });

        // --- Hover: end-effector glow + positioning rectangle ---
        if (isHover) {
          // End-effector glow
          const glowR = 20;
          const grad = ctx.createRadialGradient(eeX, eeY, 0, eeX, eeY, glowR);
          grad.addColorStop(0, orange);
          grad.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.38;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(eeX, eeY, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Positioning rectangle around end-effector
          const rectSize = 14;
          ctx.globalAlpha = 0.28;
          ctx.strokeStyle = amber;
          ctx.lineWidth = 1.0;
          ctx.strokeRect(eeX - rectSize, eeY - rectSize, rectSize * 2, rectSize * 2);
        }

        ctx.globalAlpha = 1;
      } catch {
        // Graceful fallback
      }
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mq.matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    if (reducedMotion || !animationsEnabled) {
      draw(width, height, 0, false, false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0]?.isIntersecting ?? false;
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    let lastTimestamp = 0;
    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isVisibleRef.current) {
        timeRef.current += delta;
        draw(
          width,
          height,
          timeRef.current,
          hoveredRef.current,
          animEnabledRef.current
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      observer.disconnect();
    };
  }, [width, height, animationsEnabled, draw]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
  );
}
