import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    renderer.toneMappingExposure = 0.9;

    // ── Scene & environment ───────────────────────────────────────────
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.35;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      42, window.innerWidth / window.innerHeight, 0.1, 140
    );
    camera.position.set(2, 5, 16);
    camera.lookAt(3, 2, 0);

    // ── OrbitControls (mouse drag to rotate) ─────────────────────────
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(3, 2, 0);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.06;
    controls.enablePan        = false;
    controls.minDistance      = 8;
    controls.maxDistance      = 28;
    controls.minPolarAngle    = Math.PI / 6;   // 30° — no va por encima
    controls.maxPolarAngle    = Math.PI / 2.1; // 85° — no va por debajo del piso
    controls.autoRotate       = true;
    controls.autoRotateSpeed  = 0.5;

    // Stop autoRotate when user interacts, resume after 3 s idle
    let idleTimer: ReturnType<typeof setTimeout>;
    const onInteract = () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { controls.autoRotate = true; }, 3000);
    };
    canvas.addEventListener('pointerdown', onInteract);

    // ── Post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.06, 0.4, 0.96
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Lighting ──────────────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x14082e, 0.55));

    const key = new THREE.DirectionalLight(0xffecd0, 2.0);
    key.position.set(10, 15, 10);
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

    const fill = new THREE.DirectionalLight(0xc4d8ff, 0.55);
    fill.position.set(-10, 8, 6);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xb06aff, 0.4);
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
        envMapIntensity: 0.7,
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
    group.rotation.y  = 0.3;

    new GLTFLoader().load(
      '/models/little_office.glb',
      (gltf) => {
        const model = gltf.scene;

        // Scale to target height 5.5 units
        const box = new THREE.Box3().setFromObject(model);
        const sz  = new THREE.Vector3();
        box.getSize(sz);
        const scale = 5.5 / sz.y;
        model.scale.setScalar(scale);

        // Center + offset right
        box.setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.x = -center.x + 3.5;
        model.position.z = -center.z;
        model.position.y = -box.min.y;

        // Fix materials: kill the overbright emissive, keep diffuse colors
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow    = true;
          child.receiveShadow = true;

          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((m) => {
            if (!(m instanceof THREE.MeshStandardMaterial)) return;
            // The emissiveFactor 0.87 is washing everything white — kill it
            m.emissive.set(0x000000);
            m.emissiveIntensity = 0;
            m.emissiveMap       = null;
            // Reasonable PBR values
            m.roughness         = 0.7;
            m.envMapIntensity   = 0.4;
            m.needsUpdate       = true;
          });
        });

        group.add(model);

        // Entrance animation
        const tl = gsap.timeline({ delay: 0.15 });
        tl.to(group.position, { y: 0,   duration: 2.2, ease: 'back.out(1.2)' }, 0);
        tl.to(group.rotation, { y: 0,   duration: 2.0, ease: 'power3.out'    }, 0);
      },
      undefined,
      (err) => console.error('GLB load error:', err)
    );

    // ── Render loop ───────────────────────────────────────────────────
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
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
      clearTimeout(idleTimer);
      canvas.removeEventListener('pointerdown', onInteract);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center overflow-hidden bg-[#08031a]">

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'grab' }} />

      {/* Left gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(108deg, rgba(8,3,26,0.96) 0%, rgba(8,3,26,0.78) 36%, rgba(8,3,26,0.08) 58%, transparent 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(to top, #08031a 0%, transparent 100%)',
      }} />

      {/* Text — pointer-events-none on overlay so mouse reaches canvas */}
      <div className="relative px-8 md:px-14 lg:px-20 max-w-[44rem] pointer-events-none" style={{ zIndex: 20 }}>

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

        {/* Buttons need pointer-events back */}
        <div className="flex flex-wrap gap-3 pointer-events-auto">
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

      {/* Hint */}
      <div className="absolute bottom-8 right-8 text-white/20 text-xs pointer-events-none select-none" style={{ zIndex: 20 }}>
        arrastra para rotar
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
