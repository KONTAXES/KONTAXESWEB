import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CheckIcon, ChevronRightIcon, ZapIcon, BarChart3Icon, FileCheckIcon,
  DatabaseIcon, TrendingUpIcon, FileTextIcon, LayoutDashboardIcon,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────── */
const cards = [
  {
    id: 'ktx',
    name: 'Odoo + IA + Módulos KTX',
    short: 'Stack Principal',
    emoji: '⚡',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/8',
    glow: 'bg-purple-600/25',
    glow2: 'bg-violet-600/15',
    text: 'text-purple-400',
    badge: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    ring: 'ring-purple-500/30',
    activeBg: 'from-purple-900/40 to-violet-900/30',
    icon: ZapIcon,
    tagline: 'ERP · Inteligencia Artificial · Guatemala',
    description:
      'La combinación más potente para contabilidad moderna: Odoo 19 como ERP base, Claude AI para análisis inteligente, y nuestros módulos desarrollados exclusivamente para el mercado guatemalteco (SAT, FEL, RTU).',
    features: [
      'Odoo 19 — ERP líder mundial',
      'Claude AI para clasificación y análisis',
      'Módulos SAT & FEL Guatemala nativos',
      'Libros de IVA y reportes locales automáticos',
      'Multi-empresa · Multi-moneda GTQ',
    ],
  },
  {
    id: 'finanzIA',
    name: 'FinanzIA',
    short: 'Plataforma de terceros',
    emoji: '📈',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/8',
    glow: 'bg-emerald-600/20',
    glow2: 'bg-teal-600/12',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    ring: 'ring-emerald-500/30',
    activeBg: 'from-emerald-900/30 to-teal-900/20',
    icon: BarChart3Icon,
    tagline: 'finanzia.gt · Software contable con IA',
    description:
      'FinanzIA es una plataforma de terceros (finanzia.gt) que integramos en nuestras operaciones. Automatiza la contabilidad con IA para Guatemala: clasifica documentos, genera libros contables y detecta riesgos fiscales — para contadores y empresas.',
    features: [
      'Clasificación automática de documentos con IA',
      'Generación de libros contables automatizada',
      'Detección de riesgos fiscales',
      'Software contable diseñado para Guatemala',
      'Plataforma externa — finanzia.gt',
    ],
  },
  {
    id: 'felsimple',
    name: 'FELSimple',
    short: 'Convenio de colaboración',
    emoji: '🧾',
    border: 'border-sky-500/40',
    bg: 'bg-sky-500/8',
    glow: 'bg-sky-600/20',
    glow2: 'bg-cyan-600/12',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
    ring: 'ring-sky-500/30',
    activeBg: 'from-sky-900/30 to-cyan-900/20',
    icon: FileCheckIcon,
    tagline: 'felsimple.com · Facturá desde WhatsApp',
    description:
      'FELSimple (felsimple.com) es una plataforma de terceros con la que KONTAXES tiene convenio de colaboración. Permite emitir facturas FEL certificadas por la SAT directamente desde WhatsApp en 15 segundos — sin apps, sin portales, para pequeños contribuyentes.',
    features: [
      'FEL certificada por SAT desde WhatsApp',
      'Factura emitida en menos de 15 segundos',
      'Sin apps ni portales adicionales',
      'Recordatorios de declaración SAT-2046',
      'Validación de NIT en tiempo real',
    ],
  },
];

