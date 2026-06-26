import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ── Mini financial chart components ───────────────────────────────

const BAR_SETS = [
  [28, 44, 18, 36, 40, 22, 34],
  [40, 22, 50, 30, 44, 36, 28],
  [18, 38, 28, 48, 22, 42, 32],
  [44, 32, 48, 24, 40, 36, 44],
];
const COLORS_BAR = ['#7c3aed', '#a855f7', '#7c3aed', '#10b981', '#7c3aed', '#a855f7', '#6d28d9'];

const MiniBar = ({ d }: { d: number[] }) => (
  <svg width="64" height="52" viewBox="0 0 64 52" fill="none">
    {d.map((h, i) => (
      <rect key={i} x={i * 9 + 0.5} y={52 - h} width="7" height={h}
        fill={COLORS_BAR[i]} rx="1.5" opacity="0.9" />
    ))}
    <line x1="0" y1="52" x2="64" y2="52" stroke="#9333ea" strokeWidth="0.5" opacity="0.4" />
  </svg>
);

const LINE_PTS = [
  [[0,32],[10,20],[20,28],[30,12],[40,18],[50,6],[60,14]],
  [[0,14],[10,24],[20,10],[30,22],[40,8],[50,18],[60,6]],
  [[0,24],[10,12],[20,30],[30,8],[40,22],[50,14],[60,18]],
];

const MiniLine = ({ pts, id }: { pts: number[][]; id: string }) => {
  const d = pts.map(([x,y]) => `${x},${y}`).join(' ');
  const area = `M0,40 L${d.replace(/,/g,' L').split(' L').map((p,i) => pts[i]?.join(',') ?? p).join(' L')} L60,40 Z`;
  return (
    <svg width="64" height="44" viewBox="0 0 64 44" fill="none">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${d.split(' ').map((p,i) => pts[i]?.join(',') ?? p).join(' L')} L60,40 L0,40 Z`}
        fill={`url(#lg-${id})`} />
      <polyline points={d} stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
      {pts.map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="2.5" fill="#a855f7" />
      ))}
    </svg>
  );
};

const C = 100.53; // 2π × 16
const MiniDonut = ({ s1 = '#7c3aed', s2 = '#a855f7', s3 = '#10b981', p1 = 0.50, p2 = 0.30 }: {
  s1?: string; s2?: string; s3?: string; p1?: number; p2?: number;
}) => (
  <svg width="52" height="52" viewBox="0 0 52 52">
    <circle cx="26" cy="26" r="16" fill="none" strokeWidth="9" stroke="#0d0118" />
    <circle cx="26" cy="26" r="16" fill="none" strokeWidth="6.5" stroke={s1}
      strokeDasharray={`${C * p1} ${C}`} strokeDashoffset="0" transform="rotate(-90 26 26)" />
    <circle cx="26" cy="26" r="16" fill="none" strokeWidth="6.5" stroke={s2}
      strokeDasharray={`${C * p2} ${C}`} strokeDashoffset={`${-C * p1}`} transform="rotate(-90 26 26)" />
    <circle cx="26" cy="26" r="16" fill="none" strokeWidth="6.5" stroke={s3}
      strokeDasharray={`${C * (1 - p1 - p2)} ${C}`} strokeDashoffset={`${-C * (p1 + p2)}`} transform="rotate(-90 26 26)" />
  </svg>
);

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  return `M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${(a1-a0)>Math.PI?1:0},1 ${x1.toFixed(1)},${y1.toFixed(1)} Z`;
}
const MiniPie = ({ pcts = [0.42,0.28,0.18,0.12], cols = ['#7c3aed','#a855f7','#10b981','#6d28d9'] }: {
  pcts?: number[]; cols?: string[];
}) => {
  let a = -Math.PI / 2;
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      {pcts.map((p, i) => { const s = a; a += p * 2 * Math.PI; return <path key={i} d={arcPath(26,26,22,s,a)} fill={cols[i]} />; })}
    </svg>
  );
};

const MiniCalc = ({ val, lbl = 'CALC' }: { val: string; lbl?: string }) => (
  <div className="rounded-xl border border-purple-500/30 bg-gray-950/75 px-3 py-2.5 font-mono text-right backdrop-blur-sm min-w-[92px] shadow-lg shadow-purple-950/50">
    <div className="text-[8px] text-purple-600 uppercase tracking-[2px] mb-0.5">{lbl}</div>
    <div className="text-purple-200 text-sm font-bold tabular-nums">{val}</div>
  </div>
);

