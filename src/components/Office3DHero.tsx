/**
 * Office3DHero — Animación 3D interactiva de oficina (KONTAXES)
 * --------------------------------------------------------------
 * Componente autocontenido para Vite + React 18 + TypeScript.
 * Renderiza SOLO la escena 3D (un <canvas> que llena su contenedor).
 * Pensado para ir DETRÁS del contenido del hero ya existente.
 *
 * Requisitos:
 *   npm i three
 *   (tipos incluidos en el paquete `three`)
 *
 * Assets estáticos (cópialos a /public/office3d/ — ver README):
 *   /office3d/chair.obj
 *   /office3d/chair_diffuse.jpg
 *   /office3d/plant.obj
 *   /office3d/plant_col.jpg
 *
 * Uso:
 *   <section className="relative h-screen w-full overflow-hidden">
 *     <Office3DHero className="absolute inset-0" />
 *     <div className="relative z-10"> ...tu texto/CTA del hero... </div>
 *   </section>
 *
 * Características conservadas:
 *   - Los objetos se ensamblan desde la nada al montar (escalonado + giro + caída).
 *   - La cámara orbita la oficina conforme se hace scroll por el hero.
 *   - Parallax suave con el mouse + ARRASTRAR para rotar la escena.
 *   - Pantallas animadas tipo Odoo / Excel / dashboard.
 *   - Silla y planta reales (modelos OBJ con textura).
 *   - Totalmente responsivo (se adapta al tamaño del contenedor / dispositivo).
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';

export interface Office3DHeroProps {
  /** Ruta base de los assets estáticos. Por defecto "/office3d". */
  assetsBase?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Llama con un setter fn(p) para controlar el progreso desde fuera (scroll externo). */
  onSetProgress?: (fn: (p: number) => void) => void;
}

// ===== Paleta de marca — edita aquí los colores =====
const C = {
  podiumWood: '#1a1626', podiumTop: '#262234', podiumTop2: '#2f2a40', podiumEdge: '#1d1929',
  woodTop: '#c79a63', woodTop2: '#b88a52', frame: '#3a3942', frameDark: '#2c2b33',
  chrome: '#cfd2db', monitor: '#586073', bezel: '#2b2e3a', stand: '#3a3d49',
  bookG: ['#6f8f6a', '#5d7d5a', '#7fa07a', '#557a52'], bookEnd: '#3f8fb0',
  mug: '#3f8fb0',
};

type Opt = any;

class OfficeScene {
  canvas: HTMLCanvasElement;
  wrap: HTMLElement;
  assetsBase: string;
  hasRB = true;
  dead = false;

  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  center!: THREE.Vector3;
  clock!: THREE.Clock;
  composer?: EffectComposer;
  bloom?: UnrealBloomPass;
  ro?: ResizeObserver;
  raf = 0;

  progress = 0; externalProgress = 0;
  mx = 0; my = 0; mxs = 0; mys = 0;
  userAz = 0; userEl = 0;
  drag: { x: number; y: number } | null = null;
  camDist = 21;
  sf = 0;

  pieces: { obj: THREE.Object3D; delay: number; baseY: number }[] = [];
  animators: ((t: number, assembled: boolean) => void)[] = [];
  screens: { texture: THREE.CanvasTexture; draw: (t: number) => void }[] = [];
  desks: { x: number; z: number; ry: number; py: number; screen: string }[] = [];
  ASSEMBLY_END = 4;

  particles?: THREE.Points;
  bgCanvas?: HTMLCanvasElement;
  bgCtx?: CanvasRenderingContext2D;
  bgTex?: THREE.CanvasTexture;

  onDown!: (e: PointerEvent) => void;
  onMove!: (e: PointerEvent) => void;
  onUp!: () => void;

  constructor(canvas: HTMLCanvasElement, assetsBase: string) {
    this.canvas = canvas;
    this.wrap = canvas.parentElement as HTMLElement;
    this.assetsBase = assetsBase.replace(/\/$/, '');
    this.init();
  }

