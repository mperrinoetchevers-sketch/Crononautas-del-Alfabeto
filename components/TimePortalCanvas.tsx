'use client';

import React, { useEffect, useRef } from 'react';

interface TimePortalCanvasProps {
  eraColor?: string; // 'emerald' | 'amber' | 'purple' | 'cyan' | 'pink'
  speedMultiplier?: number;
  className?: string;
}

export default function TimePortalCanvas({
  eraColor = 'purple',
  speedMultiplier = 1,
  className = '',
}: TimePortalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes per era
    const colorMap: Record<string, string[]> = {
      emerald: ['#10b981', '#34d399', '#6ee7b7', '#059669', '#a7f3d0'],
      amber: ['#f59e0b', '#fbbf24', '#fde68a', '#d97706', '#fef3c7'],
      purple: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#ddd6fe'],
      cyan: ['#06b6d4', '#22d3ee', '#67e8f9', '#0891b2', '#cffafe'],
      pink: ['#ec4899', '#f472b6', '#fbcfe8', '#db2777', '#fdf2f8'],
    };

    const colors = colorMap[eraColor] || colorMap.purple;

    // Particle system
    const numParticles = 60;
    const particles = Array.from({ length: numParticles }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * (Math.min(width, height) * 0.45);
      return {
        angle,
        radius,
        baseRadius: radius,
        speed: (0.005 + Math.random() * 0.015) * speedMultiplier,
        size: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.3 + Math.random() * 0.7,
        pulse: Math.random() * Math.PI,
      };
    });

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw Center Glow Vortex
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, Math.min(width, height) * 0.45);
      gradient.addColorStop(0, colors[1] + '55');
      gradient.addColorStop(0.4, colors[0] + '22');
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Spiral Rings
      rotationAngle += 0.003 * speedMultiplier;
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.arc(0, 0, (Math.min(width, height) * 0.25) * (0.5 + r * 0.35), 0, Math.PI * 2);
        ctx.strokeStyle = colors[r % colors.length] + '33';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 12]);
        ctx.stroke();
      }
      ctx.restore();

      // Update and Draw Particles
      particles.forEach((p) => {
        p.angle += p.speed;
        p.pulse += 0.04;
        const currentRadius = p.radius + Math.sin(p.pulse) * 8;

        const x = centerX + Math.cos(p.angle) * currentRadius;
        const y = centerY + Math.sin(p.angle) * currentRadius;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [eraColor, speedMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full pointer-events-none rounded-2xl ${className}`}
    />
  );
}
