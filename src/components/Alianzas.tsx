import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ScaleIcon, PhoneIcon } from 'lucide-react';

const WA_NUMBER = '50235174713';

const lexumServices = [
  { cat: 'Notariado', items: ['Escrituras públicas', 'Testamentos', 'Mandatos para el extranjero'] },
  { cat: 'Derecho Civil, Laboral y Familiar', items: ['Derecho Civil', 'Derecho Laboral', 'Derecho Familiar', 'Procesos sucesorios'] },
  { cat: 'Penal y Tránsito', items: ['Derecho Penal', 'Hechos de tránsito'] },
  { cat: 'Trámites y Gestión', items: ['Apostillas y legalizaciones', 'Cartas poder', 'Traspasos de vehículos', 'Trámites RENAP/SAT', 'Matrimonios', 'Patentes de comercio', 'Titulaciones supletorias'] },
];

function LegalSphere() {
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

    // Outer wireframe sphere — golden color for LEXUM
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, wireframe: true, transparent: true, opacity: 0.18 });
    const sphere = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 2), sphereMat);
    scene.add(sphere);

    // Inner fill
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x0f0a1e, transparent: true, opacity: 0.75 })
    ));

    // Orbit dots — mix gold and purple
    const dotCount = 100;
    const dp = new Float32Array(dotCount * 3);
    const dc = new Float32Array(dotCount * 3);
    for (let i = 0; i < dotCount; i++) {
      const r = 3 + Math.random() * 0.5;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      dp[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      dp[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      dp[i*3+2] = r * Math.cos(phi);
      const isGold = Math.random() > 0.5;
      dc[i*3]   = isGold ? 0.83 : 0.58;
      dc[i*3+1] = isGold ? 0.69 : 0.20;
      dc[i*3+2] = isGold ? 0.21 : 0.92;
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    dg.setAttribute('color',    new THREE.Float32BufferAttribute(dc, 3));
    scene.add(new THREE.Points(dg, new THREE.PointsMaterial({ size: 0.07, vertexColors: true })));

    // Emoji sprites
    ['⚖️', '📜', '🏛️', '🤝', '📋', '✍️'].forEach((emoji, i) => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const ctx = c.getContext('2d')!;
      ctx.font = '36px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 32, 32);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
      sprite.scale.set(0.65, 0.65, 1);
      const angle = (i / 6) * Math.PI * 2;
      sprite.position.set(4 * Math.cos(angle), (Math.random() - 0.5) * 2.5, 4 * Math.sin(angle));
      scene.add(sprite);
    });

    let t = 0; let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate); t += 0.005;
      sphere.rotation.y = t * 0.35; sphere.rotation.x = t * 0.10;
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

export function Alianzas() {
  return (
    <section id="alianzas" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900/80 to-gray-950" />
      <div className="absolute inset-0 pointer-events-none grid-bg opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-600/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none orb-float" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-purple-600/6 rounded-full blur-3xl pointer-events-none orb-float-reverse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-purple-300 mb-3">Alianzas Estratégicas</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            KONTAXES + LEXUM
          </h2>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Contabilidad y Derecho en un solo respaldo. Una alianza pensada para proteger y hacer crecer tu negocio integralmente.
          </p>
        </div>

        {/* Main content — sphere + LEXUM card */}
        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">

          {/* 3D sphere */}
          <div className="reveal order-2 lg:order-1 h-72 lg:h-[420px] relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/5 to-transparent rounded-3xl" />
            <LegalSphere />
          </div>

          {/* LEXUM card */}
          <div className="reveal reveal-delay-1 order-1 lg:order-2">
            <div className="rounded-2xl bg-white/8 backdrop-blur-sm border border-yellow-500/25 overflow-hidden">

              {/* LEXUM header */}
              <div className="p-6 bg-gradient-to-r from-yellow-900/30 to-yellow-800/15 border-b border-yellow-500/20 flex items-center gap-4">
                <div className="flex-shrink-0">
                  {/* Logo placeholder — replaced when logo-lexum.png is uploaded */}
                  <img
                    src="/logo-lexum.png"
                    alt="LEXUM"
                    className="h-16 w-auto"
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement;
                      el.style.display = 'none';
                      const fb = el.nextElementSibling as HTMLElement | null;
                      if (fb) fb.style.display = 'flex';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-16 h-16 rounded-xl bg-yellow-500/20 border border-yellow-500/30 items-center justify-center">
                    <ScaleIcon className="w-8 h-8 text-yellow-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Bufete Jurídico LEXUM</h3>
                  <p className="text-yellow-300 text-sm font-medium">Licda. Cindy Iquic</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-yellow-200/70">
                      <PhoneIcon size={11} /> 3240-6009
                    </span>
                    <span className="text-yellow-500/40">·</span>
                    <span className="flex items-center gap-1 text-xs text-yellow-200/70">
                      <PhoneIcon size={11} /> 5179-1610
                    </span>
                  </div>
                  <p className="text-xs text-yellow-200/60 mt-1">San Juan Sacatepéquez, Guatemala</p>
                </div>
              </div>

              {/* Services grid */}
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4">Servicios Jurídicos</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {lexumServices.map((group, gi) => (
                    <div key={gi}>
                      <p className="text-xs font-semibold text-yellow-300/80 mb-2">{group.cat}</p>
                      <ul className="space-y-1">
                        {group.items.map((item, ii) => (
                          <li key={ii} className="flex items-center gap-2 text-xs text-purple-100/70">
                            <span className="w-1 h-1 rounded-full bg-yellow-500/60 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Two CTAs */}
        <div className="grid md:grid-cols-2 gap-6 reveal">

          {/* CTA 1 — For businesses needing legal + accounting */}
          <div className="p-7 rounded-2xl bg-white/8 backdrop-blur-sm border border-yellow-500/20 hover:bg-white/12 transition-all duration-300">
            <div className="text-3xl mb-4">🤝</div>
            <h4 className="text-lg font-bold text-white mb-2">¿Necesitas respaldo legal?</h4>
            <p className="text-purple-100/70 text-sm leading-relaxed mb-5">
              Con KONTAXES tienes acceso directo al Bufete LEXUM. Contabilidad y derecho trabajando juntos para proteger tu empresa.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola KONTAXES, me interesa el servicio contable con el respaldo del Bufete LEXUM.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 font-bold rounded-xl hover:bg-purple-50 transition-all hover:-translate-y-0.5 shadow-xl text-sm"
            >
              💬 Hablar con KONTAXES
            </a>
          </div>

          {/* CTA 2 — For accounting offices wanting KONTAXES backing */}
          <div className="p-7 rounded-2xl bg-white/8 backdrop-blur-sm border border-purple-500/25 hover:bg-white/12 transition-all duration-300">
            <div className="text-3xl mb-4">🏢</div>
            <h4 className="text-lg font-bold text-white mb-2">¿Eres contador o tienes una oficina contable?</h4>
            <p className="text-purple-100/70 text-sm leading-relaxed mb-5">
              Si quieres que tu oficina contable tenga el respaldo de KONTAXES — tecnología, procesos y alianzas estratégicas — escríbenos por WhatsApp.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hola KONTAXES, me interesa que mi oficina contable tenga el respaldo de KONTAXES.')}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all hover:-translate-y-0.5 shadow-xl text-sm"
            >
              💬 Escríbenos por WhatsApp
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
