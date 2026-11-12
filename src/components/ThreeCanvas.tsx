import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BuildingData, Player } from '../types/game';
import { playSFX } from '../utils/audio';

interface ThreeCanvasProps {
  buildings: Record<string, BuildingData>;
  players: Player[];
  onPlayerMove: (pIdx: number, newPos: { x: number; z: number }) => void;
  onBuildingTrigger: (buildingCode: string) => void;
  cameraFocus: 'ALL' | number;
  cameraAngle: number;
  cameraDistance: number;
  isAutoOrbit: boolean;
  onRotateCamera: (delta: number) => void;
  onCanvasClickCoords?: (coords: { x: number; z: number }) => void;
  placedOrnaments: Array<{ id: string; type: string; pos: { x: number; z: number }; text?: string }>;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  buildings,
  players,
  onPlayerMove,
  onBuildingTrigger,
  cameraFocus,
  cameraAngle,
  cameraDistance,
  isAutoOrbit,
  onRotateCamera,
  onCanvasClickCoords,
  placedOrnaments,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to keep THREE scene objects across updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerGroupsRef = useRef<THREE.Group[]>([]);
  const buildingGroupsRef = useRef<Record<string, THREE.Group>>({});
  const ornamentGroupsRef = useRef<THREE.Group[]>([]);
  const crystalMonumentRef = useRef<THREE.Mesh | null>(null);
  const keysPressedRef = useRef<Record<string, boolean>>({});
  const lastTriggerTimeRef = useRef<number>(0);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x7dd3fc); // Sky Blue
    scene.fog = new THREE.FogExp2(0x7dd3fc, 0.002);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1200);
    camera.position.set(0, 75, 120);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    sunLight.position.set(120, 160, 90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // 5. Ground Island (260x260) with grass & roads
    createIsland(scene);

    // 6. Central Plaza Monument
    const monument = createCenterMonument();
    scene.add(monument.group);
    crystalMonumentRef.current = monument.crystal;

    // 7. Trees & Flora
    createFlora(scene);

    // 8. Clouds
    createClouds(scene);

    // 9. Resize handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Click handler for placement
    const canvas = canvasRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(sceneRef.current.children, true);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        if (Math.abs(pt.x) <= 120 && Math.abs(pt.z) <= 120) {
          onCanvasClickCoords?.({ x: Math.round(pt.x), z: Math.round(pt.z) });
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Rotate Crystal
      if (crystalMonumentRef.current) {
        crystalMonumentRef.current.rotation.y += delta * 0.8;
      }

      // Auto Orbit
      if (isAutoOrbit) {
        onRotateCamera(0.005);
      }

      // Update Camera based on focus
      updateCameraPosition();

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleCanvasClick);
      renderer.dispose();
    };
  }, []);

  // Update Buildings in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old buildings
    Object.values(buildingGroupsRef.current).forEach((grp) => scene.remove(grp));
    buildingGroupsRef.current = {};

    // Build each building
    Object.keys(buildings).forEach((code) => {
      const bData = buildings[code];
      const bGroup = new THREE.Group();
      bGroup.position.set(bData.pos.x, 0, bData.pos.z);

      // Main Block
      const mainGeo = new THREE.BoxGeometry(32, 22, 32);
      const mainMat = new THREE.MeshStandardMaterial({
        color: bData.color,
        roughness: 0.35,
        metalness: 0.1,
      });
      const mainMesh = new THREE.Mesh(mainGeo, mainMat);
      mainMesh.position.y = 11;
      mainMesh.castShadow = true;
      mainMesh.receiveShadow = true;
      bGroup.add(mainMesh);

      // Accent Roof
      const roofGeo = new THREE.BoxGeometry(34, 4, 34);
      const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 24;
      bGroup.add(roof);

      // Front Door
      const doorGeo = new THREE.BoxGeometry(8, 12, 1.5);
      const doorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, 6, 16.5);
      bGroup.add(door);

      // Overhead 3D Billboard
      const billboard = createBuildingBillboard(bData);
      billboard.position.y = 36;
      bGroup.add(billboard);

      scene.add(bGroup);
      buildingGroupsRef.current[code] = bGroup;
    });
  }, [buildings]);

  // Update Ornaments in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old ornaments
    ornamentGroupsRef.current.forEach((grp) => scene.remove(grp));
    ornamentGroupsRef.current = [];

    placedOrnaments.forEach((orn) => {
      const group = new THREE.Group();
      group.position.set(orn.pos.x, 0, orn.pos.z);

      if (orn.type === 'gazebo') {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
        base.position.y = 0.4;
        group.add(base);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 4, 8), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
        roof.position.y = 6.5;
        group.add(roof);

        const sprite = createTextBillboard('Gazebo Literasi', orn.text || 'Berpikir Komputasional & Algoritma', '#10b981');
        sprite.position.y = 10;
        group.add(sprite);
      } else if (orn.type === 'mading') {
        const board = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 0.4), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
        board.position.y = 4.5;
        group.add(board);

        const sprite = createTextBillboard('Mading Informatika', orn.text || 'Info & Soal Latihan Kelas VIII', '#3b82f6');
        sprite.position.y = 8.5;
        group.add(sprite);
      } else if (orn.type === 'fountain') {
        const pool = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 1.8, 16), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
        pool.position.y = 0.9;
        group.add(pool);
        const water = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 }));
        water.position.y = 1.8;
        group.add(water);
      } else {
        const box = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
        box.position.y = 1.75;
        group.add(box);
      }

      scene.add(group);
      ornamentGroupsRef.current.push(group);
    });
  }, [placedOrnaments]);

  // Update Players in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old player meshes
    playerGroupsRef.current.forEach((pGrp) => scene.remove(pGrp));
    playerGroupsRef.current = [];

    players.forEach((p) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(p.pos.x, 0, p.pos.z);

      // Torso
      const torsoMat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 1.8), torsoMat);
      torso.position.y = 3.5;
      torso.castShadow = true;
      pGroup.add(torso);

      // Head
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.3 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), headMat);
      head.position.y = 6.7;
      head.castShadow = true;
      pGroup.add(head);

      // Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.4, 1.6), legMat);
      legL.position.set(-0.75, 1.7, 0);
      pGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.4, 1.6), legMat);
      legR.position.set(0.75, 1.7, 0);
      pGroup.add(legR);

      // Hat accessory
      addAvatarHat(pGroup, p.avatar);

      // 3D Overhead Name Sprite
      const nameSprite = createPlayerNameSprite(p.name, p.colorHex);
      nameSprite.position.y = 10.5;
      pGroup.add(nameSprite);

      scene.add(pGroup);
      playerGroupsRef.current.push(pGroup);
    });
  }, [players]);

  // Movement & Proximity Tick Loop
  useEffect(() => {
    let animId: number;

    const tick = () => {
      animId = requestAnimationFrame(tick);
      const speed = 0.8;
      const keys = keysPressedRef.current;

      // Player 1: WASD + Space
      if (players[0]) {
        let dx = 0;
        let dz = 0;
        if (keys['w'] || keys['W']) dz -= speed;
        if (keys['s'] || keys['S']) dz += speed;
        if (keys['a'] || keys['A']) dx -= speed;
        if (keys['d'] || keys['D']) dx += speed;
        if (keys[' ']) playSFX('jump');

        if (dx !== 0 || dz !== 0) {
          applyPlayerMovement(0, dx, dz);
        }
      }

      // Player 2: Arrows
      if (players[1]) {
        let dx = 0;
        let dz = 0;
        if (keys['ArrowUp']) dz -= speed;
        if (keys['ArrowDown']) dz += speed;
        if (keys['ArrowLeft']) dx -= speed;
        if (keys['ArrowRight']) dx += speed;

        if (dx !== 0 || dz !== 0) {
          applyPlayerMovement(1, dx, dz);
        }
      }

      // Player 3: IJKL
      if (players[2]) {
        let dx = 0;
        let dz = 0;
        if (keys['i'] || keys['I']) dz -= speed;
        if (keys['k'] || keys['K']) dz += speed;
        if (keys['j'] || keys['J']) dx -= speed;
        if (keys['l'] || keys['L']) dx += speed;

        if (dx !== 0 || dz !== 0) {
          applyPlayerMovement(2, dx, dz);
        }
      }

      // Check proximity to buildings
      checkProximity();
    };

    tick();
    return () => cancelAnimationFrame(animId);
  }, [players, buildings]);

  const applyPlayerMovement = (pIdx: number, dx: number, dz: number) => {
    const p = players[pIdx];
    const grp = playerGroupsRef.current[pIdx];
    if (!p || !grp) return;

    const newX = Math.max(-115, Math.min(115, p.pos.x + dx));
    const newZ = Math.max(-115, Math.min(115, p.pos.z + dz));

    p.pos.x = newX;
    p.pos.z = newZ;
    grp.position.x = newX;
    grp.position.z = newZ;
    grp.rotation.y = Math.atan2(dx, dz);

    onPlayerMove(pIdx, { x: newX, z: newZ });
  };

  const checkProximity = () => {
    const now = Date.now();
    if (now - lastTriggerTimeRef.current < 2500) return;

    Object.keys(buildings).forEach((code) => {
      const b = buildings[code];
      players.forEach((p) => {
        const dist = Math.hypot(p.pos.x - b.pos.x, p.pos.z - b.pos.z);
        if (dist < 22) {
          lastTriggerTimeRef.current = now;
          onBuildingTrigger(code);
        }
      });
    });
  };

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;

    if (cameraFocus === 'ALL') {
      let avgX = 0;
      let avgZ = 0;
      players.forEach((p) => {
        avgX += p.pos.x;
        avgZ += p.pos.z;
      });
      avgX /= Math.max(1, players.length);
      avgZ /= Math.max(1, players.length);

      camera.position.x = avgX + Math.sin(cameraAngle) * cameraDistance;
      camera.position.z = avgZ + Math.cos(cameraAngle) * cameraDistance;
      camera.position.y = 75;
      camera.lookAt(avgX, 2, avgZ);
    } else if (typeof cameraFocus === 'number' && players[cameraFocus]) {
      const p = players[cameraFocus];
      camera.position.x = p.pos.x + Math.sin(cameraAngle) * 45;
      camera.position.z = p.pos.z + Math.cos(cameraAngle) * 45;
      camera.position.y = 32;
      camera.lookAt(p.pos.x, 3, p.pos.z);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};

