import * as THREE from 'three';
import { GameEngine } from './gameState';
import { Direction, NodePoint } from './types';

export class ThreeGameView {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private onNodeClicked: (nodeId: string) => void;

  // Render elements & references
  private nodeMeshes: Map<string, THREE.Group> = new Map();
  private playerMesh: THREE.Group | null = null;
  private enemyMeshes: Map<string, THREE.Group> = new Map();
  private relicMeshes: Map<string, THREE.Group> = new Map();
  private portalMesh: THREE.Group | null = null;
  private levelGroup: THREE.Group = new THREE.Group();

  // Animations & loop
  private reqId: number | null = null;
  private clock: THREE.Clock = new THREE.Clock();

  // Animation states
  private playerTargetPos: THREE.Vector3 = new THREE.Vector3();
  private playerCurrentPos: THREE.Vector3 = new THREE.Vector3();
  private playerTargetRotY: number = 0;
  private snakeStrikeTime: number = 0;
  private strikingSnakeId: string | null = null;

  constructor(container: HTMLDivElement, onNodeClicked: (nodeId: string) => void) {
    this.container = container;
    this.onNodeClicked = onNodeClicked;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0c0a09); // Stone-950
    this.scene.fog = new THREE.FogExp2(0x0c0a09, 0.035);

    // Camera: Slightly closer zoom as requested ("um pouco de zoom na imagem do jogo")
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    // Isometric angle with tighter camera distance
    this.camera.position.set(7.5, 9.5, 9.5);
    this.camera.lookAt(3, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Scene lighting
    this.setupLighting();

    this.scene.add(this.levelGroup);

    // Event listeners
    this.onResize = this.onResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // Start loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xd4d4d8, 0.85);
    this.scene.add(ambientLight);

    // Main directional sunlight (warm ancient ruin beam)
    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    dirLight.position.set(12, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    const d = 10;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Subtle blueish bounce light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-10, 8, -10);
    this.scene.add(fillLight);
  }

