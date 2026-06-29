import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ── Scene ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08031a, 0.022);

    // ── Camera ───────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    const CAM_BASE = { x: 6, y: 9, z: 18 };
    camera.position.set(CAM_BASE.x, CAM_BASE.y, CAM_BASE.z);
    camera.lookAt(0, 2, 0);

    // ── Lights ───────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x200840, 6));

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(10, 14, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -18;
    sunLight.shadow.camera.right = 18;
    sunLight.shadow.camera.top = 14;
    sunLight.shadow.camera.bottom = -4;
    scene.add(sunLight);

    const purplePoint = new THREE.PointLight(0x9333ea, 10, 22);
    purplePoint.position.set(-6, 8, -4);
    scene.add(purplePoint);

    const tealPoint = new THREE.PointLight(0x0d9488, 8, 20);
    tealPoint.position.set(9, 4, 4);
    scene.add(tealPoint);

    const topFill = new THREE.PointLight(0x6d28d9, 5, 30);
    topFill.position.set(0, 14, 6);
    scene.add(topFill);

    // Ceiling lamp lights (3 above desks)
    const lampLights: THREE.PointLight[] = [];
    for (const lx of [-5.5, 0, 5.5]) {
      const l = new THREE.PointLight(0xddd8ff, 6, 9);
      l.position.set(lx, 8.5, -1.5);
      scene.add(l);
      lampLights.push(l);
    }

    // ── Shared material helper ────────────────────────────────────────
    const lm = (
      color: number,
      opts: { emissive?: number; emissiveIntensity?: number; transparent?: boolean; opacity?: number } = {}
    ) =>
      new THREE.MeshLambertMaterial({
        color,
        flatShading: true,
        emissive: opts.emissive ?? 0,
        emissiveIntensity: opts.emissiveIntensity ?? 0,
        transparent: opts.transparent ?? false,
        opacity: opts.opacity ?? 1,
      });

    // Materials
    const mFloor    = lm(0x120830);
    const mWall     = lm(0x0c061e);
    const mCeiling  = lm(0x0e0824);
    const mDeskTop  = lm(0x2e1958);
    const mDeskLeg  = lm(0x1c1040);
    const mDeskSide = lm(0x24144a);
    const mMonFr    = lm(0x080615);
    const mScrPurp  = lm(0x7c3aed, { emissive: 0x6d28d9, emissiveIntensity: 1.0 });
    const mScrTeal  = lm(0x0d9488, { emissive: 0x065f46, emissiveIntensity: 0.8 });
    const mChairDk  = lm(0x14102a);
    const mChairMd  = lm(0x1e1840);
    const mSkin     = lm(0xf4b98a);
    const mPot      = lm(0x3a1850);
    const mLeaf     = lm(0x065f46);
    const mGlass    = new THREE.MeshLambertMaterial({
      color: 0x9333ea, transparent: true, opacity: 0.22,
      emissive: 0x5b21b6, emissiveIntensity: 0.5,
    });
    const mLamp     = lm(0xfafafa, { emissive: 0xffffff, emissiveIntensity: 0.9 });

    // Person body colours (brand palette)
    const BODY_COLORS = [0x7c3aed, 0x0d9488, 0x1d4ed8, 0xa855f7, 0x059669];

    // ── Room shell ───────────────────────────────────────────────────
    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(32, 0.25, 24), mFloor);
    floor.position.set(0, -0.12, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid overlay
    const grid = new THREE.GridHelper(30, 30, 0x3b1c6e, 0x1c0a3a);
    grid.position.y = 0.01;
    scene.add(grid);

    // Ceiling
    const ceiling = new THREE.Mesh(new THREE.BoxGeometry(32, 0.25, 24), mCeiling);
    ceiling.position.set(0, 10.12, 0);
    scene.add(ceiling);

    // Back wall
    const wallBack = new THREE.Mesh(new THREE.BoxGeometry(32, 10.5, 0.3), mWall);
    wallBack.position.set(0, 5, -10.5);
    wallBack.receiveShadow = true;
    scene.add(wallBack);

    // Side walls
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10.5, 24), mWall);
    wallL.position.set(-15.15, 5, 0);
    scene.add(wallL);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10.5, 24), mWall);
    wallR.position.set(15.15, 5, 0);
    scene.add(wallR);

    // Windows (glowing)
    for (const wx of [-7, 0, 7]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 5.8, 0.22), mMonFr);
      frame.position.set(wx, 5.5, -10.35);
      scene.add(frame);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(4.0, 5.0, 0.12), mGlass);
      glass.position.set(wx, 5.5, -10.28);
      scene.add(glass);
    }

    // Ceiling lamps
    for (const lx of [-5.5, 0, 5.5]) {
      const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 0.9), mLamp);
      body.position.set(lx, 9.9, -1.5);
      scene.add(body);
    }

    // ── Desk builder ─────────────────────────────────────────────────
    function addDesk(x: number, z: number): void {
      const g = new THREE.Group();

      // surface
      const top = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, 2.2), mDeskTop);
      top.position.y = 1.85;
      top.castShadow = true;
      top.receiveShadow = true;
      g.add(top);

      // legs (4 corners)
      for (const [lx, lz] of [[-1.85, -0.95], [1.85, -0.95], [-1.85, 0.95], [1.85, 0.95]] as [number, number][]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 1.85, 0.13), mDeskLeg);
        leg.position.set(lx, 0.92, lz);
        leg.castShadow = true;
        g.add(leg);
      }

      // right side panel
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 2.0), mDeskSide);
      panel.position.set(1.85, 0.92, 0);
      g.add(panel);

      // small drawer box
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.95, 1.85), mDeskSide);
      drawer.position.set(1.38, 0.58, 0);
      g.add(drawer);

      g.position.set(x, 0, z);
      scene.add(g);
    }

    // ── Monitor builder ───────────────────────────────────────────────
    function addMonitor(
      x: number, y: number, z: number,
      scrMat: THREE.MeshLambertMaterial,
      rotY = 0
    ): void {
      const g = new THREE.Group();

      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.6, 0.13), mMonFr);
      frame.position.y = 0.8;
      g.add(frame);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.25, 1.38, 0.06), scrMat);
      screen.position.set(0, 0.8, 0.1);
      g.add(screen);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 6), mMonFr);
      arm.position.y = 0.14;
      g.add(arm);

      const base = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.06, 0.45), mMonFr);
      base.position.y = -0.14;
      g.add(base);

      g.position.set(x, y, z);
      g.rotation.y = rotY;
      scene.add(g);
    }

    // ── Chair builder ─────────────────────────────────────────────────
    function addChair(x: number, z: number, rotY = 0): void {
      const g = new THREE.Group();

      // seat
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.1, 1.25), mChairMd);
      seat.position.y = 0.95;
      g.add(seat);
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.1, 1.12), mChairDk);
      cushion.position.y = 1.04;
      g.add(cushion);

      // back
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.05, 0.1), mChairMd);
      back.position.set(0, 1.58, -0.58);
      g.add(back);
      const backPad = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.85, 0.08), mChairDk);
      backPad.position.set(0, 1.58, -0.52);
      g.add(backPad);

      // 5-star base (spokes)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.55), mChairMd);
        spoke.position.set(Math.cos(a) * 0.44, 0.22, Math.sin(a) * 0.44);
        spoke.rotation.y = a;
        g.add(spoke);
      }
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.9, 6), mChairMd);
      col.position.y = 0.52;
      g.add(col);

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
    }

    // ── Person builder ────────────────────────────────────────────────
    function addPerson(x: number, z: number, bodyColor: number, rotY = 0): void {
      const g = new THREE.Group();
      const mBody = lm(bodyColor);

      // head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 8, 7), mSkin);
      head.position.y = 2.88;
      head.castShadow = true;
      g.add(head);

      // hair (upper hemisphere)
      const hairColor = [0x1a0800, 0x2c1400, 0x0a0a0a][Math.floor(Math.random() * 3)];
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.335, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.5),
        lm(hairColor)
      );
      hair.position.y = 2.9;
      g.add(hair);

      // neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.22, 6), mSkin);
      neck.position.y = 2.54;
      g.add(neck);

      // torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.95, 0.4), mBody);
      torso.position.y = 2.02;
      torso.castShadow = true;
      g.add(torso);

      // arms angled forward (typing pose)
      const armGeo = new THREE.BoxGeometry(0.19, 0.58, 0.2);
      const armL = new THREE.Mesh(armGeo, mBody);
      armL.position.set(-0.44, 2.02, 0.22);
      armL.rotation.x = -0.55;
      g.add(armL);
      const armR = new THREE.Mesh(armGeo, mBody);
      armR.position.set(0.44, 2.02, 0.22);
      armR.rotation.x = -0.55;
      g.add(armR);

      // lower body (sitting)
      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.52, 0.56), lm(0x12102a));
      lower.position.y = 1.52;
      g.add(lower);

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
      return;
    }

    // ── Plant builder ─────────────────────────────────────────────────
    function addPlant(x: number, z: number, scale = 1): void {
      const g = new THREE.Group();
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.2, 0.44, 8), mPot);
      pot.position.y = 0.22;
      g.add(pot);
      const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 7, 5), mLeaf);
      f1.position.y = 1.05;
      f1.scale.set(1, 1.1, 1);
      g.add(f1);
      const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.52, 6, 5), mLeaf);
      f2.position.set(0.52, 0.9, 0.1);
      g.add(f2);
      const f3 = new THREE.Mesh(new THREE.SphereGeometry(0.44, 6, 5), mLeaf);
      f3.position.set(-0.42, 0.95, 0.18);
      g.add(f3);
      g.scale.setScalar(scale);
      g.position.set(x, 0, z);
      scene.add(g);
    }

    // ── Build office ──────────────────────────────────────────────────
    const DESK_Z = -1.5;

    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 5.8;

      addDesk(dx, DESK_Z);

      // monitor on desk surface
      const scrMat = i === 1 ? mScrTeal : mScrPurp;
      const rotY   = i === 0 ? 0.08 : i === 2 ? -0.08 : 0;
      addMonitor(dx - 0.15, 1.87, DESK_Z - 0.85, scrMat, rotY);

      // chair (behind desk, between desk and camera)
      addChair(dx, DESK_Z + 1.45, 0);

      // person sitting (facing monitor = facing -z → rotY = Math.PI)
      addPerson(dx, DESK_Z + 0.75, BODY_COLORS[i], Math.PI);
    }

    // Plants
    addPlant(-12.5, -4, 1.1);
    addPlant(12.5, -4, 1.1);
    addPlant(-12.5, -8, 0.85);
    addPlant(12.5, -8, 0.85);
    addPlant(-12.5, 5, 0.9);

    // Small desk accessories (keyboards as flat boxes)
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 5.8;
      const kb = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.55), mDeskSide);
      kb.position.set(dx - 0.1, 1.94, DESK_Z + 0.4);
      scene.add(kb);
    }

    // ── Floating particles ────────────────────────────────────────────
    const pCount = 500;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      pPos[i3]     = (Math.random() - 0.5) * 28;
      pPos[i3 + 1] = Math.random() * 10;
      pPos[i3 + 2] = (Math.random() - 0.5) * 18 - 1;
      const isPurp = Math.random() > 0.45;
      pCol[i3]     = isPurp ? 0.6 : 0.05;
      pCol[i3 + 1] = isPurp ? 0.1 : 0.72;
      pCol[i3 + 2] = isPurp ? 1.0 : 0.52;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true,
      opacity: 0.85, sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Floating holographic data panels ─────────────────────────────
    const panelMats = [
      new THREE.MeshLambertMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.6, transparent: true, opacity: 0.55 }),
      new THREE.MeshLambertMaterial({ color: 0x0d9488, emissive: 0x0d9488, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 }),
    ];
    const floatPanels: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
    const panelConfigs = [
      { x: -10,  y: 5.5, z: -6,   mat: 0, w: 2.0, h: 1.3, ry: 0.25  },
      { x:  9.5, y: 4.5, z: -5,   mat: 1, w: 1.6, h: 1.1, ry: -0.22 },
      { x: -8.5, y: 7.5, z: -4,   mat: 0, w: 1.4, h: 0.9, ry: 0.18  },
      { x:  10,  y: 6.5, z: -3,   mat: 1, w: 1.8, h: 1.2, ry: -0.15 },
      { x:  2.5, y: 8.0, z: -7.5, mat: 0, w: 2.2, h: 1.4, ry: 0.05  },
      { x: -3.0, y: 6.8, z: -8,   mat: 1, w: 1.5, h: 1.0, ry: -0.08 },
    ];
    for (const cfg of panelConfigs) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(cfg.w, cfg.h), panelMats[cfg.mat]);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.ry;
      scene.add(mesh);
      floatPanels.push({ mesh, baseY: cfg.y, speed: 0.4 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2 });
    }

    // ── Events ───────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5);
      mouse.current.ty = -(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouseMove);

    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Animation loop ────────────────────────────────────────────────
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;

      // Smooth mouse lerp
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.045;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.045;

      // Scroll-based camera pull-back
      const heroEl = document.getElementById('hero');
      const heroH  = heroEl?.offsetHeight ?? window.innerHeight;
      const sf = Math.min(scrollRef.current / heroH, 1);

      camera.position.x = CAM_BASE.x + mouse.current.x * 3.8;
      camera.position.y = CAM_BASE.y + mouse.current.y * 2.2 - sf * 5;
      camera.position.z = CAM_BASE.z + sf * 14;
      camera.lookAt(
        mouse.current.x * 1.0,
        2,
        0,
      );

      // Gentle particle drift
      particles.rotation.y = t * 0.018;
      particles.position.y = Math.sin(t * 0.28) * 0.18;

      // Floating panels
      for (const fp of floatPanels) {
        fp.mesh.position.y = fp.baseY + Math.sin(t * fp.speed + fp.phase) * 0.28;
      }

      // Pulsing lights
      purplePoint.intensity = 10 + Math.sin(t * 1.4) * 2.5;
      tealPoint.intensity   = 8  + Math.sin(t * 1.1 + 1.2) * 2;
      for (const ll of lampLights) {
        ll.intensity = 6 + Math.sin(t * 2.0 + ll.position.x) * 0.4;
      }

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center overflow-hidden bg-[#08031a]">

      {/* Three.js canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Left-side dark gradient so text is readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 5,
          background:
            'linear-gradient(105deg, rgba(8,3,26,0.92) 0%, rgba(8,3,26,0.70) 38%, rgba(8,3,26,0.18) 62%, transparent 100%)',
        }}
      />

      {/* Bottom fade into page */}
      <div
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ zIndex: 5, background: 'linear-gradient(to top, #08031a 0%, transparent 100%)' }}
      />

      {/* Purple cursor glow — tracked via CSS custom property alternative (static) */}

      {/* ── Hero content ── */}
      <div className="relative px-8 md:px-14 lg:px-20 max-w-[44rem]" style={{ zIndex: 20 }}>

        {/* Logo */}
        <div className="mb-7">
          <img
            src="/K_white.png"
            alt="KONTAXES"
            className="h-16 w-auto drop-shadow-[0_0_36px_rgba(147,51,234,0.65)]"
          />
        </div>

        {/* Tag line */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Consultores Financieros & Fiscales
        </div>

        {/* Title */}
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

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-400 mb-9 max-w-md leading-relaxed">
          Contabilidad · Impuestos · Asesoría · Consultoría
        </p>

        {/* CTA buttons */}
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
            className="px-6 py-3 bg-white/8 border border-white/15 backdrop-blur-sm text-white font-bold rounded-xl text-sm
              hover:bg-white/14 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5"
          >
            Cotizar Ahora
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs tracking-widest uppercase pointer-events-none"
        style={{ zIndex: 20 }}
      >
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