const MiniStatement = () => (
  <div className="font-mono text-[9px] leading-relaxed text-left min-w-[128px] backdrop-blur-sm">
    <div className="text-purple-400 font-bold text-[10px] mb-1 uppercase tracking-wider border-b border-purple-500/25 pb-0.5">
      Estado de Resultados
    </div>
    <div className="flex justify-between text-gray-500 gap-4"><span>Ingresos</span><span>Q 48,000</span></div>
    <div className="flex justify-between text-gray-500 gap-4"><span>(-) Costos</span><span>Q 12,500</span></div>
    <div className="flex justify-between text-gray-500 gap-4 mt-0.5"><span>(-) Gastos</span><span>Q 4,200</span></div>
    <div className="flex justify-between text-purple-300 font-bold border-t border-purple-500/20 mt-1 pt-0.5 gap-4">
      <span>Utilidad</span><span>Q 31,300</span>
    </div>
  </div>
);

const MiniBalance = () => (
  <div className="font-mono text-[9px] leading-relaxed text-left min-w-[120px] backdrop-blur-sm">
    <div className="text-emerald-400 font-bold text-[10px] mb-1 uppercase tracking-wider border-b border-emerald-500/25 pb-0.5">
      Balance General
    </div>
    <div className="flex justify-between text-gray-500 gap-3"><span>Total Activo</span><span>Q 95,400</span></div>
    <div className="flex justify-between text-gray-500 gap-3"><span>Pasivo</span><span>Q 28,700</span></div>
    <div className="flex justify-between text-emerald-300 font-bold border-t border-emerald-500/20 mt-1 pt-0.5 gap-3">
      <span>Capital</span><span>Q 66,700</span>
    </div>
  </div>
);

// ── Floating element definitions ────────────────────────────────

type FItem = { node: React.ReactNode; left: number; top: number; dur: number; delay: number; op: number; };

