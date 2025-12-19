import { useEffect, useRef } from "react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    const particleCount = 60; // Reduced for better performance
    const connectionDistance = 150;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1 + 0.5,
      });
    }

    let animationFrame: number;
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30 FPS
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        // Clear with lower opacity for trailing effect
        ctx.fillStyle = "rgba(10, 15, 25, 0.08)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, i) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          // Simplified particle rendering
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
          ctx.fill();

          // Optimized connection lines - only check nearby particles
          const startIdx = Math.max(0, i - 10);
          particles.slice(startIdx, i).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < connectionDistance * connectionDistance) {
              const distance = Math.sqrt(distanceSq);
              const opacity = 0.15 * (1 - distance / connectionDistance);

              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });

        lastTime = currentTime;
      }
      
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