  init() {
    const canvas = this.canvas, wrap = this.wrap;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    (renderer as Opt).outputEncoding = (THREE as Opt).sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.76;
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;

    // fondo animado (nebula canvas)
    const bgC = document.createElement('canvas'); bgC.width = 512; bgC.height = 512;
    const bgCtx = bgC.getContext('2d')!;
    const bgTex = new THREE.CanvasTexture(bgC);
    this.bgCanvas = bgC; this.bgCtx = bgCtx; this.bgTex = bgTex;
    scene.background = bgTex;

    // entorno PBR suave
    try {
      const eg = document.createElement('canvas'); eg.width = 8; eg.height = 256;
      const ex = eg.getContext('2d')!;
      const g = ex.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#8f7fc0'); g.addColorStop(0.5, '#5a4d82'); g.addColorStop(1, '#1a1230');
      ex.fillStyle = g; ex.fillRect(0, 0, 8, 256);
      const et = new THREE.CanvasTexture(eg);
      et.mapping = THREE.EquirectangularReflectionMapping;
      const pm = new THREE.PMREMGenerator(renderer); pm.compileEquirectangularShader();
      scene.environment = pm.fromEquirectangular(et).texture; et.dispose();
    } catch (e) { /* noop */ }

    const camera = new THREE.PerspectiveCamera(34, 1, 0.5, 200);
    this.camera = camera;
    this.center = new THREE.Vector3(-2.0, 2.4, 0.5);

    // luces
    scene.add(new THREE.AmbientLight(0x6a6090, 0.13));
    const key = new THREE.DirectionalLight(0xfff3df, 1.55);
    key.position.set(-7, 12, 9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const sc = key.shadow.camera;
    sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 60;
    key.shadow.bias = -0.0003; (key.shadow as Opt).normalBias = 0.03; key.shadow.radius = 5;
    scene.add(key);
    const winL = new THREE.DirectionalLight(0xcfe6ff, 0.7); winL.position.set(2, 8, -10); scene.add(winL);
    const rim = new THREE.DirectionalLight(0x8f6bff, 0.5); rim.position.set(9, 5, -7); scene.add(rim);
    const front = new THREE.DirectionalLight(0xead8ff, 0.55); front.position.set(0, 4, 12); scene.add(front);
    const pool = new THREE.PointLight(0xb79bff, 0.5, 18, 2.2); pool.position.set(-1, -0.4, 1.2); scene.add(pool);

    this.buildScene();

    this.clock = new THREE.Clock();
    const lastDelay = this.pieces.reduce((m, p) => Math.max(m, p.delay), 0);
    this.ASSEMBLY_END = lastDelay + 0.95 + 0.4;

    // post: bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.10, 0.45, 0.9);
    composer.addPass(bloom); this.bloom = bloom;
    composer.addPass(new ShaderPass(GammaCorrectionShader));
    this.composer = composer;

    // mouse: parallax + arrastre para rotar
    canvas.style.cursor = 'grab'; canvas.style.touchAction = 'pan-y';
    this.onDown = (e) => { this.drag = { x: e.clientX, y: e.clientY }; canvas.style.cursor = 'grabbing'; };
    this.onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      this.mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.my = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (this.drag) {
        const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
        this.drag.x = e.clientX; this.drag.y = e.clientY;
        this.userAz += dx * 0.006;
        this.userEl = Math.max(-0.28, Math.min(0.6, this.userEl - dy * 0.004));
      }
    };
    this.onUp = () => { if (this.drag) { this.drag = null; canvas.style.cursor = 'grab'; } };
    canvas.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerup', this.onUp);

    const resize = () => {
      const w = wrap.clientWidth || window.innerWidth, h = wrap.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      this.composer?.setSize(w, h); this.bloom?.setSize(w, h);
      const aspect = w / h;
      this.camDist = Math.max(20, 20 / Math.max(0.55, aspect)) * 1.05;
    };
    resize();
    this.ro = new ResizeObserver(resize); this.ro.observe(wrap);

    this.loop();
  }

