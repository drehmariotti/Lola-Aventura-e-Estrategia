import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CharacterDef, FighterState, HitEffect } from './types';

interface FighterMeshParts {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  chest: THREE.Mesh;
  head: THREE.Group;
  leftArmPivot: THREE.Group;
  leftForearmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  rightForearmPivot: THREE.Group;
  leftLegPivot: THREE.Group;
  leftCalfPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  rightCalfPivot: THREE.Group;
}

export class FightingThreeScene {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private reqId: number = 0;

  private p1Parts: FighterMeshParts | null = null;
  private p2Parts: FighterMeshParts | null = null;

  private p1Shadow: THREE.Mesh;
  private p2Shadow: THREE.Mesh;

  private hitSparks: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];
  private cameraShake = 0;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Setup Renderer
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return false;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);

    // Setup Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0a09);
    this.scene.fog = new THREE.FogExp2(0x0c0a09, 0.035);

    this.camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 2.2, 7.5);

    // Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting Rig
    this.setupLighting();

    // Build Arena Stage
    this.setupArena();

    // Shadows under fighters
    const shadowGeom = new THREE.RingGeometry(0.01, 0.55, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    this.p1Shadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.p1Shadow.rotation.x = -Math.PI / 2;
    this.p1Shadow.position.y = 0.02;
    this.scene.add(this.p1Shadow);

    this.p2Shadow = new THREE.Mesh(shadowGeom, shadowMat.clone());
    this.p2Shadow.rotation.x = -Math.PI / 2;
    this.p2Shadow.position.y = 0.02;
    this.scene.add(this.p2Shadow);

    window.addEventListener('resize', this.onResize);
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Ambient / Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1c1917, 0.9);
    this.scene.add(hemiLight);

    // Key Directional Spotlight
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -2;
    this.scene.add(keyLight);

    // Rim / Backlight for fighter contours
    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.4);
    rimLight.position.set(-4, 6, -5);
    this.scene.add(rimLight);

    // Warm Arena Accent spot
    const arenaSpot = new THREE.PointLight(0xf59e0b, 1.8, 15);
    arenaSpot.position.set(0, 4, 1);
    this.scene.add(arenaSpot);
  }

  private setupArena() {
    // Elevated Ring Platform (Tekken Style Dojo / Iron Fist Arena)
    const stageGeom = new THREE.CylinderGeometry(8.5, 9, 0.4, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x1f1d1b,
      roughness: 0.8,
      metalness: 0.2,
    });
    const stage = new THREE.Mesh(stageGeom, stageMat);
    stage.position.y = -0.2;
    stage.receiveShadow = true;
    this.scene.add(stage);

    // Inner Tatami / Octagonal ring mat
    const ringGeom = new THREE.CylinderGeometry(7.2, 7.2, 0.02, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.9,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.y = 0.01;
    ring.receiveShadow = true;
    this.scene.add(ring);

    // Glowing Neon Border Edge
    const borderRingGeom = new THREE.RingGeometry(7.1, 7.35, 48);
    const borderRingMat = new THREE.MeshBasicMaterial({
      color: 0xd97706,
      side: THREE.DoubleSide,
    });
    const borderRing = new THREE.Mesh(borderRingGeom, borderRingMat);
    borderRing.rotation.x = -Math.PI / 2;
    borderRing.position.y = 0.022;
    this.scene.add(borderRing);

    // Background Pillars & Arena Rig
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * 11;
      const z = Math.sin(angle) * 11;

      const pillarGeom = new THREE.BoxGeometry(0.6, 5, 0.6);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x292524,
        roughness: 0.85,
        metalness: 0.3,
      });
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, 2.5, z);
      this.scene.add(pillar);

      // Light beam on top of pillar
      const lampGeom = new THREE.SphereGeometry(0.2, 8, 8);
      const lampMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0x6366f1,
      });
      const lamp = new THREE.Mesh(lampGeom, lampMat);
      lamp.position.set(x, 5.1, z);
      this.scene.add(lamp);
    }
  }

  // Create composite 3D fighter mesh
  public createFighterMesh(def: CharacterDef, facingRight: boolean): FighterMeshParts {
    const root = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: def.skinToneHex,
      roughness: 0.65,
      metalness: 0.1,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: def.pantsColorHex,
      roughness: 0.75,
      metalness: 0.15,
    });
    const shirtMat = new THREE.MeshStandardMaterial({
      color: def.shirtColorHex,
      roughness: 0.8,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: def.accentColorHex,
      roughness: 0.6,
      metalness: 0.2,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: def.hairColorHex,
      roughness: 0.9,
    });

    // Root Hips
    const hips = new THREE.Group();
    hips.position.y = 0.95;
    root.add(hips);

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.24), pantsMat);
    pelvisMesh.castShadow = true;
    hips.add(pelvisMesh);

    // Belt / Sash
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.08, 0.26), accentMat);
    sash.position.y = 0.06;
    hips.add(sash);

    // Torso (Abdomen + Chest)
    const torso = new THREE.Group();
    torso.position.y = 0.12;
    hips.add(torso);

    const chestMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.44, 0.26),
      def.gender === 'male' ? skinMat : shirtMat
    );
    chestMesh.position.y = 0.22;
    chestMesh.castShadow = true;
    torso.add(chestMesh);

    // Head & Hair
    const head = new THREE.Group();
    head.position.y = 0.52;
    torso.add(head);

    const faceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), skinMat);
    faceMesh.scale.set(0.9, 1.1, 0.95);
    faceMesh.castShadow = true;
    head.add(faceMesh);

    if (def.gender === 'male') {
      // Short fade / dread top
      const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12), hairMat);
      hairMesh.position.set(0, 0.06, -0.02);
      hairMesh.scale.set(0.95, 0.8, 1);
      head.add(hairMesh);
    } else {
      // High ponytail / top knot
      const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.148, 12, 12), hairMat);
      hairBase.position.set(0, 0.05, -0.03);
      head.add(hairBase);

      const ponytail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.015, 0.35, 8), hairMat);
      ponytail.position.set(0, 0.12, -0.16);
      ponytail.rotation.x = 0.4;
      head.add(ponytail);
    }

    // ARMS & SHOULDERS
    // Left Arm (Back Arm relative to camera)
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0, 0.36, -0.22);
    torso.add(leftArmPivot);

    const leftBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.26, 8), skinMat);
    leftBicep.position.y = -0.13;
    leftBicep.castShadow = true;
    leftArmPivot.add(leftBicep);

    const leftForearmPivot = new THREE.Group();
    leftForearmPivot.position.y = -0.26;
    leftArmPivot.add(leftForearmPivot);

    const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8), accentMat);
    leftForearm.position.y = -0.13;
    leftForearm.castShadow = true;
    leftForearmPivot.add(leftForearm);

    const leftFist = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
    leftFist.position.y = -0.26;
    leftForearmPivot.add(leftFist);

    // Right Arm (Lead Arm relative to camera)
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0, 0.36, 0.22);
    torso.add(rightArmPivot);

    const rightBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.26, 8), skinMat);
    rightBicep.position.y = -0.13;
    rightBicep.castShadow = true;
    rightArmPivot.add(rightBicep);

    const rightForearmPivot = new THREE.Group();
    rightForearmPivot.position.y = -0.26;
    rightArmPivot.add(rightForearmPivot);

    const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.26, 8), accentMat);
    rightForearm.position.y = -0.13;
    rightForearm.castShadow = true;
    rightForearmPivot.add(rightForearm);

    const rightFist = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), skinMat);
    rightFist.position.y = -0.26;
    rightForearmPivot.add(rightFist);

    // LEGS
    // Left Leg
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0, -0.08, -0.12);
    hips.add(leftLegPivot);

    const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 8), pantsMat);
    leftThigh.position.y = -0.19;
    leftThigh.castShadow = true;
    leftLegPivot.add(leftThigh);

    const leftCalfPivot = new THREE.Group();
    leftCalfPivot.position.y = -0.38;
    leftLegPivot.add(leftCalfPivot);

    const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.42, 8), pantsMat);
    leftCalf.position.y = -0.21;
    leftCalf.castShadow = true;
    leftCalfPivot.add(leftCalf);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), accentMat);
    leftFoot.position.set(0.04, -0.42, 0);
    leftCalfPivot.add(leftFoot);

    // Right Leg
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0, -0.08, 0.12);
    hips.add(rightLegPivot);

    const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.38, 8), pantsMat);
    rightThigh.position.y = -0.19;
    rightThigh.castShadow = true;
    rightLegPivot.add(rightThigh);

    const rightCalfPivot = new THREE.Group();
    rightCalfPivot.position.y = -0.38;
    rightLegPivot.add(rightCalfPivot);

    const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.42, 8), pantsMat);
    rightCalf.position.y = -0.21;
    rightCalf.castShadow = true;
    rightCalfPivot.add(rightCalf);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.22), accentMat);
    rightFoot.position.set(0.04, -0.42, 0);
    rightCalfPivot.add(rightFoot);

    // Initial scale and orientation
    root.scale.set(1.15, 1.15, 1.15);
    root.rotation.y = facingRight ? Math.PI / 2 : -Math.PI / 2;

    this.scene.add(root);

    return {
      root,
      hips,
      torso,
      chest: chestMesh,
      head,
      leftArmPivot,
      leftForearmPivot,
      rightArmPivot,
      rightForearmPivot,
      leftLegPivot,
      leftCalfPivot,
      rightLegPivot,
      rightCalfPivot,
    };
  }

  public initFighters(p1Def: CharacterDef, p2Def: CharacterDef) {
    if (this.p1Parts) this.scene.remove(this.p1Parts.root);
    if (this.p2Parts) this.scene.remove(this.p2Parts.root);

    this.p1Parts = this.createFighterMesh(p1Def, true);
    this.p2Parts = this.createFighterMesh(p2Def, false);
  }

  // Spawn visual hit sparks
  public spawnHitSparks(x: number, y: number, z: number, isHeavy = false) {
    this.cameraShake = isHeavy ? 0.22 : 0.08;

    const count = isHeavy ? 14 : 7;
    for (let i = 0; i < count; i++) {
      const geom = new THREE.SphereGeometry(isHeavy ? 0.07 : 0.04, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: isHeavy ? (Math.random() > 0.5 ? 0xf59e0b : 0xef4444) : 0xfef08a,
      });
      const spark = new THREE.Mesh(geom, mat);
      spark.position.set(
        x + (Math.random() - 0.5) * 0.2,
        y + (Math.random() - 0.5) * 0.2,
        z + (Math.random() - 0.5) * 0.2
      );

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * (isHeavy ? 6 : 3.5),
        Math.random() * (isHeavy ? 5 : 3) + 1,
        (Math.random() - 0.5) * 2
      );

      this.scene.add(spark);
      this.hitSparks.push({ mesh: spark, vel, life: 0.35, maxLife: 0.35 });
    }
  }

  // Update hierarchical poses based on fighter state & animation timer
  private updateFighterPose(parts: FighterMeshParts, f: FighterState, elapsed: number) {
    const root = parts.root;
    root.position.set(f.x, f.y, f.z);

    // Orientation: face the opponent
    const targetRotY = f.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
    root.rotation.y = targetRotY;

    // Reset default joint rotations
    parts.hips.rotation.set(0, 0, 0);
    parts.hips.position.set(0, 0.95, 0);
    parts.torso.rotation.set(0, 0, 0);
    parts.head.rotation.set(0, 0, 0);

    parts.leftArmPivot.rotation.set(0, 0, 0);
    parts.leftForearmPivot.rotation.set(0, 0, 0);
    parts.rightArmPivot.rotation.set(0, 0, 0);
    parts.rightForearmPivot.rotation.set(0, 0, 0);

    parts.leftLegPivot.rotation.set(0, 0, 0);
    parts.leftCalfPivot.rotation.set(0, 0, 0);
    parts.rightLegPivot.rotation.set(0, 0, 0);
    parts.rightCalfPivot.rotation.set(0, 0, 0);

    const animProgress = f.animDuration > 0 ? Math.min(1, f.animTimer / f.animDuration) : 0;
    const t = Math.sin(animProgress * Math.PI); // Smooth peak at 0.5

    switch (f.animState) {
      case 'idle': {
        // Tekken bouncing fighting stance
        const bounce = Math.sin(elapsed * 7) * 0.04;
        parts.hips.position.y = 0.95 + bounce;

        // Boxing / Karate Guard
        parts.torso.rotation.y = 0.3; // Slight 3/4 turn
        parts.rightArmPivot.rotation.x = -1.1; // Lead guard
        parts.rightForearmPivot.rotation.x = -1.2;
        parts.leftArmPivot.rotation.x = -0.9; // Back guard
        parts.leftForearmPivot.rotation.x = -1.3;

        parts.leftLegPivot.rotation.x = -0.2;
        parts.rightLegPivot.rotation.x = 0.2;
        break;
      }

      case 'walk_fwd': {
        const walk = Math.sin(elapsed * 12);
        parts.rightLegPivot.rotation.x = walk * 0.6;
        parts.leftLegPivot.rotation.x = -walk * 0.6;
        parts.rightArmPivot.rotation.x = -1.0 + walk * 0.3;
        parts.leftArmPivot.rotation.x = -0.9 - walk * 0.3;
        break;
      }

      case 'walk_bwd': {
        const walk = Math.sin(elapsed * 10);
        parts.rightLegPivot.rotation.x = -walk * 0.5;
        parts.leftLegPivot.rotation.x = walk * 0.5;
        parts.torso.rotation.z = -0.1; // Leaning back defensively
        parts.rightArmPivot.rotation.x = -1.2;
        parts.leftArmPivot.rotation.x = -1.2;
        break;
      }

      case 'crouch': {
        // Low ducking guard
        parts.hips.position.y = 0.55;
        parts.leftLegPivot.rotation.x = -1.2;
        parts.rightLegPivot.rotation.x = -1.2;
        parts.leftCalfPivot.rotation.x = 1.3;
        parts.rightCalfPivot.rotation.x = 1.3;
        parts.torso.rotation.x = 0.4;
        parts.rightArmPivot.rotation.x = -1.4;
        parts.leftArmPivot.rotation.x = -1.4;
        break;
      }

      case 'jump': {
        // Tuck knees in air
        parts.leftLegPivot.rotation.x = -0.7;
        parts.rightLegPivot.rotation.x = -0.7;
        parts.leftCalfPivot.rotation.x = 1.0;
        parts.rightCalfPivot.rotation.x = 1.0;
        parts.rightArmPivot.rotation.x = -1.6;
        parts.leftArmPivot.rotation.x = -1.6;
        break;
      }

      case 'punch_light': {
        // Fast Left Jab
        parts.torso.rotation.y = 0.5 * t;
        parts.leftArmPivot.rotation.x = -Math.PI / 2 * t;
        parts.leftForearmPivot.rotation.x = 0; // Fully straight
        parts.rightArmPivot.rotation.x = -1.2; // Guard stays up
        break;
      }

      case 'punch_heavy': {
        // Devastating Right Straight / Hook
        parts.torso.rotation.y = -0.8 * t;
        parts.torso.rotation.x = 0.2 * t;
        parts.rightArmPivot.rotation.x = -Math.PI / 1.8 * t;
        parts.rightForearmPivot.rotation.x = -0.1;
        parts.leftArmPivot.rotation.x = -1.1;
        parts.rightLegPivot.rotation.x = 0.4 * t;
        break;
      }

      case 'kick_low': {
        // Quick Low Shin / Knee Kick
        parts.rightLegPivot.rotation.x = 0.8 * t;
        parts.rightCalfPivot.rotation.x = -0.3 * t;
        parts.torso.rotation.z = -0.2 * t;
        break;
      }

      case 'kick_high': {
        // High Roundhouse Kick to Head
        parts.torso.rotation.z = -0.6 * t;
        parts.torso.rotation.y = -0.4 * t;
        parts.rightLegPivot.rotation.x = 1.6 * t;
        parts.rightLegPivot.rotation.z = 0.4 * t;
        parts.rightCalfPivot.rotation.x = 0;
        break;
      }

      case 'sweep': {
        // Leg Sweep (Rasteira): low drop and full rotational sweep
        parts.hips.position.y = 0.4;
        parts.torso.rotation.x = 0.6;
        parts.torso.rotation.y = animProgress * Math.PI * 1.5;
        parts.leftLegPivot.rotation.x = -1.3;
        parts.leftCalfPivot.rotation.x = 1.4;
        parts.rightLegPivot.rotation.x = 0.9;
        parts.rightLegPivot.rotation.z = 0.6;
        break;
      }

      case 'spinning_kick': {
        // Chute Giratório (360° spin kick)
        const spinAngle = animProgress * Math.PI * 2;
        root.rotation.y = (f.facing === 1 ? Math.PI / 2 : -Math.PI / 2) + spinAngle;
        parts.hips.position.y = 0.95 + Math.sin(animProgress * Math.PI) * 0.25; // Slight jump
        parts.rightLegPivot.rotation.x = 1.4 * t;
        parts.rightLegPivot.rotation.z = 0.3 * t;
        parts.torso.rotation.z = -0.4 * t;
        break;
      }

      case 'grab': {
        // Lunging grab reach
        parts.torso.rotation.x = 0.3 * t;
        parts.rightArmPivot.rotation.x = -Math.PI / 2 * t;
        parts.leftArmPivot.rotation.x = -Math.PI / 2 * t;
        parts.rightForearmPivot.rotation.x = 0;
        parts.leftForearmPivot.rotation.x = 0;
        break;
      }

      case 'grabbed': {
        // Being lifted and slammed
        parts.hips.position.y = 0.95 + t * 0.8;
        parts.torso.rotation.x = -t * 1.2;
        parts.leftLegPivot.rotation.x = 0.5;
        parts.rightLegPivot.rotation.x = 0.5;
        break;
      }

      case 'hit_light': {
        // Head / torso snapback
        parts.torso.rotation.x = -0.35 * t;
        parts.head.rotation.x = -0.4 * t;
        parts.rightArmPivot.rotation.x = -0.6;
        parts.leftArmPivot.rotation.x = -0.6;
        break;
      }

      case 'hit_heavy': {
        // Big stagger back
        parts.torso.rotation.x = -0.7 * t;
        parts.head.rotation.x = -0.7 * t;
        parts.hips.position.y = 0.85;
        parts.leftLegPivot.rotation.x = -0.4;
        break;
      }

      case 'knockdown': {
        // Falling flat on floor
        parts.hips.position.y = 0.15;
        root.rotation.x = Math.PI / 2; // Flat on back
        parts.rightLegPivot.rotation.x = 0.2;
        parts.leftLegPivot.rotation.x = 0.2;
        break;
      }

      case 'getup': {
        // Rolling and standing back up
        const standT = animProgress;
        parts.hips.position.y = 0.15 + standT * 0.8;
        root.rotation.x = (1 - standT) * (Math.PI / 2);
        break;
      }

      case 'victory': {
        // Confident martial arts salute / arms raised
        const v = Math.sin(elapsed * 4) * 0.05;
        parts.hips.position.y = 0.95 + v;
        parts.rightArmPivot.rotation.x = -2.4;
        parts.leftArmPivot.rotation.x = -2.4;
        parts.torso.rotation.x = -0.15;
        break;
      }

      case 'defeat': {
        // Collapsed on floor
        parts.hips.position.y = 0.12;
        root.rotation.x = Math.PI / 2;
        break;
      }
    }
  }

  // Update scene from fighter engine state
  public update(p1: FighterState, p2: FighterState) {
    const elapsed = this.clock.getElapsedTime();

    if (this.p1Parts) {
      this.updateFighterPose(this.p1Parts, p1, elapsed);
      this.p1Shadow.position.set(p1.x, 0.02, p1.z);
      this.p1Shadow.scale.setScalar(Math.max(0.4, 1 - p1.y * 0.4));
    }

    if (this.p2Parts) {
      this.updateFighterPose(this.p2Parts, p2, elapsed);
      this.p2Shadow.position.set(p2.x, 0.02, p2.z);
      this.p2Shadow.scale.setScalar(Math.max(0.4, 1 - p2.y * 0.4));
    }

    // Dynamic Tekken 3 Camera Tracking
    const midX = (p1.x + p2.x) / 2;
    const dist = Math.abs(p1.x - p2.x);
    const targetCamZ = THREE.MathUtils.clamp(5.5 + dist * 0.45, 5.8, 9.2);

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, midX * 0.75, 5, 0.016);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 4, 0.016);
    this.camera.position.y = 2.1;

    // Camera impact shake
    if (this.cameraShake > 0.001) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake;
      this.cameraShake *= 0.85;
    }

    this.camera.lookAt(midX, 1.25, 0);
  }

  private animate() {
    this.reqId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    // Animate hit sparks
    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      const spark = this.hitSparks[i];
      spark.life -= delta;
      if (spark.life <= 0) {
        this.scene.remove(spark.mesh);
        spark.mesh.geometry.dispose();
        (spark.mesh.material as THREE.Material).dispose();
        this.hitSparks.splice(i, 1);
      } else {
        spark.vel.y -= 12 * delta; // Gravity
        spark.mesh.position.addScaledVector(spark.vel, delta);
        const scale = spark.life / spark.maxLife;
        spark.mesh.scale.setScalar(scale);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onResize = () => {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public dispose() {
    cancelAnimationFrame(this.reqId);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
