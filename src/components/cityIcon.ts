import L from 'leaflet';

export const cityIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #5c3a21;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.4);
    ">
      <span style="transform: rotate(45deg); font-size: 14px; line-height: 1; pointer-events: none;">☕</span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -30],
});
