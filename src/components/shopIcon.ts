import L from 'leaflet';
import type { Vibe } from '../types/shop';

const VIBE_COLORS: Record<Vibe, string> = {
  Favorite: '#3b2417',
  Great: '#7b4b2a',
  Good: '#a9713f',
  Decent: '#c9986a',
};

export function createShopIcon(vibe: Vibe): L.DivIcon {
  const color = VIBE_COLORS[vibe];

  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg); font-size: 15px; line-height: 1; pointer-events: none;">☕</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}
