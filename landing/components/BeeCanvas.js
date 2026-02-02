import { useEffect, useRef } from 'react';

export default function BeeCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w, h;
    let animationId;
    let lastFrameTime = 0;
    const targetFps = 30;
    const frameDuration = 1000 / targetFps;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse tracking
    const mouse = { x: w / 2, y: h / 2 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    if (!prefersReducedMotion) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Invisible flowers for bees to hover around
    const flowers = Array.from({ length: 4 }, () => ({
      x: Math.random() * w * 0.8 + w * 0.1,
      y: Math.random() * h * 0.4 + h * 0.2,
    }));

    // Bee class
    class Bee {
      constructor(isQueen = false) {
        this.isQueen = isQueen;
        this.size = isQueen ? 26 : 18 + Math.random() * 6;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = Math.random() * 0.6 - 0.3;
        this.vy = Math.random() * 0.6 - 0.3;
        this.flower = flowers[Math.floor(Math.random() * flowers.length)];
      }

      update() {
        // Hover around flower
        this.vx += (this.flower.x - this.x) * 0.0003;
        this.vy += (this.flower.y - this.y) * 0.0003;

        // Mouse reaction
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.vx += dx * 0.002;
          this.vy += dy * 0.002;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Blur depth
        ctx.globalAlpha = this.isQueen ? 0.9 : 0.65;

        // Body
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stripes
        ctx.fillStyle = '#000';
        ctx.fillRect(-this.size * 0.4, -this.size * 0.3, this.size * 0.15, this.size * 0.6);
        ctx.fillRect(this.size * 0.1, -this.size * 0.3, this.size * 0.15, this.size * 0.6);

        // Wings
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.5, -this.size * 0.6, this.size * 0.5, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.size * 0.5, -this.size * 0.6, this.size * 0.5, this.size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // Create bees
    const isMobile = window.innerWidth < 768;
    const BEE_COUNT = isMobile ? 2 : 4;
    const bees = [];

    for (let i = 0; i < BEE_COUNT; i++) {
      bees.push(new Bee());
    }

    // Queen bee near logo
    const queen = new Bee(true);
    queen.x = w * 0.15;
    queen.y = 80;
    bees.push(queen);

    const drawFrame = () => {
      ctx.clearRect(0, 0, w, h);
      bees.forEach((b) => {
        b.update();
        b.draw();
      });
    };

    if (prefersReducedMotion) {
      drawFrame();
    } else {
      // Animation loop (throttled)
      const animate = (timestamp) => {
        if (timestamp - lastFrameTime >= frameDuration) {
          lastFrameTime = timestamp;
          drawFrame();
        }
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="beeCanvas"
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ filter: 'blur(0.4px)' }}
    />
  );
}
