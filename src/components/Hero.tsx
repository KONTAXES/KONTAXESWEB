import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 40;

    // Particle system
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 120;
      pos[i3 + 1] = (Math.random() - 0.5) * 100;
      pos[i3 + 2] = (Math.random() - 0.5) * 80;
      const t = Math.random();
      col[i3]     = 0.4 + t * 0.4;
      col[i3 + 1] = 0.1 + t * 0.1;
      col[i3 + 2] = 0.7 + t * 0.3;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Wireframe shapes
    const shapes: { mesh: THREE.Mesh; rx: number; ry: number }[] = [];
    const wireMat  = new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.15 });
    const wireMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.1 });
    const geos = [
      new THREE.IcosahedronGeometry(2, 0), new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(2, 0), new THREE.IcosahedronGeometry(1, 1),
    ];
    for (let i = 0; i < 14; i++) {
      const mesh = new THREE.Mesh(geos[i % geos.length], i % 5 === 0 ? wireMat2 : wireMat);
      mesh.scale.setScalar(0.5 + Math.random() * 2);
      mesh.position.set((Math.random()-0.5)*80, (Math.random()-0.5)*60, (Math.random()-0.5)*40-10);
      mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
      shapes.push({ mesh, rx: (Math.random()-0.5)*0.005, ry: (Math.random()-0.5)*0.007 });
      scene.add(mesh);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      frame++;
      const t = frame * 0.001;
      particles.rotation.y = t * 0.05;
      particles.rotation.x = t * 0.02;
      shapes.forEach(({ mesh, rx, ry }) => { mesh.rotation.x += rx; mesh.rotation.y += ry; });
      camera.position.x += (mouse.current.x * 4 - camera.position.x) * 0.04;
      camera.position.y += (mouse.current.y * 3 - camera.position.y) * 0.04;
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
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-transparent to-gray-950 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/60 via-transparent to-gray-950/60 z-10 pointer-events-none" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Contabilidad profesional para Guatemala · Odoo 19
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in">
          {[
            { label: 'Odoo', color: 'bg-purple-500/15 border-purple-500/30 text-purple-300' },
            { label: 'IA · Claude', color: 'bg-orange-500/15 border-orange-500/30 text-orange-300' },
            { label: 'Módulos Propios', color: 'bg-violet-500/15 border-violet-500/30 text-violet-300' },
            { label: 'FinanzIA', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' },
          ].map((t) => (
            <span key={t.label} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${t.color}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {t.label}
            </span>
          ))}
        </div>

        <div className="flex justify-center mb-8 animate-fade-in">
          <img src="/K_V4-2.png" alt="KONTAXES" className="h-24 w-auto drop-shadow-[0_0_30px_rgba(147,51,234,0.6)]" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          de{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">números</span>
          {' '}a{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">decisiones</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-in">
          Contabilidad · Impuestos · Asesoría Financiera · Consultoría<br />
          Potenciado por{' '}
          <span className="text-purple-400 font-semibold">Odoo</span> +{' '}
          <span className="text-orange-400 font-semibold">IA</span> +{' '}
          <span className="text-emerald-400 font-semibold">FinanzIA</span>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in">
          <a href="https://app.kontaxes.com" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 shadow-lg hover:-translate-y-0.5">
            Acceder a la APP
          </a>
          <a href="#servicios"
            className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all duration-300 shadow-lg hover:-translate-y-0.5">
            Ver Servicios
          </a>
          <a href="https://odoo.kontaxes.com" target="_blank" rel="noopener noreferrer"
            className="px-8 py-3.5 bg-white/5 border border-white/15 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-purple-400/40 transition-all duration-300">
            Ir a Odoo
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 animate-fade-in">
          {[
            { value: '4+', label: 'Clientes activos' },
            { value: 'GTQ', label: 'Moneda nativa' },
            { value: 'SAT', label: '100% Compliant' },
            { value: 'Odoo', label: 'Tecnología #1' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-gray-600 text-xs tracking-widest uppercase">
        <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
