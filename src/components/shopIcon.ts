import L from 'leaflet';

function colorForRating(rating: number): string {
  if (rating >= 4.5) return '#3b2417';
  if (rating >= 3.5) return '#7b4b2a';
  if (rating >= 2.5) return '#a9713f';
  return '#c9986a';
}

export function createShopIcon(rating: number): L.DivIcon {
  const color = colorForRating(rating);

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
