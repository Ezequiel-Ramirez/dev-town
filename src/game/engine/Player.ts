import { TILE } from '@/game/domain/tiles';
import type { Direction, Vec2 } from '@/game/domain/types';
import { SPAWN, isSolidAt } from '@/game/domain/world';

const WALK_SPEED = 82; // world pixels per second
const RUN_SPEED = 148;
/** Distance walked before the sprite swaps to the next animation frame. */
const STEP_LENGTH = 9;
/** Collision box, anchored at the feet — the classic top-down trick that lets
 *  the character's head overlap scenery without blocking movement. */
const BODY_W = 10;
const BODY_H = 8;
/** Never advance more than this per collision sub-step, to avoid tunnelling. */
const MAX_STEP = 4;
/** The hop is cosmetic: it changes nothing about collision or reach. */
const JUMP_DURATION = 0.42; // seconds
const JUMP_HEIGHT = 11; // world pixels at the top of the arc

export class Player {
  position: Vec2 = { ...SPAWN };
  facing: Direction = 'up';
  moving = false;
  /** Increments once per step; the renderer uses its parity for the walk cycle. */
  stepPhase = 0;
  private distance = 0;
  /** Starts finished, so the character spawns on the ground. */
  private jumpElapsed = JUMP_DURATION;

  get isJumping() {
    return this.jumpElapsed < JUMP_DURATION;
  }

  /** How far above the ground the sprite is drawn. Never affects collision. */
  get jumpOffset(): number {
    if (!this.isJumping) return 0;
    const t = this.jumpElapsed / JUMP_DURATION;
    return JUMP_HEIGHT * 4 * t * (1 - t); // parabola: 0 at both ends, peak at t=0.5
  }

  /** Returns false when a hop is already in the air, so sounds do not stack. */
  jump(): boolean {
    if (this.isJumping) return false;
    this.jumpElapsed = 0;
    return true;
  }

  get col() {
    return Math.floor(this.position.x / TILE);
  }

  get row() {
    return Math.floor((this.position.y - 2) / TILE);
  }

  private collides(x: number, y: number): boolean {
    const left = x - BODY_W / 2;
    const right = x + BODY_W / 2 - 1;
    const top = y - BODY_H;
    const bottom = y - 1;

    return (
      isSolidAt(Math.floor(left / TILE), Math.floor(top / TILE)) ||
      isSolidAt(Math.floor(right / TILE), Math.floor(top / TILE)) ||
      isSolidAt(Math.floor(left / TILE), Math.floor(bottom / TILE)) ||
      isSolidAt(Math.floor(right / TILE), Math.floor(bottom / TILE))
    );
  }

  /** Moves along one axis in small steps, stopping at the first blocked pixel. */
  private slide(deltaX: number, deltaY: number) {
    const steps = Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / MAX_STEP) || 1;
    const stepX = deltaX / steps;
    const stepY = deltaY / steps;

    for (let i = 0; i < steps; i++) {
      const nextX = this.position.x + stepX;
      if (stepX !== 0 && !this.collides(nextX, this.position.y)) this.position.x = nextX;

      const nextY = this.position.y + stepY;
      if (stepY !== 0 && !this.collides(this.position.x, nextY)) this.position.y = nextY;
    }
  }

  update(dt: number, vector: Vec2, facing: Direction | null, running: boolean) {
    // The hop keeps playing whether or not the visitor is walking.
    if (this.isJumping) this.jumpElapsed = Math.min(JUMP_DURATION, this.jumpElapsed + dt);

    if (!facing || (vector.x === 0 && vector.y === 0)) {
      this.moving = false;
      return;
    }

    const speed = running ? RUN_SPEED : WALK_SPEED;
    const before = { x: this.position.x, y: this.position.y };

    this.slide(vector.x * speed * dt, vector.y * speed * dt);

    this.facing = facing;
    const travelled = Math.hypot(this.position.x - before.x, this.position.y - before.y);
    this.moving = travelled > 0.01;

    this.distance += travelled;
    while (this.distance >= STEP_LENGTH) {
      this.distance -= STEP_LENGTH;
      this.stepPhase++;
    }
  }
}
