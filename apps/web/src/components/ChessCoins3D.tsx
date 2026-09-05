import React, { useEffect, useRef, useState } from 'react';

interface ChessCoinProps {
  symbol: string;
  name: string;
  material: 'gold' | 'obsidian' | 'platinum' | 'bronze';
  initialX: number;
  initialY: number;
  initialZ: number;
  initialRotate: number;
  scale?: number;
  parallaxSpeed: number;
  rotationSpeed?: number;
}

const COIN_MATERIALS = {
  gold: {
    base: 'from-amber-300 via-yellow-500 to-amber-700',
    border: 'border-amber-300/60',
    shadow: 'shadow-[0_20px_50px_rgba(245,158,11,0.25)]',
    glow: 'bg-amber-500/20',
    accent: 'text-amber-100',
    label: 'Golden Knight'
  },
  obsidian: {
    base: 'from-zinc-700 via-zinc-900 to-black',
    border: 'border-zinc-500/40',
    shadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.8)]',
    glow: 'bg-zinc-700/20',
    accent: 'text-zinc-200',
    label: 'Obsidian King'
  },
  platinum: {
    base: 'from-slate-200 via-zinc-400 to-slate-700',
    border: 'border-slate-300/60',
    shadow: 'shadow-[0_20px_50px_rgba(203,213,225,0.25)]',
    glow: 'bg-slate-400/20',
    accent: 'text-white',
    label: 'Platinum Queen'
  },
  bronze: {
    base: 'from-orange-400 via-amber-700 to-yellow-950',
    border: 'border-orange-400/50',
    shadow: 'shadow-[0_20px_50px_rgba(234,88,12,0.25)]',
    glow: 'bg-orange-600/20',
    accent: 'text-orange-100',
    label: 'Royal Rook'
  }
};

export const ChessCoins3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setMousePos({ 
        x: Math.max(-1, Math.min(1, x)), 
        y: Math.max(-1, Math.min(1, y)) 
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const coins: ChessCoinProps[] = [
    {
      symbol: '♞',
      name: 'Knight',
      material: 'gold',
      initialX: -160,
      initialY: -40,
      initialZ: 60,
      initialRotate: -12,
      scale: 1.15,
      parallaxSpeed: 0.18,
      rotationSpeed: 0.25
    },
    {
      symbol: '♚',
      name: 'King',
      material: 'obsidian',
      initialX: 0,
      initialY: -80,
      initialZ: 100,
      initialRotate: 6,
      scale: 1.35,
      parallaxSpeed: 0.25,
      rotationSpeed: 0.15
    },
    {
      symbol: '♛',
      name: 'Queen',
      material: 'platinum',
      initialX: 170,
      initialY: -20,
      initialZ: 70,
      initialRotate: 16,
      scale: 1.2,
      parallaxSpeed: 0.22,
      rotationSpeed: 0.3
    },
    {
      symbol: '♜',
      name: 'Rook',
      material: 'bronze',
      initialX: -260,
      initialY: 90,
      initialZ: 20,
      initialRotate: 18,
      scale: 0.95,
      parallaxSpeed: 0.12,
      rotationSpeed: -0.2
    },
    {
      symbol: '♝',
      name: 'Bishop',
      material: 'gold',
      initialX: 250,
      initialY: 100,
      initialZ: 30,
      initialRotate: -15,
      scale: 0.95,
      parallaxSpeed: 0.14,
      rotationSpeed: -0.25
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[380px] sm:h-[460px] flex items-center justify-center pointer-events-none select-none overflow-visible perspective-[1200px]"
    >
      {/* Ambient Lighting Dome */}
      <div 
        className="absolute w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-400/15 to-transparent blur-3xl pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate3d(${mousePos.x * 40}px, ${mousePos.y * 30 - scrollY * 0.08}px, -100px)`
        }}
      />

      {/* 3D Chess Coin Stage */}
      <div 
        className="relative w-full h-full flex items-center justify-center transform-gpu transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${-mousePos.y * 14}deg) rotateY(${mousePos.x * 18}deg)`
        }}
      >
        {coins.map((coin, index) => {
          const mat = COIN_MATERIALS[coin.material];
          const offsetX = coin.initialX + mousePos.x * coin.parallaxSpeed * 100;
          const offsetY = coin.initialY + mousePos.y * coin.parallaxSpeed * 80 + (scrollY * coin.parallaxSpeed * 0.4);
          const offsetZ = coin.initialZ + Math.sin(scrollY * 0.005 + index) * 15;
          const rotX = mousePos.y * -15;
          const rotY = coin.initialRotate + mousePos.x * 20 + (scrollY * (coin.rotationSpeed ?? 0.2) * 0.05);
          const rotZ = Math.sin(scrollY * 0.004 + index) * 5;

          return (
            <div
              key={coin.name}
              className="absolute transform-gpu transition-all duration-300 ease-out will-change-transform"
              style={{
                transform: `translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${coin.scale})`,
                transformStyle: 'preserve-3d'
              }}
            >
              {/* 3D Physical Coin Container */}
              <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[2px] bg-gradient-to-br ${mat.base} ${mat.shadow} border ${mat.border} backdrop-blur-xl group cursor-pointer pointer-events-auto`}>
                
                {/* Specular Edge Reflection */}
                <div 
                  className="absolute inset-0 rounded-full opacity-70 bg-gradient-to-t from-white/0 via-white/20 to-white/60 pointer-events-none" 
                  style={{
                    transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 4}px, 2px)`
                  }}
                />

                {/* Inner Beveled Rim */}
                <div className="w-full h-full rounded-full bg-gradient-to-b from-zinc-900/90 to-zinc-950/95 flex flex-col items-center justify-center p-2 border border-white/10 shadow-inner relative overflow-hidden">
                  
                  {/* Subtle Circular Radial Shimmer */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.2),transparent_70%)]" />

                  {/* 3D Chess Piece Emboss */}
                  <span 
                    className={`text-3xl sm:text-4xl font-black ${mat.accent} drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] filter transition-transform duration-200`}
                    style={{
                      transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 12px)`
                    }}
                  >
                    {coin.symbol}
                  </span>

                  {/* Tiny Engraved Subtext */}
                  <span className="text-[8px] font-mono tracking-widest uppercase font-bold text-zinc-400/80 mt-0.5">
                    {coin.name}
                  </span>
                </div>

                {/* Floating Glow Halo */}
                <div className={`absolute -inset-2 rounded-full ${mat.glow} blur-xl -z-10`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
