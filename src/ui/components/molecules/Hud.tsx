import type { MouseEvent } from 'react';
import { profile, stations } from '@/content/portfolio.config';

interface Props {
  visitedCount: number;
  muted: boolean;
  onToggleMute: () => void;
  onReadAsText: () => void;
}

export function Hud({ visitedCount, muted, onToggleMute, onReadAsText }: Props) {
  const complete = visitedCount === stations.length;

  /** Hand the keyboard back to the game, otherwise arrows would stay on the
   *  button that was just clicked and the character would stop responding. */
  const release = (action: () => void) => (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.blur();
    action();
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-2 sm:gap-3 sm:p-4">
      <div className="pixel-frame-sm bg-panel/95 px-2 py-1 sm:px-3 sm:py-2">
        <p className="text-[8px] leading-relaxed sm:text-[9px]">{profile.name}</p>
        <p className="hidden text-[8px] leading-relaxed text-accent sm:block">{profile.role}</p>
      </div>

      <div className="flex items-center gap-2">
        <div
          className="pixel-frame-sm bg-panel/95 px-2 py-1 text-[8px] leading-relaxed sm:px-3 sm:py-2 sm:text-[9px]"
          aria-live="polite"
        >
          <span className={complete ? 'text-accent' : ''}>
            <span className="hidden sm:inline">{complete ? 'ALL FOUND! ' : 'FOUND '}</span>
            {visitedCount}/{stations.length}
          </span>
        </div>

        <button
          type="button"
          onClick={release(onToggleMute)}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          className="pointer-events-auto pixel-frame-sm bg-panel/95 px-2 py-1 text-[8px] hover:bg-panelLight sm:px-3 sm:py-2 sm:text-[9px]"
        >
          {muted ? 'OFF' : 'SND'}
        </button>

        <button
          type="button"
          onClick={release(onReadAsText)}
          className="pointer-events-auto pixel-frame-sm bg-panel/95 px-2 py-1 text-[8px] hover:bg-panelLight sm:px-3 sm:py-2 sm:text-[9px]"
        >
          TXT
        </button>
      </div>
    </div>
  );
}