  // ---------- helpers ----------
  mat(c: string, o: Opt = {}) {
    if (o.basic) return new THREE.MeshBasicMaterial({
      color: c, transparent: !!o.transparent, opacity: o.opacity != null ? o.opacity : 1,
      blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !o.add,
      toneMapped: o.tm !== false,
    });
    const m = new THREE.MeshStandardMaterial({
      color: c, roughness: o.rough != null ? o.rough : 0.7, metalness: o.metal != null ? o.metal : 0.0,
    });
    m.envMapIntensity = o.env != null ? o.env : 0.35;
    if (o.flat) m.flatShading = true;
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive); m.emissiveIntensity = o.ei || 1; }
    return m;
  }
  rbox(w: number, h: number, d: number, c: string, o: Opt = {}) {
    const md = Math.min(w, h, d);
    const r = Math.min(o.r != null ? o.r : 0.06, md * 0.48);
    const geo = this.hasRB ? new RoundedBoxGeometry(w, h, d, o.seg || 3, r) : new THREE.BoxGeometry(w, h, d);
    const m = new THREE.Mesh(geo, this.mat(c, o));
    m.castShadow = !o.noShadow; m.receiveShadow = !o.noShadow; this.place(m, o); return m;
  }
  cyl(rt: number, rb: number, h: number, c: string, seg = 32, o: Opt = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!o.open), this.mat(c, o));
    m.castShadow = !o.noShadow; m.receiveShadow = !o.noShadow; this.place(m, o); return m;
  }
  sph(r: number, c: string, o: Opt = {}) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.ws || 24, o.hs || 18), this.mat(c, o));
    m.castShadow = !o.noShadow; m.receiveShadow = !o.noShadow; this.place(m, o); return m;
  }
  place(m: THREE.Object3D, o: Opt) {
    if (o.x != null) m.position.x = o.x; if (o.y != null) m.position.y = o.y; if (o.z != null) m.position.z = o.z;
    if (o.rx != null) m.rotation.x = o.rx; if (o.ry != null) m.rotation.y = o.ry; if (o.rz != null) m.rotation.z = o.rz;
    if (o.sx != null) m.scale.x = o.sx; if (o.sy != null) m.scale.y = o.sy; if (o.sz != null) m.scale.z = o.sz;
  }
  reg(obj: THREE.Object3D, baseY?: number) {
    const u = obj.userData;
    u.baseY = baseY != null ? baseY : obj.position.y;
    u.baseRotY = obj.rotation.y;
    u.rise = 1.1 + Math.random() * 1.7;
    u.spin = (Math.random() * 2 - 1) * 0.7;
    u.dur = 0.62 + Math.random() * 0.18;
    obj.scale.set(0.001, 0.001, 0.001);
    this.pieces.push({ obj, delay: this.pieces.length * 0.085, baseY: u.baseY });
  }

  // ---------- fondo animado + partículas ----------
  drawNebula(t: number) {
    const ctx = this.bgCtx!; const W = 512;
    ctx.fillStyle = '#0d0620'; ctx.fillRect(0, 0, W, W);
    const nebulae: [number, number, number, string, number][] = [
      [0.30, 0.45, 0.55, 'rgba(90,35,160,0.22)', t * 0.07],
      [0.72, 0.30, 0.42, 'rgba(35,70,170,0.14)', t * 0.055 + 2],
      [0.50, 0.72, 0.60, 'rgba(110,40,180,0.12)', t * 0.065 + 4],
      [0.18, 0.80, 0.38, 'rgba(25,110,145,0.10)', t * 0.08 + 1],
      [0.85, 0.65, 0.45, 'rgba(70,20,130,0.16)', t * 0.058 + 3],
    ];
    nebulae.forEach(([nx, ny, nr, col, nt]) => {
      const cx = (nx + Math.sin(nt) * 0.06) * W, cy = (ny + Math.cos(nt * 0.75) * 0.06) * W, r = nr * W;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grd.addColorStop(0, col); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, W);
    });
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 37 + 17) % 100) / 100 * W, sy = ((i * 53 + 29) % 100) / 100 * W;
      const sa = 0.25 + Math.sin(t * 1.3 + i * 0.8) * 0.2;
      ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${sa})`; ctx.fill();
    }
    this.bgTex!.needsUpdate = true;
  }

  setupParticles() {
    const count = 220;
    const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
    const palette = [new THREE.Color('#8855ff'), new THREE.Color('#5544bb'), new THREE.Color('#3388cc'), new THREE.Color('#22aacc'), new THREE.Color('#cc88ff'), new THREE.Color('#aa66dd'), new THREE.Color('#44aaaa')];
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * 0.85;
      const r = 5 + Math.random() * 14;
      pos[i*3] = Math.sin(ph) * Math.cos(th) * r;
      pos[i*3+1] = Math.abs(Math.cos(ph)) * r;
      pos[i*3+2] = Math.sin(ph) * Math.sin(th) * r - 2;
      const c = palette[i % palette.length];
      col[i*3] = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({ size: 0.055, vertexColors: true, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  // ---------- escena ----------
  buildScene() {
    const S = this.scene;
    this.setupParticles();
    this.drawNebula(0);
    // charco de luz (bloom suave)
    const gc = document.createElement('canvas'); gc.width = 256; gc.height = 256;
    const gx = gc.getContext('2d')!;
    const rg = gx.createRadialGradient(128, 128, 4, 128, 128, 128);
    rg.addColorStop(0, 'rgba(190,168,255,0.5)'); rg.addColorStop(0.4, 'rgba(150,120,240,0.2)'); rg.addColorStop(1, 'rgba(120,90,220,0)');
    gx.fillStyle = rg; gx.fillRect(0, 0, 256, 256);
    const glowTex = new THREE.CanvasTexture(gc);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(16, 16),
      new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.position.set(-1, 2.2, -4.8); S.add(glow);

    // base circular
    const PY = 0.42;
    const pod = new THREE.Group();
    pod.add(this.cyl(5.0, 5.0, 0.42, C.podiumTop, 64, { y: 0.21, rough: 0.5, env: 0.5 }));
    pod.add(this.cyl(4.55, 4.55, 0.06, C.podiumTop2, 64, { y: 0.45, rough: 0.45, env: 0.6 }));
    pod.add(this.cyl(5.08, 5.18, 0.34, C.podiumEdge, 64, { y: -0.05, rough: 0.55 }));
    pod.add(this.cyl(5.18, 5.05, 0.12, C.podiumWood, 64, { y: -0.28, rough: 0.6 }));
    S.add(pod); this.reg(pod, 0);

    // escritorios
    this.desks = [
      { x: -1.95, z: 0.3, ry: 0.5, py: PY, screen: 'odoo' },
      { x: 1.95, z: 0.3, ry: -0.5, py: PY, screen: 'excel' },
    ];
    this.desks.forEach((d) => this.workstation(d));

    this.loadChairs(PY);
    this.loadPlants(PY);
    this.bigScreen(PY);
  }

  bigScreen(PY: number) {
    const g = new THREE.Group();
    g.add(this.rbox(1.5, 0.1, 0.8, '#2a2c34', { y: 0.05, r: 0.03, rough: 0.4, metal: 0.3 }));
    g.add(this.cyl(0.11, 0.13, 2.0, '#34384a', 16, { y: 1.05, rough: 0.35, metal: 0.5 }));
    const pw = 4.4, ph = 2.5;
    g.add(this.rbox(pw, ph, 0.14, '#15161c', { y: 3.0, r: 0.06, rough: 0.4 }));
    g.add(this.rbox(pw - 0.12, ph - 0.12, 0.05, '#0c0d11', { y: 3.0, z: 0.06, r: 0.03 }));
    const tex = this.screenTexture('dash');
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.22, ph - 0.22), new THREE.MeshBasicMaterial({ map: tex.texture }));
    scr.position.set(0, 3.0, 0.092); g.add(scr); this.screens.push(tex);
    g.position.set(0.2, PY, -2.95); g.rotation.y = 0.06;
    this.scene.add(g); this.reg(g, PY);
  }

  loadPlants(PY: number) {
    const tex = new THREE.TextureLoader().load(`${this.assetsBase}/plant_col.jpg`, (tx) => { (tx as Opt).encoding = (THREE as Opt).sRGBEncoding; tx.flipY = false; });
    new OBJLoader().load(`${this.assetsBase}/plant.obj`, (obj) => {
      if (this.dead) return;
      obj.traverse((ch: Opt) => { if (ch.isMesh) { ch.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.0, envMapIntensity: 0.45, side: THREE.DoubleSide, alphaTest: 0.5 }); ch.castShadow = true; ch.receiveShadow = true; } });
      const box = new THREE.Box3().setFromObject(obj); const size = new THREE.Vector3(); box.getSize(size); const c = new THREE.Vector3(); box.getCenter(c);
      const spots = [{ x: 3.35, z: -1.2, h: 2.6 }];
      spots.forEach((sp) => {
        const s = sp.h / size.y;
        const g = new THREE.Group();
        const m = obj.clone();
        m.scale.setScalar(s);
        m.position.set(-c.x * s, -box.min.y * s, -c.z * s);
        m.rotation.y = Math.random() * Math.PI * 2;
        g.add(m); g.position.set(sp.x, PY, sp.z);
        this.scene.add(g); this.reg(g, PY);
        const ph = Math.random() * 6;
        this.animators.push((t) => { g.rotation.z = Math.sin(t * 0.7 + ph) * 0.012; g.rotation.x = Math.cos(t * 0.6 + ph) * 0.01; });
      });
    }, undefined, (err) => console.warn('plant load failed', err));
  }

  loadChairs(PY: number) {
    const tex = new THREE.TextureLoader().load(`${this.assetsBase}/chair_diffuse.jpg`, (tx) => { (tx as Opt).encoding = (THREE as Opt).sRGBEncoding; });
    new OBJLoader().load(`${this.assetsBase}/chair.obj`, (obj) => {
      if (this.dead) return;
      obj.traverse((ch: Opt) => { if (ch.isMesh) { ch.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.05, envMapIntensity: 0.7, emissive: new THREE.Color('#1a120c'), emissiveIntensity: 0.35 }); ch.castShadow = true; ch.receiveShadow = true; } });
      const box = new THREE.Box3().setFromObject(obj); const size = new THREE.Vector3(); box.getSize(size); const c = new THREE.Vector3(); box.getCenter(c);
      const targetH = 2.6, s = targetH / size.z;
      const dist = 1.85;
      const spots = this.desks.map((d) => ({ x: d.x + Math.sin(d.ry) * dist, z: d.z + Math.cos(d.ry) * dist, ry: d.ry }));
      spots.forEach((sp) => {
        const g = new THREE.Group();
        const m = obj.clone();
        m.scale.setScalar(s);
        m.rotation.x = -Math.PI / 2;                  // Z-up -> Y-up
        m.position.set(-c.x * s, -box.min.z * s, c.y * s);
        g.add(m);
        g.position.set(sp.x, PY, sp.z); g.rotation.y = sp.ry + Math.PI;
        this.scene.add(g); this.reg(g, PY);
      });
    }, undefined, (err) => console.warn('chair load failed', err));
  }

  workstation(o: Opt) {
    const g = new THREE.Group();
    g.position.set(o.x, o.py, o.z); g.rotation.y = o.ry;
    const topY = 1.5, tw = 2.9, td = 1.5;

    g.add(this.rbox(tw, 0.12, td, C.woodTop, { y: topY, r: 0.04, rough: 0.45, env: 0.4 }));
    g.add(this.rbox(tw - 0.06, 0.04, td - 0.06, C.woodTop2, { y: topY - 0.08, r: 0.02, noShadow: true }));
    [-1, 1].forEach((s) => {
      const lx = s * (tw / 2 - 0.12);
      g.add(this.rbox(0.07, topY - 0.04, td - 0.5, C.frame, { x: lx, y: (topY - 0.04) / 2, z: 0, r: 0.02, rough: 0.4, metal: 0.55 }));
      g.add(this.rbox(0.16, 0.07, td - 0.32, C.frameDark, { x: lx, y: 0.05, z: 0, r: 0.02, rough: 0.4, metal: 0.55 }));
      g.add(this.rbox(0.16, 0.07, 0.5, C.frameDark, { x: lx, y: topY - 0.12, z: 0, r: 0.02, rough: 0.4, metal: 0.55 }));
    });
    g.add(this.cyl(0.05, 0.05, tw - 0.26, C.frame, 16, { x: 0, y: 0.34, z: -td / 2 + 0.32, rz: Math.PI / 2, rough: 0.4, metal: 0.55 }));

    const shY = 0.55;
    g.add(this.rbox(tw - 0.35, 0.08, td - 0.35, C.woodTop2, { y: shY, r: 0.03, rough: 0.5 }));
    let bx = -tw / 2 + 0.5;
    for (let i = 0; i < 5; i++) { const bh = 0.5 + Math.random() * 0.12; g.add(this.rbox(0.16, bh, 0.5, C.bookG[i % 4], { x: bx, y: shY + 0.04 + bh / 2, z: -0.1, r: 0.02, rz: i === 4 ? 0.18 : 0, rough: 0.6 })); bx += 0.2; }
    g.add(this.sph(0.13, C.bookEnd, { x: -tw / 2 + 0.42, y: shY + 0.17, z: -0.1, rough: 0.35 }));
    g.add(this.sph(0.13, C.bookEnd, { x: bx + 0.04, y: shY + 0.17, z: -0.1, rough: 0.35 }));

    const monY = topY - 0.255;
    const mon = this.monitor(o.screen); mon.position.set(-0.95, monY, -td / 2 + 0.34); mon.rotation.y = 0.2; g.add(mon);
    const mon2 = this.monitor(o.screen === 'odoo' ? 'excel' : 'odoo'); mon2.position.set(0.7, monY, -td / 2 + 0.36); mon2.rotation.y = -0.16; g.add(mon2);
    g.add(this.rbox(1.1, 0.045, 0.36, '#23252e', { y: topY + 0.085, x: -0.15, z: 0.2, r: 0.02, rough: 0.4 }));
    g.add(this.rbox(1.0, 0.012, 0.32, '#34384a', { y: topY + 0.11, x: -0.15, z: 0.2, r: 0.01, noShadow: true }));
    g.add(this.rbox(0.18, 0.04, 0.26, '#23252e', { y: topY + 0.085, x: 0.62, z: 0.24, r: 0.05 }));
    g.add(this.rbox(0.86, 0.05, 0.6, '#3a3d46', { y: topY + 0.09, x: -1.25, z: 0.42, r: 0.02, ry: 0.25, rough: 0.35, metal: 0.5 }));
    g.add(this.rbox(0.22, 0.05, 0.22, '#caa044', { y: topY + 0.125, x: -1.25, z: 0.42, r: 0.06, ry: 0.25, noShadow: true, metal: 0.6, rough: 0.3 }));
    g.add(this.rbox(0.7, 0.07, 0.5, '#e8e2d4', { y: topY + 0.095, x: 1.25, z: 0.34, r: 0.02, rz: 0.01, rough: 0.7 }));
    g.add(this.rbox(0.66, 0.04, 0.46, '#d8cfbd', { y: topY + 0.14, x: 1.27, z: 0.34, r: 0.02, noShadow: true }));
    g.add(this.rbox(0.36, 1.0, 0.72, '#2a2c34', { x: tw / 2 - 0.34, y: 0.5, z: 0.2, r: 0.03, rough: 0.4, metal: 0.3 }));
    g.add(this.rbox(0.04, 0.04, 0.04, '#46b566', { x: tw / 2 - 0.17, y: 0.92, z: 0.2, basic: true }));
    g.add(this.cyl(0.12, 0.1, 0.24, C.mug, 24, { y: topY + 0.18, x: 1.6, z: 0.18, rough: 0.3, env: 0.5 }));
    g.add(this.cyl(0.045, 0.045, 0.02, '#2f6f88', 16, { y: topY + 0.28, x: 1.7, z: 0.18, rx: Math.PI / 2, open: true }));

    this.scene.add(g); this.reg(g, o.py);
  }

  monitor(kind: string) {
    const g = new THREE.Group();
    g.add(this.rbox(1.55, 0.95, 0.09, C.bezel, { y: 0.95, r: 0.04, rough: 0.4 }));
    g.add(this.rbox(1.4, 0.82, 0.04, C.monitor, { y: 0.95, z: 0.05, r: 0.02, rough: 0.25, env: 0.6 }));
    g.add(this.cyl(0.06, 0.09, 0.42, C.stand, 20, { y: 0.55, rough: 0.3, metal: 0.4 }));
    g.add(this.rbox(0.55, 0.05, 0.34, C.stand, { y: 0.34, r: 0.02, rough: 0.3, metal: 0.4 }));
    const tex = this.screenTexture(kind);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.78), new THREE.MeshBasicMaterial({ map: tex.texture }));
    scr.position.set(0, 0.95, 0.071); g.add(scr); this.screens.push(tex);
    return g;
  }

  // ---------- pantallas (canvas animado) ----------
  screenTexture(kind: string) {
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 192;
    const ctx = cv.getContext('2d')!;
    const texture = new THREE.CanvasTexture(cv); texture.minFilter = THREE.LinearFilter;
    const draw = (t: number) => {
      if (kind === 'odoo') this.drawOdoo(ctx, t);
      else if (kind === 'excel') this.drawExcel(ctx, t);
      else this.drawDash(ctx, t);
      texture.needsUpdate = true;
    };
    draw(0);
    return { texture, draw };
  }
  rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  drawDash(ctx: CanvasRenderingContext2D, t: number) {
    const W = 320; ctx.fillStyle = '#1c1430'; ctx.fillRect(0, 0, W, 192);
    ctx.fillStyle = '#2a1f48'; ctx.fillRect(0, 0, W, 24);
    ctx.fillStyle = '#e6c068'; ctx.font = 'bold 12px Manrope,Arial'; ctx.fillText('KONTAXES', 10, 16);
    ctx.fillStyle = '#b9a8d8'; ctx.font = '9px Manrope,Arial'; ctx.fillText('Panel financiero — 2026', 230, 15);
    const kp: [string, string, string][] = [['Ingresos', '$1.24M', '#e6c068'], ['EBITDA', '32%', '#52b06a'], ['Flujo', '+18%', '#3f9ad8'], ['Clientes', '248', '#c78fe0']];
    kp.forEach((k, i) => { const x = 8 + i * 76; ctx.fillStyle = '#251a40'; this.rr(ctx, x, 32, 70, 40, 6); ctx.fill(); ctx.fillStyle = '#9a8ab8'; ctx.font = '7px Manrope,Arial'; ctx.fillText(k[0], x + 8, 46); ctx.fillStyle = k[2]; ctx.font = 'bold 15px Manrope,Arial'; ctx.fillText(k[1], x + 8, 64); });
    ctx.fillStyle = '#251a40'; this.rr(ctx, 8, 80, 196, 104, 6); ctx.fill();
    ctx.strokeStyle = '#3a2c58'; ctx.lineWidth = 1; for (let i = 1; i < 4; i++) { const y = 92 + i * 22; ctx.beginPath(); ctx.moveTo(16, y); ctx.lineTo(196, y); ctx.stroke(); }
    ctx.strokeStyle = '#e6c068'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 11; i++) { const px = 18 + i * 16, py = 150 - (Math.sin(i * 0.6 + t * 0.8) * 0.5 + 0.5) * 52 - i * 1.2; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
    ctx.strokeStyle = '#52b06a'; ctx.lineWidth = 1.6; ctx.beginPath();
    for (let i = 0; i <= 11; i++) { const px = 18 + i * 16, py = 158 - (Math.sin(i * 0.5 + t * 0.6 + 1.5) * 0.5 + 0.5) * 38 - i * 0.8; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
    const cx = 258, cy = 128, r = 34; const segs: [number, string][] = [[0.4, '#e6c068'], [0.3, '#52b06a'], [0.18, '#3f9ad8'], [0.12, '#c78fe0']]; let a = -Math.PI / 2;
    segs.forEach((s) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a + s[0] * Math.PI * 2); ctx.closePath(); ctx.fillStyle = s[1]; ctx.fill(); a += s[0] * Math.PI * 2; });
    ctx.fillStyle = '#1c1430'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Manrope,Arial'; ctx.textAlign = 'center'; ctx.fillText('100%', cx, cy + 4); ctx.textAlign = 'left';
  }
  drawOdoo(ctx: CanvasRenderingContext2D, t: number) {
    const W = 320; ctx.fillStyle = '#1a1128'; ctx.fillRect(0, 0, W, 192);
    ctx.fillStyle = '#5b3a6e'; ctx.fillRect(0, 0, W, 26); ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Manrope,Arial'; ctx.fillText('Ventas', 12, 18);
    ctx.font = '10px Manrope,Arial'; ctx.fillStyle = '#d9cce4'; ['Pedidos', 'Clientes', 'Productos', 'Informes'].forEach((s, i) => ctx.fillText(s, 70 + i * 58, 18));
    ctx.fillStyle = '#231535'; ctx.fillRect(0, 26, W, 18); ctx.fillStyle = '#b09ac8'; ctx.font = 'bold 9px Manrope,Arial'; ctx.fillText('Tablero de control', 12, 39);
    const kp: [string, string, string][] = [['Ingresos', '$ 84.2k', '#c97fe0'], ['Facturas', '126', '#3fd0e0'], ['Margen', '38%', '#52c88a']];
    kp.forEach((k, i) => { const x = 10 + i * 100; ctx.fillStyle = '#2d1e44'; this.rr(ctx, x, 52, 92, 40, 6); ctx.fill(); ctx.fillStyle = '#8a7aa8'; ctx.font = '8px Manrope,Arial'; ctx.fillText(k[0], x + 9, 66); ctx.fillStyle = k[2]; ctx.font = 'bold 15px Manrope,Arial'; ctx.fillText(k[1], x + 9, 84); });
    ctx.fillStyle = '#221540'; this.rr(ctx, 10, 100, 300, 82, 6); ctx.fill();
    [0.5, 0.7, 0.45, 0.85, 0.6, 0.95, 0.75].forEach((b, i) => { const p = 0.85 + 0.15 * Math.sin(t * 2 + i), hh = 60 * b * p; ctx.fillStyle = i === 5 ? '#caa044' : '#9a4bcc'; this.rr(ctx, 22 + i * 40, 170 - hh, 24, hh, 3); ctx.fill(); });
    ctx.fillStyle = '#8070a4'; ctx.font = '8px Manrope,Arial'; ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach((d, i) => ctx.fillText(d, 30 + i * 40, 180));
  }
  drawExcel(ctx: CanvasRenderingContext2D, t: number) {
    const W = 320; ctx.fillStyle = '#0f1a0f'; ctx.fillRect(0, 0, W, 192); ctx.fillStyle = '#157347'; ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Manrope,Arial'; ctx.fillText('Presupuesto 2026.xlsx', 10, 15); ctx.fillStyle = '#1a2e1a'; ctx.fillRect(0, 22, W, 16);
    const cw = 44, x0 = 22; ctx.fillStyle = '#5a8a5a'; ctx.font = '8px Manrope,Arial'; ['A', 'B', 'C', 'D', 'E', 'F'].forEach((c, i) => ctx.fillText(c, x0 + i * cw + 18, 33));
    ctx.strokeStyle = '#1e3a1e'; ctx.lineWidth = 1;
    for (let r = 0; r < 9; r++) { const y = 38 + r * 17; ctx.fillStyle = r % 2 ? '#101f10' : '#0f1a0f'; ctx.fillRect(22, y, W - 22, 17); ctx.fillStyle = '#4a6a4a'; ctx.font = '8px Manrope,Arial'; ctx.fillText(String(r + 1), 6, y + 12); for (let c = 0; c < 6; c++) { ctx.beginPath(); ctx.moveTo(x0 + c * cw, y); ctx.lineTo(x0 + c * cw, y + 17); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const rows = [['Ingresos', '12,400', '13,100', '14,800'], ['Costos', '7,200', '7,050', '7,600'], ['Nómina', '3,100', '3,100', '3,250'], ['Utilidad', '2,100', '2,950', '3,950']];
    rows.forEach((rw, r) => { rw.forEach((v, c) => { ctx.fillStyle = c === 0 ? '#88bb88' : (r === 3 ? '#52c88a' : '#ccddcc'); ctx.font = (c === 0 || r === 3) ? 'bold 8px Manrope,Arial' : '8px Manrope,Arial'; ctx.fillText(v, x0 + c * cw + 6, 38 + (r + 1) * 17 - 5); }); });
    const sel = Math.floor(t * 0.8) % 4; ctx.strokeStyle = '#52c88a'; ctx.lineWidth = 2; ctx.strokeRect(x0 + 3 * cw, 38 + (sel + 1) * 17, cw, 17);
    ctx.strokeStyle = '#52c88a'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 0; i < 7; i++) { const px = 240 + i * 10, py = 150 - Math.sin(t * 1.5 + i * 0.6) * 6 - i * 2; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.stroke();
  }

  eob(x: number) { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }

  loop = () => {
    if (this.dead) return;
    this.raf = requestAnimationFrame(this.loop);
    const t = this.clock.getElapsedTime();
    const as = t > this.ASSEMBLY_END;
    this.pieces.forEach((p) => {
      const o = p.obj; const u = o.userData;
      const lp = Math.min(1, Math.max(0, (t - p.delay) / (u.dur || 0.7)));
      const e = lp <= 0 ? 0 : this.eob(lp);
      const inv = 1 - lp;
      const sv = e < 0.001 ? 0.001 : e;
      o.scale.set(sv, sv, sv);
      o.position.y = p.baseY - inv * inv * (u.rise || 1.4);
      o.rotation.y = (u.baseRotY || 0) + inv * inv * (u.spin || 0);
    });
    for (let i = 0; i < this.animators.length; i++) this.animators[i](t, as);
    this.sf++;
    if (this.sf % 4 === 0) this.screens.forEach((s) => s.draw(t));
    if (this.sf % 2 === 0) this.drawNebula(t);
    this.mxs += (this.mx - this.mxs) * 0.06; this.mys += (this.my - this.mys) * 0.06;
    this.progress += (this.externalProgress - this.progress) * 0.07;
    if (this.particles) this.particles.rotation.y = t * 0.018;
    const az = -0.5 + this.progress * 1.60 + Math.sin(t * 0.14) * 0.02 + this.mxs * 0.07 + this.userAz;
    const el = Math.max(0.05, Math.min(0.64, 0.28 - this.progress * 0.04 - this.mys * 0.03 + this.userEl));
    const R = this.camDist;
    this.camera.position.set(Math.sin(az) * Math.cos(el) * R, this.center.y + Math.sin(el) * R + 1.0, Math.cos(az) * Math.cos(el) * R);
    this.camera.lookAt(this.center);
    if (this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.ro?.disconnect();
    this.bgTex?.dispose();
    this.particles?.geometry.dispose();
    (this.particles?.material as THREE.Material | undefined)?.dispose();
    this.renderer?.dispose();
  }
}

export default function Office3DHero({ assetsBase = '/office3d', className, style, onSetProgress }: Office3DHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const scene = new OfficeScene(canvasRef.current, assetsBase);
    if (onSetProgress) onSetProgress((p: number) => { scene.externalProgress = p; });
    return () => scene.dispose();
  }, [assetsBase, onSetProgress]);

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, ...style }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
}
