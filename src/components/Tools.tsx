import React, { useState } from 'react';
import { DatabaseIcon, TrendingUpIcon, FileTextIcon, LayoutDashboardIcon } from 'lucide-react';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';

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

    const innerMat = new THREE.MeshBasicMaterial({ color: 0x1a0533, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 32), innerMat));

    // Orbiting dots
    const dotCount = 120;
    const dotPositions = new Float32Array(dotCount * 3);
    const dotColors = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const r = 3 + Math.random() * 0.6;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      dotPositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      dotPositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      dotPositions[i*3+2] = r * Math.cos(phi);
      const isEmerald = Math.random() > 0.7;
      dotColors[i*3]   = isEmerald ? 0.06 : 0.58;
      dotColors[i*3+1] = isEmerald ? 0.73 : 0.20;
      dotColors[i*3+2] = isEmerald ? 0.51 : 0.92;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));
    const dots = new THREE.Points(dotGeo, new THREE.PointsMaterial({ size: 0.07, vertexColors: true }));
    scene.add(dots);

    // Labels as emojis
    ['📊', '💼', '🖨️', '📋', '🔄', '📈'].forEach((emoji, i) => {
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.font = '36px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sprite.scale.set(0.7, 0.7, 1);
      const angle = (i / 6) * Math.PI * 2;
      sprite.position.set(4 * Math.cos(angle), (Math.random() - 0.5) * 2.5, 4 * Math.sin(angle));
      scene.add(sprite);
    });

    let t = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;
      sphere.rotation.y = t * 0.4;
      sphere.rotation.x = t * 0.12;
      dots.rotation.y = t * 0.55;
      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const w = canvas.parentElement?.clientWidth || 400;
      const h = canvas.parentElement?.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(canvas.parentElement!);

    return () => { cancelAnimationFrame(animId); renderer.dispose(); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export function Tools() {
  const [activeDemo, setActiveDemo] = useState<string>('invoice');

  const features = [
    { title: 'En KONTAXES, trabajamos con Odoo', description: 'Una potente plataforma de gestión empresarial que nos permite llevar cada contabilidad con precisión, eficiencia y transparencia.', icon: DatabaseIcon, color: 'purple' },
    { title: 'Información confiable y actualizada', description: 'Esto nos permite ofrecerte información financiera confiable, actualizada y accesible, facilitando la toma de decisiones estratégicas.', icon: TrendingUpIcon, color: 'emerald' },
    { title: 'Enfócate en crecer', description: 'Tú te concentras en hacer crecer tu empresa, y nosotros nos encargamos de que tus números siempre estén al día.', icon: FileTextIcon, color: 'violet' },
  ];

  const demos = [
    { id: 'invoice', label: 'Ingresar Factura', icon: FileTextIcon },
    { id: 'reconciliation', label: 'Conciliación Bancaria', icon: DatabaseIcon },
    { id: 'reports', label: 'Reportería', icon: TrendingUpIcon },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  ];

  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  return (
    <section id="odoo-demo" className="py-24 bg-gray-950 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* 3D Sphere */}
          <div className="reveal order-2 lg:order-1 h-80 lg:h-[450px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent rounded-3xl" />
            <OdooSphere />
          </div>

          {/* Text */}
          <div className="reveal reveal-delay-1 order-1 lg:order-2">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-400 mb-3">Tecnología</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Herramientas<br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">Odoo</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">Tecnología de clase mundial para tu contabilidad</p>
            <div className="space-y-4">
              {features.map((f, i) => (
                <div key={i} className={`flex gap-4 p-4 rounded-xl border ${colorMap[f.color]} transition-all hover:scale-[1.01]`}>
                  <f.icon className={`w-8 h-8 flex-shrink-0 ${colorMap[f.color].split(' ')[0]}`} />
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Selector */}
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

          {/* Demo Display */}
          <div className="bg-white/3 rounded-2xl border border-white/8 p-6 md:p-8">
            {activeDemo === 'invoice' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Módulo de Contabilidad — Ingresar Factura</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: 'Proveedor', placeholder: 'Seleccionar proveedor...' },
                    { label: 'Fecha de Factura', placeholder: '', type: 'date' },
                    { label: 'Número de Factura', placeholder: 'FAC-001' },
                    { label: 'Monto Total', placeholder: 'Q 1,000.00' },
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
                      <tr>
                        {['Fecha', 'Descripción', 'Débito', 'Crédito', 'Estado'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-gray-300 font-semibold text-xs uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
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
                    { title: 'Balance General', desc: 'Estado de situación financiera al cierre del período' },
                    { title: 'Estado de Resultados', desc: 'Ingresos, costos y utilidades del período' },
                    { title: 'Libro Diario', desc: 'Registro cronológico de todas las operaciones' },
                    { title: 'Libro Mayor', desc: 'Movimientos por cuenta contable' },
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
                    { label: 'Ingresos del Mes', value: 'Q 45,230', change: '↑ 12%', color: 'blue' },
                    { label: 'Gastos del Mes', value: 'Q 28,450', change: '↑ 5%', color: 'emerald' },
                    { label: 'Utilidad Neta', value: 'Q 16,780', change: '↑ 23%', color: 'purple' },
                  ].map((s, i) => (
                    <div key={i} className={`p-5 rounded-xl bg-${s.color}-500/8 border border-${s.color}-500/15`}>
                      <p className="text-xs text-gray-400 mb-2">{s.label}</p>
                      <p className={`text-2xl font-bold text-${s.color}-400 mb-1`}>{s.value}</p>
                      <p className="text-xs text-emerald-400">{s.change} vs mes anterior</p>
                    </div>
                  ))}
                </div>
                <div className="p-5 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-xs text-gray-400 mb-4 font-semibold uppercase tracking-wider">Ingresos vs Gastos</p>
                  <div className="h-32 flex items-end justify-around gap-2">
                    {[65, 80, 75, 90, 85, 95].map((h, i) => (
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
