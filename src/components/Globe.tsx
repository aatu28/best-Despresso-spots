import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { CityStop } from '../types/city';
import { COASTLINE_POINTS } from '../lib/coastlines';

interface GlobeProps {
  /** Full, stable city list — pins are built once from this. */
  cities: CityStop[];
  /** ids currently shown (country filter); toggles pin visibility without rebuilding the scene. */
  visibleIds: Set<string>;
  selectedCityId: string | null;
  onSelectCity: (city: CityStop) => void;
}

const RADIUS = 2;
const MARKER_COLOR = 0xb4623d;
const HALO_COLOR = 0xc9a878;
const INK_COLOR = 0x201c1a;
const INTRO_DURATION = 2.6;
const CLUSTER_RADIUS_PX = 32;

interface Pin {
  id: string;
  mesh: THREE.Mesh;
  halo: THREE.Mesh;
  stem: THREE.Mesh;
}

function toVector(lat: number, lon: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function teardropGeometry(): THREE.LatheGeometry {
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const r = 0.06 * Math.sin(t * Math.PI);
    points.push(new THREE.Vector2(r, 0.12 * (1 - t)));
  }
  return new THREE.LatheGeometry(points, 16);
}

function coastlineGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  let prev: THREE.Vector3 | null = null;
  for (let i = 0; i < COASTLINE_POINTS.length; i += 2) {
    const lat = COASTLINE_POINTS[i];
    const lon = COASTLINE_POINTS[i + 1];
    if (lat === null || lon === null) {
      prev = null;
      continue;
    }
    const v = toVector(lat, lon, RADIUS * 1.008);
    if (prev) positions.push(prev.x, prev.y, prev.z, v.x, v.y, v.z);
    prev = v;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geo;
}

