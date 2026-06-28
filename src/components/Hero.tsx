import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// ── Mini financial chart components ───────────────────────────────

const BAR_SETS = [
  [42, 66, 28, 55, 60, 33, 50],
  [60, 33, 75, 46, 66, 55, 42],
  [28, 57, 42, 72, 33, 64, 48],
  [66, 48, 72, 36, 60, 55, 66],
];
const COLORS_BAR = ['#7c3aed', '#a855f7', '#7c3aed', '#10b981', '#7c3aed', '#a855f7', '#6d28d9'];

const MiniBar = ({ d }: { d: number[] }) => (
  <svg width="95" height="78" viewBox="0 0 95 78" fill="none">
    {d.map((h, i) => (
      <rect key={i} x={i * 14 + 0.5} y={78 - h} width="11" height={h}
        fill={COLORS_BAR[i]} rx="2.5" opacity="0.92" />
    ))}
    <line x1="0" y1="78" x2="95" y2="78" stroke="#9333ea" strokeWidth="0.8" opacity="0.4" />
  </svg>
);

const LINE_PTS = [
  [[0,48],[14,30],[28,42],[42,17],[56,26],[70,8],[84,20]],
  [[0,20],[14,36],[28,15],[42,32],[56,11],[70,26],[84,9]],
  [[0,34],[14,18],[28,44],[42,11],[56,32],[70,20],[84,26]],
];

const MiniLine = ({ pts, id }: { pts: number[][]; id: string }) => {
  const points = pts.map(([x,y]) => `${x},${y}`).join(' ');
  const areaPath = `M${pts[0][0]},58 ` + pts.map(([x,y]) => `L${x},${y}`).join(' ') + ` L${pts[pts.length-1][0]},58 Z`;
  return (
    <svg width="90" height="65" viewBox="0 0 90 65" fill="none">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#lg-${id})`} />
      <polyline points={points} stroke="#a855f7" strokeWidth="2.8" strokeLinejoin="round" />
      {pts.map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#a855f7" />
      ))}
    </svg>
  );
};

const C = 138.2; // 2π × 22
const MiniDonut = ({ s1 = '#7c3aed', s2 = '#a855f7', s3 = '#10b981', p1 = 0.50, p2 = 0.30 }: {
  s1?: string; s2?: string; s3?: string; p1?: number; p2?: number;
}) => (
  <svg width="76" height="76" viewBox="0 0 76 76">
    <circle cx="38" cy="38" r="22" fill="none" strokeWidth="13" stroke="rgba(147,51,234,0.14)" />
    <circle cx="38" cy="38" r="22" fill="none" strokeWidth="10" stroke={s1}
      strokeDasharray={`${C * p1} ${C}`} strokeDashoffset="0" transform="rotate(-90 38 38)" />
    <circle cx="38" cy="38" r="22" fill="none" strokeWidth="10" stroke={s2}
      strokeDasharray={`${C * p2} ${C}`} strokeDashoffset={`${-C * p1}`} transform="rotate(-90 38 38)" />
    <circle cx="38" cy="38" r="22" fill="none" strokeWidth="10" stroke={s3}
      strokeDasharray={`${C * (1 - p1 - p2)} ${C}`} strokeDashoffset={`${-C * (p1 + p2)}`} transform="rotate(-90 38 38)" />
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
    <svg width="76" height="76" viewBox="0 0 76 76">
      {pcts.map((p, i) => { const s = a; a += p * 2 * Math.PI; return <path key={i} d={arcPath(38,38,32,s,a)} fill={cols[i]} />; })}
    </svg>
  );
};

const MiniCalc = ({ val, lbl = 'CALC' }: { val: string; lbl?: string }) => (
  <div style={{
    borderRadius: 14, border: '1px solid rgba(167,139,250,0.45)',
    padding: '9px 16px', fontFamily: 'monospace', textAlign: 'right', minWidth: 126,
  }}>
    <div style={{ fontSize: 9, color: '#c084fc', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 3 }}>{lbl}</div>
    <div style={{ color: '#f3e8ff', fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>{val}</div>
  </div>
);

const MiniStatement = () => (
  <div style={{ fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.7, minWidth: 156 }}>
    <div style={{ color: '#c084fc', fontWeight: 800, fontSize: 11.5, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.2, borderBottom: '1px solid rgba(147,51,234,0.3)', paddingBottom: 3 }}>
      Estado de Resultados
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa', gap: 18 }}><span>Ingresos</span><span>Q 48,000</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa', gap: 18 }}><span>(-) Costos</span><span>Q 12,500</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a78bfa', gap: 18 }}><span>(-) Gastos</span><span>Q 4,200</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f3e8ff', fontWeight: 800, borderTop: '1px solid rgba(147,51,234,0.3)', marginTop: 3, paddingTop: 3, gap: 18 }}>
      <span>Utilidad</span><span>Q 31,300</span>
    </div>
  </div>
);

