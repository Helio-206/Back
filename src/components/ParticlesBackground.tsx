import { useMemo } from 'react';
import styles from './ParticlesBackground.module.css';



function StarSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function GearSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}

function ShieldSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BookSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const SHAPES = ['star', 'gear', 'shield', 'book', 'dot'] as const;
const COLORS = ['red', 'gold', 'dark'] as const;

interface Particle {
  id: number;
  shape: typeof SHAPES[number];
  color: typeof COLORS[number];
  left: number;    // %
  top: number;     // %
  size: number;    // px
  duration: number; // s
  delay: number;   // s
  opacity: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const r = (offset: number) => seededRandom(i * 7 + offset);
    return {
      id: i,
      shape: SHAPES[Math.floor(r(0) * SHAPES.length)],
      color: COLORS[Math.floor(r(1) * COLORS.length)],
      left: r(2) * 100,
      top: r(3) * 100,
      size: 14 + Math.floor(r(4) * 22),       // 14–36 px
      duration: 14 + r(5) * 18,               // 14–32 s
      delay: -(r(6) * 20),                    // stagger start
      opacity: 0.06 + r(7) * 0.10,            // 0.06–0.16
    };
  });
}

export default function ParticlesBackground() {
  const particles = useMemo(() => generateParticles(28), []);

  return (
    <div className={styles.canvas} aria-hidden="true">
      {particles.map((p) => {
        const shapeEl = (() => {
          switch (p.shape) {
            case 'star':   return <StarSvg  size={p.size} />;
            case 'gear':   return <GearSvg  size={p.size} />;
            case 'shield': return <ShieldSvg size={p.size} />;
            case 'book':   return <BookSvg  size={p.size} />;
            case 'dot':
              return (
                <div
                  style={{
                    width:  p.size * 0.6,
                    height: p.size * 0.6,
                    borderRadius: '50%',
                    border: '1.5px solid currentColor',
                  }}
                />
              );
          }
        })();

        return (
          <span
            key={p.id}
            className={`${styles.particle} ${styles[`color_${p.color}`]}`}
            style={{
              left:              `${p.left}%`,
              top:               `${p.top}%`,
              opacity:           p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay:    `${p.delay}s`,
            }}
          >
            {shapeEl}
          </span>
        );
      })}
    </div>
  );
}