const odooFeatures = [
  {
    title: 'En KONTAXES, trabajamos con Odoo',
    description: 'Una potente plataforma de gestión empresarial que nos permite llevar cada contabilidad con precisión, eficiencia y transparencia.',
    icon: DatabaseIcon,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
  {
    title: 'Información confiable y actualizada',
    description: 'Esto nos permite ofrecerte información financiera confiable, actualizada y accesible, facilitando la toma de decisiones estratégicas.',
    icon: TrendingUpIcon,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Enfócate en crecer',
    description: 'Tú te concentras en hacer crecer tu empresa, y nosotros nos encargamos de que tus números siempre estén al día.',
    icon: FileTextIcon,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
];

const demos = [
  { id: 'invoice',        label: 'Ingresar Factura',     icon: FileTextIcon },
  { id: 'reconciliation', label: 'Conciliación Bancaria', icon: DatabaseIcon },
  { id: 'reports',        label: 'Reportería',            icon: TrendingUpIcon },
  { id: 'dashboard',      label: 'Dashboard',             icon: LayoutDashboardIcon },
];

/* ─── Odoo 3D Sphere ────────────────────────────────── */
function OdooSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement?.clientWidth || 400;
    const H = canvas.parentElement?.clientHeight || 400;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 7;
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.2 });
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), sphereMat);
    scene.add(sphere);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0x1a0533, transparent: true, opacity: 0.8 })));
    const dotCount = 120;
    const dp = new Float32Array(dotCount * 3);
    const dc = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const r = 3 + Math.random() * 0.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      dp[i*3] = r * Math.sin(phi) * Math.cos(theta);
      dp[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      dp[i*3+2] = r * Math.cos(phi);
      const e = Math.random() > 0.7;
      dc[i*3] = e ? 0.06 : 0.58; dc[i*3+1] = e ? 0.73 : 0.20; dc[i*3+2] = e ? 0.51 : 0.92;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dg.setAttribute('color', new THREE.Float32BufferAttribute(dc, 3));
    const dots = new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.07, vertexColors: true }));
    scene.add(dots);
    ['📊', '💼', '🖨️', '📋', '🔄', '📈'].forEach((emoji, i) => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sprite.scale.set(0.7, 0.7, 1);
      const angle = (i / 6) * Math.PI * 2;
      sprite.position.set(4 * Math.cos(angle), (Math.random() - 0.5) * 2.5, 4 * Math.sin(angle));
      scene.add(sprite);
    });
    let t = 0; let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate); t += 0.005;
      sphere.rotation.y = t * 0.4; sphere.rotation.x = t * 0.12;
      dots.rotation.y = t * 0.55;
      renderer.render(scene, camera);
    };
    animate();
    const ro = new ResizeObserver(() => {
      const w = canvas.parentElement?.clientWidth || 400;
      const h = canvas.parentElement?.clientHeight || 400;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    });
    ro.observe(canvas.parentElement!);
    return () => { cancelAnimationFrame(animId); renderer.dispose(); ro.disconnect(); };
  }, []);
  return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ─── Local reveal hook ─────────────────────────────── */
function useLocalReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.05 }
    );
    el.querySelectorAll('.reveal').forEach((node) => obs.observe(node));
    return () => obs.disconnect();
  }, []);
}