const FITEMS: FItem[] = [
  // Bar charts
  { node: <MiniBar d={BAR_SETS[0]} />, left:  3, top: 15, dur: 20, delay:  -4, op: 0.13 },
  { node: <MiniBar d={BAR_SETS[1]} />, left: 83, top: 38, dur: 25, delay: -12, op: 0.11 },
  { node: <MiniBar d={BAR_SETS[2]} />, left: 11, top: 68, dur: 18, delay: -17, op: 0.10 },
  { node: <MiniBar d={BAR_SETS[3]} />, left: 92, top: 55, dur: 23, delay:  -8, op: 0.09 },
  // Line charts
  { node: <MiniLine pts={LINE_PTS[0]} id="a" />, left:  5, top: 48, dur: 22, delay:  -6, op: 0.12 },
  { node: <MiniLine pts={LINE_PTS[1]} id="b" />, left: 77, top: 20, dur: 27, delay: -14, op: 0.10 },
  { node: <MiniLine pts={LINE_PTS[2]} id="c" />, left: 51, top: 78, dur: 21, delay: -20, op: 0.09 },
  // Donut charts
  { node: <MiniDonut />,                                                          left: 18, top: 28, dur: 24, delay:  -3, op: 0.14 },
  { node: <MiniDonut s1="#10b981" s2="#7c3aed" s3="#a855f7" p1={0.40} p2={0.35}/>, left: 72, top: 62, dur: 19, delay: -15, op: 0.12 },
  { node: <MiniDonut s1="#a855f7" s2="#6d28d9" s3="#10b981" p1={0.55} p2={0.25}/>, left: 38, top: 82, dur: 26, delay: -22, op: 0.10 },
  // Pie charts
  { node: <MiniPie />,                                                            left: 89, top:  6, dur: 26, delay:  -9, op: 0.12 },
  { node: <MiniPie pcts={[0.30,0.25,0.28,0.17]} cols={['#a855f7','#7c3aed','#10b981','#6d28d9']} />, left: 36, top: 52, dur: 21, delay: -21, op: 0.11 },
  // Amounts in Q
  { node: <span className="font-mono font-bold text-purple-300 text-sm tabular-nums">Q 12,450.00</span>, left:  8, top: 18, dur: 17, delay:  -2, op: 0.30 },
  { node: <span className="font-mono font-bold text-violet-300 text-sm tabular-nums">Q 48,000</span>,    left: 64, top: 32, dur: 19, delay:  -5, op: 0.28 },
  { node: <span className="font-mono font-bold text-purple-400 text-sm tabular-nums">Q 3,750.50</span>,  left: 22, top: 75, dur: 24, delay: -14, op: 0.25 },
  { node: <span className="font-mono font-bold text-purple-300 text-xs tabular-nums">Q 1,250.25</span>,  left: 79, top: 50, dur: 22, delay: -11, op: 0.23 },
  { node: <span className="font-mono font-bold text-purple-200 text-xs tabular-nums">= 62,400.00</span>, left:  1, top: 85, dur: 20, delay: -16, op: 0.26 },
  // Amounts in $
  { node: <span className="font-mono font-bold text-emerald-400 text-sm tabular-nums">$ 8,290</span>,    left: 79, top: 50, dur: 21, delay:  -9, op: 0.27 },
  { node: <span className="font-mono font-bold text-emerald-300 text-sm tabular-nums">$ 125,800</span>,  left: 94, top: 58, dur: 23, delay: -12, op: 0.23 },
  { node: <span className="font-mono font-bold text-teal-300 text-xs tabular-nums">$ 42,600.00</span>,   left: 56, top: 14, dur: 18, delay:  -7, op: 0.26 },
  // Operators / formulas
  { node: <span className="font-mono font-bold text-violet-400 text-base tabular-nums">÷ 1.12</span>,    left: 45, top: 12, dur: 16, delay:  -6, op: 0.30 },
  { node: <span className="font-mono font-bold text-purple-300 text-base tabular-nums">× 25%</span>,     left:  2, top: 42, dur: 19, delay: -10, op: 0.28 },
  { node: <span className="font-mono text-purple-300/80 text-xs whitespace-nowrap">Activo = Pasivo + Capital</span>, left:  2, top: 58, dur: 23, delay:  -7, op: 0.25 },
  { node: <span className="font-mono text-violet-300/80 text-xs whitespace-nowrap">ROI = U / I × 100</span>,        left: 73, top: 23, dur: 20, delay:  -1, op: 0.22 },
  { node: <span className="font-mono text-purple-200/80 text-xs whitespace-nowrap">Margen = Utilidad / Ventas</span>, left: 47, top: 70, dur: 25, delay: -18, op: 0.20 },
  { node: <span className="font-mono text-emerald-300/75 text-xs">IVA 12%</span>,                                   left: 43, top: 65, dur: 18, delay: -13, op: 0.30 },
  { node: <span className="font-mono text-purple-300/75 text-xs">ISR 25%</span>,                                    left: 60, top: 88, dur: 22, delay: -19, op: 0.28 },
  // Financial labels
  { node: <span className="text-purple-300/65 text-[10px] font-semibold tracking-[2px] uppercase whitespace-nowrap">Balance General</span>,       left: 14, top: 60, dur: 25, delay: -10, op: 0.28 },
  { node: <span className="text-violet-300/65 text-[10px] font-semibold tracking-[2px] uppercase whitespace-nowrap">Estado de Resultados</span>,  left: 86, top: 42, dur: 22, delay: -21, op: 0.23 },
  { node: <span className="text-emerald-300/65 text-[10px] font-semibold tracking-[2px] uppercase whitespace-nowrap">Flujo de Caja</span>,        left: 30, top: 26, dur: 19, delay: -14, op: 0.28 },
  { node: <span className="text-purple-300/65 text-[10px] font-semibold tracking-[2px] uppercase whitespace-nowrap">Cuentas por Cobrar</span>,    left: 49, top: 73, dur: 24, delay:  -5, op: 0.25 },
  { node: <span className="text-teal-300/65 text-[10px] font-semibold tracking-[2px] uppercase whitespace-nowrap">Libro de Ventas</span>,         left:  7, top: 32, dur: 21, delay: -16, op: 0.25 },
  // Calculator displays
  { node: <MiniCalc val="48,750.00" />,          left: 48, top: 40, dur: 22, delay: -15, op: 0.35 },
  { node: <MiniCalc val="Q 3,250" lbl="TOTAL" />, left: 27, top: 66, dur: 25, delay:  -4, op: 0.32 },
  { node: <MiniCalc val="$ 9,840.00" lbl="ISR" />, left: 85, top: 72, dur: 20, delay: -18, op: 0.30 },
  // Financial statements
  { node: <MiniStatement />, left: 69, top: 78, dur: 28, delay: -11, op: 0.22 },
  { node: <MiniBalance />,   left: 15, top: 44, dur: 26, delay:  -8, op: 0.22 },
];

