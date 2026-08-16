import { stationById, type StationId } from '@/content/portfolio.config';

interface Props {
  nearby: StationId | null;
  touch: boolean;
  complete: boolean;
}

export function HintBar({ nearby, touch, complete }: Props) {
  const station = nearby ? stationById.get(nearby) : null;

  const idleMessage = complete
    ? 'You found every building — thanks for playing!'
    : 'Walk up to any door to read that section';

  /* Doors open on arrival, so this only shows once the visitor has closed a
     panel and is still standing there. */
  const doorMessage = station
    ? touch
      ? `${station.title} — step away and back to reopen`
      : `${station.title} — press E to open it again`
    : '';

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-20 flex justify-center p-4 ${
        touch ? 'bottom-28' : 'bottom-0'
      }`}
    >
      <p
        className={`pixel-frame-sm bg-panel/95 px-4 py-2 text-center text-[9px] leading-relaxed ${
          station || complete ? 'text-accent' : 'text-white/60'
        }`}
        aria-live="polite"
      >
        {station ? doorMessage : idleMessage}
      </p>
    </div>
  );
}
