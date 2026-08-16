import type { PointerEvent } from 'react';
import type { Direction } from '@/game/domain/types';

interface Props {
  onDirection: (direction: Direction | null) => void;
  onJump: () => void;
}

/** font-sans on purpose: the pixel font ships no arrow glyphs. */
const PAD_CLASS =
  'flex h-12 w-12 select-none items-center justify-center border-2 border-ink bg-panel/95 font-sans text-lg text-white active:bg-accent active:text-ink';

function PadButton({
  direction,
  label,
  onDirection,
  className = '',
}: {
  direction: Direction;
  label: string;
  onDirection: (direction: Direction | null) => void;
  className?: string;
}) {
  const press = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    onDirection(direction);
  };
  const release = () => onDirection(null);

  return (
    <button
      type="button"
      aria-label={`Move ${direction}`}
      className={`${PAD_CLASS} ${className}`}
      style={{ touchAction: 'none' }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
    >
      {label}
    </button>
  );
}

/** On-screen gamepad. Only rendered on touch devices. */
export function TouchControls({ onDirection, onJump }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-4 pb-6">
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1">
        <span />
        <PadButton direction="up" label="▲" onDirection={onDirection} />
        <span />
        <PadButton direction="left" label="◀" onDirection={onDirection} />
        <span />
        <PadButton direction="right" label="▶" onDirection={onDirection} />
        <span />
        <PadButton direction="down" label="▼" onDirection={onDirection} />
        <span />
      </div>

      <button
        type="button"
        onPointerDown={(event) => {
          event.preventDefault();
          onJump();
        }}
        aria-label="Jump"
        style={{ touchAction: 'none' }}
        className="pointer-events-auto flex h-16 w-16 select-none items-center justify-center rounded-full border-4 border-ink bg-accent text-sm text-ink active:translate-y-1"
      >
        A
      </button>
    </div>
  );
}
