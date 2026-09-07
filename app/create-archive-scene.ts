import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { gallery, timeline, works } from "./archive-data";
import { chapterIndex, exhibitPosition, matchesFilter, roomCenter, type ChapterId, type Selection, type WorkFilter } from "./scene-layout";

type SceneCallbacks = {
  reducedMotion: boolean;
  onReady: () => void;
  onProgress: (value: number) => void;
  onSelect: (selection: Selection) => void;
  onContextLost: () => void;
};
export type ArchiveSceneAPI = {
  navigate: (chapter: ChapterId, instant?: boolean) => void;
  focus: (selection: Selection) => void;
  setFilter: (filter: WorkFilter) => void;
  setAutoRotate: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  zoom: (factor: number) => void;
  dispose: () => void;
};
type Exhibit = { group: THREE.Group; hit: THREE.Mesh; rim: THREE.Mesh; chapter: ChapterId; index: number; label: string; baseY: number };

export function createArchiveScene(host: HTMLElement, callbacks: SceneCallbacks): ArchiveSceneAPI {
  const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x070c11);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.touchAction = "none";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070c11);
  scene.fog = new THREE.FogExp2(0x070c11, 0.018);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 170);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.minDistance = 5;
  controls.maxDistance = 31;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = Math.PI / 2 - 0.025;
  controls.autoRotateSpeed = 0.45;
  controls.rotateSpeed = 0.55;

  let disposed = false;
  let contextLost = false;
  let paused = false;
  let reduced = callbacks.reducedMotion;
  let autoRotate = false;
  let active: ChapterId = "top";
  let filter: WorkFilter = "all";
  let selected: Exhibit | undefined;
  let hover: Exhibit | undefined;
  let elapsed = 0;
  let last = 0;
  let frame = 0;
  let flight: { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; target: THREE.Vector3; start: number; duration: number } | null = null;
  const rooms = new Map<ChapterId, THREE.Group>();
  const exhibits: Exhibit[] = [];
  const rotating: { mesh: THREE.Object3D; axis: "y" | "z"; speed: number }[] = [];
  const animatedMaterials: THREE.ShaderMaterial[] = [];
  const textures = new Set<THREE.Texture>();
  const textureCache = new Map<string, THREE.Texture>();
  const textureWaiters = new Map<string, ((texture: THREE.Texture) => void)[]>();
  const pendingImages = new Set<HTMLImageElement>();
  let requested = 0;
  let loaded = 0;
  let initialReady = false;
  function markReady() {
    if (!initialReady && !disposed) {
      initialReady = true;
      clearTimeout(readyTimeout);
      callbacks.onReady();
    }
  }

  scene.add(new THREE.HemisphereLight(0xb2dcd8, 0x16202b, 2.8));
  const key = new THREE.DirectionalLight(0xe8fff7, 4.8);
  key.position.set(4, 11, 8);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0x809bcc, 2.5);
  fill.position.set(-8, 3, -4);
  scene.add(fill);

  const metal = new THREE.MeshStandardMaterial({ color: 0x273740, metalness: 0.8, roughness: 0.28 });
  const mirror = new Reflector(new THREE.CircleGeometry(11, 80), { color: 0x16272b, textureWidth: host.clientWidth < 720 ? 512 : 1024, textureHeight: host.clientWidth < 720 ? 512 : 1024, clipBias: 0.003, multisample: 0 });
  mirror.rotation.x = -Math.PI / 2;
  mirror.position.y = -0.18;
  scene.add(mirror);

  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x101a23, metalness: 0.65, roughness: 0.32 });
  const edge = new THREE.MeshBasicMaterial({ color: 0x84e4cc, toneMapped: false });
  const mutedEdge = new THREE.MeshBasicMaterial({ color: 0x41666c, toneMapped: false });

  function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D, position: [number, number, number] = [0, 0, 0]) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...position);
    parent.add(item);
    return item;
  }

  function label(text: string, width = 3, color = "#c3e4dc", fontSize = 48) {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 160;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `400 ${fontSize}px "PingFang SC", "Microsoft YaHei", sans-serif`;
    ctx.fillText(text, 512, 80, 980);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.add(texture);
    return new THREE.Mesh(new THREE.PlaneGeometry(width, width * 160 / 1024), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  }

  function loadTexture(url: string, done: (texture: THREE.Texture) => void) {
    const cached = textureCache.get(url);
    if (cached) { done(cached); return; }
    const waiting = textureWaiters.get(url);
    if (waiting) { waiting.push(done); return; }
    textureWaiters.set(url, [done]);
    requested++;
    const image = new Image();
    pendingImages.add(image);
    image.onload = () => {
      pendingImages.delete(image);
      if (disposed) return;
      // Bound texture memory, including images shared between rooms.
      const size = Math.min(1, 1280 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.naturalWidth * size);
      canvas.height = Math.round(image.naturalHeight * size);
      canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      textures.add(texture);
      textureCache.set(url, texture);
      textureWaiters.get(url)?.forEach(callback => callback(texture));
      textureWaiters.delete(url);
      loaded++;
      callbacks.onProgress(Math.round(loaded / requested * 100));
      if (loaded >= requested) markReady();
    };
    image.onerror = () => {
      pendingImages.delete(image);
      textureWaiters.delete(url);
      if (!disposed) { loaded++; callbacks.onProgress(Math.round(loaded / requested * 100)); if (loaded >= requested) markReady(); }
    };
    image.src = url;
  }

  function ring(parent: THREE.Object3D, radius: number, y: number, material = edge, thickness = 0.013) {
    const object = mesh(new THREE.TorusGeometry(radius, thickness, 8, 120), material, parent, [0, y, 0]);
    object.rotation.x = Math.PI / 2;
    return object;
  }

  function pedestal(parent: THREE.Object3D, radius: number, height = 0.55) {
    mesh(new THREE.CylinderGeometry(radius, radius + 0.22, height, 80), darkMetal, parent, [0, height / 2 - 0.1, 0]);
    mesh(new THREE.CylinderGeometry(radius - 0.06, radius, 0.06, 80), metal, parent, [0, height - 0.09, 0]);
    ring(parent, radius, height - 0.08);
    ring(parent, radius + 0.14, 0.02, mutedEdge);
    const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.015, 1), mutedEdge, 40);
    const transform = new THREE.Object3D();
    for (let i = 0; i < 40; i++) {
      const a = i / 40 * Math.PI * 2;
      transform.position.set(Math.sin(a) * (radius - 0.22), height - 0.05, Math.cos(a) * (radius - 0.22));
      transform.rotation.y = a;
      transform.scale.set(1, 1, i % 5 === 0 ? 0.25 : 0.09);
      transform.updateMatrix();
      ticks.setMatrixAt(i, transform.matrix);
    }
    parent.add(ticks);
  }

  function room(id: ChapterId) {
    const group = new THREE.Group();
    group.position.set(...roomCenter(id));
    scene.add(group);
    rooms.set(id, group);
    const floorMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x497f81) } },
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
        void main(){vec2 p=(vUv-.5)*48.;float d=length(p);vec2 line=abs(fract(p/1.5-.5)-.5)/max(fwidth(p/1.5),vec2(.001));float grid=1.-min(min(line.x,line.y),1.);float wave=pow(max(0.,1.-abs(d-mod(uTime*.55,19.))*.9),7.);float fade=exp(-d*.105);float alpha=(grid*.16+wave*.10)*fade;gl_FragColor=vec4(uColor,alpha);}`,
    });
    animatedMaterials.push(floorMaterial);
    const floor = mesh(new THREE.PlaneGeometry(48, 48), floorMaterial, group, [0, -0.14, 0]);
    floor.rotation.x = -Math.PI / 2;
    ring(group, 10.8, -0.1, mutedEdge, 0.009);
    ring(group, 11.1, -0.1, mutedEdge, 0.004);
    const number = label(`0${chapterIndex(id) + 1}  /  THE PORTRAIT ARCHIVE`, 6, "#5b9292", 30);
    number.rotation.x = -Math.PI / 2;
    number.position.set(0, -0.08, 8.6);
    group.add(number);
    return group;
  }

  function picture(parent: THREE.Group, chapter: ChapterId, index: number, title: string, url: string, w: number, h: number, position: [number, number, number], angle = 0) {
    const group = new THREE.Group();
    group.position.set(...position);
    group.rotation.y = angle;
    parent.add(group);
    const rimMaterial = new THREE.MeshBasicMaterial({ color: 0x41686c, toneMapped: false });
    const rim = mesh(new THREE.BoxGeometry(w + 0.10, h + 0.10, 0.21), rimMaterial, group);
    mesh(new THREE.BoxGeometry(w + 0.055, h + 0.055, 0.25), darkMetal, group, [0, 0, 0.01]);
    const material = new THREE.MeshBasicMaterial({ color: 0x192c32, toneMapped: false });
    const hit = mesh(new THREE.PlaneGeometry(w, h), material, group, [0, 0, 0.146]);
    // The reverse has its own portrait surface, so exhibits stay meaningful at 360°.
    const reverse = mesh(new THREE.PlaneGeometry(w, h), material, group, [0, 0, -0.136]);
    reverse.rotation.y = Math.PI;
    loadTexture(url, texture => { material.map = texture; material.color.set(0xffffff); material.needsUpdate = true; });
    const caption = label(title, Math.max(2.5, w), "#d9e9e3", 46);
    caption.position.set(0, -h / 2 - 0.3, 0.15);
    group.add(caption);
    const item = { group, hit, rim, chapter, index, label: title, baseY: position[1] };
    hit.userData.exhibit = item;
    reverse.userData.exhibit = item;
    exhibits.push(item);
    return item;
  }

  function buildRoom(id: ChapterId) {
    if (rooms.has(id)) return;
    const group = room(id);
    if (id === "top" || id === "about") {
      const stage = new THREE.Group();
      stage.position.x = id === "top" ? 1.5 : 2.8;
      group.add(stage);
      pedestal(stage, 3.35, 0.68);
      const arch = mesh(new THREE.TorusGeometry(3.45, 0.07, 12, 160), metal, stage, [0, 3.2, -0.9]);
      arch.scale.y = 1.12;
      const glowArch = mesh(new THREE.TorusGeometry(3.55, 0.017, 8, 160), edge, stage, [0, 3.2, -0.9]);
      glowArch.scale.y = 1.12;
      const orbit = mesh(new THREE.TorusGeometry(4.35, 0.025, 8, 160, Math.PI * 1.75), edge, stage, [0, 3.2, 0]);
      orbit.rotation.set(1.1, 0.2, -0.5);
      rotating.push({ mesh: orbit, axis: "z", speed: 0.10 });
      const second = mesh(new THREE.TorusGeometry(4.7, 0.009, 6, 160, Math.PI * 1.6), mutedEdge, stage, [0, 3.2, 0]);
      second.rotation.set(0.65, -0.6, 0.8);
      rotating.push({ mesh: second, axis: "z", speed: -0.06 });
      const source = id === "top" ? "/images/ju-portrait-02.jpg" : "/images/ju-portrait-04.jpg";
      picture(stage, id, 0, "JU JINGYI · 鞠婧祎", source, 2.85, 2.85 * 1800 / (id === "top" ? 1174 : 1320), [0, 3.18, 0], -0.13);
      if (id === "top") {
        picture(stage, id, 1, "书房肖像 · 2021", "/images/ju-birthday-2021.jpg", 2.65, 1.99, [-3.25, 2.2, -1.3], 0.42);
        picture(stage, id, 2, "月鳞绮纪 · 2026", works[6].image, 2.65, 1.49, [3.25, 2.8, -0.9], -0.38);
      }
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        const gem = mesh(new THREE.OctahedronGeometry(i % 2 ? 0.08 : 0.12), edge, stage, [Math.cos(a) * 4.25, 3.2 + Math.sin(a) * 2.1, Math.sin(a) * 2]);
        rotating.push({ mesh: gem, axis: "y", speed: 0.35 });
      }
    }
    if (id === "works") {
      pedestal(group, 7.8, 0.18);
      works.forEach((work, index) => {
        const pos = exhibitPosition(index, works.length, 7);
        const h = 2.62 * work.height / work.width;
        picture(group, id, index, `${work.year}  /  ${work.title}`, work.image, 2.62, h, [pos[0], 2.5 + (index % 2) * 0.55, pos[2]], -pos[0] * 0.045);
        const stand = mesh(new THREE.BoxGeometry(0.035, 1.5, 0.035), mutedEdge, group, [pos[0], 0.95, pos[2]]);
        stand.userData.workIndex = index;
        const foot = mesh(new THREE.CylinderGeometry(0.48, 0.55, 0.16, 32), metal, group, [pos[0], 0.25, pos[2]]);
        foot.userData.workIndex = index;
      });
    }
    if (id === "journey") {
      const curve = new THREE.CatmullRomCurve3(timeline.map((_, i) => new THREE.Vector3((i - 3) * 2.65, 1 + Math.sin(i * 0.65) * 0.5, -2 + Math.cos(i * 0.6) * 2)));
      mesh(new THREE.TubeGeometry(curve, 100, 0.025, 8, false), edge, group);
      timeline.forEach((moment, index) => {
        const position = curve.getPoint(index / (timeline.length - 1));
        const node = new THREE.Group();
        node.position.copy(position);
        group.add(node);
        mesh(new THREE.CylinderGeometry(0.48, 0.56, 0.25, 32), metal, node, [0, -0.3, 0]);
        const jewel = mesh(new THREE.IcosahedronGeometry(0.25, 0), new THREE.MeshStandardMaterial({ color: 0x97e4d0, emissive: 0x5ab69e, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.2 }), node);
        rotating.push({ mesh: jewel, axis: "y", speed: 0.45 });
        const year = label(moment.year, 2.5, "#a7efd8", 90);
        year.position.y = 1.3;
        node.add(year);
        const title = label(moment.title, 2.5, "#dce9e4", 43);
        title.position.y = 0.65;
        node.add(title);
        const hit = mesh(new THREE.BoxGeometry(2.5, 2.5, 0.7), new THREE.MeshBasicMaterial({ visible: false }), node, [0, 0.65, 0]);
        const rim = mesh(new THREE.TorusGeometry(0.65, 0.02, 8, 40), edge.clone(), node, [0, -0.15, 0]);
        rim.rotation.x = Math.PI / 2;
        const item = { group: node, hit, rim, chapter: id, index, label: `${moment.year} · ${moment.title}`, baseY: position.y };
        hit.userData.exhibit = item;
        exhibits.push(item);
      });
    }
    if (id === "gallery") {
      gallery.forEach((photo, index) => {
        const pos = exhibitPosition(index, gallery.length, 7.5);
        const w = photo.width > photo.height ? 3.2 : 2.1;
        const h = w * photo.height / photo.width;
        picture(group, id, index, photo.caption, photo.src, w, h, [pos[0], 2.7 + (index % 2) * 0.8, pos[2]], -pos[0] * 0.055);
        const base = new THREE.Group();
        base.position.set(pos[0], 0, pos[2]);
        group.add(base);
        pedestal(base, 1.25, 0.2);
      });
    }
  }

  // A single GPU point cloud spans the rooms, with additive, soft circular motes.
  const points = new Float32Array(1500 * 3);
  const sizes = new Float32Array(1500);
  let seed = 163;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < sizes.length; i++) {
    points[i * 3] = random() * 235 - 20;
    points[i * 3 + 1] = random() * 20 + 0.2;
    points[i * 3 + 2] = random() * 50 - 30;
    sizes[i] = random() * 1.5 + 0.5;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(points, 3));
  particleGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uDpr: { value: 1 } },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `uniform float uTime;uniform float uDpr;attribute float aSize;varying float vAlpha;void main(){vec3 p=position;p.y+=sin(uTime*.18+p.x)*.25;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(aSize*75./-mv.z,1.,6.)*uDpr;vAlpha=.3+.3*sin(p.x+uTime*.3);}`,
    fragmentShader: `varying float vAlpha;void main(){float d=length(gl_PointCoord-.5)*2.;float a=pow(max(0.,1.-d),2.)*vAlpha;gl_FragColor=vec4(.58,.93,.84,a);}`,
  });
  scene.add(new THREE.Points(particleGeo, particleMaterial));

  function cameraPose(id: ChapterId) {
    const x = roomCenter(id)[0];
    const mobile = host.clientWidth < 720;
    const panoramic = id === "journey" || id === "works" || id === "gallery";
    const aspect = Math.max(0.4, host.clientWidth / Math.max(1, host.clientHeight));
    // Preserve the full physical exhibit width in narrow portrait viewports.
    const distance = mobile ? Math.min(44, (panoramic ? 22 : 14) / aspect) : panoramic ? 23 : 18;
    return { position: new THREE.Vector3(x + (mobile ? 0 : 1.2), mobile ? 7 : 6.4, distance), target: new THREE.Vector3(x + (mobile ? 0.5 : -2.0), mobile ? 2.0 : 2.5, 0) };
  }

  function stopFlight() {
    flight = null;
    controls.enableDamping = true;
    controls.autoRotate = autoRotate && !reduced && !selected;
  }

  function fly(position: THREE.Vector3, target: THREE.Vector3, instant = false) {
    controls.autoRotate = false;
    controls.enableDamping = false;
    controls.update();
    if (instant || reduced) {
      camera.position.copy(position);
      controls.target.copy(target);
      stopFlight();
      controls.update();
    } else {
      flight = { from: camera.position.clone(), to: position, fromTarget: controls.target.clone(), target, start: performance.now(), duration: 1450 };
    }
  }

  function navigate(id: ChapterId, instant = false) {
    active = id;
    selected = undefined;
    hover = undefined;
    buildRoom(id);
    mirror.position.x = roomCenter(id)[0];
    controls.maxDistance = host.clientWidth < 720 ? 58 : 34;
    const pose = cameraPose(id);
    fly(pose.position, pose.target, instant);
  }

  function setFilter(value: WorkFilter) {
    filter = value;
    const visible = exhibits.filter(item => item.chapter === "works" && matchesFilter(works[item.index].kind, filter));
    for (const item of exhibits.filter(item => item.chapter === "works")) {
      item.group.visible = matchesFilter(works[item.index].kind, filter);
      if (item.group.visible) {
        const p = exhibitPosition(visible.indexOf(item), visible.length, 7);
        item.group.position.x = p[0];
        item.group.position.z = p[2];
        item.group.rotation.y = -p[0] * 0.045;
      }
    }
    const group = rooms.get("works");
    group?.children.forEach(child => {
      const index = child.userData.workIndex;
      if (typeof index === "number") {
        child.visible = matchesFilter(works[index].kind, filter);
        const item = visible.find(item => item.index === index);
        if (item) { child.position.x = item.group.position.x; child.position.z = item.group.position.z; }
      }
    });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const pointers = new Set<number>();
  let down: { x: number; y: number; id: number; multi: boolean; moved: boolean } | null = null;
  function hitAt(event: PointerEvent) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
    scene.updateMatrixWorld(true);
    raycaster.setFromCamera(pointer, camera);
    const clickable = exhibits.filter(item => item.chapter === active && item.group.visible).flatMap(item => item.group.children.filter(child => child.userData.exhibit));
    return raycaster.intersectObjects(clickable, false)[0]?.object.userData.exhibit as Exhibit | undefined;
  }
  function pointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    pointers.add(event.pointerId);
    if (down) { down.multi = true; return; }
    down = { x: event.clientX, y: event.clientY, id: event.pointerId, multi: pointers.size > 1, moved: false };
  }
  function pointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId);
    const candidate = down;
    if (pointers.size === 0) down = null;
    if (!candidate || candidate.id !== event.pointerId || candidate.multi || candidate.moved || event.button !== 0 || Math.hypot(event.clientX - candidate.x, event.clientY - candidate.y) > 6) return;
    const item = hitAt(event);
    if (item) callbacks.onSelect({ chapter: item.chapter, index: item.index });
  }
  function pointerCancel(event: PointerEvent) { pointers.delete(event.pointerId); down = null; }
  function pointerMove(event: PointerEvent) {
    if (down) {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) down.moved = true;
      return;
    }
    if (event.pointerType === "touch") return;
    const item = hitAt(event);
    if (hover !== item) {
      hover = item;
      renderer.domElement.style.cursor = item ? "pointer" : "grab";
    }
  }
  function pointerLeave() { hover = undefined; }
  function onStart() { stopFlight(); }
  function onContextLost(event: Event) {
    event.preventDefault();
    contextLost = true;
    cancelAnimationFrame(frame);
    callbacks.onContextLost();
  }
  function onContextRestored() {
    contextLost = false;
    last = 0;
    callbacks.onReady();
    resize();
    startLoop();
  }
  function onVisibility() { if (document.hidden) cancelAnimationFrame(frame); else { last = 0; startLoop(); } }

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height || disposed) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 720 ? 1.5 : 1.8, Math.sqrt(3200000 / (width * height)));
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    particleMaterial.uniforms.uDpr.value = pixelRatio;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  let previousWidth = host.clientWidth;
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (Math.abs(host.clientWidth - previousWidth) > 100) {
      previousWidth = host.clientWidth;
      const pose = cameraPose(active);
      controls.maxDistance = host.clientWidth < 720 ? 58 : 34;
      fly(pose.position, pose.target, true);
    }
  });
  resizeObserver.observe(host);
  renderer.domElement.addEventListener("pointerdown", pointerDown);
  renderer.domElement.addEventListener("pointerup", pointerUp);
  renderer.domElement.addEventListener("pointercancel", pointerCancel);
  renderer.domElement.addEventListener("pointermove", pointerMove);
  renderer.domElement.addEventListener("pointerleave", pointerLeave);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
  document.addEventListener("visibilitychange", onVisibility);
  controls.addEventListener("start", onStart);

  const highlightColor = new THREE.Color(0xb0ffe1);
  const restingColor = new THREE.Color(0x41686c);
  const exhibitScale = new THREE.Vector3();
  function tick(now: number) {
    if (disposed || contextLost || paused || document.hidden) return;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0;
    last = now;
    if (!reduced) elapsed += delta;
    if (flight) {
      const t = Math.min(1, (now - flight.start) / flight.duration);
      const easing = t * t * (3 - 2 * t);
      camera.position.lerpVectors(flight.from, flight.to, easing);
      controls.target.lerpVectors(flight.fromTarget, flight.target, easing);
      if (t === 1) stopFlight();
    }
    controls.update(delta);
    if (!reduced) {
      rotating.forEach(item => { item.mesh.rotation[item.axis] += item.speed * delta; });
      exhibits.forEach(item => {
        if (item.chapter !== "journey") item.group.position.y = item.baseY + Math.sin(elapsed * 0.5 + item.index * 1.3) * 0.08;
      });
    }
    exhibits.forEach(item => {
      const isActive = item === hover || item === selected;
      const material = item.rim.material as THREE.MeshBasicMaterial;
      material.color.lerp(isActive ? highlightColor : restingColor, 0.12);
      const targetScale = isActive ? 1.035 : 1;
      item.group.scale.lerp(exhibitScale.setScalar(targetScale), 0.08);
    });
    animatedMaterials.forEach(material => { material.uniforms.uTime.value = elapsed; });
    particleMaterial.uniforms.uTime.value = elapsed;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }
  function startLoop() { cancelAnimationFrame(frame); if (!paused && !contextLost && !disposed && !document.hidden) frame = requestAnimationFrame(tick); }

  navigate("top", true);
  resize();
  renderer.render(scene, camera);
  const readyTimeout = setTimeout(markReady, 12000);
  startLoop();

  return {
    navigate: (id, instant) => { navigate(id, instant); if (id === "works") setFilter(filter); },
    focus: value => {
      const item = exhibits.find(item => item.chapter === value.chapter && item.index === value.index);
      if (!item) return;
      selected = item;
      const center = item.group.getWorldPosition(new THREE.Vector3());
      const mobile = host.clientWidth < 720;
      const target = center.clone().add(new THREE.Vector3(mobile ? 0 : 1.6, 0, 0));
      const offset = new THREE.Vector3(0, 1.3, mobile ? 13 : 8.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), item.group.rotation.y);
      fly(center.clone().add(offset), target);
    },
    setFilter,
    setAutoRotate: value => { autoRotate = value; controls.autoRotate = value && !reduced && !flight && !selected; },
    setReducedMotion: value => {
      reduced = value;
      if (value) {
        autoRotate = false;
        controls.autoRotate = false;
        if (flight) fly(flight.to, flight.target, true);
      }
    },
    setPaused: value => { paused = value; controls.enabled = !value; last = 0; if (value) cancelAnimationFrame(frame); else startLoop(); },
    zoom: factor => {
      stopFlight();
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },
    dispose: () => {
      disposed = true;
      clearTimeout(readyTimeout);
      mirror.getRenderTarget().dispose();
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointercancel", pointerCancel);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerleave", pointerLeave);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      controls.removeEventListener("start", onStart);
      controls.dispose();
      pendingImages.forEach(image => { image.onload = null; image.onerror = null; image.src = ""; });
      pendingImages.clear();
      textureWaiters.clear();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>([metal, darkMetal, edge, mutedEdge]);
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry);
          const list = Array.isArray(object.material) ? object.material : [object.material];
          list.forEach(material => materials.add(material));
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
