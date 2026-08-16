import type { StationId } from '@/content/portfolio.config';
import { assertSpriteIntegrity } from '@/game/art/sprites';
import type { Direction } from '@/game/domain/types';
import { triggers } from '@/game/domain/world';
import { Camera } from '@/game/engine/Camera';
import { InputController } from '@/game/engine/InputController';
import { Player } from '@/game/engine/Player';
import { Sfx } from '@/game/engine/Sfx';
import { renderScene } from '@/game/render/scene';

export interface GameSnapshot {
  started: boolean;
  /** Station the player is standing in front of, if any. */
  nearby: StationId | null;
  /** Station whose panel is open. Movement is frozen while this is set. */
  open: StationId | null;
  visited: readonly StationId[];
  muted: boolean;
}

/** Viewport target in world pixels. Zoom is derived from it, always integer. */
const TARGET_VIEW_W = 400;
const TARGET_VIEW_H = 256;
const MIN_ZOOM = 2;
const MAX_ZOOM = 3;
/** How many tiles sideways from the door still counts as "at the door". */
const DOOR_TOLERANCE = 1;

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera = new Camera();
  private readonly input = new InputController();
  private readonly player = new Player();
  private readonly sfx = new Sfx();

  private listeners = new Set<() => void>();
  private snapshot: GameSnapshot = {
    started: false,
    nearby: null,
    open: null,
    visited: [],
    muted: false,
  };
  private visited = new Set<StationId>();
  /**
   * Station the visitor just closed while still standing at its door. Without
   * this the panel would reopen on the very next frame and trap them there.
   * Cleared as soon as they step away from that door.
   */
  private autoOpenBlocked: StationId | null = null;

  private frameId = 0;
  private lastTime = 0;
  private resizeObserver: ResizeObserver | null = null;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2D canvas context is not available');
    this.ctx = ctx;

    if (import.meta.env.DEV) assertSpriteIntegrity();
  }

  // -- React bridge ---------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): GameSnapshot => this.snapshot;

  private patch(next: Partial<GameSnapshot>) {
    this.snapshot = { ...this.snapshot, ...next };
    this.listeners.forEach((listener) => listener());
  }

  // -- Lifecycle ------------------------------------------------------------

  mount() {
    // Dev-only handle for poking at the running game from the console
    // (`__devTown.player.position`, `__devTown.openStation('arcade')`).
    // Stripped from production builds.
    if (import.meta.env.DEV) {
      (window as unknown as { __devTown?: Game }).__devTown = this;
    }

    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas.parentElement ?? this.canvas);
    this.input.attach();
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.input.detach();
    this.sfx.dispose();
    this.listeners.clear();
  }

  start() {
    if (this.snapshot.started) return;
    this.sfx.start();
    this.patch({ started: true });
  }

  // -- Player-facing commands ----------------------------------------------

  setVirtualDirection(direction: Direction | null) {
    this.input.setVirtualDirection(direction);
  }

  pressInteract() {
    this.input.queueInteract();
  }

  pressJump() {
    this.input.queueJump();
  }

  closeStation() {
    if (!this.snapshot.open) return;
    this.autoOpenBlocked = this.snapshot.open;
    this.sfx.close();
    this.patch({ open: null });
  }

  openStation(id: StationId) {
    this.registerVisit(id);
    this.patch({ open: id });
  }

  toggleMute() {
    this.patch({ muted: this.sfx.toggleMute() });
  }

  private registerVisit(id: StationId) {
    if (this.visited.has(id)) {
      this.sfx.open();
      return;
    }
    this.visited.add(id);
    this.sfx.discover();
    this.patch({ visited: [...this.visited] });
  }

  // -- Frame ----------------------------------------------------------------

  private resize() {
    const parent = this.canvas.parentElement;
    const width = parent?.clientWidth || window.innerWidth;
    const height = parent?.clientHeight || window.innerHeight;

    const zoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, Math.floor(Math.min(width / TARGET_VIEW_W, height / TARGET_VIEW_H))),
    );
    const dpr = Math.max(1, Math.min(2, Math.round(window.devicePixelRatio || 1)));

    const viewW = Math.ceil(width / zoom);
    const viewH = Math.ceil(height / zoom);

    // Integer CSS size keeps every world pixel a perfect square on screen.
    this.canvas.style.width = `${viewW * zoom}px`;
    this.canvas.style.height = `${viewH * zoom}px`;
    this.canvas.width = viewW * zoom * dpr;
    this.canvas.height = viewH * zoom * dpr;

    this.ctx.setTransform(zoom * dpr, 0, 0, zoom * dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
    this.camera.resize(viewW, viewH);
  }

  private findNearby(): StationId | null {
    const { col, row } = this.player;
    for (const trigger of triggers) {
      if (trigger.row === row && Math.abs(trigger.col - col) <= DOOR_TOLERANCE) {
        return trigger.stationId;
      }
    }
    return null;
  }

  private tick = (now: number) => {
    this.frameId = requestAnimationFrame(this.tick);

    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    const panelOpen = this.snapshot.open !== null;

    if (this.input.cancelQueued) {
      this.input.cancelQueued = false;
      if (panelOpen) this.closeStation();
    }

    if (this.snapshot.started && !panelOpen) {
      const { vector, facing } = this.input.read();
      this.player.update(dt, vector, facing, this.input.isRunning);
    } else {
      this.player.moving = false;
    }

    const nearby = this.snapshot.started ? this.findNearby() : null;
    if (nearby !== this.snapshot.nearby) this.patch({ nearby });

    // Walking away from a door re-arms it.
    if (this.autoOpenBlocked && this.autoOpenBlocked !== nearby) this.autoOpenBlocked = null;

    // Reaching a door is the interaction: no key press required.
    if (nearby && !panelOpen && this.autoOpenBlocked !== nearby) this.openStation(nearby);

    if (this.input.jumpQueued) {
      this.input.jumpQueued = false;
      if (!this.snapshot.started) this.start();
      else if (this.snapshot.open) this.closeStation();
      else if (this.player.jump()) this.sfx.jump();
    }

    if (this.input.interactQueued) {
      this.input.interactQueued = false;
      if (!this.snapshot.started) this.start();
      else if (this.snapshot.open) this.closeStation();
      else if (nearby) this.openStation(nearby);
    }

    this.camera.follow(this.player.position);
    renderScene(this.ctx, this.camera, this.player, nearby, this.visited, now);
  };
}