const MiniBalance = () => (
  <div style={{ fontFamily: 'monospace', fontSize: 10.5, lineHeight: 1.7, minWidth: 148 }}>
    <div style={{ color: '#34d399', fontWeight: 800, fontSize: 11.5, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.2, borderBottom: '1px solid rgba(16,185,129,0.3)', paddingBottom: 3 }}>
      Balance General
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ee7b7', gap: 14 }}><span>Total Activo</span><span>Q 95,400</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6ee7b7', gap: 14 }}><span>Pasivo</span><span>Q 28,700</span></div>
    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a7f3d0', fontWeight: 800, borderTop: '1px solid rgba(16,185,129,0.3)', marginTop: 3, paddingTop: 3, gap: 14 }}>
      <span>Capital</span><span>Q 66,700</span>
    </div>
  </div>
);

// ── Brand logos — real GIF/PNG files ────────────────────────────────

const LogoAnthropicOrb = () => (
  <img src="/logo-claude.gif" alt="Claude" style={{ height: 72, width: 'auto', display: 'block' }} />
);

const LogoClaude = () => (
  <img src="/logo-claude.gif" alt="Claude" style={{ height: 56, width: 'auto', display: 'block' }} />
);

const LogoOdoo = () => (
  <img src="/logo-odoo.gif" alt="Odoo" style={{ height: 64, width: 'auto', display: 'block' }} />
);

const LogoFinanzIA = () => (
  <img src="/logo-finanz-ia.png" alt="FinanzIA" style={{ height: 48, width: 'auto', display: 'block' }} />
);

// ── Floating element definitions ────────────────────────────────

type FItem = { node: React.ReactNode; left: number; top: number; dur: number; delay: number; op: number; };

