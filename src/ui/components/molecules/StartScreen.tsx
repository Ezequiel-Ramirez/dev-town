import { profile, stations } from '@/content/portfolio.config';
import { PixelButton } from '../atoms/PixelButton';

interface Props {
  onStart: () => void;
  onReadAsText: () => void;
  touch: boolean;
}

export function StartScreen({ onStart, onReadAsText, touch }: Props) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-8 bg-night/95 px-6 text-center">
      <div className="space-y-4">
        <p className="text-[10px] tracking-widest text-accent">{profile.role.toUpperCase()}</p>
        <h1 className="text-2xl leading-relaxed sm:text-4xl">
          <span className="text-accent">DEV</span> TOWN
        </h1>
        <p className="mx-auto max-w-md text-[10px] leading-loose text-white/70">
          {profile.name} — {profile.tagline}
        </p>
      </div>

      <div className="space-y-3">
        <PixelButton onClick={onStart} className="animate-pulse px-8 py-4 text-xs">
          PRESS START
        </PixelButton>
        <p className="text-[9px] leading-loose text-white/50">
          {stations.length} places to visit
        </p>
      </div>

      <div className="space-y-2 text-[9px] leading-loose text-white/60">
        {touch ? (
          <>
            <p>D-PAD — move</p>
            <p>A — jump</p>
            <p className="text-accent">walk to a door to read a section</p>
          </>
        ) : (
          <>
            <p>ARROWS / WASD — move</p>
            <p>SHIFT — run</p>
            <p>SPACE — jump</p>
            <p className="text-accent">walk to a door to read a section</p>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={onReadAsText}
        className="text-[9px] text-white/50 underline underline-offset-4 hover:text-accent"
      >
        Skip the game and read everything as text
      </button>
    </div>
  );
}
