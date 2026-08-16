import type { Direction, Vec2 } from '@/game/domain/types';

const MOVE_KEYS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
};

/** Stations open on arrival, so Space is free to be a purely cosmetic hop. */
const JUMP_KEYS = new Set(['Space']);
/** Manual re-open for a station you already read and are still standing on. */
const INTERACT_KEYS = new Set(['Enter', 'KeyE']);
const CANCEL_KEYS = new Set(['Escape']);

const AXIS: Record<Direction, Vec2> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Keyboard + virtual D-pad. The virtual layer is what the on-screen touch
 * controls write into, so the engine never knows which one is driving.
 */
export class InputController {
  private held = new Set<Direction>();
  private virtual: Direction | null = null;
  private running = false;

  /** All consumed once per frame by the game loop. */
  interactQueued = false;
  jumpQueued = false;
  cancelQueued = false;

  attach(target: HTMLElement | Window = window) {
    target.addEventListener('keydown', this.onKeyDown as EventListener);
    target.addEventListener('keyup', this.onKeyUp as EventListener);
    window.addEventListener('blur', this.releaseAll);
  }

  detach(target: HTMLElement | Window = window) {
    target.removeEventListener('keydown', this.onKeyDown as EventListener);
    target.removeEventListener('keyup', this.onKeyUp as EventListener);
    window.removeEventListener('blur', this.releaseAll);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    // While the visitor is on a link or button (dialog panel, HUD), the browser
    // owns the keyboard: swallowing Enter/Space there would break activation.
    const target = event.target as HTMLElement | null;
    if (target?.closest?.('a, button, input, textarea, select, [contenteditable]')) {
      if (CANCEL_KEYS.has(event.code)) this.cancelQueued = true;
      return;
    }

    const direction = MOVE_KEYS[event.code];
    if (direction) {
      event.preventDefault();
      this.held.add(direction);
    }
    if (JUMP_KEYS.has(event.code)) {
      event.preventDefault();
      this.jumpQueued = true;
    }
    if (INTERACT_KEYS.has(event.code)) {
      event.preventDefault();
      this.interactQueued = true;
    }
    if (CANCEL_KEYS.has(event.code)) this.cancelQueued = true;
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') this.running = true;
  };

  private onKeyUp = (event: KeyboardEvent) => {
    const direction = MOVE_KEYS[event.code];
    if (direction) this.held.delete(direction);
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') this.running = false;
  };

  private releaseAll = () => {
    this.held.clear();
    this.virtual = null;
    this.running = false;
  };

  setVirtualDirection(direction: Direction | null) {
    this.virtual = direction;
  }

  queueInteract() {
    this.interactQueued = true;
  }

  queueJump() {
    this.jumpQueued = true;
  }

  get isRunning() {
    return this.running;
  }

  /** Normalised movement vector plus the direction the sprite should face. */
  read(): { vector: Vec2; facing: Direction | null } {
    const active: Direction[] = this.virtual ? [this.virtual] : [...this.held];
    if (active.length === 0) return { vector: { x: 0, y: 0 }, facing: null };

    let x = 0;
    let y = 0;
    for (const direction of active) {
      x += AXIS[direction].x;
      y += AXIS[direction].y;
    }

    const length = Math.hypot(x, y);
    if (length === 0) return { vector: { x: 0, y: 0 }, facing: null };

    // Vertical wins ties so diagonal walking still picks a readable sprite.
    const facing: Direction =
      Math.abs(y) >= Math.abs(x) ? (y < 0 ? 'up' : 'down') : x < 0 ? 'left' : 'right';

    return { vector: { x: x / length, y: y / length }, facing };
  }
}
