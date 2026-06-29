import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // ── Scene ─────────────────────────────────────────────────────────
    const scene = new THREE.Scene();

    // ── Environment (subtle PBR reflections) ─────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    (scene as THREE.Scene & { environmentIntensity?: number }).environmentIntensity = 0.55;
    pmrem.dispose();

    // ── Camera ────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(
      42, window.innerWidth / window.innerHeight, 0.1, 120
    );
    const CAM = { x: 9, y: 7, z: 18 };
    // cam.z / cam.y used by GSAP for entrance animation
    const cam = { x: CAM.x, y: 16, z: 34 };
    camera.position.set(cam.x, cam.y, cam.z);
    camera.lookAt(0, 2.5, 0);

    // ── Post-processing ───────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.15, 0.45, 0.92
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── Lighting ──────────────────────────────────────────────────────
    // Warm hemisphere (sky / ground)
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x1a0a2e, 0.9));

    // Key light (warm sunlight from top-right)
    const key = new THREE.DirectionalLight(0xfff5e0, 3.6);
    key.position.set(12, 18, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left   = -18;
    key.shadow.camera.right  =  18;
    key.shadow.camera.top    =  14;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far    = 60;
    key.shadow.radius        = 4;
    scene.add(key);

    // Fill light (soft from left, cooler)
    const fill = new THREE.DirectionalLight(0xc0d8ff, 1.2);
    fill.position.set(-10, 8, 6);
    scene.add(fill);

    // Brand purple rim light (back-left)
    const rimPurple = new THREE.DirectionalLight(0xb06aff, 1.0);
    rimPurple.position.set(-12, 4, -14);
    scene.add(rimPurple);

    // Screen glow lights
    const scrGlows = [-5.8, 0, 5.8].map((x, i) => {
      const l = new THREE.PointLight(i === 1 ? 0x0d9488 : 0x9333ea, 3.5, 8);
      l.position.set(x, 3.5, -4);
      scene.add(l);
      return l;
    });

    // ── PBR Material helper ───────────────────────────────────────────
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
      clearcoatRoughness = 0.1
    ) => new THREE.MeshPhysicalMaterial({
      color, roughness, metalness, clearcoat, clearcoatRoughness,
    });

    // ── Materials (matching reference palette) ────────────────────────
    // Platform
    const mPlatform  = S(0x1e0a3c, 0.97, 0, { envMapIntensity: 0 });
    const mPlatEdge  = S(0x2d1060, 0.96, 0, { envMapIntensity: 0 });
    // Desk
    const mWood      = P(0xc4953a, 0.58, 0.05, 0.25, 0.3);  // warm wood
    const mDeskFrame = S(0x1c1917, 0.65, 0.1);               // dark frame
    // Chair – orange leather like reference
    const mChairSeat = P(0xf97316, 0.38, 0.02, 0.45, 0.25);  // orange leather
    const mChairAcct = P(0xea580c, 0.42, 0.02, 0.4, 0.28);
    const mChairBase = S(0x374151, 0.55, 0.3);
    // Monitor
    const mMonFr     = S(0x111827, 0.55, 0.3);
    const mScrPurp   = new THREE.MeshStandardMaterial({
      color: 0x4c1d95, emissive: 0x9333ea, emissiveIntensity: 2.0, roughness: 0.05,
    });
    const mScrTeal   = new THREE.MeshStandardMaterial({
      color: 0x042f2e, emissive: 0x0d9488, emissiveIntensity: 1.8, roughness: 0.05,
    });
    // Person
    const mSkin      = P(0xfcd9b6, 0.88, 0, 0.05, 0.4);
    const mHair1     = S(0x1c0f04, 0.9);
    const mHair2     = S(0x78350f, 0.88);
    const mHair3     = S(0x1e1b4b, 0.9);
    const SHIRTS     = [0x0ea5e9, 0xa855f7, 0x22c55e].map(c => S(c, 0.9));  // teal, purple, green
    const PANTS_MAT  = [0x1e293b, 0x1e1b4b, 0x374151].map(c => S(c, 0.85));
    const mShoes     = S(0xfef3c7, 0.85);
    // Plant
    const mPotClay   = P(0xc2410c, 0.72, 0, 0.1);
    const mPotBlue   = P(0x94a3b8, 0.55, 0.05, 0.2);
    const mLeaf      = S(0x16a34a, 0.96);
    const mLeafDark  = S(0x15803d, 0.95);
    const mCactus    = S(0x4d7c0f, 0.94);
    const mSoil      = S(0x2d1a0a, 0.98);
    // Books
    const BOOK_COLS  = [0x3b82f6, 0x22c55e, 0x64748b, 0x94a3b8, 0x6366f1]
      .map(c => S(c, 0.9));
    // Accessories
    const mCupBody   = P(0x38bdf8, 0.55, 0, 0.3);  // teal/blue cup
    const mLampBody  = new THREE.MeshStandardMaterial({
      color: 0xffffff, emissive: 0xfff9e6, emissiveIntensity: 1.8, roughness: 1,
    });

    // ── Group to animate on entrance ──────────────────────────────────
    const officeGroup = new THREE.Group();
    scene.add(officeGroup);

    // Round platform (like reference image base)
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(11.5, 10.5, 0.55, 64),
      mPlatform
    );
    platform.position.y = -0.28;
    platform.receiveShadow = true;
    officeGroup.add(platform);

    const platformEdge = new THREE.Mesh(
      new THREE.TorusGeometry(11.0, 0.18, 16, 80),
      mPlatEdge
    );
    platformEdge.rotation.x = Math.PI / 2;
    platformEdge.position.y = -0.0;
    officeGroup.add(platformEdge);

    // ── Desk builder ──────────────────────────────────────────────────
    function addDesk(parent: THREE.Group, x: number, z: number, ry = 0): void {
      const g = new THREE.Group();

      // Surface
      const top = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.1, 2.1), mWood);
      top.position.y = 1.82;
      top.castShadow = true;
      top.receiveShadow = true;
      g.add(top);

      // Under-shelf
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.85), mWood);
      shelf.position.set(-0.55, 0.82, 0);
      shelf.receiveShadow = true;
      g.add(shelf);

      // 4 round legs
      for (const [lx, lz] of [[-2.0, -0.88], [2.0, -0.88], [-2.0, 0.88], [2.0, 0.88]] as [number, number][]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.82, 20), mDeskFrame);
        leg.position.set(lx, 0.91, lz);
        leg.castShadow = true;
        g.add(leg);
      }

      // Horizontal stretchers
      for (const lz of [-0.88, 0.88]) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4.0, 10), mDeskFrame);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, 0.44, lz);
        g.add(bar);
      }

      g.position.set(x, 0, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Monitor ───────────────────────────────────────────────────────
    function addMonitor(parent: THREE.Group, x: number, z: number, sm: THREE.Material, ry = 0): void {
      const g = new THREE.Group();

      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.65, 1.7, 0.1), mMonFr);
      frame.position.y = 0.9;
      frame.castShadow = true;
      g.add(frame);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.54, 0.06), sm as THREE.MeshStandardMaterial);
      screen.position.set(0, 0.9, 0.09);
      g.add(screen);

      // Thin bezel
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.58, 0.03), S(0x0a0a12, 0.6));
      bezel.position.set(0, 0.9, 0.075);
      g.add(bezel);

      // Neck (tapered)
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 16), mMonFr);
      neck.position.y = 0.15;
      g.add(neck);

      // Circular base
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.44, 0.06, 24), mMonFr);
      base.position.y = -0.11;
      g.add(base);

      g.position.set(x, 1.84, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Chair (orange, like reference) ────────────────────────────────
    function addChair(parent: THREE.Group, x: number, z: number, ry = 0): void {
      const g = new THREE.Group();

      // Seat cushion — rounded cylinder
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.72, 0.14, 32), mChairSeat);
      seat.position.y = 0.94;
      seat.castShadow = true;
      g.add(seat);

      // Seat top surface
      const seatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.06, 32), mChairAcct);
      seatTop.position.y = 1.01;
      g.add(seatTop);

      // Backrest
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.12, 0.1), mChairSeat);
      back.position.set(0, 1.62, -0.6);
      back.castShadow = true;
      g.add(back);

      // Rounded top of backrest
      const backCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.1, 24, 1, false, 0, Math.PI),
        mChairSeat
      );
      backCap.rotation.z = Math.PI / 2;
      backCap.position.set(0, 2.18, -0.6);
      g.add(backCap);

      // Headrest
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.4, 0.1), mChairAcct);
      head.position.set(0, 2.18, -0.62);
      g.add(head);

      // Lumbar support
      const lumbar = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.3, 0.08), mChairAcct);
      lumbar.position.set(0, 1.28, -0.54);
      g.add(lumbar);

      // Armrests
      for (const side of [-1, 1]) {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.68, 12), mChairBase);
        arm.position.set(side * 0.72, 1.4, -0.08);
        g.add(arm);
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.44), mChairSeat);
        pad.position.set(side * 0.72, 1.78, -0.08);
        g.add(pad);
      }

      // Column
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.92, 20), mChairBase);
      col.position.y = 0.52;
      g.add(col);

      // 5-spoke star base
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.058, 0.7), mChairBase);
        spoke.position.set(Math.cos(a) * 0.35, 0.07, Math.sin(a) * 0.35);
        spoke.rotation.y = a;
        g.add(spoke);
        const caster = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), S(0x0d0d0d, 0.5));
        caster.position.set(Math.cos(a) * 0.68, 0.04, Math.sin(a) * 0.68);
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
      const mPants = PANTS_MAT[idx % PANTS_MAT.length];
      const mHair  = [mHair1, mHair2, mHair3][idx % 3];

      // Torso (smooth capsule)
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.64, 16, 32), mShirt);
      torso.position.y = 2.1;
      torso.castShadow = true;
      g.add(torso);

      // Collar
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.2, 20), S(0xffffff, 0.9));
      collar.position.y = 2.52;
      g.add(collar);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.24, 20), mSkin);
      neck.position.y = 2.57;
      g.add(neck);

      // Head — high poly sphere
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 40, 40), mSkin);
      head.position.y = 2.88;
      head.castShadow = true;
      g.add(head);

      // Ears
      for (const ex of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), mSkin);
        ear.scale.set(0.52, 0.72, 0.52);
        ear.position.set(ex * 0.33, 2.87, 0.02);
        g.add(ear);
      }

      // Hair
      const hairGeo = new THREE.SphereGeometry(0.372, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.54);
      const hair = new THREE.Mesh(hairGeo, mHair);
      hair.position.y = 2.92;
      g.add(hair);

      // Forehead hairline bit
      const bang = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12, 0, Math.PI * 2, Math.PI * 0.54, Math.PI * 0.14), mHair);
      bang.position.y = 2.92;
      g.add(bang);

      // Eyes (sphere with a white and dark part)
      for (const ex of [-0.12, 0.12]) {
        const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.066, 16, 16), S(0xf8f8f8, 0.95));
        eyeWhite.position.set(ex, 2.9, 0.305);
        g.add(eyeWhite);

        const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.044, 14, 14), S(0x1a0800, 0.8));
        pupil.position.set(ex, 2.9, 0.322);
        g.add(pupil);

        const shine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), S(0xffffff, 0.9));
        shine.position.set(ex + 0.02, 2.918, 0.336);
        g.add(shine);
      }

      // Eyebrows (thin flat box, slightly rotated)
      for (const ex of [-0.12, 0.12]) {
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.017, 0.017), mHair);
        brow.position.set(ex, 2.965, 0.3);
        brow.rotation.z = ex > 0 ? -0.1 : 0.1;
        g.add(brow);
      }

      // Upper arms (capsule)
      const armGeo = new THREE.CapsuleGeometry(0.105, 0.38, 10, 20);
      const armL = new THREE.Mesh(armGeo, mShirt);
      armL.position.set(-0.42, 2.14, 0.2);
      armL.rotation.x = -0.58; armL.rotation.z = 0.22;
      armL.castShadow = true;
      g.add(armL);

      const armR = new THREE.Mesh(armGeo, mShirt);
      armR.position.set(0.42, 2.14, 0.2);
      armR.rotation.x = -0.58; armR.rotation.z = -0.22;
      armR.castShadow = true;
      g.add(armR);

      // Forearms (skin)
      const foreGeo = new THREE.CapsuleGeometry(0.09, 0.3, 8, 18);
      const foreL = new THREE.Mesh(foreGeo, mSkin);
      foreL.position.set(-0.45, 1.97, 0.38);
      foreL.rotation.x = -0.2; foreL.rotation.z = 0.15;
      g.add(foreL);

      const foreR = new THREE.Mesh(foreGeo, mSkin);
      foreR.position.set(0.45, 1.97, 0.38);
      foreR.rotation.x = -0.2; foreR.rotation.z = -0.15;
      g.add(foreR);

      // Hands
      for (const hx of [-0.46, 0.46]) {
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 16), mSkin);
        hand.scale.set(1, 0.75, 0.9);
        hand.position.set(hx, 1.92, 0.44);
        g.add(hand);
      }

      // Lower body / thighs
      const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.34, 12, 28), mPants);
      lower.position.y = 1.52;
      g.add(lower);

      // Legs
      for (const lx of [-0.14, 0.14]) {
        const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.55, 10, 20), mPants);
        leg.position.set(lx, 1.08, 0.22);
        leg.rotation.x = 0.22;
        g.add(leg);
      }

      // Shoes
      for (const lx of [-0.14, 0.14]) {
        const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.28, 8, 16), mShoes);
        shoe.rotation.x = Math.PI / 2;
        shoe.position.set(lx, 0.62, 0.52);
        g.add(shoe);
      }

      g.position.set(x, 0, z);
      g.rotation.y = ry;
      parent.add(g);
    }

    // ── Plant builder ─────────────────────────────────────────────────
    function addPlant(
      parent: THREE.Group,
      x: number, z: number, sc = 1,
      potMat = mPotClay,
      type: 'tropical' | 'cactus' | 'bush' = 'tropical'
    ): void {
      const g = new THREE.Group();

      // Pot
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.54, 28), potMat);
      pot.position.y = 0.27;
      pot.castShadow = true;
      g.add(pot);

      // Pot rim (torus)
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.048, 14, 32), potMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.52;
      g.add(rim);

      // Soil
      const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 22), mSoil);
      soil.position.y = 0.53;
      g.add(soil);

      if (type === 'tropical') {
        // Large leafy plant (multiple overlapping spheres)
        const leaves: [number, number, number, number][] = [
          [0, 1.15, 0, 0.78], [0.6, 0.98, 0.08, 0.56], [-0.52, 1.04, 0.14, 0.54],
          [0.25, 1.42, -0.32, 0.5], [-0.3, 0.92, -0.34, 0.46],
          [0.12, 0.82, 0.46, 0.42], [0.45, 1.28, -0.18, 0.4], [-0.2, 1.32, 0.3, 0.38],
        ];
        for (const [lx, ly, lz, lr] of leaves) {
          const lf = new THREE.Mesh(
            new THREE.SphereGeometry(lr, 18, 16),
            Math.random() > 0.5 ? mLeaf : mLeafDark
          );
          lf.position.set(lx, ly, lz);
          lf.castShadow = true;
          g.add(lf);
        }
      } else if (type === 'cactus') {
        // Cactus: main cylinder + arms
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.55, 12, 24), mCactus);
        body.position.y = 1.0;
        g.add(body);
        for (const side of [-1, 1]) {
          const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.28, 8, 16), mCactus);
          arm.position.set(side * 0.28, 1.1, 0);
          arm.rotation.z = side * 0.6;
          g.add(arm);
        }
      } else {
        // Bush: round clump
        const main = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 18), mLeaf);
        main.position.y = 0.95;
        g.add(main);
        const side1 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 14), mLeafDark);
        side1.position.set(0.48, 0.85, 0.1);
        g.add(side1);
        const side2 = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 14), mLeaf);
        side2.position.set(-0.42, 0.82, 0.08);
        g.add(side2);
      }

      g.scale.setScalar(sc);
      g.position.set(x, 0, z);
      parent.add(g);
    }

    // ── Books stack ───────────────────────────────────────────────────
    function addBooks(parent: THREE.Group, x: number, y: number, z: number): void {
      const g = new THREE.Group();
      let by = 0;
      const books = [
        { h: 0.2, w: 1.0, d: 0.66 },
        { h: 0.18, w: 0.95, d: 0.62 },
        { h: 0.22, w: 0.88, d: 0.64 },
        { h: 0.16, w: 0.92, d: 0.6  },
        { h: 0.2,  w: 0.98, d: 0.66 },
      ];
      books.forEach((b, i) => {
        const book = new THREE.Mesh(new THREE.BoxGeometry(b.d, b.h, b.w), BOOK_COLS[i]);
        book.position.set(0, by + b.h / 2, 0);
        book.rotation.y = (Math.random() - 0.5) * 0.06;
        book.castShadow = true;
        g.add(book);
        by += b.h + 0.008;
      });
      g.position.set(x, y, z);
      parent.add(g);
    }

    // ── Assemble office scene ─────────────────────────────────────────
    const DZ = -1.5;

    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 5.8;
      addDesk(officeGroup, dx, DZ);
      addMonitor(officeGroup, dx - 0.1, DZ - 0.88, i === 1 ? mScrTeal : mScrPurp, (i - 1) * -0.08);
      addChair(officeGroup, dx, DZ + 1.55, 0);
      addPerson(officeGroup, dx, DZ + 0.82, i, Math.PI);

      // Keyboard + mouse on each desk
      const kb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.038, 0.56), S(0x1c1840, 0.65));
      kb.position.set(dx - 0.05, 1.877, DZ + 0.44);
      officeGroup.add(kb);

      const ms = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.17, 8, 16), S(0x1c1840, 0.6));
      ms.rotation.x = Math.PI / 2;
      ms.position.set(dx + 1.04, 1.876, DZ + 0.44);
      officeGroup.add(ms);
    }

    // Books under left desk shelf
    addBooks(officeGroup, -5.9, 0.84, DZ - 0.2);

    // Coffee cup on right desk
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.3, 24), mCupBody);
    cup.position.set(5.8 - 1.4, 1.876, DZ - 0.3);
    cup.castShadow = true;
    officeGroup.add(cup);
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 22), S(0x2d1204, 0.98));
    liquid.position.set(5.8 - 1.4, 2.02, DZ - 0.3);
    officeGroup.add(liquid);

    // Ceiling lamp fixtures
    for (const lx of [-5.8, 0, 5.8]) {
      const housing = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.13, 0.88), S(0x111827, 0.55));
      housing.position.set(lx, 9.95, -1.5);
      officeGroup.add(housing);
      const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.07, 0.7), mLampBody);
      bulb.position.set(lx, 9.9, -1.5);
      officeGroup.add(bulb);
    }

    // Plants (large room plants)
    addPlant(officeGroup, -9.5, 2.5,  1.15, mPotClay, 'tropical');
    addPlant(officeGroup,  9.2, 2.5,  1.1,  mPotClay, 'tropical');
    addPlant(officeGroup, -9.5, -4.5, 0.95, mPotBlue, 'tropical');
    addPlant(officeGroup,  9.2, -4.5, 0.9,  mPotClay, 'bush');

    // Small plants on/near desks
    addPlant(officeGroup, -5.8 - 1.5, DZ - 0.6, 0.44, mPotBlue, 'cactus');
    addPlant(officeGroup,  5.8 - 1.4, DZ - 0.6, 0.44, mPotClay, 'bush');

    // Walls (back + sides, subtle so scene breathes)
    const wallMat = S(0x0e0820, 0.99, 0, { envMapIntensity: 0 });
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(34, 11, 0.24), wallMat);
    wallB.position.set(0, 5.5, -11);
    wallB.receiveShadow = true;
    officeGroup.add(wallB);

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 11, 24), wallMat);
    wallL.position.set(-15.5, 5.5, 0);
    officeGroup.add(wallL);
    const wallR = wallL.clone();
    wallR.position.x = 15.5;
    officeGroup.add(wallR);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(34, 0.22, 24), S(0x0c0618, 0.99, 0, { envMapIntensity: 0 }));
    ceil.position.set(0, 10.1, 0);
    officeGroup.add(ceil);

    // Windows
    for (const wx of [-7, 0, 7]) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 6.2, 0.2), S(0x0d0b1e, 0.6));
      frame.position.set(wx, 5.8, -10.88);
      officeGroup.add(frame);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.4, 0.1),
        new THREE.MeshPhysicalMaterial({
          color: 0x9333ea, transparent: true, opacity: 0.22,
          emissive: 0x7c3aed, emissiveIntensity: 0.55,
          roughness: 0.0, transmission: 0.3,
        })
      );
      glass.position.set(wx, 5.8, -10.8);
      officeGroup.add(glass);
    }

    // ── Floating particles ─────────────────────────────────────────────
    const pCount = 380;
    const pGeo   = new THREE.BufferGeometry();
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const i3 = i * 3;
      pPos[i3]     = (Math.random() - 0.5) * 26;
      pPos[i3 + 1] = Math.random() * 10;
      pPos[i3 + 2] = (Math.random() - 0.5) * 20 - 1;
      const p = Math.random() > 0.45;
      pCol[i3]     = p ? 0.62 : 0.05;
      pCol[i3 + 1] = p ? 0.12 : 0.78;
      pCol[i3 + 2] = p ? 1.0  : 0.52;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.78,
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
        color: cfg.c, emissive: cfg.c, emissiveIntensity: 0.7,
        transparent: true, opacity: 0.5, roughness: 0.15,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.35), m);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.ry;
      scene.add(mesh);
      panels.push({ mesh, baseY: cfg.y, spd: 0.36 + Math.random() * 0.38, ph: Math.random() * Math.PI * 2 });
    }

    // ── Entrance animation (GSAP) ─────────────────────────────────────
    officeGroup.position.y = -10;
    officeGroup.rotation.y = 0.4;

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(officeGroup.position,  { y: 0,   duration: 2.0, ease: 'back.out(1.0)'  }, 0);
    tl.to(officeGroup.rotation,  { y: 0,   duration: 1.9, ease: 'power3.out'     }, 0);
    tl.to(cam,                   { y: CAM.y, z: CAM.z, duration: 2.4, ease: 'power3.out' }, 0);

    // ── Events ────────────────────────────────────────────────────────
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX  / window.innerWidth  - 0.5);
      mouse.current.ty = -(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMove);
    const onScroll = () => { scrollRef.current = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Animation loop ────────────────────────────────────────────────
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;

      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.046;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.046;

      const sf = Math.min(scrollRef.current / (window.innerHeight || 1), 1);

      // Camera — base from GSAP cam object + live mouse/scroll offsets
      camera.position.x = cam.x + mouse.current.x * 3.8;
      camera.position.y = cam.y + mouse.current.y * 2.1 - sf * 4;
      camera.position.z = cam.z + sf * 14;
      camera.lookAt(mouse.current.x * 0.9, 2.5, 0);

      particles.rotation.y = t * 0.015;
      particles.position.y = Math.sin(t * 0.24) * 0.16;

      for (const p of panels) {
        p.mesh.position.y = p.baseY + Math.sin(t * p.spd + p.ph) * 0.3;
      }

      for (const sg of scrGlows) {
        sg.intensity = 3.5 + Math.sin(t * 1.8 + sg.position.x * 0.5) * 0.8;
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

      {/* Left side text gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(108deg, rgba(8,3,26,0.94) 0%, rgba(8,3,26,0.70) 38%, rgba(8,3,26,0.14) 62%, transparent 100%)',
      }} />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ zIndex: 5,
        background: 'linear-gradient(to top, #08031a 0%, transparent 100%)',
      }} />

      {/* ── Text overlay ── */}
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
