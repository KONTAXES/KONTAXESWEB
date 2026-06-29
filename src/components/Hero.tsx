import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import gsap from 'gsap';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    RectAreaLightUniformsLib.init();

    // ── Renderer ─────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Environment ───────────────────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.4;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      40, window.innerWidth / window.innerHeight, 0.1, 140
    );
    const CAM = { x: 8.5, y: 6.8, z: 17 };
    const cam = { x: CAM.x, y: 16, z: 34 };
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(0, 2.5, 0);

    // ── Post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.18, 0.5, 0.90
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Lighting ──────────────────────────────────────────────────────
    // Warm hemisphere
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x140828, 0.7));

    // Key light (warm sunlight top-right)
    const key = new THREE.DirectionalLight(0xffecd0, 3.2);
    key.position.set(14, 20, 12);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.camera.left   = -20;
    key.shadow.camera.right  =  20;
    key.shadow.camera.top    =  16;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far    = 70;
    key.shadow.radius        = 6;
    key.shadow.bias          = -0.0005;
    scene.add(key);

    // Fill light (cool from left)
    const fill = new THREE.DirectionalLight(0xc4d8ff, 1.0);
    fill.position.set(-12, 9, 7);
    scene.add(fill);

    // Brand rim (back-left)
    const rim = new THREE.DirectionalLight(0xb06aff, 0.8);
    rim.position.set(-14, 3, -16);
    scene.add(rim);

    // RectArea ceiling panels — soft, area-based illumination
    const rectCfg = [
      { x: -5.8, c: 0xfff5e0, w: 5.5, h: 3 },
      { x:  0,   c: 0xfff5e0, w: 5.5, h: 3 },
      { x:  5.8, c: 0xfff5e0, w: 5.5, h: 3 },
    ];
    for (const r of rectCfg) {
      const rl = new THREE.RectAreaLight(r.c, 5.5, r.w, r.h);
      rl.position.set(r.x, 9.6, -1.8);
      rl.rotation.x = -Math.PI / 2;
      scene.add(rl);
    }

    // Accent purple rect light from windows
    const purpRect = new THREE.RectAreaLight(0x9333ea, 2.5, 18, 7);
    purpRect.position.set(0, 5.5, -10.5);
    purpRect.lookAt(0, 2, 0);
    scene.add(purpRect);

    // Screen glow points
    const scrGlows = [-5.8, 0, 5.8].map((x, i) => {
      const l = new THREE.PointLight(i === 1 ? 0x0d9488 : 0x9333ea, 3.0, 7);
      l.position.set(x, 3.2, -4);
      scene.add(l);
      return l;
    });

    // ── PBR helpers ───────────────────────────────────────────────────
    const S = (
      color: number,
      roughness = 0.82,
      metalness = 0,
      extras: Partial<THREE.MeshStandardMaterialParameters> = {}
    ) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extras });

    const P = (
      color: number,
      roughness = 0.6,
      metalness = 0,
      clearcoat = 0,
      clearcoatRoughness = 0.1,
      extras: Partial<THREE.MeshPhysicalMaterialParameters> = {}
    ) => new THREE.MeshPhysicalMaterial({
      color, roughness, metalness, clearcoat, clearcoatRoughness, ...extras,
    });

    // ── Materials ─────────────────────────────────────────────────────
    // Floor (polished dark surface — star of the show)
    const mFloor = new THREE.MeshPhysicalMaterial({
      color: 0x07021a,
      roughness: 0.06,
      metalness: 0.0,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.2,
    });
    // Desk wood (warm, rich)
    const mWood   = P(0xc8973c, 0.42, 0.02, 0.55, 0.22);
    const mWoodDk = P(0xa87830, 0.46, 0.02, 0.45, 0.25);  // darker inlay
    const mDeskFrame = S(0x1a1714, 0.72, 0.18);
    // Chair — orange leather
    const mChairSeat = P(0xf97316, 0.34, 0.0, 0.55, 0.20);
    const mChairAcct = P(0xea580c, 0.38, 0.0, 0.48, 0.24);
    const mChairBase = S(0x2e3340, 0.5, 0.35);
    // Monitors
    const mMonFr   = P(0x0d1117, 0.45, 0.32, 0.35, 0.3);
    const mScrPurp = new THREE.MeshStandardMaterial({
      color: 0x3b0764, emissive: 0x9333ea, emissiveIntensity: 2.2, roughness: 0.04,
    });
    const mScrTeal = new THREE.MeshStandardMaterial({
      color: 0x042f2e, emissive: 0x0d9488, emissiveIntensity: 2.0, roughness: 0.04,
    });
    // Skin — warm with subtle SSS hint
    const mSkin    = P(0xfcd9b6, 0.84, 0, 0.08, 0.5, { sheenColor: new THREE.Color(0xfbb89c), sheen: 0.05 });
    const mHair1   = P(0x1c0f04, 0.88, 0, 0.08, 0.5);
    const mHair2   = P(0x78350f, 0.84, 0, 0.08, 0.5);
    const mHair3   = P(0x1e1b4b, 0.88, 0, 0.06, 0.5);
    const SHIRTS   = [0x0ea5e9, 0xa855f7, 0x22c55e].map(c => P(c, 0.88, 0, 0.04, 0.6));
    const PANTS    = [0x1e293b, 0x1e1b4b, 0x374151].map(c => S(c, 0.84));
    const mShoes   = P(0xfef3c7, 0.82, 0, 0.1, 0.5);
    // Plants
    const mPotClay = P(0xc2410c, 0.68, 0, 0.15, 0.3);
    const mPotBlue = P(0x94a3b8, 0.52, 0.05, 0.25, 0.3);
    const mLeaf    = P(0x16a34a, 0.94, 0, 0.05, 0.6);
    const mLeafDk  = P(0x15803d, 0.93, 0, 0.04, 0.6);
    const mCactus  = P(0x4d7c0f, 0.92, 0, 0.04, 0.6);
    const mSoil    = S(0x2d1a0a, 0.99, 0, { envMapIntensity: 0 });
    // Books
    const BOOKS    = [0x3b82f6, 0x22c55e, 0x64748b, 0xe67e22, 0x6366f1, 0xef4444]
      .map(c => P(c, 0.88, 0, 0.06, 0.4));
    // Accessories
    const mCup     = P(0x38bdf8, 0.48, 0, 0.4, 0.2);
    const mLamp    = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xfff9e6, emissiveIntensity: 2.0, roughness: 1,
    });
    const mPaper   = S(0xf8f5ee, 0.97);
    const mPenCup  = P(0x1e1b4b, 0.55, 0.1, 0.3, 0.3);
    const mPen     = S(0x0f172a, 0.55, 0.2);
    const mSticky  = [0xfbbf24, 0xf472b6, 0x34d399].map(c => S(c, 0.98));

    // ── Office group ──────────────────────────────────────────────────
    const officeGroup = new THREE.Group();
    scene.add(officeGroup);

    // ── Polished floor ────────────────────────────────────────────────
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 45), mFloor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    officeGroup.add(floor);

    // Subtle floor accent lines (grid lines — very faint)
    for (let gx = -20; gx <= 20; gx += 5) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.002, 40),
        S(0x4c1d95, 0.98, 0, { envMapIntensity: 0, transparent: true, opacity: 0.18 })
      );
      line.position.set(gx, 0.001, 0);
      officeGroup.add(line);
    }
    for (let gz = -20; gz <= 20; gz += 5) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(50, 0.002, 0.02),
        S(0x4c1d95, 0.98, 0, { envMapIntensity: 0, transparent: true, opacity: 0.18 })
      );
      line.position.set(0, 0.001, gz);
      officeGroup.add(line);
    }

    // ── Desk builder ──────────────────────────────────────────────────
    function addDesk(parent: THREE.Group, x: number, z: number, ry = 0): void {
      const g = new THREE.Group();

      // Desktop surface (with inlay strips)
      const top = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.1, 2.15), mWood);
      top.position.y = 1.82;
      top.castShadow = true;
      top.receiveShadow = true;
      g.add(top);

      // Desktop edge chamfer (slight bevel look)
      const edge = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.04, 0.04), mWoodDk);
      edge.position.set(0, 1.77, 1.078);
      g.add(edge);
      const edge2 = edge.clone();
      edge2.position.z = -1.078;
      g.add(edge2);

      // Under-shelf
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.9), mWood);
      shelf.position.set(-0.5, 0.84, 0);
      shelf.receiveShadow = true;
      g.add(shelf);

      // 4 round legs
      for (const [lx, lz] of [[-2.08, -0.9], [2.08, -0.9], [-2.08, 0.9], [2.08, 0.9]] as [number, number][]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.065, 1.82, 22), mDeskFrame);
        leg.position.set(lx, 0.91, lz);
        leg.castShadow = true;
        g.add(leg);
        // Foot cap
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 18), S(0x0a0a0a, 0.5, 0.2));
        cap.position.set(lx, 0.015, lz);
        g.add(cap);
      }

      // Horizontal stretchers
      for (const lz of [-0.9, 0.9]) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 4.16, 12), mDeskFrame);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 0.46, lz);
        g.add(bar);
      }

      // Cable management tray (under desk, realistic)
      const tray = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.28), S(0x111318, 0.7, 0.1));
      tray.position.set(0.5, 1.52, 0.6);
      g.add(tray);

      g.position.set(x, 0, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Monitor ───────────────────────────────────────────────────────
    function addMonitor(parent: THREE.Group, x: number, z: number, sm: THREE.Material, ry = 0): void {
      const g = new THREE.Group();

      // Outer frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.72, 1.74, 0.1), mMonFr);
      frame.position.y = 0.9;
      frame.castShadow = true;
      g.add(frame);

      // Screen
      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.48, 1.56, 0.06), sm as THREE.MeshStandardMaterial);
      screen.position.set(0, 0.9, 0.09);
      g.add(screen);

      // Bezel
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.54, 1.62, 0.03), P(0x080c12, 0.55, 0.3, 0.2));
      bezel.position.set(0, 0.9, 0.07);
      g.add(bezel);

      // Camera dot
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x111, emissive: 0x00ff44, emissiveIntensity: 1.2, roughness: 0.2 }));
      dot.position.set(0, 1.79, 0.1);
      g.add(dot);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.065, 0.52, 18), mMonFr);
      neck.position.y = 0.15;
      g.add(neck);

      // Base (wider, more premium)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.46, 0.06, 26), mMonFr);
      base.position.y = -0.11;
      g.add(base);

      g.position.set(x, 1.84, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Chair (orange) ────────────────────────────────────────────────
    function addChair(parent: THREE.Group, x: number, z: number, ry = 0): void {
      const g = new THREE.Group();

      // Seat cushion
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.73, 0.15, 34), mChairSeat);
      seat.position.y = 0.95;
      seat.castShadow = true;
      g.add(seat);
      const seatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.06, 34), mChairAcct);
      seatTop.position.y = 1.02;
      g.add(seatTop);

      // Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.14, 0.1), mChairSeat);
      back.position.set(0, 1.63, -0.62);
      back.castShadow = true;
      g.add(back);
      // Rounded back cap
      const backCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.66, 0.66, 0.1, 26, 1, false, 0, Math.PI),
        mChairSeat
      );
      backCap.rotation.z = Math.PI / 2;
      backCap.position.set(0, 2.2, -0.62);
      g.add(backCap);
      // Headrest
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.42, 0.1), mChairAcct);
      head.position.set(0, 2.2, -0.64);
      g.add(head);
      // Lumbar support
      const lumbar = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.32, 0.08), mChairAcct);
      lumbar.position.set(0, 1.3, -0.56);
      g.add(lumbar);

      // Armrests
      for (const side of [-1, 1]) {
        const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.7, 14), mChairBase);
        armPost.position.set(side * 0.74, 1.42, -0.08);
        g.add(armPost);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.48), mChairSeat);
        pad.position.set(side * 0.74, 1.8, -0.08);
        g.add(pad);
      }

      // Column + pneumatic cylinder
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.9, 22), mChairBase);
      col.position.y = 0.52;
      g.add(col);
      const pneu = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16), S(0x888, 0.3, 0.7));
      pneu.position.y = 0.12;
      g.add(pneu);

      // 5-spoke star base
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.6, 6, 10), mChairBase);
        spoke.rotation.z = Math.PI / 2;
        spoke.position.set(Math.cos(a) * 0.32, 0.06, Math.sin(a) * 0.32);
        spoke.rotation.y = a;
        g.add(spoke);
        const caster = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), P(0x0d0d0d, 0.4, 0.1, 0.2));
        caster.scale.set(1, 0.7, 1);
        caster.position.set(Math.cos(a) * 0.7, 0.045, Math.sin(a) * 0.7);
        g.add(caster);
      }

      g.position.set(x, 0, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Person ────────────────────────────────────────────────────────
    function addPerson(parent: THREE.Group, x: number, z: number, idx: number, ry = Math.PI): void {
      const g = new THREE.Group();
      const mShirt = SHIRTS[idx % SHIRTS.length];
      const mPants = PANTS[idx % PANTS.length];
      const mHair  = [mHair1, mHair2, mHair3][idx % 3];

      // Torso
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.68, 18, 34), mShirt);
      torso.position.y = 2.12;
      torso.castShadow = true;
      g.add(torso);

      // Collar
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.155, 0.185, 0.2, 22), S(0xf8f8f8, 0.92));
      collar.position.y = 2.54;
      g.add(collar);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.135, 0.26, 22), mSkin);
      neck.position.y = 2.6;
      g.add(neck);

      // Head — high poly
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.355, 44, 44), mSkin);
      headMesh.position.y = 2.9;
      headMesh.castShadow = true;
      g.add(headMesh);

      // Ears
      for (const ex of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.102, 18, 16), mSkin);
        ear.scale.set(0.5, 0.72, 0.52);
        ear.position.set(ex * 0.335, 2.89, 0.02);
        g.add(ear);
      }

      // Hair
      const hairTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.375, 38, 26, 0, Math.PI * 2, 0, Math.PI * 0.54),
        mHair
      );
      hairTop.position.y = 2.94;
      g.add(hairTop);
      // Side hair fill
      const hairSide = new THREE.Mesh(
        new THREE.SphereGeometry(0.365, 28, 22, Math.PI * 0.5, Math.PI, Math.PI * 0.3, Math.PI * 0.5),
        mHair
      );
      hairSide.position.y = 2.94;
      g.add(hairSide);

      // Eyebrows (a bit more defined)
      for (const ex of [-0.12, 0.12]) {
        const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.1, 6, 10), mHair);
        brow.rotation.z = Math.PI / 2;
        brow.rotation.x = -0.18;
        brow.position.set(ex, 2.97, 0.298);
        brow.rotation.y = ex > 0 ? -0.12 : 0.12;
        g.add(brow);
      }

      // Eyes
      for (const ex of [-0.115, 0.115]) {
        const white = new THREE.Mesh(new THREE.SphereGeometry(0.068, 18, 16), S(0xf6f6f6, 0.95));
        white.position.set(ex, 2.91, 0.307);
        g.add(white);
        const iris = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 14), P(0x3b2010, 0.2, 0, 0.5));
        iris.position.set(ex, 2.91, 0.324);
        g.add(iris);
        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), S(0x060606, 0.5));
        pupil.position.set(ex, 2.91, 0.336);
        g.add(pupil);
        const shine = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), S(0xffffff, 0.95));
        shine.position.set(ex + 0.02, 2.926, 0.344);
        g.add(shine);
      }

      // Nose (subtle bump)
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mSkin);
      nose.scale.set(0.9, 0.6, 1.0);
      nose.position.set(0, 2.86, 0.35);
      g.add(nose);

      // Mouth (slightly curved)
      const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.08, 4, 8), S(0xb06060, 0.9));
      mouth.rotation.z = Math.PI / 2;
      mouth.position.set(0, 2.822, 0.348);
      g.add(mouth);

      // Upper arms
      const armGeo = new THREE.CapsuleGeometry(0.11, 0.4, 12, 22);
      const armL = new THREE.Mesh(armGeo, mShirt);
      armL.position.set(-0.44, 2.15, 0.22);
      armL.rotation.x = -0.6; armL.rotation.z = 0.24;
      armL.castShadow = true;
      g.add(armL);
      const armR = new THREE.Mesh(armGeo, mShirt);
      armR.position.set(0.44, 2.15, 0.22);
      armR.rotation.x = -0.6; armR.rotation.z = -0.24;
      armR.castShadow = true;
      g.add(armR);

      // Forearms (skin)
      const foreGeo = new THREE.CapsuleGeometry(0.092, 0.32, 10, 20);
      const foreL = new THREE.Mesh(foreGeo, mSkin);
      foreL.position.set(-0.46, 1.98, 0.4);
      foreL.rotation.x = -0.22; foreL.rotation.z = 0.16;
      g.add(foreL);
      const foreR = new THREE.Mesh(foreGeo, mSkin);
      foreR.position.set(0.46, 1.98, 0.4);
      foreR.rotation.x = -0.22; foreR.rotation.z = -0.16;
      g.add(foreR);

      // Hands
      for (const hx of [-0.47, 0.47]) {
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.122, 20, 18), mSkin);
        hand.scale.set(1, 0.72, 0.88);
        hand.position.set(hx, 1.93, 0.46);
        g.add(hand);
        // Thumb hint
        const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.07, 4, 8), mSkin);
        thumb.position.set(hx + (hx < 0 ? -0.1 : 0.1), 1.94, 0.44);
        thumb.rotation.z = hx < 0 ? 0.8 : -0.8;
        g.add(thumb);
      }

      // Lower body / hips
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.36, 14, 30), mPants);
      lower.position.y = 1.54;
      g.add(lower);

      // Legs
      for (const lx of [-0.15, 0.15]) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.58, 12, 22), mPants);
        leg.position.set(lx, 1.1, 0.24);
        leg.rotation.x = 0.24;
        g.add(leg);
      }

      // Shoes
      for (const lx of [-0.15, 0.15]) {
        const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 10, 18), mShoes);
        shoe.rotation.x = Math.PI / 2;
        shoe.position.set(lx, 0.62, 0.54);
        g.add(shoe);
        // Shoe sole
        const sole = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.28, 8, 14), S(0x1a1a2e, 0.55));
        sole.rotation.x = Math.PI / 2;
        sole.position.set(lx, 0.55, 0.54);
        g.add(sole);
      }

      g.position.set(x, 0, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Plant ─────────────────────────────────────────────────────────
    function addPlant(
      parent: THREE.Group,
      x: number, z: number, sc = 1,
      potMat = mPotClay,
      type: 'tropical' | 'cactus' | 'bush' = 'tropical'
    ): void {
      const g = new THREE.Group();

      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.27, 0.56, 30), potMat);
      pot.position.y = 0.28;
      pot.castShadow = true;
      g.add(pot);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.05, 16, 34), potMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.54;
      g.add(rim);
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 24), mSoil);
      soil.position.y = 0.55;
      g.add(soil);

      if (type === 'tropical') {
        const leaves: [number, number, number, number][] = [
          [0, 1.18, 0, 0.82], [0.62, 1.0, 0.1, 0.6], [-0.55, 1.06, 0.16, 0.56],
          [0.28, 1.46, -0.34, 0.52], [-0.32, 0.94, -0.36, 0.48],
          [0.14, 0.84, 0.48, 0.44], [0.48, 1.3, -0.2, 0.42], [-0.22, 1.36, 0.32, 0.4],
          [0.1, 1.62, 0.18, 0.36],
        ];
        for (const [lx, ly, lz, lr] of leaves) {
          const lf = new THREE.Mesh(
            new THREE.SphereGeometry(lr, 20, 18),
            Math.random() > 0.5 ? mLeaf : mLeafDk
          );
          lf.position.set(lx, ly, lz);
          lf.castShadow = true;
          g.add(lf);
        }
      } else if (type === 'cactus') {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.58, 14, 26), mCactus);
        body.position.y = 1.04;
        g.add(body);
        for (const side of [-1, 1]) {
          const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.3, 10, 18), mCactus);
          arm.position.set(side * 0.3, 1.14, 0);
          arm.rotation.z = side * 0.58;
          g.add(arm);
        }
      } else {
        const main = new THREE.Mesh(new THREE.SphereGeometry(0.62, 22, 20), mLeaf);
        main.position.y = 0.98;
        g.add(main);
        const s1 = new THREE.Mesh(new THREE.SphereGeometry(0.44, 18, 16), mLeafDk);
        s1.position.set(0.5, 0.88, 0.12);
        g.add(s1);
        const s2 = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 14), mLeaf);
        s2.position.set(-0.44, 0.84, 0.1);
        g.add(s2);
        const s3 = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 14), mLeafDk);
        s3.position.set(0.12, 1.3, -0.22);
        g.add(s3);
      }

      g.scale.setScalar(sc);
      g.position.set(x, 0, z);
      parent.add(g);
    }

    // ── Books ─────────────────────────────────────────────────────────
    function addBooks(parent: THREE.Group, x: number, y: number, z: number): void {
      const g = new THREE.Group();
      let by = 0;
      const books = [
        { h: 0.22, w: 1.02, d: 0.68 }, { h: 0.18, w: 0.96, d: 0.64 },
        { h: 0.24, w: 0.9,  d: 0.66 }, { h: 0.16, w: 0.94, d: 0.62 },
        { h: 0.2,  w: 1.0,  d: 0.68 }, { h: 0.19, w: 0.88, d: 0.62 },
      ];
      books.forEach((b, i) => {
        const book = new THREE.Mesh(new THREE.BoxGeometry(b.d, b.h, b.w), BOOKS[i % BOOKS.length]);
        book.position.set(0, by + b.h / 2, 0);
        book.rotation.y = (Math.random() - 0.5) * 0.05;
        book.castShadow = true;
        g.add(book);
        by += b.h + 0.007;
      });
      g.position.set(x, y, z);
      parent.add(g);
    }

    // ── Desk accessories ──────────────────────────────────────────────
    function addDeskAccessories(parent: THREE.Group, x: number, z: number): void {
      // Pen/pencil cup
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.085, 0.26, 22), mPenCup);
      cup.position.set(x, 1.94, z);
      cup.castShadow = true;
      parent.add(cup);
      // Pens sticking out
      for (let p = 0; p < 4; p++) {
        const a = (p / 4) * Math.PI * 2 + 0.2;
        const pen = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.22, 4, 8), mPen);
        pen.position.set(x + Math.cos(a) * 0.055, 2.1, z + Math.sin(a) * 0.055);
        pen.rotation.x = (Math.random() - 0.5) * 0.3;
        pen.rotation.z = (Math.random() - 0.5) * 0.3;
        parent.add(pen);
      }
      // Paper stack
      for (let ps = 0; ps < 3; ps++) {
        const paper = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.008, 0.65),
          S(0xf0ede5, 0.97, 0, { envMapIntensity: 0 })
        );
        paper.position.set(x - 0.85, 1.878 + ps * 0.009, z - 0.3);
        paper.rotation.y = (ps - 1) * 0.04;
        parent.add(paper);
      }
    }

    // ── Sticky notes ──────────────────────────────────────────────────
    function addStickyNote(parent: THREE.Group, x: number, y: number, z: number, matIdx: number, ry = 0): void {
      const note = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.42, 0.008), mSticky[matIdx % mSticky.length]);
      note.position.set(x, y, z);
      note.rotation.y = ry;
      note.castShadow = true;
      parent.add(note);
      // Lines on sticky note
      for (let li = 0; li < 3; li++) {
        const line = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.006, 0.003),
          S(0x00000, 0.9, 0, { transparent: true, opacity: 0.2, envMapIntensity: 0 })
        );
        line.position.set(x, y - 0.1 + li * 0.1, z + 0.006);
        line.rotation.y = ry;
        parent.add(line);
      }
    }

    // ── Assemble scene ────────────────────────────────────────────────
    const DZ = -1.5;

    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 5.8;
      addDesk(officeGroup, dx, DZ);
      addMonitor(officeGroup, dx - 0.1, DZ - 0.88, i === 1 ? mScrTeal : mScrPurp, (i - 1) * -0.08);
      addChair(officeGroup, dx, DZ + 1.55, 0);
      addPerson(officeGroup, dx, DZ + 0.82, i, Math.PI);
      addDeskAccessories(officeGroup, dx + 1.7, DZ - 0.4);

      // Keyboard
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 0.038, 0.58),
        P(0x1a1834, 0.6, 0.05, 0.25, 0.4)
      );
      kb.position.set(dx - 0.05, 1.877, DZ + 0.46);
      officeGroup.add(kb);
      // Keyboard detail row
      const kbRow = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.014, 0.04), S(0x252445, 0.7));
      kbRow.position.set(dx - 0.05, 1.898, DZ + 0.22);
      officeGroup.add(kbRow);

      // Mouse
      const ms = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.092, 0.18, 10, 18),
        P(0x1a1834, 0.5, 0.05, 0.3, 0.4)
      );
      ms.rotation.x = Math.PI / 2;
      ms.position.set(dx + 1.06, 1.876, DZ + 0.46);
      officeGroup.add(ms);

      // Mouse pad
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.012, 1.0),
        S(0x14112e, 0.98, 0, { envMapIntensity: 0 })
      );
      pad.position.set(dx + 0.3, 1.872, DZ + 0.5);
      officeGroup.add(pad);
    }

    // Sticky notes on monitors
    addStickyNote(officeGroup, -5.8 + 1.1, 3.5, DZ - 0.92, 0, -0.08);
    addStickyNote(officeGroup, 0.9, 3.42, DZ - 0.92, 2, 0.04);
    addStickyNote(officeGroup, 5.8 + 1.1, 3.5, DZ - 0.92, 1, 0.1);

    // Books under left desk shelf
    addBooks(officeGroup, -5.9, 0.84, DZ - 0.2);

    // Coffee cup on right desk
    const cofCup = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.11, 0.32, 26), mCup);
    cofCup.position.set(5.8 - 1.4, 1.876, DZ - 0.32);
    cofCup.castShadow = true;
    officeGroup.add(cofCup);
    // Cup handle
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.016, 10, 20, Math.PI), S(0x38bdf8, 0.5));
    handle.rotation.y = Math.PI / 2;
    handle.position.set(5.8 - 1.4 + 0.145, 2.02, DZ - 0.32);
    officeGroup.add(handle);
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24), S(0x2d1204, 0.98));
    liquid.position.set(5.8 - 1.4, 2.024, DZ - 0.32);
    officeGroup.add(liquid);

    // Ceiling lamp fixtures
    for (const lx of [-5.8, 0, 5.8]) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.14, 0.92), P(0x0e1420, 0.5, 0.25, 0.3));
      housing.position.set(lx, 9.95, -1.5);
      officeGroup.add(housing);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.88, 0.08, 0.74), mLamp);
      bulb.position.set(lx, 9.9, -1.5);
      officeGroup.add(bulb);
    }

    // Plants
    addPlant(officeGroup, -9.6,  2.4,  1.2,  mPotClay, 'tropical');
    addPlant(officeGroup,  9.3,  2.4,  1.14, mPotClay, 'tropical');
    addPlant(officeGroup, -9.6, -4.6,  1.0,  mPotBlue, 'tropical');
    addPlant(officeGroup,  9.3, -4.6,  0.94, mPotClay, 'bush');
    addPlant(officeGroup, -5.8 - 1.55, DZ - 0.62, 0.46, mPotBlue, 'cactus');
    addPlant(officeGroup,  5.8 - 1.45, DZ - 0.62, 0.46, mPotClay, 'bush');

    // ── Walls & ceiling ───────────────────────────────────────────────
    const wallMat = S(0x0e0820, 0.99, 0, { envMapIntensity: 0 });

    // Base board trim (adds depth to walls)
    const trimMat = P(0x1a1040, 0.85, 0, 0.2, 0.5);

    const wallB = new THREE.Mesh(new THREE.BoxGeometry(36, 11, 0.24), wallMat);
    wallB.position.set(0, 5.5, -11);
    wallB.receiveShadow = true;
    officeGroup.add(wallB);
    const trimB = new THREE.Mesh(new THREE.BoxGeometry(36, 0.18, 0.26), trimMat);
    trimB.position.set(0, 0.09, -10.88);
    officeGroup.add(trimB);

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 11, 26), wallMat);
    wallL.position.set(-15.5, 5.5, 0);
    officeGroup.add(wallL);
    const wallR = wallL.clone();
    wallR.position.x = 15.5;
    officeGroup.add(wallR);

    // Ceiling
    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(36, 0.22, 26),
      S(0x0c0618, 0.99, 0, { envMapIntensity: 0 })
    );
    ceil.position.set(0, 10.1, 0);
    officeGroup.add(ceil);

    // Windows with better glow
    for (const wx of [-7, 0, 7]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(5.4, 6.4, 0.2), P(0x0d0b1e, 0.55, 0.1, 0.2));
      frame.position.set(wx, 5.8, -10.88);
      officeGroup.add(frame);
      // Window glass
      const glass = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 5.5, 0.1),
        new THREE.MeshPhysicalMaterial({
          color: 0x9333ea,
          transparent: true,
          opacity: 0.18,
          emissive: 0x7c3aed,
          emissiveIntensity: 0.65,
          roughness: 0.0,
          transmission: 0.5,
          thickness: 0.1,
        })
      );
      glass.position.set(wx, 5.8, -10.8);
      officeGroup.add(glass);
      // Window frame dividers
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.06, 0.15), P(0x160e34, 0.7, 0.05, 0.1));
      hBar.position.set(wx, 5.8, -10.76);
      officeGroup.add(hBar);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 5.5, 0.15), P(0x160e34, 0.7, 0.05, 0.1));
      vBar.position.set(wx, 5.8, -10.76);
      officeGroup.add(vBar);
    }

    // ── Floating particles ─────────────────────────────────────────────
    const pCount = 440;
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
      pCol[i3 + 1] = p ? 0.1  : 0.8;
      pCol[i3 + 2] = p ? 0.98 : 0.54;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.055, vertexColors: true, transparent: true, opacity: 0.7,
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
      const m = new THREE.MeshStandardMaterial({
        color: cfg.c, emissive: cfg.c, emissiveIntensity: 0.75,
        transparent: true, opacity: 0.48, roughness: 0.12,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.4), m);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.ry;
      scene.add(mesh);
      panels.push({ mesh, baseY: cfg.y, spd: 0.34 + Math.random() * 0.36, ph: Math.random() * Math.PI * 2 });
    }

    // ── Entrance animation (GSAP) ─────────────────────────────────────
    officeGroup.position.y = -10;
    officeGroup.rotation.y = 0.4;

    const tl = gsap.timeline({ delay: 0.1 });
    tl.to(officeGroup.position,  { y: 0,     duration: 2.2, ease: 'back.out(1.2)'  }, 0);
    tl.to(officeGroup.rotation,  { y: 0,     duration: 2.0, ease: 'power3.out'     }, 0);
    tl.to(cam,                   { y: CAM.y, z: CAM.z, duration: 2.6, ease: 'power3.out' }, 0);

    // ── Events ────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX  / window.innerWidth  - 0.5);
      mouse.current.ty = -(e.clientY / window.innerHeight - 0.5);
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

      camera.position.x = cam.x + mouse.current.x * 4.0;
      camera.position.y = cam.y + mouse.current.y * 2.2 - sf * 4;
      camera.position.z = cam.z + sf * 14;
      camera.lookAt(mouse.current.x * 0.9, 2.5, 0);

      particles.rotation.y  = t * 0.014;
      particles.position.y  = Math.sin(t * 0.22) * 0.18;

      for (const p of panels) {
        p.mesh.position.y = p.baseY + Math.sin(t * p.spd + p.ph) * 0.3;
      }
      for (const sg of scrGlows) {
        sg.intensity = 3.0 + Math.sin(t * 1.7 + sg.position.x * 0.5) * 0.7;
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
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center overflow-hidden bg-[#08031a]">

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Left side gradient overlay */}
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
