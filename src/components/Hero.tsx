import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

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

    // More particles, slightly bigger
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
      // Mix purple, violet and occasional emerald
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

    // Wireframe shapes — slightly more transparent for cleaner look
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
      // Cursor glow (percentage for CSS)
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
      // More reactive camera movement
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
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/25 via-transparent to-gray-950 z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/50 via-transparent to-gray-950/50 z-10 pointer-events-none" />

      {/* Cursor glow */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-200"
        style={{
          background: `radial-gradient(500px circle at ${cursorGlow.x}px ${cursorGlow.y}px, rgba(147,51,234,0.055), transparent 70%)`,
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <img src="/K_white.png" alt="KONTAXES" className="logo-dark h-20 w-auto drop-shadow-[0_0_40px_rgba(147,51,234,0.55)]" />
          <img src="/K_black.png" alt="KONTAXES" className="logo-light h-20 w-auto" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-fade-in" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          de{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">números</span>
          {' '}a{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">decisiones</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto mb-10 animate-fade-in">
          Contabilidad · Impuestos · Asesoría · Consultoría
        </p>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-gray-600 text-xs tracking-widest uppercase">
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
