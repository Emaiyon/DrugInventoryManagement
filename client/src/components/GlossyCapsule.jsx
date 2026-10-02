import React from 'react';

/**
 * Hyper-realistic 3D translucent glossy capsule matching the uploaded reference design.
 * Features specular reflections, glass refraction, ambient neon glow, and smooth floating animations.
 */
const GlossyCapsule = ({
  color = 'cyan', // 'cyan' | 'purple' | 'emerald' | 'amber'
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'hero'
  rotation = '-35deg',
  className = '',
  animation = 'animate-float-slow', // 'animate-float-slow' | 'animate-float-reverse' | 'animate-float-tilt' | 'animate-float-small'
  style = {},
}) => {
  const sizeMap = {
    sm: 'w-24 h-9',
    md: 'w-44 h-16',
    lg: 'w-64 h-24',
    xl: 'w-80 h-32',
    hero: 'w-[420px] h-[160px]',
  };

  const colorStyles = {
    cyan: {
      gradient: 'from-emerald-300/80 via-teal-400/50 to-cyan-900/60',
      glow: 'shadow-[0_25px_60px_-10px_rgba(20,184,166,0.65)]',
      specular: 'rgba(255,255,255,0.85)',
      border: 'border-white/40',
      bottomLight: 'rgba(168,85,247,0.35)', // purple light bounce reflection
      ambientBackdrop: 'bg-teal-500/10',
    },
    purple: {
      gradient: 'from-fuchsia-300/85 via-purple-600/60 to-indigo-950/70',
      glow: 'shadow-[0_30px_70px_-10px_rgba(168,85,247,0.7)]',
      specular: 'rgba(255,255,255,0.9)',
      border: 'border-white/40',
      bottomLight: 'rgba(236,72,153,0.4)',
      ambientBackdrop: 'bg-purple-600/15',
    },
    emerald: {
      gradient: 'from-emerald-200/85 via-emerald-500/50 to-teal-950/60',
      glow: 'shadow-[0_25px_60px_-10px_rgba(16,185,129,0.6)]',
      specular: 'rgba(255,255,255,0.85)',
      border: 'border-white/40',
      bottomLight: 'rgba(6,182,212,0.35)',
      ambientBackdrop: 'bg-emerald-500/10',
    },
  };

  const chosen = colorStyles[color] || colorStyles.cyan;
  const capsuleSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`pointer-events-none select-none transition-transform ${animation} ${className}`}
      style={{
        '--rot': rotation,
        transform: `rotate(${rotation})`,
        ...style,
      }}
    >
      <div
        className={`relative rounded-full backdrop-blur-[14px] border ${chosen.border} bg-gradient-to-br ${chosen.gradient} ${chosen.glow} ${capsuleSize} overflow-hidden`}
        style={{
          boxShadow: `
            inset 2px 4px 12px rgba(255, 255, 255, 0.75),
            inset -3px -5px 14px ${chosen.bottomLight},
            inset 0 0 20px rgba(255, 255, 255, 0.25),
            0 30px 60px -15px rgba(0, 0, 0, 0.7)
          `,
        }}
      >
        {/* Top curved specular glass reflection matching the reference image */}
        <div
          className="absolute top-1.5 left-4 right-4 h-[38%] rounded-full bg-gradient-to-b from-white/90 via-white/40 to-transparent blur-[0.3px]"
          style={{ opacity: 0.9 }}
        />

        {/* Diagonal glass glare streak */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
          style={{ width: '160%', left: '-30%' }}
        />

        {/* Ambient bottom bounce light refraction */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[50%] rounded-full blur-[3px]"
          style={{
            background: `radial-gradient(ellipse at bottom, ${chosen.bottomLight} 0%, transparent 70%)`,
          }}
        />

        {/* Subtle center capsule core glow */}
        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-1/3 rounded-full bg-white/10 blur-[4px]" />
      </div>
    </div>
  );
};

export default GlossyCapsule;