// ── Hero component ─────────────────────────────────────────────────

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const [cursorGlow, setCursorGlow] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 40;

    const count = 3000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 140;
      pos[i3 + 1] = (Math.random() - 0.5) * 120;
      pos[i3 + 2] = (Math.random() - 0.5) * 100;
      const t = Math.random();
      const isEmerald = t > 0.88;
      col[i3]     = isEmerald ? 0.06 : 0.35 + t * 0.45;
      col[i3 + 1] = isEmerald ? 0.72 : 0.08 + t * 0.12;
      col[i3 + 2] = isEmerald ? 0.50 : 0.65 + t * 0.35;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    const shapes: { mesh: THREE.Mesh; rx: number; ry: number }[] = [];
    const wireMat  = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.1 });
    const wireMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.08 });
    const geos = [
      new THREE.IcosahedronGeometry(2, 0), new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(2, 0), new THREE.IcosahedronGeometry(1, 1),
    ];
    for (let i = 0; i < 10; i++) {
      const mesh = new THREE.Mesh(geos[i % geos.length], i % 5 === 0 ? wireMat2 : wireMat);
      mesh.scale.setScalar(0.8 + Math.random() * 2.5);
      mesh.position.set((Math.random()-0.5)*100, (Math.random()-0.5)*80, (Math.random()-0.5)*60-10);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      shapes.push({ mesh, rx: (Math.random()-0.5)*0.004, ry: (Math.random()-0.5)*0.006 });
      scene.add(mesh);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
      setCursorGlow({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.001;
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.015;
      shapes.forEach(({ mesh, rx, ry }) => { mesh.rotation.x += rx; mesh.rotation.y += ry; });
      camera.position.x += (mouse.current.x * 8 - camera.position.x) * 0.035;
      camera.position.y += (mouse.current.y * 6 - camera.position.y) * 0.035;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-950">

      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ── Floating financial elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {FITEMS.map((item, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              opacity: item.op,
              animation: `floatItem ${item.dur}s linear ${item.delay}s infinite`,
              willChange: 'transform, opacity',
            }}
          >
            {item.node}
          </div>
        ))}
      </div>

      {/* Gradient overlays (dim the floating elements toward center) */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/25 via-transparent to-gray-950 pointer-events-none" style={{ zIndex: 8 }} />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 via-transparent to-gray-950/60 pointer-events-none" style={{ zIndex: 8 }} />
      {/* Strong center vignette so floating elements stay on edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 9,
          background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.60) 50%, transparent 100%)',
        }}
      />

      {/* Cursor glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
          background: `radial-gradient(500px circle at ${cursorGlow.x}px ${cursorGlow.y}px, rgba(147,51,234,0.055), transparent 70%)`,
        }}
      />

      {/* Hero content */}
      <div className="relative text-center px-4 max-w-4xl mx-auto" style={{ zIndex: 20 }}>
        <div className="flex justify-center mb-8 animate-fade-in">
          <img src="/K_white.png" alt="KONTAXES" className="logo-dark h-20 w-auto drop-shadow-[0_0_40px_rgba(147,51,234,0.55)]" />
          <img src="/K_black.png" alt="KONTAXES" className="logo-light h-20 w-auto" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          de{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">números</span>
          {' '}a{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">decisiones</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 animate-fade-in">
          Contabilidad · Impuestos · Asesoría · Consultoría
          <br />
          <span className="text-gray-500 text-base">
            Potenciado por{' '}
            <span className="text-purple-400 font-semibold">Odoo</span> ·{' '}
            <span className="text-orange-400 font-semibold">IA (Claude)</span> ·{' '}
            <span className="text-emerald-400 font-semibold">FinanzIA</span> ·{' '}
            <span className="text-sky-400 font-semibold">FELSimple</span>
          </span>
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600 text-xs tracking-widest uppercase pointer-events-none" style={{ zIndex: 20 }}>
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
