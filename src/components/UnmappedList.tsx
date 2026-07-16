import type { EspressoShop } from '../types/shop';

interface UnmappedListProps {
  shops: EspressoShop[];
}

export default function UnmappedList({ shops }: UnmappedListProps) {
  if (shops.length === 0) return null;

  return (
    <div className="border-t border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">
        {shops.length} shop{shops.length > 1 ? 's' : ''} missing coordinates (not shown on map):
      </p>
      <ul className="mt-1 list-inside list-disc">
        {shops.map((shop) => (
          <li key={shop.id}>
            {shop.name} ({shop.city})
          </li>
        ))}
      </ul>
    </div>
  );
}