const FITEMS: FItem[] = [
  // Bar charts
  { node: <MiniBar d={BAR_SETS[0]} />, left:  2, top: 12, dur: 11, delay:  -3, op: 0.48 },
  { node: <MiniBar d={BAR_SETS[1]} />, left: 84, top: 35, dur: 13, delay:  -7, op: 0.42 },
  { node: <MiniBar d={BAR_SETS[2]} />, left:  8, top: 65, dur: 10, delay:  -9, op: 0.40 },
  { node: <MiniBar d={BAR_SETS[3]} />, left: 90, top: 52, dur: 12, delay:  -2, op: 0.38 },
  // Line charts
  { node: <MiniLine pts={LINE_PTS[0]} id="a" />, left:  4, top: 44, dur: 12, delay:  -5, op: 0.45 },
  { node: <MiniLine pts={LINE_PTS[1]} id="b" />, left: 78, top: 18, dur: 14, delay:  -8, op: 0.40 },
  { node: <MiniLine pts={LINE_PTS[2]} id="c" />, left: 50, top: 75, dur: 11, delay: -11, op: 0.38 },
  // Donut charts
  { node: <MiniDonut />, left: 17, top: 24, dur: 13, delay:  -2, op: 0.52 },
  { node: <MiniDonut s1="#10b981" s2="#7c3aed" s3="#a855f7" p1={0.40} p2={0.35}/>, left: 74, top: 60, dur: 10, delay:  -8, op: 0.46 },
  { node: <MiniDonut s1="#a855f7" s2="#6d28d9" s3="#10b981" p1={0.55} p2={0.25}/>, left: 37, top: 80, dur: 14, delay: -12, op: 0.40 },
  // Pie charts
  { node: <MiniPie />, left: 88, top:  5, dur: 13, delay:  -4, op: 0.46 },
  { node: <MiniPie pcts={[0.30,0.25,0.28,0.17]} cols={['#a855f7','#7c3aed','#10b981','#6d28d9']} />, left: 35, top: 50, dur: 11, delay: -11, op: 0.42 },
  // Amounts Q
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c084fc', fontSize: 17 }}>Q 12,450.00</span>, left:  7, top: 16, dur:  9, delay:  -1, op: 0.70 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#a78bfa', fontSize: 17 }}>Q 48,000</span>,    left: 65, top: 30, dur: 10, delay:  -4, op: 0.65 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c084fc', fontSize: 15 }}>Q 3,750.50</span>,  left: 20, top: 72, dur: 13, delay:  -7, op: 0.60 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#d8b4fe', fontSize: 14 }}>Q 1,250.25</span>,  left: 80, top: 48, dur: 11, delay:  -6, op: 0.58 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#e9d5ff', fontSize: 14 }}>= 62,400.00</span>, left:  1, top: 82, dur: 10, delay:  -9, op: 0.60 },
  // Amounts $
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#34d399', fontSize: 17 }}>$ 8,290</span>,   left: 76, top: 46, dur: 11, delay:  -3, op: 0.65 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#6ee7b7', fontSize: 15 }}>$ 125,800</span>, left: 93, top: 56, dur: 12, delay:  -6, op: 0.58 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#5eead4', fontSize: 14 }}>$ 42,600.00</span>, left: 55, top: 12, dur:  9, delay:  -2, op: 0.62 },
  // Operators / formulas
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#a78bfa', fontSize: 18 }}>÷ 1.12</span>, left: 44, top: 10, dur:  9, delay:  -5, op: 0.70 },
  { node: <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c084fc', fontSize: 18 }}>× 25%</span>,  left:  1, top: 38, dur: 10, delay:  -4, op: 0.65 },
  { node: <span style={{ fontFamily: 'monospace', color: '#a78bfa', fontSize: 13, whiteSpace: 'nowrap' }}>Activo = Pasivo + Capital</span>, left:  1, top: 55, dur: 12, delay:  -3, op: 0.60 },
  { node: <span style={{ fontFamily: 'monospace', color: '#c084fc', fontSize: 13, whiteSpace: 'nowrap' }}>ROI = Utilidad / Inversión × 100</span>, left: 70, top: 22, dur: 11, delay:  -1, op: 0.55 },
  { node: <span style={{ fontFamily: 'monospace', color: '#e9d5ff', fontSize: 13, whiteSpace: 'nowrap' }}>Margen = Utilidad / Ventas</span>, left: 46, top: 68, dur: 13, delay: -10, op: 0.55 },
  { node: <span style={{ fontFamily: 'monospace', color: '#34d399', fontSize: 13 }}>IVA 12%</span>, left: 42, top: 62, dur:  9, delay:  -7, op: 0.70 },
  { node: <span style={{ fontFamily: 'monospace', color: '#c084fc', fontSize: 13 }}>ISR 25%</span>, left: 59, top: 85, dur: 11, delay: -10, op: 0.68 },
  // Financial labels
  { node: <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Balance General</span>,       left: 13, top: 58, dur: 13, delay:  -5, op: 0.65 },
  { node: <span style={{ color: '#c084fc', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Estado de Resultados</span>,  left: 85, top: 40, dur: 11, delay: -12, op: 0.58 },
  { node: <span style={{ color: '#34d399', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Flujo de Caja</span>,        left: 29, top: 23, dur: 10, delay:  -8, op: 0.65 },
  { node: <span style={{ color: '#a78bfa', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Cuentas por Cobrar</span>,   left: 48, top: 70, dur: 12, delay:  -2, op: 0.60 },
  { node: <span style={{ color: '#5eead4', fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Libro de Ventas</span>,      left:  6, top: 30, dur: 11, delay:  -9, op: 0.60 },
  // Calculator displays
  { node: <MiniCalc val="48,750.00" />,            left: 47, top: 38, dur: 12, delay:  -8, op: 0.70 },
  { node: <MiniCalc val="Q 3,250" lbl="TOTAL" />,  left: 26, top: 63, dur: 13, delay:  -2, op: 0.65 },
  { node: <MiniCalc val="$ 9,840.00" lbl="ISR" />, left: 84, top: 70, dur: 10, delay: -10, op: 0.62 },
  // Financial statements
  { node: <MiniStatement />, left: 68, top: 76, dur: 14, delay:  -6, op: 0.55 },
  { node: <MiniBalance />,   left: 14, top: 42, dur: 13, delay:  -4, op: 0.55 },
  // Brand logos — no card backgrounds
  { node: <LogoAnthropicOrb />, left:  4, top: 47, dur: 10, delay:  -2, op: 0.75 },
  { node: <LogoAnthropicOrb />, left: 86, top: 14, dur: 13, delay:  -9, op: 0.68 },
  { node: <LogoClaude />,       left:  3, top: 77, dur: 12, delay:  -5, op: 0.72 },
  { node: <LogoClaude />,       left: 72, top: 54, dur: 11, delay:  -1, op: 0.68 },
  { node: <LogoOdoo />,         left: 78, top:  8, dur: 13, delay: -11, op: 0.70 },
  { node: <LogoOdoo />,         left:  1, top: 62, dur: 10, delay:  -6, op: 0.66 },
  { node: <LogoFinanzIA />,     left: 51, top:  4, dur: 12, delay:  -7, op: 0.74 },
  { node: <LogoFinanzIA />,     left: 85, top: 70, dur: 11, delay:  -3, op: 0.68 },
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
    <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-950">

      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="hero-canvas absolute inset-0 w-full h-full" />

      {/* ── Floating financial elements ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5 }}>
        {FITEMS.map((item, i) => (
          /* Outer div: position + opacity cap (not animated) */
          <div key={i} className="absolute" style={{ left: `${item.left}%`, top: `${item.top}%`, opacity: item.op }}>
            {/* Inner div: animation only — keyframes control opacity 0→1→1→0 */}
            <div style={{
              animation: `floatItem ${item.dur}s ease-in-out ${item.delay}s infinite`,
              willChange: 'transform, opacity',
            }}>
              {item.node}
            </div>
          </div>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="hero-grad-b absolute inset-0 pointer-events-none" style={{ zIndex: 8 }} />
      <div className="hero-grad-r absolute inset-0 pointer-events-none" style={{ zIndex: 8 }} />
      {/* Center vignette */}
      <div className="hero-vignette absolute inset-0 pointer-events-none" style={{ zIndex: 9 }} />

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
