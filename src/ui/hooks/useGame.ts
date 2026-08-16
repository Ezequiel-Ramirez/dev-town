import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react';
import { Game, type GameSnapshot } from '@/game/Game';

const IDLE_SNAPSHOT: GameSnapshot = {
  started: false,
  nearby: null,
  open: null,
  visited: [],
  muted: false,
};

const noopSubscribe = () => () => {};
const idleSnapshot = () => IDLE_SNAPSHOT;

/** Creates the engine for a canvas and exposes its state to React. */
export function useGame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance = new Game(canvas);
    instance.mount();
    setGame(instance);

    return () => {
      instance.destroy();
      setGame(null);
    };
  }, [canvasRef]);

  const snapshot = useSyncExternalStore(
    game?.subscribe ?? noopSubscribe,
    game?.getSnapshot ?? idleSnapshot,
    idleSnapshot,
  );

  return { game, snapshot };
}
