import { useCallback, useEffect, useRef, useState } from 'react';
import { profile, stationById, stations } from '@/content/portfolio.config';
import type { Direction } from '@/game/domain/types';
import { useGame } from '@/ui/hooks/useGame';
import { useTouchDevice } from '@/ui/hooks/useMediaQuery';
import { HintBar } from '@/ui/components/molecules/HintBar';
import { Hud } from '@/ui/components/molecules/Hud';
import { StartScreen } from '@/ui/components/molecules/StartScreen';
import { StationDialog } from '@/ui/components/molecules/StationDialog';
import { TextMode } from '@/ui/components/molecules/TextMode';
import { TouchControls } from '@/ui/components/molecules/TouchControls';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { game, snapshot } = useGame(canvasRef);
  const [textMode, setTextMode] = useState(false);
  const touch = useTouchDevice();

  const station = snapshot.open ? stationById.get(snapshot.open) ?? null : null;

  useEffect(() => {
    document.body.classList.toggle('is-playing', !textMode);
    return () => document.body.classList.remove('is-playing');
  }, [textMode]);

  const handleDirection = useCallback(
    (direction: Direction | null) => game?.setVirtualDirection(direction),
    [game],
  );

  const handleJump = useCallback(() => {
    if (!snapshot.started) game?.start();
    else game?.pressJump();
  }, [game, snapshot.started]);

  return (
    <main className="relative h-full w-full overflow-hidden bg-night">
      <div className="scanlines absolute inset-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Pixel-art town where you can explore the portfolio of ${profile.name}. A text version of the same content is available below.`}
        />
      </div>

      {!snapshot.started ? (
        <StartScreen
          touch={touch}
          onStart={() => game?.start()}
          onReadAsText={() => setTextMode(true)}
        />
      ) : (
        <>
          <Hud
            visitedCount={snapshot.visited.length}
            muted={snapshot.muted}
            onToggleMute={() => game?.toggleMute()}
            onReadAsText={() => setTextMode(true)}
          />

          {station ? (
            <StationDialog station={station} onClose={() => game?.closeStation()} />
          ) : (
            <>
              <HintBar
                nearby={snapshot.nearby}
                touch={touch}
                complete={snapshot.visited.length === stations.length}
              />
              {touch ? (
                <TouchControls onDirection={handleDirection} onJump={handleJump} />
              ) : null}
            </>
          )}
        </>
      )}

      <TextMode active={textMode} onClose={() => setTextMode(false)} />
    </main>
  );
}
