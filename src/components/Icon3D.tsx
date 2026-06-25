import React, { useRef, useState } from 'react';

interface Icon3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function Icon3D({ children, className = '', intensity = 20 }: Icon3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x: -ny * intensity, y: nx * intensity });
  };

  return (
    <div
      ref={ref}
      className={`icon-3d ${className}`}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        transform: `perspective(280px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? 1.12 : 1})`,
        transition: hovered ? 'transform 0.08s linear' : 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {children}
    </div>
  );
}
