import { useEffect, useRef, useState } from 'react';
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
const FLY_DURATION = 0.55;

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

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
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
  const sceneRef = useRef<{
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    pins: Pin[];
    flyTo: (dir: THREE.Vector3, distance?: number) => void;
  } | null>(null);
  const [ready, setReady] = useState(false);

  selectedIdRef.current = selectedCityId;
  visibleIdsRef.current = visibleIds;
  onSelectRef.current = onSelectCity;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    // PerspectiveCamera fixes the *vertical* FOV, so on a narrow portrait
    // viewport the horizontal extent shrinks and the globe overflows the
    // sides. Back the camera up so the globe fits the tighter of the two
    // dimensions; on landscape/square viewports this reduces to the
    // original fixed distance (~6.4) unchanged.
    const fovRad = (camera.fov * Math.PI) / 180;
    const comfortableDistance = (aspect: number) =>
      (RADIUS * 1.325) / (Math.tan(fovRad / 2) * Math.min(1, aspect));
    camera.position.set(0, 0, comfortableDistance(container.clientWidth / container.clientHeight));

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
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.6;
    controls.enablePan = false;
    const setZoomRange = (aspect: number) => {
      const base = comfortableDistance(aspect);
      controls.minDistance = base * 0.5625;
      controls.maxDistance = base * 1.40625;
    };
    setZoomRange(container.clientWidth / container.clientHeight);

    // Eased camera moves: a selected city, a narrowed filter, or a cluster
    // badge all move the camera through this instead of snapping it, so the
    // globe reads as one continuous, deliberate motion. autoRotate is
    // suspended for the duration so the two don't fight over the position.
    let flight: { from: THREE.Vector3; to: THREE.Vector3; start: number; duration: number } | null = null;
    const flyTo = (dir: THREE.Vector3, distance?: number) => {
      const dist = distance ?? camera.position.length();
      const to = dir.clone().normalize().multiplyScalar(dist);
      if (reducedMotion) {
        camera.position.copy(to);
        controls.update();
        return;
      }
      flight = { from: camera.position.clone(), to, start: clock.getElapsedTime(), duration: FLY_DURATION };
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos: { x: number; y: number } | null = null;
    let hoveredId: string | null = null;

    function pickPin(evt: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const targets = pins.filter((p) => visibleIdsRef.current.has(p.id) && p.mesh.visible).map((p) => p.mesh);
      const hits = raycaster.intersectObjects(targets);
      if (hits.length === 0) return undefined;
      return pins.find((p) => p.mesh === hits[0].object);
    }

    const onPointerDown = (evt: PointerEvent) => {
      downPos = { x: evt.clientX, y: evt.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };
    const onPointerMove = (evt: PointerEvent) => {
      if (downPos) return;
      const hit = pickPin(evt);
      hoveredId = hit?.id ?? null;
      renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
    };
    const onPointerUp = (evt: PointerEvent) => {
      if (!downPos) return;
      const moved = Math.hypot(evt.clientX - downPos.x, evt.clientY - downPos.y);
      downPos = null;
      renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'grab';
      if (moved > 4) return;

      const hit = pickPin(evt);
      const city = hit && cities.find((c) => c.id === hit.id);
      if (city) onSelectRef.current(city);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Cluster badges: a small pool of real <button> elements laid over the
    // canvas, repositioned each frame. Tightly-grouped pins (e.g. the US
    // west coast) collapse into one badge showing a count; clicking it flies
    // the camera in until the group is loose enough to split back apart.
    // Each badge has a 44px invisible hit area around a smaller visible dot,
    // matching the minimum recommended touch target size.
    const overlay = overlayRef.current;
    const badgePool: { button: HTMLButtonElement; dot: HTMLSpanElement }[] = [];
    function getBadge(i: number) {
      let entry = badgePool[i];
      if (!entry) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cluster-badge';
        button.style.display = 'none';
        button.setAttribute('aria-hidden', 'true');
        button.tabIndex = -1;
        const dot = document.createElement('span');
        dot.className = 'cluster-badge-dot';
        button.appendChild(dot);
        button.addEventListener('click', () => {
          const dir = (button as unknown as { _dir?: THREE.Vector3 })._dir;
          if (!dir) return;
          flyTo(dir, Math.max(controls.minDistance, camera.position.length() * 0.55));
        });
        overlay?.appendChild(button);
        entry = { button, dot };
        badgePool[i] = entry;
      }
      return entry;
    }

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const selectedId = selectedIdRef.current;
      const visible = visibleIdsRef.current;

      if (flight) {
        const elapsed = (t - flight.start) / flight.duration;
        if (elapsed >= 1) {
          camera.position.copy(flight.to);
          flight = null;
        } else {
          camera.position.lerpVectors(flight.from, flight.to, easeInOutCubic(elapsed));
        }
      }

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

          const { button, dot } = getBadge(badgeIndex++);
          dot.textContent = String(group.length);
          button.style.display = 'flex';
          button.style.left = `${cx}px`;
          button.style.top = `${cy}px`;
          (button as unknown as { _dir: THREE.Vector3 })._dir = avgDir;
        }
        for (let i = badgeIndex; i < badgePool.length; i++) badgePool[i].button.style.display = 'none';
      }

      for (const pin of pins) {
        const shown = visible.has(pin.id) && !clusteredHidden.has(pin.id);
        pin.mesh.visible = shown;
        pin.halo.visible = shown;
        pin.stem.visible = shown;
        if (!shown) continue;

        if (pin.id === selectedId) {
          const pulse = reducedMotion ? 1.2 : 1 + Math.sin(t * 4) * 0.25;
          pin.mesh.scale.setScalar(pulse);
          pin.halo.scale.setScalar(reducedMotion ? 1.5 : 1.3 + Math.sin(t * 4) * 0.4);
          (pin.halo.material as THREE.MeshBasicMaterial).opacity = reducedMotion ? 0.4 : 0.35 + Math.sin(t * 4) * 0.15;
        } else if (pin.id === hoveredId) {
          pin.mesh.scale.setScalar(1.18);
          pin.halo.scale.setScalar(1.15);
          (pin.halo.material as THREE.MeshBasicMaterial).opacity = 0.28;
        } else {
          const introFactor = reducedMotion ? 0 : Math.max(0, (INTRO_DURATION - t) / INTRO_DURATION);
          const wobble = introFactor > 0 ? Math.sin(t * 3.2) : 0;
          pin.mesh.scale.setScalar(1 + wobble * 0.14 * introFactor);
          pin.halo.scale.setScalar(1 + wobble * 0.12 * introFactor);
          (pin.halo.material as THREE.MeshBasicMaterial).opacity = 0.18 + wobble * 0.08 * introFactor;
        }
      }

      controls.autoRotate = !reducedMotion && !flight;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    requestAnimationFrame(() => setReady(true));

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      setZoomRange(w / h);
      camera.position.clampLength(controls.minDistance, controls.maxDistance);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    sceneRef.current = { camera, controls, pins, flyTo };

    return () => {
      sceneRef.current = null;
      cancelAnimationFrame(raf);
      ro.disconnect();
      overlay?.replaceChildren();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
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
  // priority — flying to it only when it isn't already comfortably in view,
  // so a click near the center of the visible hemisphere doesn't cause a
  // jump. With nothing selected, narrowing the country filter reorients
  // toward the centroid of the pins still shown, so a single remote pin
  // never ends up hidden on the far side of the globe.
  useEffect(() => {
    const s = sceneRef.current;
    if (!s) return;

    if (selectedCityId) {
      const pin = s.pins.find((p) => p.id === selectedCityId);
      if (pin) {
        const dir = pin.mesh.position.clone().normalize();
        const camDir = s.camera.position.clone().normalize();
        if (camDir.dot(dir) < 0.6) s.flyTo(dir);
      }
      return;
    }

    if (visibleIds.size === 0 || visibleIds.size === s.pins.length) return;
    const sum = new THREE.Vector3();
    for (const pin of s.pins) {
      if (visibleIds.has(pin.id)) sum.add(pin.mesh.position.clone().normalize());
    }
    if (sum.lengthSq() === 0) return;
    s.flyTo(sum);
  }, [selectedCityId, visibleIds]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className={`h-full w-full touch-none transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        aria-label="3D globe of cities visited for coffee"
        role="img"
      />
      <div ref={overlayRef} className="pointer-events-none absolute inset-0 z-10" />
    </div>
  );
}
