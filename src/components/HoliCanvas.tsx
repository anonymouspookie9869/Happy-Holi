import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Splash {
  x: number;
  y: number;
  color: string;
  size: number;
  opacity: number;
  particles: Particle[];
  rotation: number;
  radii: number[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  rotation: number;
  vr: number;
}

const HOLI_COLORS = [
  { hex: '#FF1493', name: 'Deep Pink' },
  { hex: '#FF4500', name: 'Orange Red' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#32CD32', name: 'Lime Green' },
  { hex: '#00BFFF', name: 'Deep Sky Blue' },
  { hex: '#8A2BE2', name: 'Blue Violet' },
  { hex: '#FF69B4', name: 'Hot Pink' },
  { hex: '#00FA9A', name: 'Spring Green' },
];

interface HoliCanvasProps {
  onSplash?: () => void;
}

export const HoliCanvas: React.FC<HoliCanvasProps> = ({ onSplash }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const splashesRef = useRef<Splash[]>([]);
  const [activeColor, setActiveColor] = useState(HOLI_COLORS[0].hex);
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      splashesRef.current = splashesRef.current.filter((splash) => splash.opacity > 0.01);

      splashesRef.current.forEach((splash) => {
        // Draw the main splash "stain" - more irregular shape
        ctx.save();
        ctx.translate(splash.x, splash.y);
        ctx.rotate(splash.rotation);
        ctx.globalAlpha = splash.opacity;
        ctx.fillStyle = splash.color;
        
        // Create an irregular splash shape
        ctx.beginPath();
        splash.radii.forEach((rMult, i) => {
          const angle = (i / splash.radii.length) * Math.PI * 2;
          const r = splash.size * rMult;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Draw particles
        splash.particles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.life * splash.opacity;
          ctx.fillStyle = p.color;
          
          // Small irregular particle
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravity
          p.life -= 0.015;
          p.size *= 0.97;
          p.rotation += p.vr;
        });

        splash.particles = splash.particles.filter(p => p.life > 0);
        splash.opacity -= 0.0015; 
      });

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const createSplash = (x: number, y: number) => {
    const colorObj = HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)];
    const color = colorObj.hex;
    const particles: Particle[] = [];
    
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 3;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 6 + 2,
        life: 1,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }

    splashesRef.current.push({
      x,
      y,
      color,
      size: Math.random() * 40 + 30,
      opacity: 0.7,
      particles,
      rotation: Math.random() * Math.PI * 2,
      radii: Array.from({ length: 12 }, () => 0.7 + Math.random() * 0.6),
    });
  };

  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent) => {
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    console.log(">>> [CANVAS] Clicked at", x, y);
    createSplash(x, y);
    if (onSplash) onSplash();
  };

  return (
    <div className="fixed inset-0 z-0 pointer-events-auto cursor-crosshair">
      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="w-full h-full"
      />
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-1.5 md:gap-3 p-2.5 md:p-4 bg-white/20 backdrop-blur-xl rounded-2xl md:rounded-full border border-white/30 pointer-events-auto shadow-2xl max-w-[95vw] md:max-w-[90vw]">
        {HOLI_COLORS.map((color) => (
          <div key={color.hex} className="relative group">
            <motion.button
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveColor(color.hex)}
              onMouseEnter={() => setHoveredColor(color.name)}
              onMouseLeave={() => setHoveredColor(null)}
              className={cn(
                "w-9 h-9 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300 shadow-sm",
                activeColor === color.hex ? "border-white scale-110 md:scale-125 ring-4 ring-white/20" : "border-transparent"
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={color.name}
            />
            {/* Tooltip */}
            <div className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none",
              hoveredColor === color.name ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-95"
            )}>
              {color.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

