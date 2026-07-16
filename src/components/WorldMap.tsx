import type { CityStop } from '../types/city';
import { CONTINENTS, GRATICULE_LATS, GRATICULE_LONS, MAP_HEIGHT, MAP_WIDTH, project } from '../lib/worldMap';

interface WorldMapProps {
  cities: CityStop[];
  selectedCityId: string | null;
  onSelectCity: (city: CityStop) => void;
}

function polygonPoints(ring: [number, number][]): string {
  return ring.map(([lon, lat]) => project(lon, lat).map((n) => n.toFixed(1)).join(',')).join(' ');
}

export default function WorldMap({ cities, selectedCityId, onSelectCity }: WorldMapProps) {
  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="World map of cities visited for coffee"
      className="h-full w-full bg-ocean"
    >
      <g>
        {GRATICULE_LONS.map((lon) => {
          const [x] = project(lon, 0);
          return <line key={`lon-${lon}`} className="graticule-line" x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />;
        })}
        {GRATICULE_LATS.map((lat) => {
          const [, y] = project(0, lat);
          return <line key={`lat-${lat}`} className="graticule-line" x1={0} y1={y} x2={MAP_WIDTH} y2={y} />;
        })}
      </g>

      <g>
        {CONTINENTS.map((ring, i) => (
          <polygon key={i} className="landmass" points={polygonPoints(ring)} />
        ))}
      </g>

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
              onClick={() => onSelectCity(entry)}
              onKeyDown={(evt) => {
                if (evt.key === 'Enter' || evt.key === ' ') {
                  evt.preventDefault();
                  onSelectCity(entry);
                }
              }}
            >
              <circle className="marker-halo" cx={x} cy={y} r={9} />
              <circle className="marker-dot" cx={x} cy={y} r={3.4} />
              <text className="marker-label" x={x + 6} y={y - 6}>
                {entry.city}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
