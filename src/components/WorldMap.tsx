import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import type { CityStop } from '../types/city';
import { GRATICULE_LATS, GRATICULE_LONS, LAND_PATH, MAP_HEIGHT, MAP_WIDTH, project } from '../lib/worldMap';

interface WorldMapProps {
  cities: CityStop[];
  selectedCityId: string | null;
  onSelectCity: (city: CityStop) => void;
}

interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const WORLD_VIEW: ViewBox = { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT };
const MIN_WIDTH = 40; // most zoomed in
const MAX_WIDTH = MAP_WIDTH; // fully zoomed out
const BASE_MARKER_R = 3.4;
const BASE_HALO_R = 9;
const BASE_FONT = 6.5;

function clampView(v: ViewBox): ViewBox {
  const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, v.w));
  const h = w / 2;
  const maxX = MAP_WIDTH - w;
  const maxY = MAP_HEIGHT - h;
  return {
    w,
    h,
    x: Math.min(Math.max(v.x, Math.min(0, maxX)), Math.max(0, maxX)),
    y: Math.min(Math.max(v.y, Math.min(0, maxY)), Math.max(0, maxY)),
  };
}

function boundsFor(cities: CityStop[]): ViewBox {
  if (cities.length === 0) return WORLD_VIEW;

  const points = cities.map((c) => project(c.longitude, c.latitude));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 60;
  let w = Math.max(maxX - minX + padding * 2, MIN_WIDTH * 2);
  let h = w / 2;
  if (maxY - minY + padding * 2 > h) {
    h = maxY - minY + padding * 2;
    w = h * 2;
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  return clampView({ x: cx - w / 2, y: cy - h / 2, w, h });
}

export default function WorldMap({ cities, selectedCityId, onSelectCity }: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<ViewBox>(WORLD_VIEW);
  const cityIdsKey = cities.map((c) => c.id).join(',');
  const drag = useRef<{ x: number; y: number; active: boolean; moved: boolean } | null>(null);

  useEffect(() => {
    setView(cities.length === 0 ? WORLD_VIEW : boundsFor(cities));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityIdsKey]);

  const scale = MAP_WIDTH / view.w;

  function toUserPoint(clientX: number, clientY: number): [number, number] | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const inverse = ctm.inverse();
    const transformed = pt.matrixTransform(inverse);
    return [transformed.x, transformed.y];
  }

  function zoomAt(clientX: number | null, clientY: number | null, factor: number) {
    const p = clientX !== null && clientY !== null ? toUserPoint(clientX, clientY) : null;
    setView((prev) => {
      const anchor = p ?? [prev.x + prev.w / 2, prev.y + prev.h / 2];
      const newW = prev.w * factor;
      const next = clampView({
        w: newW,
        h: newW / 2,
        x: anchor[0] - (anchor[0] - prev.x) * (newW / prev.w),
        y: anchor[1] - (anchor[1] - prev.y) * (newW / prev.w),
      });
      return next;
    });
  }

  function handleWheel(evt: ReactWheelEvent<SVGSVGElement>) {
    evt.preventDefault();
    const factor = evt.deltaY > 0 ? 1.2 : 1 / 1.2;
    zoomAt(evt.clientX, evt.clientY, factor);
  }

  function handlePointerDown(evt: ReactPointerEvent<SVGSVGElement>) {
    const target = evt.target as Element;
    const onMarker = Boolean(target.closest('.city-marker'));
    drag.current = { x: evt.clientX, y: evt.clientY, active: !onMarker, moved: false };
    if (!onMarker) svgRef.current?.setPointerCapture(evt.pointerId);
  }

  function handlePointerMove(evt: ReactPointerEvent<SVGSVGElement>) {
    if (!drag.current?.active) return;
    const dx = evt.clientX - drag.current.x;
    const dy = evt.clientY - drag.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) drag.current.moved = true;
    if (!drag.current.moved) return;

    const userDx = dx / (svgRef.current!.clientWidth / view.w);
    const userDy = dy / (svgRef.current!.clientHeight / view.h);
    drag.current.x = evt.clientX;
    drag.current.y = evt.clientY;
    setView((prev) => clampView({ ...prev, x: prev.x - userDx, y: prev.y - userDy }));
  }

  function handlePointerUp(evt: ReactPointerEvent<SVGSVGElement>) {
    // Keep `moved` around so marker onClick (which fires after pointerup) can
    // still see it; it gets cleared on the next pointerdown instead.
    if (drag.current) drag.current.active = false;
    svgRef.current?.releasePointerCapture(evt.pointerId);
  }

  function handleDoubleClick(evt: ReactMouseEvent<SVGSVGElement>) {
    zoomAt(evt.clientX, evt.clientY, 1 / 1.8);
  }

  const markerR = BASE_MARKER_R / scale;
  const haloR = BASE_HALO_R / scale;
  const fontSize = BASE_FONT / scale;
  const strokeW = 1.6 / scale;

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="World map of cities visited for coffee"
        className="h-full w-full touch-none bg-ocean"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <defs>
          <radialGradient id="oceanGradient" cx="50%" cy="35%" r="80%">
            <stop offset="0%" stopColor="var(--color-ocean-light)" />
            <stop offset="100%" stopColor="var(--color-ocean)" />
          </radialGradient>
        </defs>

        <rect x={0} y={0} width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#oceanGradient)" />

        <g>
          {GRATICULE_LONS.map((lon) => {
            const [x] = project(lon, 0);
            return (
              <line
                key={`lon-${lon}`}
                className="graticule-line"
                x1={x}
                y1={0}
                x2={x}
                y2={MAP_HEIGHT}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          {GRATICULE_LATS.map((lat) => {
            const [, y] = project(0, lat);
            return (
              <line
                key={`lat-${lat}`}
                className="graticule-line"
                x1={0}
                y1={y}
                x2={MAP_WIDTH}
                y2={y}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </g>

        <path className="landmass" d={LAND_PATH} vectorEffect="non-scaling-stroke" />

        <g>
          {cities.map((entry) => {
            const [x, y] = project(entry.longitude, entry.latitude);
            const isActive = entry.id === selectedCityId;
            return (
              <g
                key={entry.id}
                className={`city-marker${isActive ? ' active' : ''}`}
                tabIndex={0}
                role="button"
                aria-label={`${entry.city}, ${entry.country}: ${entry.cafes.length} cafes`}
                onClick={() => {
                  if (!drag.current?.moved) onSelectCity(entry);
                }}
                onKeyDown={(evt) => {
                  if (evt.key === 'Enter' || evt.key === ' ') {
                    evt.preventDefault();
                    onSelectCity(entry);
                  }
                }}
              >
                <circle className="marker-halo" cx={x} cy={y} r={haloR} />
                <circle className="marker-dot" cx={x} cy={y} r={markerR} strokeWidth={strokeW} />
                <text
                  className="marker-label"
                  x={x + markerR * 1.8}
                  y={y - markerR * 1.8}
                  fontSize={fontSize}
                >
                  {entry.city}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute top-4 left-4 flex flex-col overflow-hidden rounded-sm border border-line bg-paper-card shadow-md">
        <button
          type="button"
          aria-label="Zoom in"
          className="map-zoom-btn"
          onClick={() => zoomAt(null, null, 1 / 1.5)}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className="map-zoom-btn border-t border-line"
          onClick={() => zoomAt(null, null, 1.5)}
        >
          −
        </button>
      </div>

      {view.w < MAP_WIDTH - 1 && (
        <button
          type="button"
          className="absolute top-4 left-16 rounded-sm border border-line bg-paper-card px-2.5 py-1 font-mono text-xs tracking-wide text-ink-soft shadow-md hover:text-ink"
          onClick={() => setView(cities.length ? boundsFor(cities) : WORLD_VIEW)}
        >
          Reset view
        </button>
      )}
    </div>
  );
}