  loadLevel(engine: GameEngine) {
    // Clear previous objects
    while (this.levelGroup.children.length > 0) {
      const obj = this.levelGroup.children[0];
      this.levelGroup.remove(obj);
    }
    this.nodeMeshes.clear();
    this.enemyMeshes.clear();
    this.relicMeshes.clear();
    this.playerMesh = null;
    this.portalMesh = null;

    const level = engine.currentLevel;

    // Calculate level bounds to center camera nicely
    let minX = Infinity,
      maxX = -Infinity,
      minZ = Infinity,
      maxZ = -Infinity;
    level.nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.z < minZ) minZ = n.z;
      if (n.z > maxZ) maxZ = n.z;
    });
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Camera positioning with zoom closer: center of action
    this.camera.position.set(centerX + 5.5, 7.8, centerZ + 7.2);
    this.camera.lookAt(centerX, 0.2, centerZ);

    // Build Ruins Ground Base
    this.buildRuinsEnvironment(centerX, centerZ, maxX - minX + 8, maxZ - minZ + 8);

    // Build Path Connections (Stone Slabs & Lines)
    this.buildConnections(level.nodes);

    // Build Nodes
    level.nodes.forEach((node) => {
      const nodeGroup = this.createNodeMesh(node, engine.brokenNodes.has(node.id));
      this.nodeMeshes.set(node.id, nodeGroup);
      this.levelGroup.add(nodeGroup);
    });

    // Build Relics
    engine.relics.forEach((r) => {
      const node = engine.getNode(r.nodeId);
      if (node && !r.collected) {
        const relicObj = this.createRelicMesh();
        relicObj.position.set(node.x, 0.4, node.z);
        this.relicMeshes.set(r.id, relicObj);
        this.levelGroup.add(relicObj);
      }
    });

    // Build Exit Portal
    const exitNode = engine.getNode(level.exitNodeId);
    if (exitNode) {
      const portal = this.createPortalMesh();
      portal.position.set(exitNode.x, 0, exitNode.z);
      this.portalMesh = portal;
      this.levelGroup.add(portal);
    }

    // Build Player (Lola)
    const startNode = engine.getNode(engine.playerNodeId);
    this.playerMesh = this.createPlayerMesh();
    if (startNode) {
      this.playerCurrentPos.set(startNode.x, 0, startNode.z);
      this.playerTargetPos.copy(this.playerCurrentPos);
      this.playerMesh.position.copy(this.playerCurrentPos);
    }
    this.updatePlayerFacing(engine.playerFacing);
    this.levelGroup.add(this.playerMesh);

    // Build Enemies
    engine.enemies.forEach((enemy) => {
      const enemyNode = engine.getNode(enemy.nodeId);
      if (enemyNode && !enemy.isDead) {
        let enemyObj: THREE.Group;
        if (enemy.type === 'snake') {
          enemyObj = this.createSnakeMesh(enemy.facing || 'west');
        } else {
          enemyObj = this.createSpiderMesh();
          if (enemy.facing) {
            if (enemy.facing === 'north') enemyObj.rotation.y = Math.PI;
            else if (enemy.facing === 'south') enemyObj.rotation.y = 0;
            else if (enemy.facing === 'west') enemyObj.rotation.y = -Math.PI / 2;
            else if (enemy.facing === 'east') enemyObj.rotation.y = Math.PI / 2;
          }
        }
        enemyObj.position.set(enemyNode.x, 0, enemyNode.z);
        this.enemyMeshes.set(enemy.id, enemyObj);
        this.levelGroup.add(enemyObj);
      }
    });

    this.updateEntities(engine);
  }

  private createNodeMesh(node: NodePoint, isBroken: boolean): THREE.Group {
    const group = new THREE.Group();
    group.position.set(node.x, 0, node.z);
    group.userData = { nodeId: node.id };

    if (isBroken) {
      // BROKEN NODE: A deep dark hole / abyss as requested
      // ("virar um buraco mais preto dando a aparencia de ser fundo")
      const holeGeom = new THREE.CylinderGeometry(0.38, 0.32, 0.4, 24);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
      const hole = new THREE.Mesh(holeGeom, holeMat);
      hole.position.y = -0.2;
      group.add(hole);

      // Pit rim with crumbling rock edge
      const rimGeom = new THREE.RingGeometry(0.36, 0.48, 24);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x292524,
        roughness: 0.9,
      });
      const rim = new THREE.Mesh(rimGeom, rimMat);
      rim.rotation.x = -Math.PI / 2;
      rim.position.y = 0.01;
      group.add(rim);
    } else if (node.type === 'cracked') {
      // CRACKED NODE: Stone plate with distinct fissure texture / cracked ground appearance
      // ("um ponto com textura de rachadura no chão")
      const slabGeom = new THREE.CylinderGeometry(0.42, 0.45, 0.1, 16);
      const slabMat = new THREE.MeshStandardMaterial({
        color: 0x78716c,
        roughness: 0.95,
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      slab.receiveShadow = true;
      group.add(slab);

      // Cracked fissure pattern lines (cross cuts on stone)
      const crackMat = new THREE.MeshBasicMaterial({ color: 0x1c1917 });
      const f1Geom = new THREE.BoxGeometry(0.65, 0.02, 0.05);
      const f1 = new THREE.Mesh(f1Geom, crackMat);
      f1.position.y = 0.052;
      f1.rotation.y = 0.4;
      group.add(f1);

      const f2Geom = new THREE.BoxGeometry(0.5, 0.02, 0.04);
      const f2 = new THREE.Mesh(f2Geom, crackMat);
      f2.position.y = 0.052;
      f2.rotation.y = -0.8;
      group.add(f2);
    } else {
      // NORMAL / START / EXIT NODE: Elegant ancient stone disc
      const discGeom = new THREE.CylinderGeometry(0.36, 0.4, 0.08, 20);
      const discMat = new THREE.MeshStandardMaterial({
        color: node.type === 'start' ? 0x44403c : node.type === 'exit' ? 0xca8a04 : 0x57534e,
        roughness: 0.8,
        metalness: 0.1,
      });
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.receiveShadow = true;
      group.add(disc);

      // Center inlay glyph
      const inlayGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.085, 12);
      const inlayMat = new THREE.MeshStandardMaterial({
        color: node.type === 'exit' ? 0xfef08a : 0x78716c,
        roughness: 0.5,
        emissive: node.type === 'exit' ? 0xeab308 : 0x000000,
        emissiveIntensity: node.type === 'exit' ? 0.35 : 0,
      });
      const inlay = new THREE.Mesh(inlayGeom, inlayMat);
      group.add(inlay);
    }

    // Interactive Invisible Hitbox for reliable raycasting clicks
    const hitBox = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 0.35, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.position.y = 0.1;
    hitBox.userData = { nodeId: node.id };
    group.add(hitBox);

    return group;
  }

  private buildConnections(nodes: NodePoint[]) {
    const visited = new Set<string>();
    const stonePathMat = new THREE.MeshStandardMaterial({
      color: 0x44403c,
      roughness: 0.9,
    });

    nodes.forEach((n) => {
      n.connections.forEach((targetId) => {
        const key = [n.id, targetId].sort().join('--');
        if (visited.has(key)) return;
        visited.add(key);

        const targetNode = nodes.find((t) => t.id === targetId);
        if (!targetNode) return;

        const p1 = new THREE.Vector3(n.x, 0.02, n.z);
        const p2 = new THREE.Vector3(targetNode.x, 0.02, targetNode.z);
        const dist = p1.distanceTo(p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

        // Stone pathway slab connecting nodes
        const slabGeom = new THREE.BoxGeometry(0.22, 0.04, dist);
        const slab = new THREE.Mesh(slabGeom, stonePathMat);
        slab.position.copy(mid);
        slab.lookAt(p2);
        slab.receiveShadow = true;
        this.levelGroup.add(slab);
      });
    });
  }

  private buildRuinsEnvironment(cx: number, cz: number, width: number, depth: number) {
    // Large Temple Foundation Floor
    const groundGeom = new THREE.PlaneGeometry(width * 1.6, depth * 1.6);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.95,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(cx, -0.06, cz);
    ground.receiveShadow = true;
    this.levelGroup.add(ground);

    // Decorative Ancient Stone Pillars around the ruins
    const pillarGeom = new THREE.CylinderGeometry(0.4, 0.45, 3.2, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.85 });

    const pillarOffsets = [
      { x: -width * 0.45, z: -depth * 0.45 },
      { x: width * 0.45, z: -depth * 0.45 },
      { x: -width * 0.45, z: depth * 0.45 },
      { x: width * 0.45, z: depth * 0.45 },
      { x: 0, z: -depth * 0.5 },
      { x: 0, z: depth * 0.5 },
    ];

    pillarOffsets.forEach((off) => {
      const pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(cx + off.x, 1.5, cz + off.z);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.levelGroup.add(pillar);
    });
  }

  private createPlayerMesh(): THREE.Group {
    const group = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xaa6e49, roughness: 0.65 }); // Morena/tan skin tone
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.7 }); // Cyan/turquoise tank top
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Brown cargo shorts
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });

    // Torso
    const torsoGeom = new THREE.BoxGeometry(0.3, 0.38, 0.18);
    const torso = new THREE.Mesh(torsoGeom, shirtMat);
    torso.position.y = 0.56;
    torso.castShadow = true;
    group.add(torso);

    // Head (simple sphere without ponytail / braid)
    const headGeom = new THREE.SphereGeometry(0.14, 16, 16);
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 0.85;
    head.castShadow = true;
    group.add(head);

    // Shorts / Hips
    const hipsGeom = new THREE.BoxGeometry(0.28, 0.16, 0.16);
    const hips = new THREE.Mesh(hipsGeom, shortsMat);
    hips.position.y = 0.36;
    hips.castShadow = true;
    group.add(hips);

    // Legs & Boots
    [-0.08, 0.08].forEach((x) => {
      const legGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.28, 8);
      const leg = new THREE.Mesh(legGeom, bootMat);
      leg.position.set(x, 0.14, 0);
      leg.castShadow = true;
      group.add(leg);
    });

    group.scale.set(1.2, 1.2, 1.2);
    return group;
  }

  private createSnakeMesh(facing: Direction): THREE.Group {
    const group = new THREE.Group();

    const snakeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Emerald green scales
      roughness: 0.5,
      metalness: 0.1,
    });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const tongueMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Coiled Base Body
    const coilGeom = new THREE.TorusGeometry(0.25, 0.08, 12, 24);
    const coil = new THREE.Mesh(coilGeom, snakeBodyMat);
    coil.rotation.x = Math.PI / 2;
    coil.position.y = 0.08;
    coil.castShadow = true;
    group.add(coil);

    // Raised S-neck and head pivot group (for strike/bobbing animation)
    const neckGroup = new THREE.Group();
    neckGroup.name = 'snakeHeadPivot';
    neckGroup.position.set(0, 0.08, 0);

    const neckGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 10);
    const neck = new THREE.Mesh(neckGeom, snakeBodyMat);
    neck.position.set(0, 0.22, 0);
    neck.rotation.x = -0.15;
    neck.castShadow = true;
    neckGroup.add(neck);

    // Snake Head
    const headGeom = new THREE.ConeGeometry(0.12, 0.25, 8);
    const head = new THREE.Mesh(headGeom, snakeBodyMat);
    head.rotation.x = Math.PI / 2;
    head.position.set(0, 0.42, 0.12);
    head.castShadow = true;
    neckGroup.add(head);

    // Red Forked Tongue
    const tongueGeom = new THREE.BoxGeometry(0.02, 0.005, 0.14);
    const tongue = new THREE.Mesh(tongueGeom, tongueMat);
    tongue.position.set(0, 0.42, 0.28);
    neckGroup.add(tongue);

    // Yellow Eyes
    [-0.07, 0.07].forEach((x) => {
      const eyeGeom = new THREE.SphereGeometry(0.025, 8, 8);
      const eye = new THREE.Mesh(eyeGeom, eyeMat);
      eye.position.set(x, 0.46, 0.14);
      neckGroup.add(eye);
    });

    group.add(neckGroup);

    // Orient snake towards its facing direction
    if (facing === 'north') group.rotation.y = Math.PI;
    else if (facing === 'south') group.rotation.y = 0;
    else if (facing === 'west') group.rotation.y = -Math.PI / 2;
    else if (facing === 'east') group.rotation.y = Math.PI / 2;

    group.scale.set(1.1, 1.1, 1.1);
    return group;
  }

  private createSpiderMesh(): THREE.Group {
    const group = new THREE.Group();

    const spiderMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917, // Obsidian black chitin
      roughness: 0.6,
      metalness: 0.2,
    });
    const abdomenMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d, // Dark crimson markings
      roughness: 0.7,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Cephalothorax
    const headGeom = new THREE.SphereGeometry(0.12, 12, 12);
    const head = new THREE.Mesh(headGeom, spiderMat);
    head.position.set(0, 0.15, 0.06);
    head.castShadow = true;
    group.add(head);

    // Abdomen
    const abdGeom = new THREE.SphereGeometry(0.18, 14, 14);
    const abd = new THREE.Mesh(abdGeom, abdomenMat);
    abd.position.set(0, 0.2, -0.16);
    abd.scale.set(1, 0.8, 1.3);
    abd.castShadow = true;
    group.add(abd);

    // Red Eyes
    [-0.04, 0.04].forEach((x) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
      eye.position.set(x, 0.19, 0.16);
      group.add(eye);
    });

    // 8 Spidery jointed legs
    for (let i = 0; i < 4; i++) {
      const zOff = 0.1 - i * 0.08;
      [-1, 1].forEach((side) => {
        const legGeom = new THREE.CylinderGeometry(0.02, 0.015, 0.45, 6);
        const leg = new THREE.Mesh(legGeom, spiderMat);
        leg.position.set(side * 0.22, 0.12, zOff);
        leg.rotation.z = side * 0.7;
        leg.rotation.y = (side * (i - 1.5) * Math.PI) / 6;
        leg.castShadow = true;
        group.add(leg);
      });
    }

    group.scale.set(1.2, 1.2, 1.2);
    return group;
  }

  private createRelicMesh(): THREE.Group {
    const group = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
    });

    // Golden Octahedron / Artifact
    const relicGeom = new THREE.OctahedronGeometry(0.24, 0);
    const relic = new THREE.Mesh(relicGeom, goldMat);
    relic.castShadow = true;
    group.add(relic);

    // Glowing halo ring around relic
    const ringGeom = new THREE.RingGeometry(0.3, 0.34, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);

    return group;
  }

  private createPortalMesh(): THREE.Group {
    const group = new THREE.Group();

    const portalBeamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });

    // Glowing energy cylinder / portal
    const beamGeom = new THREE.CylinderGeometry(0.36, 0.36, 1.8, 20, 1, true);
    const beam = new THREE.Mesh(beamGeom, portalBeamMat);
    beam.name = 'portalBeam';
    beam.position.y = 0.9;
    group.add(beam);

    // Glowing blue ring on ground
    const ringGeom = new THREE.RingGeometry(0.3, 0.42, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    group.add(ring);

    return group;
  }

  updateEntities(engine: GameEngine) {
    const level = engine.currentLevel;

    // Update Player Target Position & Orientation
    const targetNode = engine.getNode(engine.playerNodeId);
    if (targetNode) {
      this.playerTargetPos.set(targetNode.x, 0, targetNode.z);
    }
    this.updatePlayerFacing(engine.playerFacing);

    // Rebuild or update broken/cracked nodes as needed
    level.nodes.forEach((node) => {
      const isBroken = engine.brokenNodes.has(node.id);
      let mesh = this.nodeMeshes.get(node.id);

      if (isBroken && mesh && mesh.children.length > 0) {
        // Replace with broken pit hole mesh if not already broken
        if (!mesh.userData.isBrokenRendered) {
          this.levelGroup.remove(mesh);
          mesh = this.createNodeMesh(node, true);
          mesh.userData.isBrokenRendered = true;
          this.nodeMeshes.set(node.id, mesh);
          this.levelGroup.add(mesh);
        }
      }
    });

    // Update Enemies
    engine.enemies.forEach((enemy) => {
      const mesh = this.enemyMeshes.get(enemy.id);
      if (mesh) {
        if (enemy.isDead) {
          mesh.visible = false;
        } else {
          mesh.visible = true;
          const node = engine.getNode(enemy.nodeId);
          if (node) {
            mesh.position.set(node.x, 0, node.z);
          }
          if (enemy.type === 'spider' && enemy.facing) {
            if (enemy.facing === 'north') mesh.rotation.y = Math.PI;
            else if (enemy.facing === 'south') mesh.rotation.y = 0;
            else if (enemy.facing === 'west') mesh.rotation.y = -Math.PI / 2;
            else if (enemy.facing === 'east') mesh.rotation.y = Math.PI / 2;
          }
        }
      }
    });

    // Check if snake struck the player (Snake strike animation)
    // ("adicione uma pequena animacao na cobra quando a personagem esbarrar de frente com ela e for picada. algo como a cobra balancar a cabeca na direcao da personagem")
    if (engine.isPlayerDead && engine.lastAttackingEnemyId) {
      this.strikingSnakeId = engine.lastAttackingEnemyId;
      this.snakeStrikeTime = this.clock.getElapsedTime();
    } else {
      this.strikingSnakeId = null;
    }

    // Update Relics
    engine.relics.forEach((r) => {
      const relicMesh = this.relicMeshes.get(r.id);
      if (relicMesh) {
        relicMesh.visible = !r.collected;
      }
    });
  }

  private updatePlayerFacing(facing: Direction) {
    if (facing === 'north') this.playerTargetRotY = Math.PI;
    else if (facing === 'south') this.playerTargetRotY = 0;
    else if (facing === 'west') this.playerTargetRotY = -Math.PI / 2;
    else if (facing === 'east') this.playerTargetRotY = Math.PI / 2;
  }

  private animate() {
    this.reqId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth player movement interpolation (hopping/stepping feel)
    if (this.playerMesh) {
      this.playerCurrentPos.lerp(this.playerTargetPos, 0.25);
      const isMoving = this.playerCurrentPos.distanceTo(this.playerTargetPos) > 0.02;
      const hopY = isMoving ? Math.sin(elapsedTime * 18) * 0.08 : 0;
      this.playerMesh.position.set(
        this.playerCurrentPos.x,
        this.playerCurrentPos.y + Math.max(0, hopY),
        this.playerCurrentPos.z
      );

      // Smooth rotation
      let diffRot = this.playerTargetRotY - this.playerMesh.rotation.y;
      while (diffRot > Math.PI) diffRot -= Math.PI * 2;
      while (diffRot < -Math.PI) diffRot += Math.PI * 2;
      this.playerMesh.rotation.y += diffRot * 0.28;
    }

    // Animate Relics: slow hover and spinning
    this.relicMeshes.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.y += delta * 1.5;
        mesh.position.y = 0.4 + Math.sin(elapsedTime * 3) * 0.06;
      }
    });

    // Animate Portal: pulsing energy beam
    if (this.portalMesh) {
      const beam = (this.portalMesh.getObjectByName('portalBeam') || this.portalMesh.children[0]) as THREE.Mesh;
      if (beam) {
        beam.rotation.y += delta * 0.8;
      }
    }

    // Snake Idle / Strike animation
    this.enemyMeshes.forEach((enemyObj, id) => {
      const headPivot = enemyObj.getObjectByName('snakeHeadPivot');
      if (headPivot) {
        if (this.strikingSnakeId === id) {
          // Snake strike animation when player stepped in front and got bitten!
          const strikeAge = elapsedTime - this.snakeStrikeTime;
          if (strikeAge < 2.2) {
            // Rapid lunging forward and snapping head towards player
            const lunge = Math.sin(strikeAge * 12) * 0.35;
            headPivot.rotation.x = -0.45 + lunge;
            headPivot.position.z = Math.max(0, Math.sin(strikeAge * 10) * 0.25);
          } else {
            headPivot.rotation.x = -0.15;
            headPivot.position.z = 0;
          }
        } else {
          // Gentle idle breathing sway
          headPivot.rotation.x = -0.15 + Math.sin(elapsedTime * 2.5 + id.charCodeAt(0)) * 0.05;
          headPivot.rotation.y = Math.sin(elapsedTime * 1.8) * 0.08;
        }
      }
    });

    // Character recoil when bitten by snake
    if (this.playerMesh && this.strikingSnakeId) {
      const strikeAge = elapsedTime - this.snakeStrikeTime;
      if (strikeAge < 2.2) {
        // Character reels back slightly in shock
        const recoil = Math.sin(Math.min(strikeAge * 4, Math.PI)) * 0.3;
        this.playerMesh.rotation.x = -recoil;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onPointerDown(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.levelGroup.children, true);

    for (const hit of intersects) {
      let curr: THREE.Object3D | null = hit.object;
      while (curr && curr !== this.levelGroup) {
        if (curr.userData && curr.userData.nodeId) {
          this.onNodeClicked(curr.userData.nodeId);
          return;
        }
        curr = curr.parent;
      }
    }
  }

  private onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / (height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  dispose() {
    if (this.reqId !== null) {
      cancelAnimationFrame(this.reqId);
    }
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
