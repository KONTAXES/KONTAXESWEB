import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse     = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    RectAreaLightUniformsLib.init();

    // ── Renderer ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    // ── Scene & environment ───────────────────────────────────────────
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.6;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      40, window.innerWidth / window.innerHeight, 0.1, 140
    );
    const CAM = { x: 6.0, y: 5.5, z: 16 };
    const cam = { x: CAM.x, y: 14, z: 32 };
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(0, 2, 0);

    // ── Post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.22, 0.5, 0.88
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Lighting ──────────────────────────────────────────────────────
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x140828, 0.8));

    // Key light (warm, top-right)
    const key = new THREE.DirectionalLight(0xffecd0, 3.4);
    key.position.set(12, 18, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.camera.left   = -18;
    key.shadow.camera.right  =  18;
    key.shadow.camera.top    =  14;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far    = 70;
    key.shadow.radius        = 5;
    key.shadow.bias          = -0.0004;
    scene.add(key);

    // Fill (cool, from left)
    const fill = new THREE.DirectionalLight(0xc4d8ff, 1.1);
    fill.position.set(-12, 9, 7);
    scene.add(fill);

    // Rim (purple brand, back-left)
    const rimPurple = new THREE.DirectionalLight(0xb06aff, 0.9);
    rimPurple.position.set(-14, 3, -16);
    scene.add(rimPurple);

    // RectArea ceiling panels — soft area light
    for (const rx of [-5.5, 0, 5.5]) {
      const rl = new THREE.RectAreaLight(0xfff5e0, 6.0, 5, 3);
      rl.position.set(rx, 9.5, -1.5);
      rl.rotation.x = -Math.PI / 2;
      scene.add(rl);
    }

    // Purple window area light
    const winLight = new THREE.RectAreaLight(0x9333ea, 2.5, 18, 7);
    winLight.position.set(0, 5, -10);
    winLight.lookAt(0, 2, 0);
    scene.add(winLight);

    // ── Polished floor ────────────────────────────────────────────────
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x07021a,
      roughness: 0.06,
      metalness: 0.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.95,
      envMapIntensity: 1.1,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 45), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y  = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle grid accent lines
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x4c1d95, transparent: true, opacity: 0.14,
    });
    for (let gx = -20; gx <= 20; gx += 5) {
      const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 40), lineMat);
      ln.rotation.x = -Math.PI / 2;
      ln.position.set(gx, 0.002, 0);
      scene.add(ln);
    }
    for (let gz = -20; gz <= 20; gz += 5) {
      const ln = new THREE.Mesh(new THREE.PlaneGeometry(50, 0.02), lineMat);
      ln.rotation.x = -Math.PI / 2;
      ln.position.set(0, 0.002, gz);
      scene.add(ln);
    }

    // ── Back wall & windows ───────────────────────────────────────────
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0e0820, roughness: 0.99, envMapIntensity: 0,
    });
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(36, 12, 0.24), wallMat);
    wallB.position.set(0, 6, -11);
    wallB.receiveShadow = true;
    scene.add(wallB);
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 12, 26), wallMat);
    wallL.position.set(-15, 6, 0);
    scene.add(wallL);
    const wallR = wallL.clone();
    wallR.position.x = 15;
    scene.add(wallR);
    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.22, 26),
      new THREE.MeshStandardMaterial({ color: 0x0c0618, roughness: 0.99, envMapIntensity: 0 })
    );
    ceil.position.set(0, 10.1, 0);
    scene.add(ceil);

    // Windows
    for (const wx of [-7, 0, 7]) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 6.4, 0.2),
        new THREE.MeshPhysicalMaterial({ color: 0x0d0b1e, roughness: 0.5, metalness: 0.1, clearcoat: 0.2 })
      );
      frame.position.set(wx, 5.8, -10.88);
      scene.add(frame);
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 5.5, 0.08),
        new THREE.MeshPhysicalMaterial({
          color: 0x9333ea, transparent: true, opacity: 0.16,
          emissive: 0x7c3aed, emissiveIntensity: 0.7,
          roughness: 0.0, transmission: 0.6,
        })
      );
      glass.position.set(wx, 5.8, -10.8);
      scene.add(glass);
      // Dividers
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.07, 0.15),
        new THREE.MeshPhysicalMaterial({ color: 0x160e34, roughness: 0.7, clearcoat: 0.1 }));
      hBar.position.set(wx, 5.8, -10.75);
      scene.add(hBar);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 5.5, 0.15),
        new THREE.MeshPhysicalMaterial({ color: 0x160e34, roughness: 0.7, clearcoat: 0.1 }));
      vBar.position.set(wx, 5.8, -10.75);
      scene.add(vBar);
    }

    // ── Floating particles ─────────────────────────────────────────────
    const pCount = 420;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      pPos[i3]     = (Math.random() - 0.5) * 28;
      pPos[i3 + 1] = Math.random() * 11;
      pPos[i3 + 2] = (Math.random() - 0.5) * 22 - 1;
      const p = Math.random() > 0.42;
      pCol[i3]     = p ? 0.58 : 0.06;
      pCol[i3 + 1] = p ? 0.10 : 0.80;
      pCol[i3 + 2] = p ? 0.98 : 0.54;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.055, vertexColors: true, transparent: true, opacity: 0.68,
    }));
    scene.add(particles);

    // ── Floating data panels ──────────────────────────────────────────
    const panelCfg = [
      { x: -10,  y: 5.6, z: -6,  ry:  0.28, c: 0x9333ea },
      { x:  10,  y: 4.9, z: -5,  ry: -0.22, c: 0x0d9488 },
      { x: -8.5, y: 7.6, z: -4,  ry:  0.18, c: 0x9333ea },
      { x:  9.5, y: 6.6, z: -3,  ry: -0.16, c: 0x0d9488 },
      { x:  2.5, y: 8.2, z: -7,  ry:  0.05, c: 0x9333ea },
    ];
    type PanelItem = { mesh: THREE.Mesh; baseY: number; spd: number; ph: number };
    const panels: PanelItem[] = [];
    for (const cfg of panelCfg) {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.4),
        new THREE.MeshStandardMaterial({
          color: cfg.c, emissive: cfg.c, emissiveIntensity: 0.75,
          transparent: true, opacity: 0.46, roughness: 0.12,
        })
      );
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.ry;
      scene.add(mesh);
      panels.push({ mesh, baseY: cfg.y, spd: 0.34 + Math.random() * 0.36, ph: Math.random() * Math.PI * 2 });
    }

    // ── Load GLB model ─────────────────────────────────────────────────
    const officeGroup = new THREE.Group();
    scene.add(officeGroup);

    // Entrance state — will animate on load
    officeGroup.position.y = -10;
    officeGroup.rotation.y  = 0.35;

    const loader = new GLTFLoader();
    loader.load(
      '/models/little_office.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-scale: target height = 5.5 units
        const box  = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = 5.5 / size.y;
        model.scale.setScalar(scale);

        // Center on X/Z, sit on floor
        box.setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.x = -center.x;
        model.position.z = -center.z;
        model.position.y = -box.min.y;

        // Improve materials & enable shadows
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow    = true;
          child.receiveShadow = true;

          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              // Boost roughness slightly for matte look; keep original textures
              mat.roughness    = Math.max(mat.roughness, 0.55);
              mat.envMapIntensity = 0.5;
              mat.needsUpdate  = true;
            }
          });
        });

        officeGroup.add(model);

        // ── Entrance animation (GSAP) — starts after model is ready ───
        const tl = gsap.timeline({ delay: 0.1 });
        tl.to(officeGroup.position, { y: 0,     duration: 2.2, ease: 'back.out(1.2)'  }, 0);
        tl.to(officeGroup.rotation, { y: 0,     duration: 2.0, ease: 'power3.out'     }, 0);
        tl.to(cam,                  { y: CAM.y, z: CAM.z, duration: 2.6, ease: 'power3.out' }, 0);
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
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;

      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.044;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.044;

      const sf = Math.min(scrollRef.current / (window.innerHeight || 1), 1);

      camera.position.x = cam.x + mouse.current.x * 3.8;
      camera.position.y = cam.y + mouse.current.y * 2.0 - sf * 4;
      camera.position.z = cam.z + sf * 14;
      camera.lookAt(mouse.current.x * 0.8, 2.0, 0);

      particles.rotation.y  = t * 0.014;
      particles.position.y  = Math.sin(t * 0.22) * 0.18;

      for (const p of panels) {
        p.mesh.position.y = p.baseY + Math.sin(t * p.spd + p.ph) * 0.3;
      }

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

      {/* Left gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(108deg, rgba(8,3,26,0.95) 0%, rgba(8,3,26,0.72) 38%, rgba(8,3,26,0.12) 62%, transparent 100%)',
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
