import { useEffect, useState } from "react";

interface VoiceWaveProps {
  isActive?: boolean;
}

const VoiceWave = ({ isActive = false }: VoiceWaveProps) => {
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    const barCount = 50; // Reduced for better performance
    const newBars = Array.from({ length: barCount }, () => Math.random() * 0.2 + 0.1);
    setBars(newBars);

    if (isActive) {
      let animationFrame: number;
      let lastTime = 0;
      const targetFPS = 30; // Limit to 30 FPS for smoother performance
      const frameInterval = 1000 / targetFPS;

      const updateBars = (currentTime: number) => {
        if (currentTime - lastTime >= frameInterval) {
          setBars(prev => prev.map((_, index) => {
            // Simpler wave calculation for better performance
            const time = Date.now() / 200;
            const wave = Math.sin(time + index * 0.2) * 0.4;
            return Math.max(0.15, Math.min(0.95, 0.3 + wave + Math.random() * 0.2));
          }));
          lastTime = currentTime;
        }
        animationFrame = requestAnimationFrame(updateBars);
      };

      animationFrame = requestAnimationFrame(updateBars);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    } else {
      // Quick fade out
      const fadeInterval = setInterval(() => {
        setBars(prev => {
          const newBars = prev.map(h => Math.max(0.1, h * 0.9));
          if (newBars.every(h => h <= 0.15)) {
            clearInterval(fadeInterval);
          }
          return newBars;
        });
      }, 100);
      
      return () => clearInterval(fadeInterval);
    }
  }, [isActive]);

  return (
    <div className="relative flex items-center justify-center gap-0.5 h-20 md:h-24 w-full">
      {/* Center line indicator */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
      
      {bars.map((height, index) => {
        const centerDistance = Math.abs(index - bars.length / 2) / (bars.length / 2);
        
        return (
          <div
            key={index}
            className="relative rounded-full will-change-[height,opacity]"
            style={{
              width: isActive ? '2.5px' : '2px',
              height: isActive ? `${height * 75 + 12}%` : "12%",
              opacity: isActive 
                ? 0.5 + (1 - centerDistance) * 0.5 
                : 0.2 + (1 - centerDistance) * 0.1,
              background: `hsl(var(--primary) / ${isActive ? (0.8 - centerDistance * 0.2) : (0.3 - centerDistance * 0.1)})`,
              boxShadow: isActive
                ? `0 0 ${6 + centerDistance * 3}px hsl(var(--primary) / ${0.4 - centerDistance * 0.15})`
                : 'none',
              transform: `translate3d(0, 0, 0)`,
              transition: isActive ? 'height 0.1s ease-out, opacity 0.1s ease-out' : 'height 0.2s ease-out, opacity 0.2s ease-out',
            }}
          />
        );
      })}
    </div>
  );
};

export default VoiceWave;