export default function Globe({ cities, visibleIds, selectedCityId, onSelectCity }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const selectedIdRef = useRef(selectedCityId);
  const visibleIdsRef = useRef(visibleIds);
  const onSelectRef = useRef(onSelectCity);
  const sceneRef = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls; pins: Pin[] } | null>(null);

  selectedIdRef.current = selectedCityId;
  visibleIdsRef.current = visibleIds;
  onSelectRef.current = onSelectCity;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xf8ead8, 0.7));
    const key = new THREE.DirectionalLight(0xfde8d0, 1.3);
    key.position.set(5, 4, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8d5bf, 0.4);
    fill.position.set(-5, -3, -4);
    scene.add(fill);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS, 64, 64),
        new THREE.MeshStandardMaterial({ color: 0xfbf8f2, roughness: 0.65, metalness: 0.12 }),
      ),
    );

    globeGroup.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(RADIUS * 1.006, 24, 16),
        new THREE.MeshBasicMaterial({ color: INK_COLOR, wireframe: true, transparent: true, opacity: 0.06 }),
      ),
    );

    globeGroup.add(
      new THREE.LineSegments(
        coastlineGeometry(),
        new THREE.LineBasicMaterial({ color: INK_COLOR, transparent: true, opacity: 0.7 }),
      ),
    );

    const haloGeo = new THREE.SphereGeometry(0.12, 16, 8);
    const haloMat = new THREE.MeshBasicMaterial({ color: HALO_COLOR, transparent: true, opacity: 0.22 });
    const pinGeo = teardropGeometry();
    const pinMat = new THREE.MeshStandardMaterial({
      color: MARKER_COLOR,
      emissive: MARKER_COLOR,
      emissiveIntensity: 0.7,
      roughness: 0.35,
    });
    const stemGeo = new THREE.CylinderGeometry(0.006, 0.006, RADIUS * 0.03, 6);
    const stemMat = new THREE.MeshBasicMaterial({ color: INK_COLOR, transparent: true, opacity: 0.4 });

    const pins: Pin[] = [];

    for (const city of cities) {
      const pos = toVector(city.latitude, city.longitude, RADIUS * 1.03);
      const dir = pos.clone().normalize();

      const mesh = new THREE.Mesh(pinGeo, pinMat.clone());
      mesh.position.copy(pos);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      mesh.userData.cityId = city.id;
      globeGroup.add(mesh);

      const halo = new THREE.Mesh(haloGeo, haloMat.clone());
      halo.position.copy(pos);
      globeGroup.add(halo);

      const stem = new THREE.Mesh(stemGeo, stemMat);
      const stemPos = toVector(city.latitude, city.longitude, RADIUS * 1.015);
      stem.position.copy(stemPos);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      globeGroup.add(stem);

      pins.push({ id: city.id, mesh, halo, stem });
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan = false;
    controls.minDistance = 3.6;
    controls.maxDistance = 9;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos: { x: number; y: number } | null = null;

    const onPointerDown = (evt: PointerEvent) => {
      downPos = { x: evt.clientX, y: evt.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerUp = (evt: PointerEvent) => {
      renderer.domElement.style.cursor = 'grab';
      if (!downPos) return;
      const moved = Math.hypot(evt.clientX - downPos.x, evt.clientY - downPos.y);
      downPos = null;
      if (moved > 4) return;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const targets = pins.filter((p) => visibleIdsRef.current.has(p.id) && p.mesh.visible).map((p) => p.mesh);
      const hits = raycaster.intersectObjects(targets);
      if (hits.length > 0) {
        const hit = pins.find((p) => p.mesh === hits[0].object);
        const city = hit && cities.find((c) => c.id === hit.id);
        if (city) onSelectRef.current(city);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Cluster badges: a small pool of real <button> elements laid over the
    // canvas, repositioned each frame. Tightly-grouped pins (e.g. the US
    // west coast) collapse into one badge showing a count; clicking it zooms
    // the camera in until the group is loose enough to split back apart.
    const overlay = overlayRef.current;
    const badgePool: HTMLButtonElement[] = [];
    function getBadge(i: number): HTMLButtonElement {
      let el = badgePool[i];
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'cluster-badge';
        el.style.display = 'none';
        el.setAttribute('aria-hidden', 'true');
        el.tabIndex = -1;
        el.addEventListener('click', () => {
          const dir = (el as unknown as { _dir?: THREE.Vector3 })._dir;
          if (!dir) return;
          const dist = Math.max(controls.minDistance, camera.position.length() * 0.55);
          camera.position.copy(dir.clone().multiplyScalar(dist));
          controls.update();
        });
        overlay?.appendChild(el);
        badgePool[i] = el;
      }
      return el;
    }

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const selectedId = selectedIdRef.current;
      const visible = visibleIdsRef.current;

      const clusteredHidden = new Set<string>();
      if (overlay) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const camDist = camera.position.length();
        const camDir = camera.position.clone().normalize();
        const horizon = RADIUS / camDist + 0.03;

        const candidates: { id: string; x: number; y: number; dir: THREE.Vector3 }[] = [];
        for (const pin of pins) {
          if (!visible.has(pin.id)) continue;
          const dir = pin.mesh.position.clone().normalize();
          if (dir.dot(camDir) < horizon) continue;
          const proj = pin.mesh.position.clone().project(camera);
          if (proj.z > 1) continue;
          candidates.push({ id: pin.id, x: (proj.x * 0.5 + 0.5) * w, y: (1 - (proj.y * 0.5 + 0.5)) * h, dir });
        }

        const used = new Set<string>();
        const groups: (typeof candidates)[] = [];
        for (const c of candidates) {
          if (used.has(c.id)) continue;
          const group = [c];
          used.add(c.id);
          for (const other of candidates) {
            if (used.has(other.id)) continue;
            if (Math.hypot(other.x - c.x, other.y - c.y) < CLUSTER_RADIUS_PX) {
              group.push(other);
              used.add(other.id);
            }
          }
          groups.push(group);
        }

        let badgeIndex = 0;
        for (const group of groups) {
          if (group.length < 2) continue;
          for (const m of group) clusteredHidden.add(m.id);
          const cx = group.reduce((s, m) => s + m.x, 0) / group.length;
          const cy = group.reduce((s, m) => s + m.y, 0) / group.length;
          const avgDir = new THREE.Vector3();
          for (const m of group) avgDir.add(m.dir);
          avgDir.normalize();

          const badge = getBadge(badgeIndex++);
          badge.textContent = String(group.length);
          badge.style.display = 'flex';
          badge.style.left = `${cx}px`;
          badge.style.top = `${cy}px`;
          (badge as unknown as { _dir: THREE.Vector3 })._dir = avgDir;
        }
        for (let i = badgeIndex; i < badgePool.length; i++) badgePool[i].style.display = 'none';
      }

      for (const pin of pins) {
        const shown = visible.has(pin.id) && !clusteredHidden.has(pin.id);
        pin.mesh.visible = shown;
        pin.halo.visible = shown;
        pin.stem.visible = shown;
        if (!shown) continue;

        if (pin.id === selectedId) {
          const pulse = 1 + Math.sin(t * 4) * 0.25;
          pin.mesh.scale.setScalar(pulse);
          pin.halo.scale.setScalar(1.3 + Math.sin(t * 4) * 0.4);
          (pin.halo.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(t * 4) * 0.15;
        } else {
          const introFactor = Math.max(0, (INTRO_DURATION - t) / INTRO_DURATION);
          const wobble = introFactor > 0 ? Math.sin(t * 3.2) : 0;
          pin.mesh.scale.setScalar(1 + wobble * 0.14 * introFactor);
          pin.halo.scale.setScalar(1 + wobble * 0.12 * introFactor);
          (pin.halo.material as THREE.MeshBasicMaterial).opacity = 0.18 + wobble * 0.08 * introFactor;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    sceneRef.current = { camera, controls, pins };

    return () => {
      sceneRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      overlay?.replaceChildren();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          const mat = obj.material;
          if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
          else mat.dispose();
        }
      });
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
    // Scene is built once from the stable `cities` list; visibleIds/selectedCityId/onSelectCity
    // are read from refs each frame so the effect doesn't need to depend on them.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities]);

  // Keep the camera pointed at whatever the app wants shown: a selected city
  // (from a pin click, search result, or a `?city=` deep link) takes
  // priority — reposition only when it isn't already comfortably in view, so
  // a click near the center of the visible hemisphere doesn't cause a jump.
  // With nothing selected, narrowing the country filter reorients toward the
  // centroid of the pins still shown, so a single remote pin never ends up
  // hidden on the far side of the globe.
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    if (selectedCityId) {
      const pin = s.pins.find((p) => p.id === selectedCityId);
      if (pin) {
        const dir = pin.mesh.position.clone().normalize();
        const camDir = s.camera.position.clone().normalize();
        if (camDir.dot(dir) < 0.6) {
          const dist = s.camera.position.length();
          s.camera.position.copy(dir.multiplyScalar(dist));
          s.controls.update();
        }
      }
      return;
    }

    if (visibleIds.size === 0 || visibleIds.size === s.pins.length) return;
    const sum = new THREE.Vector3();
    for (const pin of s.pins) {
      if (visibleIds.has(pin.id)) sum.add(pin.mesh.position.clone().normalize());
    }
    if (sum.lengthSq() === 0) return;

    const dist = s.camera.position.length();
    s.camera.position.copy(sum.normalize().multiplyScalar(dist));
    s.controls.update();
  }, [selectedCityId, visibleIds]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full touch-none" aria-label="3D globe of cities visited for coffee" role="img" />
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-10" />
    </div>
  );
}
