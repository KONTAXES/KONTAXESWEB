import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ─────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 120);
    const CAM = { x: 9, y: 7, z: 17 };
    camera.position.set(CAM.x, CAM.y, CAM.z);
    camera.lookAt(0, 2.5, 0);

    // ── Toon gradient (4-step cel shading) ────────────────────────────
    const gradientMap = (() => {
      const data = new Uint8Array([72, 128, 200, 252]);
      const tex = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      return tex;
    })();

    // T = toon material factory
    const T = (color: number) =>
      new THREE.MeshToonMaterial({ color, gradientMap });

    // ── Lighting ──────────────────────────────────────────────────────
    // Hemisphere: warm sky / cool ground
    scene.add(new THREE.HemisphereLight(0x9966ff, 0x110033, 1.4));

    // Main key light (sharp shadows)
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(10, 16, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left   = -20;
    key.shadow.camera.right  =  20;
    key.shadow.camera.top    =  16;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far    = 60;
    key.shadow.radius        = 2;
    scene.add(key);

    // Purple rim from back-left
    const rim = new THREE.DirectionalLight(0xb06aff, 1.4);
    rim.position.set(-12, 8, -10);
    scene.add(rim);

    // Teal fill from right
    const tealFill = new THREE.PointLight(0x0d9488, 6, 24);
    tealFill.position.set(10, 4, 7);
    scene.add(tealFill);

    // Screen glows (one per monitor)
    const scrGlows = [-5.8, 0, 5.8].map((x, i) => {
      const l = new THREE.PointLight(i === 1 ? 0x0d9488 : 0x9333ea, 4, 9);
      l.position.set(x, 3.4, -4);
      scene.add(l);
      return l;
    });

    // Window ambient light
    for (const wx of [-7, 0, 7]) {
      const wl = new THREE.PointLight(0x8b5cf6, 2.5, 13);
      wl.position.set(wx, 5.5, -8);
      scene.add(wl);
    }

    // ── Materials ─────────────────────────────────────────────────────
    const mFloor     = T(0x1a0e38);
    const mFloorLine = T(0x2d1a5a);
    const mWall      = T(0x120a28);
    const mCeil      = T(0x0e0820);
    const mDeskTop   = T(0xede9fe);   // light lavender surface
    const mDeskEdge  = T(0xc4b5fd);
    const mDeskLeg   = T(0x2e1f5e);
    const mMonFrame  = T(0x0d0b1e);
    const mChairBody = T(0x7c3aed);
    const mChairAcct = T(0x5b21b6);
    const mChairBase = T(0x14102e);
    const mPotClay   = T(0xa16207);
    const mSoil      = T(0x2d1a0a);
    const mLeafBrt   = T(0x16a34a);
    const mLeafDrk   = T(0x15803d);
    const mSkin      = T(0xfcd9b6);
    const mLamp      = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 2.5, roughness: 1,
    });

    // Screen materials (emissive, not toon)
    const mScrPurp = new THREE.MeshStandardMaterial({
      color: 0x3b0764, emissive: 0x9333ea, emissiveIntensity: 1.8, roughness: 0.1,
    });
    const mScrTeal = new THREE.MeshStandardMaterial({
      color: 0x042f2e, emissive: 0x0d9488, emissiveIntensity: 1.5, roughness: 0.1,
    });

    // Window glass
    const mGlass = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, transparent: true, opacity: 0.2,
      emissive: 0x5b21b6, emissiveIntensity: 0.6, roughness: 0.0,
    });

    // Person body colours
    const BODIES  = [0xa855f7, 0x0d9488, 0x3b82f6, 0xf59e0b, 0xec4899];
    const HAIRS   = [0x1c0f00, 0x78350f, 0x1e1b4b, 0x1c1917, 0x450a0a];
    const PANTS   = [0x1e1b4b, 0x0c2e4a, 0x1c1917, 0x1e1b4b, 0x0c2e4a];

    // ── Room shell ────────────────────────────────────────────────────
    // Floor
    const floor = new THREE.Mesh(new THREE.BoxGeometry(32, 0.22, 24), mFloor);
    floor.position.set(0, -0.11, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Floor grid (low-poly lines)
    const grid = new THREE.GridHelper(30, 30, 0x3b1c6e, 0x200e42);
    grid.position.y = 0.02;
    scene.add(grid);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(32, 0.22, 24), mCeil);
    ceil.position.set(0, 10.1, 0);
    scene.add(ceil);

    // Back wall
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(32, 10.4, 0.25), mWall);
    wallB.position.set(0, 5, -10.6);
    wallB.receiveShadow = true;
    scene.add(wallB);

    // Side walls
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 10.4, 24), mWall);
    wallL.position.set(-15.1, 5, 0);
    scene.add(wallL);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 10.4, 24), mWall);
    wallR.position.set(15.1, 5, 0);
    scene.add(wallR);

    // Windows (3 glowing portals)
    for (const wx of [-7, 0, 7]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 6.2, 0.2), mMonFrame);
      frame.position.set(wx, 5.8, -10.48);
      scene.add(frame);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.4, 0.1), mGlass);
      glass.position.set(wx, 5.8, -10.4);
      scene.add(glass);

      // Window frame cross bars
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.08, 0.12), T(0x1a0e38));
      hBar.position.set(wx, 5.8, -10.35);
      scene.add(hBar);
      const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5.4, 0.12), T(0x1a0e38));
      vBar.position.set(wx, 5.8, -10.35);
      scene.add(vBar);
    }

    // Ceiling lamp fixtures
    for (const lx of [-5.8, 0, 5.8]) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.14, 0.9), T(0x1a0e38));
      housing.position.set(lx, 10.0, -1.5);
      scene.add(housing);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.08, 0.7), mLamp);
      bulb.position.set(lx, 9.94, -1.5);
      scene.add(bulb);
    }

    // ── Desk ──────────────────────────────────────────────────────────
    function addDesk(x: number, z: number): void {
      const g = new THREE.Group();

      // Surface
      const top = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.1, 2.1), mDeskTop);
      top.position.y = 1.82;
      top.castShadow = true;
      top.receiveShadow = true;
      g.add(top);

      // Edge bevel strip
      const edge = new THREE.Mesh(new THREE.BoxGeometry(4.34, 0.055, 2.14), mDeskEdge);
      edge.position.y = 1.765;
      g.add(edge);

      // 4 round legs (cylinder)
      for (const [lx, lz] of [[-1.95, -0.88], [1.95, -0.88], [-1.95, 0.88], [1.95, 0.88]] as [number, number][]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 1.82, 18), mDeskLeg);
        leg.position.set(lx, 0.91, lz);
        leg.castShadow = true;
        g.add(leg);
      }

      // Horizontal crossbars connecting legs
      const barFront = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.9, 10), mDeskLeg);
      barFront.rotation.z = Math.PI / 2;
      barFront.position.set(0, 0.45, 0.88);
      g.add(barFront);
      const barBack = barFront.clone();
      barBack.position.set(0, 0.45, -0.88);
      g.add(barBack);

      g.position.set(x, 0, z);
      scene.add(g);
    }

    // ── Monitor ───────────────────────────────────────────────────────
    function addMonitor(x: number, z: number, scrMat: THREE.Material, rotY = 0): void {
      const g = new THREE.Group();

      // Outer frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.65, 0.1), mMonFrame);
      frame.position.y = 0.88;
      frame.castShadow = true;
      g.add(frame);

      // Screen panel
      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.52, 1.5, 0.06), scrMat as THREE.MeshStandardMaterial);
      screen.position.set(0, 0.88, 0.08);
      g.add(screen);

      // Thin bezel line
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.55, 1.53, 0.04), T(0x1a1030));
      bezel.position.set(0, 0.88, 0.065);
      g.add(bezel);

      // Neck (tapered cylinder)
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.055, 0.52, 14), mMonFrame);
      neck.position.y = 0.15;
      g.add(neck);

      // Base disk
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.44, 0.06, 22), mMonFrame);
      base.position.y = -0.11;
      g.add(base);

      g.position.set(x, 1.84, z);
      g.rotation.y = rotY;
      scene.add(g);
    }

    // ── Chair ─────────────────────────────────────────────────────────
    function addChair(x: number, z: number, rotY = 0): void {
      const g = new THREE.Group();

      // Seat cushion (rounded cylinder)
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.7, 0.12, 28), mChairBody);
      seat.position.y = 0.92;
      seat.castShadow = true;
      g.add(seat);

      const seatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.06, 28), T(0x8b5cf6));
      seatTop.position.y = 0.98;
      g.add(seatTop);

      // Backrest body
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.1, 0.1), mChairBody);
      back.position.set(0, 1.58, -0.59);
      back.castShadow = true;
      g.add(back);

      // Rounded top of backrest (half-cylinder cap)
      const backTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.64, 0.64, 0.1, 20, 1, false, 0, Math.PI),
        mChairBody
      );
      backTop.rotation.z = Math.PI / 2;
      backTop.position.set(0, 2.13, -0.59);
      g.add(backTop);

      // Lumbar bump
      const lumbar = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.32, 0.07), mChairAcct);
      lumbar.position.set(0, 1.28, -0.52);
      g.add(lumbar);

      // Headrest
      const hrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.36, 0.1), mChairAcct);
      hrest.position.set(0, 2.12, -0.59);
      g.add(hrest);

      // Armrests
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.64, 0.1), mChairBase);
        arm.position.set(side * 0.7, 1.38, -0.1);
        g.add(arm);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.42), mChairBody);
        pad.position.set(side * 0.7, 1.74, -0.1);
        g.add(pad);
      }

      // Pneumatic column
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.94, 18), mChairBase);
      col.position.y = 0.53;
      g.add(col);

      // 5-spoke base
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const cx = Math.cos(a) * 0.32;
        const cz = Math.sin(a) * 0.32;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.68), mChairBase);
        spoke.position.set(cx, 0.06, cz);
        spoke.rotation.y = a;
        g.add(spoke);
        // Caster
        const caster = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), T(0x0a0818));
        caster.position.set(Math.cos(a) * 0.64, 0.04, Math.sin(a) * 0.64);
        g.add(caster);
      }

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
    }

    // ── Person ────────────────────────────────────────────────────────
    function addPerson(x: number, z: number, idx: number, rotY = Math.PI): void {
      const g = new THREE.Group();
      const mBody  = T(BODIES[idx % BODIES.length]);
      const mHair  = T(HAIRS[idx  % HAIRS.length]);
      const mPants = T(PANTS[idx  % PANTS.length]);

      // Torso (capsule — smooth, no flat shading)
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.62, 12, 28), mBody);
      torso.position.y = 2.1;
      torso.castShadow = true;
      g.add(torso);

      // Shirt collar / neck opening
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.17, 0.2, 18), T(0xffffff));
      collar.position.y = 2.5;
      g.add(collar);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.22, 18), mSkin);
      neck.position.y = 2.55;
      g.add(neck);

      // Head (smooth sphere, larger = cartoony)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 32), mSkin);
      head.position.y = 2.85;
      head.castShadow = true;
      g.add(head);

      // Ears
      for (const ex of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), mSkin);
        ear.scale.set(0.55, 0.7, 0.55);
        ear.position.set(ex * 0.32, 2.84, 0.02);
        g.add(ear);
      }

      // Hair dome (upper hemisphere)
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.365, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.54),
        mHair
      );
      hair.position.y = 2.9;
      g.add(hair);

      // Eyes
      for (const ex of [-0.12, 0.12]) {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 14), T(0x1a0800));
        eye.position.set(ex, 2.87, 0.3);
        g.add(eye);
        const shine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), T(0xffffff));
        shine.position.set(ex + 0.022, 2.9, 0.318);
        g.add(shine);
      }

      // Eyebrows
      for (const ex of [-0.12, 0.12]) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.018, 0.018), mHair);
        brow.position.set(ex, 2.95, 0.3);
        brow.rotation.z = ex > 0 ? -0.1 : 0.1;
        g.add(brow);
      }

      // Upper arms (capsule)
      const armGeo = new THREE.CapsuleGeometry(0.1, 0.36, 8, 18);
      const armL = new THREE.Mesh(armGeo, mBody);
      armL.position.set(-0.4, 2.14, 0.18);
      armL.rotation.x = -0.55;
      armL.rotation.z = 0.2;
      armL.castShadow = true;
      g.add(armL);

      const armR = new THREE.Mesh(armGeo, mBody);
      armR.position.set(0.4, 2.14, 0.18);
      armR.rotation.x = -0.55;
      armR.rotation.z = -0.2;
      armR.castShadow = true;
      g.add(armR);

      // Hands (rounded)
      for (const hx of [-0.42, 0.42]) {
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 14), mSkin);
        hand.position.set(hx, 1.97, 0.38);
        g.add(hand);
      }

      // Lower body / legs (sitting, pants)
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.32, 10, 24), mPants);
      lower.position.y = 1.52;
      g.add(lower);

      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      scene.add(g);
    }

    // ── Plant ─────────────────────────────────────────────────────────
    function addPlant(x: number, z: number, sc = 1): void {
      const g = new THREE.Group();

      // Terracotta pot
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.52, 24), mPotClay);
      pot.position.y = 0.26;
      pot.castShadow = true;
      g.add(pot);

      // Rim torus
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 12, 28), mPotClay);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.5;
      g.add(rim);

      // Soil disk
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 20), mSoil);
      soil.position.y = 0.51;
      g.add(soil);

      // Foliage cluster (multiple spheres, varying size/color)
      const leaves: [number, number, number, number, boolean][] = [
        [0,    1.12, 0,     0.76, true ],
        [0.58, 0.96, 0.08,  0.55, false],
        [-0.5, 1.02, 0.14,  0.52, true ],
        [0.22, 1.36, -0.3,  0.48, false],
        [-0.28, 0.9, -0.32, 0.44, true ],
        [0.1,  0.8,  0.44,  0.4,  false],
        [0.42, 1.22, -0.18, 0.38, true ],
        [-0.18, 1.28, 0.28, 0.36, false],
      ];
      for (const [lx, ly, lz, lr, bright] of leaves) {
        const leaf = new THREE.Mesh(
          new THREE.SphereGeometry(lr, 16, 14),
          bright ? mLeafBrt : mLeafDrk
        );
        leaf.position.set(lx, ly, lz);
        leaf.castShadow = true;
        g.add(leaf);
      }

      g.scale.setScalar(sc);
      g.position.set(x, 0, z);
      scene.add(g);
    }

    // ── Assemble office ───────────────────────────────────────────────
    const DZ = -1.5;

    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 5.8;
      addDesk(dx, DZ);
      addMonitor(dx - 0.1, DZ - 0.85, i === 1 ? mScrTeal : mScrPurp, (i - 1) * -0.07);
      addChair(dx, DZ + 1.52, 0);
      addPerson(dx, DZ + 0.8, i, Math.PI);

      // Keyboard
      const kb = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.038, 0.56), T(0x1c1840));
      kb.position.set(dx - 0.05, 1.875, DZ + 0.44);
      scene.add(kb);

      // Mouse (capsule on side)
      const ms = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.16, 8, 14), T(0x1c1840));
      ms.rotation.x = Math.PI / 2;
      ms.position.set(dx + 1.02, 1.87, DZ + 0.44);
      scene.add(ms);

      // Coffee cup on right desk only
      if (i === 2) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.28, 18), T(0xfcd9b6));
        cup.position.set(dx - 1.4, 1.87, DZ - 0.3);
        scene.add(cup);
        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 18), T(0x3d1a04));
        liquid.position.set(dx - 1.4, 2.01, DZ - 0.3);
        scene.add(liquid);
      }

      // Desk plant on left desk
      if (i === 0) {
        addPlant(dx - 1.5, DZ - 0.6, 0.42);
      }
    }

    // Room plants
    addPlant(-12.5, -4,   1.15);
    addPlant( 12.5, -4,   1.1);
    addPlant(-12.5, -8.5, 0.88);
    addPlant( 12.5, -8.5, 0.92);
    addPlant(-12.5,  5,   0.82);

    // ── Floating particles ─────────────────────────────────────────────
    const pCount = 420;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      pPos[i3]     = (Math.random() - 0.5) * 28;
      pPos[i3 + 1] = Math.random() * 10;
      pPos[i3 + 2] = (Math.random() - 0.5) * 20 - 1;
      const isPurp = Math.random() > 0.42;
      pCol[i3]     = isPurp ? 0.64 : 0.05;
      pCol[i3 + 1] = isPurp ? 0.12 : 0.76;
      pCol[i3 + 2] = isPurp ? 1.0  : 0.54;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.8,
    }));
    scene.add(particles);

    // ── Floating holographic data panels ──────────────────────────────
    const panels: { mesh: THREE.Mesh; baseY: number; spd: number; ph: number }[] = [];
    const panelCfg = [
      { x: -10,  y: 5.5, z: -6,  ry:  0.28, c: 0x9333ea },
      { x:  10,  y: 4.8, z: -5,  ry: -0.22, c: 0x0d9488 },
      { x: -8.5, y: 7.6, z: -4,  ry:  0.18, c: 0x9333ea },
      { x:  9.5, y: 6.6, z: -3,  ry: -0.16, c: 0x0d9488 },
      { x:  2.5, y: 8.2, z: -7,  ry:  0.05, c: 0x9333ea },
    ];
    for (const cfg of panelCfg) {
      const m = new THREE.MeshStandardMaterial({
        color: cfg.c, emissive: cfg.c, emissiveIntensity: 0.6,
        transparent: true, opacity: 0.48, roughness: 0.2,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.35), m);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.ry;
      scene.add(mesh);
      panels.push({ mesh, baseY: cfg.y, spd: 0.35 + Math.random() * 0.4, ph: Math.random() * Math.PI * 2 });
    }

    // ── Event listeners ───────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth  - 0.5);
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
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.046;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.046;

      // Scroll-driven camera pull-back
      const sf = Math.min(scrollRef.current / (window.innerHeight || 1), 1);
      camera.position.x = CAM.x + mouse.current.x * 3.8;
      camera.position.y = CAM.y + mouse.current.y * 2.1 - sf * 4;
      camera.position.z = CAM.z + sf * 14;
      camera.lookAt(mouse.current.x * 0.9, 2.5, 0);

      // Particle drift
      particles.rotation.y = t * 0.016;
      particles.position.y = Math.sin(t * 0.24) * 0.16;

      // Floating panels
      for (const p of panels) {
        p.mesh.position.y = p.baseY + Math.sin(t * p.spd + p.ph) * 0.3;
      }

      // Light pulsing
      tealFill.intensity = 6 + Math.sin(t * 1.1) * 1.5;
      for (const sg of scrGlows) {
        sg.intensity = 4 + Math.sin(t * 1.8 + sg.position.x * 0.5) * 0.9;
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

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Gradient so left-side text stays readable */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(108deg, rgba(8,3,26,0.93) 0%, rgba(8,3,26,0.68) 38%, rgba(8,3,26,0.14) 62%, transparent 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(to top, #08031a 0%, transparent 100%)',
      }} />

      {/* ── Text content ── */}
      <div className="relative px-8 md:px-14 lg:px-20 max-w-[44rem]" style={{ zIndex: 20 }}>

        <div className="mb-7">
          <img src="/K_white.png" alt="KONTAXES"
            className="h-16 w-auto drop-shadow-[0_0_36px_rgba(147,51,234,0.68)]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Consultores Financieros &amp; Fiscales
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
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
              shadow-lg shadow-purple-900/40 hover:-translate-y-0.5 hover:shadow-purple-500/30">
            Ver Servicios
          </button>
          <button
            onClick={() => document.getElementById('cotizador')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 bg-white/8 border border-white/15 backdrop-blur-sm text-white font-bold rounded-xl text-sm
              hover:bg-white/14 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5">
            Cotizar Ahora
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ zIndex: 20 }}>
        <div className="w-5 h-8 border border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-purple-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