/* ─── Main component ────────────────────────────────── */
export function TechStack() {
  const [active, setActive]     = useState(0);
  const [activeDemo, setActiveDemo] = useState('invoice');
  const sectionRef = useRef<HTMLElement>(null);
  useLocalReveal(sectionRef);

  const card = cards[active];

  return (
    <section ref={sectionRef} id="herramientas" className="py-20 bg-gray-950 relative overflow-hidden">

      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-800/8 rounded-full blur-3xl orb-float" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-800/8 rounded-full blur-3xl orb-float-reverse" />
        <div className="absolute top-10 right-10 w-48 h-48 bg-sky-800/6 rounded-full blur-3xl orb-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* ── Section header ── */}
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
            <ZapIcon size={11} className="text-yellow-400" />
            Plataforma Tecnológica
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Herramientas que{' '}
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              nos diferencian
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Stack propio diseñado para contabilidad de siguiente nivel en Guatemala.
          </p>
        </div>

        {/* ── 3 Interactive cards ── */}
        <div className="reveal flex flex-col sm:flex-row justify-center gap-3 mb-10">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={`group flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 border ${
                active === i
                  ? `${c.bg} ${c.border} ${c.text} shadow-lg ring-1 ${c.ring} scale-[1.02]`
                  : 'bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:bg-white/6 hover:border-white/15'
              }`}
            >
              <span className="text-lg">{c.emoji}</span>
              <span>{c.name}</span>
              {active === i && <ChevronRightIcon size={14} className="ml-auto" />}
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="reveal mb-20">
          <div className={`relative rounded-2xl border ${card.border} overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${card.activeBg} pointer-events-none`} />
            <div className={`absolute -top-16 -right-16 w-64 h-64 ${card.glow} rounded-full blur-3xl pointer-events-none`} />
            <div className={`absolute -bottom-16 -left-16 w-48 h-48 ${card.glow2} rounded-full blur-3xl pointer-events-none`} />

            <div className="relative p-8 md:p-10 grid md:grid-cols-2 gap-10 items-start">
              {/* Left */}
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wider mb-5 ${card.badge}`}>
                  <span>{card.emoji}</span>
                  {card.tagline}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {card.name}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed">{card.description}</p>
              </div>

              {/* Right — Features */}
              <div className="space-y-2.5">
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${card.text}`}>Incluye</p>
                {card.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${card.bg} border ${card.border}`}>
                      <CheckIcon size={12} className={card.text} />
                    </div>
                    <span className="text-gray-300 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dot navigation */}
            <div className="relative px-8 pb-6 flex items-center gap-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`transition-all duration-300 rounded-full ${
                    active === i ? `w-6 h-2 ${card.bg} border ${card.border}` : 'w-2 h-2 bg-white/15 hover:bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="reveal flex items-center gap-4 mb-14">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <DatabaseIcon size={13} className="text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Odoo en acción</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* ── Odoo sphere + features ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="reveal order-2 lg:order-1 h-80 lg:h-[450px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent rounded-3xl" />
            <OdooSphere />
          </div>

          <div className="reveal reveal-delay-1 order-1 lg:order-2">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Tecnología</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Herramientas<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Odoo</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">Tecnología de clase mundial para tu contabilidad</p>
            <div className="space-y-4">
              {odooFeatures.map((f, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${f.color} transition-all hover:scale-[1.01]`}>
                  <f.icon className={`w-8 h-8 flex-shrink-0 ${f.color.split(' ')[0]}`} />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Demo tabs ── */}
        <div className="reveal">
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {demos.map((demo) => (
              <button key={demo.id} onClick={() => setActiveDemo(demo.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  activeDemo === demo.id
                    ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20 scale-105'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <demo.icon size={16} />
                <span>{demo.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white/3 rounded-2xl border border-white/8 p-6 md:p-8">
            {activeDemo === 'invoice' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Módulo de Contabilidad — Ingresar Factura</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Proveedor',         placeholder: 'Seleccionar proveedor...' },
                    { label: 'Fecha de Factura',  placeholder: '', type: 'date' },
                    { label: 'Número de Factura', placeholder: 'FAC-001' },
                    { label: 'Monto Total',       placeholder: 'Q 1,000.00' },
                  ].map((f, i) => (
                    <div key={i}>
                      <label className="block text-xs font-semibold text-gray-400 mb-1.5">{f.label}</label>
                      <input type={f.type || 'text'} placeholder={f.placeholder} readOnly
                        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm focus:outline-none" />
                    </div>
                  ))}
                </div>
                <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg text-sm">Guardar Factura</button>
              </div>
            )}

            {activeDemo === 'reconciliation' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Conciliación Bancaria</h3>
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-purple-500/10 border-b border-purple-500/20">
                      <tr>{['Fecha','Descripción','Débito','Crédito','Estado'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-gray-300">15/01/2024</td>
                        <td className="px-4 py-3 text-gray-300">Pago Cliente A</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">Q 5,000.00</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-full text-xs font-semibold">Conciliado</span></td>
                      </tr>
                      <tr className="hover:bg-white/3 transition-colors">
                        <td className="px-4 py-3 text-gray-300">16/01/2024</td>
                        <td className="px-4 py-3 text-gray-300">Pago Proveedor B</td>
                        <td className="px-4 py-3 text-gray-500">—</td>
                        <td className="px-4 py-3 text-red-400 font-semibold">Q 2,500.00</td>
                        <td className="px-4 py-3"><span className="px-2.5 py-1 bg-yellow-500/15 text-yellow-400 rounded-full text-xs font-semibold">Pendiente</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeDemo === 'reports' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Generación de Reportes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: 'Balance General',       desc: 'Estado de situación financiera al cierre del período' },
                    { title: 'Estado de Resultados',  desc: 'Ingresos, costos y utilidades del período' },
                    { title: 'Libro Diario',          desc: 'Registro cronológico de todas las operaciones' },
                    { title: 'Libro Mayor',           desc: 'Movimientos por cuenta contable' },
                  ].map((r, i) => (
                    <div key={i} className="p-5 rounded-xl bg-white/3 border border-white/8 hover:border-purple-500/30 transition-all group cursor-pointer">
                      <h4 className="font-bold text-white mb-1.5 text-sm">{r.title}</h4>
                      <p className="text-gray-400 text-xs mb-4">{r.desc}</p>
                      <button className="px-3 py-1.5 bg-purple-600/20 text-purple-400 rounded-lg text-xs font-semibold group-hover:bg-purple-600/40 transition-all">Generar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDemo === 'dashboard' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Dashboard — Tablero de Control</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Ingresos del Mes', value: 'Q 45,230', change: '↑ 12%', cls: 'bg-blue-500/8 border-blue-500/15 text-blue-400' },
                    { label: 'Gastos del Mes',   value: 'Q 28,450', change: '↑ 5%',  cls: 'bg-emerald-500/8 border-emerald-500/15 text-emerald-400' },
                    { label: 'Utilidad Neta',    value: 'Q 16,780', change: '↑ 23%', cls: 'bg-purple-500/8 border-purple-500/15 text-purple-400' },
                  ].map((s, i) => (
                    <div key={i} className={`p-5 rounded-xl border ${s.cls.split(' ').slice(0,2).join(' ')}`}>
                      <p className="text-xs text-gray-400 mb-2">{s.label}</p>
                      <p className={`text-2xl font-bold mb-1 ${s.cls.split(' ')[2]}`}>{s.value}</p>
                      <p className="text-xs text-emerald-400">{s.change} vs mes anterior</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">Ingresos vs Gastos</p>
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[65,80,75,90,85,95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-purple-600 to-violet-400 rounded-t transition-all hover:opacity-80" style={{ height: `${h}%` }} />
                        <span className="text-xs text-gray-500">{['Ene','Feb','Mar','Abr','May','Jun'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
