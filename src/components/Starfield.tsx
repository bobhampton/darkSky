import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
}

interface StarfieldProps {
  starCount?: number;
  starSpeed?: number;
  starColor?: string;
  enabled?: boolean;
}

/**
 * Canvas-based animated starfield background
 * Renders drifting stars with edge bouncing behavior
 */
export function Starfield({
  starCount = 120,
  starSpeed = 1,
  starColor = '#ffffff',
  enabled = true,
}: StarfieldProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationIdRef = useRef<number | undefined>(undefined);

  // Initialize canvas and start animation
  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    // Generate stars
    const generateStars = () => {
      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          dx: (Math.random() - 0.5) * 0.2 * starSpeed,
          dy: (Math.random() - 0.5) * 0.2 * starSpeed,
        });
      }
    };
    generateStars();

    // Animation loop
    const animateStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = starColor;

      starsRef.current.forEach((star) => {
        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        star.x += star.dx;
        star.y += star.dy;

        // Bounce off edges
        if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
        if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
      });

      animationIdRef.current = requestAnimationFrame(animateStars);
    };

    animateStars();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      generateStars();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, starCount, starSpeed, starColor]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}
