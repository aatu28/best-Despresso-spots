import { useEffect, useState } from 'react';
import type { CityStop } from '../types/city';

interface DetailPanelProps {
  city: CityStop | null;
  onClose: () => void;
}

function formatCoord(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`;
}

export default function DetailPanel({ city, onClose }: DetailPanelProps) {
  const open = city !== null;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function copyLink() {
    if (!city) return;
    const url = new URL(window.location.href);
    url.searchParams.set('city', city.id);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
    } catch {
      // clipboard access can be denied (permissions, insecure context); fail quietly
    }
  }

  return (
    <aside
      aria-live="polite"
      className={`detail-panel absolute inset-x-0 bottom-0 z-30 flex max-h-[70vh] flex-col gap-5 overflow-y-auto border-t border-panel-border bg-panel p-6 shadow-2xl sm:inset-x-auto sm:top-0 sm:right-0 sm:h-full sm:max-h-none sm:w-[min(400px,90vw)] sm:border-t-0 sm:border-l sm:p-10 sm:py-12 ${
        open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'
      }`}
    >
      <div className="flex flex-none items-center gap-2">
        {city && (
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] text-ink-faint hover:bg-tag-bg hover:text-ink"
          >
            <svg aria-hidden width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M5.8 8.2L8.2 5.8M6.4 3.6L7.1 2.9a2.2 2.2 0 0 1 3.1 3.1l-1.3 1.3M7.6 10.4l-.7.7a2.2 2.2 0 0 1-3.1-3.1l1.3-1.3"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="panel-close-btn ml-auto flex h-9 w-9 flex-none items-center justify-center rounded-sm text-lg text-ink"
        >
          &times;
        </button>
      </div>

      {city && (
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col gap-2.5">
            <div className="text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
              {city.country}
            </div>
            <h2 className="font-serif text-[40px] leading-[1] font-medium text-balance">{city.city}</h2>
            <div className="text-[14px] text-ink-soft">
              {city.cafes.length} cafe{city.cafes.length === 1 ? '' : 's'} visited &mdash; tap one for details
            </div>
          </div>

          <div className="h-px bg-line" />

          <ul className="flex flex-col gap-2.5">
            {city.cafes.map((cafe) => {
              const isOpen = expanded.has(cafe.name);
              const hasDescription = cafe.description && cafe.description !== 'UNVERIFIED';
              return (
                <li key={cafe.name}>
                  <button
                    onClick={() => toggle(cafe.name)}
                    aria-expanded={isOpen}
                    className="w-full rounded-xl border border-panel-border px-[18px] py-4 text-left transition-colors hover:bg-tag-bg"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[15px] leading-[1.35] font-medium text-ink">{cafe.name}</span>
                      <span
                        aria-hidden
                        className="flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[13px] text-accent"
                        style={{ borderColor: 'color-mix(in srgb, var(--color-accent) 50%, transparent)' }}
                      >
                        {isOpen ? '−' : '+'}
                      </span>
                    </span>
                    {isOpen && (
                      <p className="mt-3 text-[13.5px] leading-[1.6] text-ink-faint">
                        {hasDescription ? cafe.description : 'No verified details yet.'}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex-1" />

          <div className="flex items-center justify-between">
            <div
              className="stamp-badge inline-flex w-fit items-center rounded-full px-4 py-[7px] text-[10px] font-semibold tracking-[0.14em] text-accent uppercase"
            >
              Coverage: Active
            </div>

            <div className="text-[12px] tracking-[0.02em] text-ink-faint tabular-nums">
              {formatCoord(city.latitude, city.longitude)}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