// Helper 3D geometry builders
function createIsland(scene: THREE.Scene) {
  // Main Grass Box
  const islandGeo = new THREE.BoxGeometry(260, 8, 260);
  const islandMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
  const island = new THREE.Mesh(islandGeo, islandMat);
  island.position.y = -4;
  island.receiveShadow = true;
  scene.add(island);

  // Cross Roads
  const roadMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
  const roadH = new THREE.Mesh(new THREE.PlaneGeometry(240, 24), roadMat);
  roadH.rotation.x = -Math.PI / 2;
  roadH.position.y = 0.05;
  scene.add(roadH);

  const roadV = new THREE.Mesh(new THREE.PlaneGeometry(24, 240), roadMat);
  roadV.rotation.x = -Math.PI / 2;
  roadV.position.y = 0.05;
  scene.add(roadV);

  // Plaza Center
  const plazaMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 0.2, 32), plazaMat);
  plaza.position.y = 0.1;
  scene.add(plaza);
}

function createCenterMonument() {
  const group = new THREE.Group();
  group.position.set(0, 0, 0);

  const baseGeo = new THREE.CylinderGeometry(8, 10, 4, 8);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 2;
  group.add(base);

  // Floating Rotating Crystal
  const crystalGeo = new THREE.OctahedronGeometry(5.5, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.8,
    roughness: 0.1,
    emissive: 0x78350f,
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.y = 10;
  group.add(crystal);

  // Monument Billboard
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 140;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f59e0b';
    ctx.roundRect(10, 10, 492, 120, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Edublox City By Sitty', 256, 58);
    ctx.font = '22px Nunito, sans-serif';
    ctx.fillText('Informatika Kelas VIII • Kota Algoritma', 256, 100);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(30, 8.2, 1);
  sprite.position.y = 20;
  group.add(sprite);

  return { group, crystal };
}

function createBuildingBillboard(b: BuildingData) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = b.colorHex;
    ctx.fillRect(0, 0, 512, 256);
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(7, 7, 498, 242);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${b.icon} GEDUNG ${b.code}`, 256, 92);

    ctx.font = 'bold 28px Nunito, sans-serif';
    ctx.fillText(b.title, 256, 160);

    ctx.font = '22px Nunito, sans-serif';
    ctx.fillText('Informatika Kelas VIII', 256, 205);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(28, 14, 1);
  return sprite;
}

function createTextBillboard(title: string, desc: string, strokeColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(10, 10, 492, 140, 20);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 32px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 52);

    ctx.font = '20px Nunito, sans-serif';
    ctx.fillText(desc.substring(0, 42), 256, 95);
    if (desc.length > 42) {
      ctx.fillText(desc.substring(42, 85), 256, 128);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(20, 6.25, 1);
  return sprite;
}

function createPlayerNameSprite(name: string, colorHex: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = colorHex;
    ctx.roundRect(8, 8, 240, 64, 16);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 48);
  }

  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
  sprite.scale.set(12, 3.75, 1);
  return sprite;
}

function addAvatarHat(group: THREE.Group, avatar: string) {
  if (avatar === 'raja') {
    const crown = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.2, 1, 6),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    crown.position.y = 8.3;
    group.add(crown);
  } else if (avatar === 'neko') {
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
    earL.position.set(-0.8, 8.3, 0);
    group.add(earL);
    const earR = earL.clone();
    earR.position.set(0.8, 8.3, 0);
    group.add(earR);
  } else if (avatar === 'penyihir') {
    const hat = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.5, 8), new THREE.MeshStandardMaterial({ color: 0x8b5cf6 }));
    hat.position.y = 9.2;
    group.add(hat);
  } else if (avatar === 'kesatria') {
    const cap = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    cap.position.y = 8.1;
    group.add(cap);
  }
}

function createFlora(scene: THREE.Scene) {
  const treePositions = [
    { x: -35, z: -35, type: 'oak' },
    { x: 35, z: -35, type: 'pine' },
    { x: -35, z: 35, type: 'sakura' },
    { x: 35, z: 35, type: 'oak' },
    { x: -105, z: -100, type: 'pine' },
    { x: 105, z: -100, type: 'oak' },
    { x: -105, z: 100, type: 'sakura' },
    { x: 105, z: 100, type: 'pine' },
    { x: 0, z: -45, type: 'sakura' },
    { x: 0, z: 45, type: 'oak' },
    { x: -45, z: 0, type: 'pine' },
    { x: 45, z: 0, type: 'sakura' },
  ];

  treePositions.forEach((p) => {
    const group = new THREE.Group();
    group.position.set(p.x, 0, p.z);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.8, 10),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    trunk.position.y = 5;
    group.add(trunk);

    const leafColor = p.type === 'pine' ? 0x064e3b : p.type === 'sakura' ? 0xf472b6 : 0x15803d;
    const leafMat = new THREE.MeshStandardMaterial({ color: leafColor, roughness: 0.6 });

    if (p.type === 'pine') {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 14, 4), leafMat);
      cone.position.y = 15;
      group.add(cone);
    } else {
      for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(new THREE.BoxGeometry(8 - i * 2, 5, 8 - i * 2), leafMat);
        leaves.position.y = 11 + i * 4;
        group.add(leaves);
      }
    }

    scene.add(group);
  });
}

function createClouds(scene: THREE.Scene) {
  const cloudsGroup = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    for (let j = 0; j < 5; j++) {
      const part = new THREE.Mesh(
        new THREE.BoxGeometry(12 + Math.random() * 8, 6 + Math.random() * 4, 12 + Math.random() * 8),
        cloudMat
      );
      part.position.set(j * 6 - 12, Math.random() * 2, Math.random() * 6);
      cloud.add(part);
    }
    cloud.position.set((Math.random() - 0.5) * 240, 55 + Math.random() * 20, (Math.random() - 0.5) * 240);
    cloudsGroup.add(cloud);
  }
  scene.add(cloudsGroup);
}
