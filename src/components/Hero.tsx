import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;

    // ── Scene & environment ───────────────────────────────────────────
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.3;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────
    // Target: model centered in the right half of the screen
    const LOOK = new THREE.Vector3(3, 2, 0);
    const CAM  = { x: -1.0, y: 5.0, z: 16 };
    const cam  = { x: CAM.x, y: 13, z: 32 };

    const camera = new THREE.PerspectiveCamera(
      40, window.innerWidth / window.innerHeight, 0.1, 140
    );
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(LOOK);

    // ── Post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.08, 0.4, 0.95
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Lighting ──────────────────────────────────────────────────────
    // Soft ambient
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x14082e, 0.5));

    // Key light — warm, top right
    const key = new THREE.DirectionalLight(0xffecd0, 2.2);
    key.position.set(10, 16, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left   = -12;
    key.shadow.camera.right  =  12;
    key.shadow.camera.top    =  10;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far    = 60;
    key.shadow.radius        = 4;
    key.shadow.bias          = -0.0004;
    scene.add(key);

    // Fill — cool, from left
    const fill = new THREE.DirectionalLight(0xc4d8ff, 0.6);
    fill.position.set(-10, 8, 6);
    scene.add(fill);

    // Subtle back rim
    const rim = new THREE.DirectionalLight(0xb06aff, 0.45);
    rim.position.set(-10, 2, -14);
    scene.add(rim);

    // ── Polished floor ────────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 40),
      new THREE.MeshPhysicalMaterial({
        color: 0x07021a,
        roughness: 0.08,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 0.9,
        envMapIntensity: 0.8,
      })
    );
    floor.rotation.x  = -Math.PI / 2;
    floor.position.y  = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Load GLB ──────────────────────────────────────────────────────
    const group = new THREE.Group();
    scene.add(group);
    group.position.y = -12;
    group.rotation.y  = 0.35;

    new GLTFLoader().load(
      '/models/little_office.glb',
      (gltf) => {
        const model = gltf.scene;

        // Scale: target height = 5.5 units
        const box = new THREE.Box3().setFromObject(model);
        const sz  = new THREE.Vector3();
        box.getSize(sz);
        const scale = 5.5 / sz.y;
        model.scale.setScalar(scale);

        // Center on X/Z; bottom sits on floor; offset right so it occupies right half
        box.setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.x = -center.x + 3.5;   // offset to right half
        model.position.z = -center.z;
        model.position.y = -box.min.y;

        // Shadows + material tweaks
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow    = true;
          child.receiveShadow = true;
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (m instanceof THREE.MeshStandardMaterial) {
              m.roughness        = Math.max(m.roughness, 0.55);
              m.envMapIntensity  = 0.35;
              m.needsUpdate      = true;
            }
          });
        });

        group.add(model);

        // Entrance animation
        const tl = gsap.timeline({ delay: 0.1 });
        tl.to(group.position, { y: 0,     duration: 2.2, ease: 'back.out(1.2)' }, 0);
        tl.to(group.rotation, { y: 0,     duration: 2.0, ease: 'power3.out'    }, 0);
        tl.to(cam,            { y: CAM.y, z: CAM.z, duration: 2.6, ease: 'power3.out' }, 0);
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    );

    // ── Events ────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current.tx =  (e.clientX  / window.innerWidth  - 0.5);
      mouse.current.ty = -(e.clientY  / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Render loop ───────────────────────────────────────────────────
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.044;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.044;

      const sf = Math.min(scrollRef.current / (window.innerHeight || 1), 1);

      camera.position.x = cam.x + mouse.current.x * 3.2;
      camera.position.y = cam.y + mouse.current.y * 1.8 - sf * 3.5;
      camera.position.z = cam.z + sf * 12;
      camera.lookAt(
        LOOK.x + mouse.current.x * 0.6,
        LOOK.y + mouse.current.y * 0.4,
        LOOK.z
      );

      composer.render();
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll',    onScroll);
      window.removeEventListener('resize',    onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center overflow-hidden bg-[#08031a]">

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Left gradient so text is readable */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(108deg, rgba(8,3,26,0.96) 0%, rgba(8,3,26,0.75) 36%, rgba(8,3,26,0.10) 58%, transparent 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(to top, #08031a 0%, transparent 100%)',
      }} />

      {/* Text overlay */}
      <div className="relative px-8 md:px-14 lg:px-20 max-w-[44rem]" style={{ zIndex: 20 }}>

        <div className="mb-7">
          <img src="/K_white.png" alt="KONTAXES"
            className="h-16 w-auto drop-shadow-[0_0_36px_rgba(147,51,234,0.7)]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Consultores Financieros &amp; Fiscales
        </div>

        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          de{' '}
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
            números
          </span>
          <br />
          a{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            decisiones
          </span>
        </h1>

        <p className="text-base md:text-lg text-gray-400 mb-9 max-w-md leading-relaxed">
          Contabilidad · Impuestos · Asesoría · Consultoría
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl text-sm
              hover:from-purple-500 hover:to-violet-500 transition-all duration-200
              shadow-lg shadow-purple-900/40 hover:-translate-y-0.5 hover:shadow-purple-500/30"
          >
            Ver Servicios
          </button>
          <button
            onClick={() => document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 bg-white/8 border border-white/15 backdrop-blur-sm text-white font-bold
              rounded-xl text-sm hover:bg-white/14 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Cotizar Ahora
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
