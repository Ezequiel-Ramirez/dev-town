import { WORLD_H, WORLD_W } from '@/game/domain/world';
import type { Vec2 } from '@/game/domain/types';

/** Follows the player and never shows anything outside the map. */
export class Camera {
  x = 0;
  y = 0;
  viewW = 320;
  viewH = 240;

  resize(viewW: number, viewH: number) {
    this.viewW = viewW;
    this.viewH = viewH;
  }

  follow(target: Vec2) {
    const targetX = target.x - this.viewW / 2;
    const targetY = target.y - this.viewH / 2;

    this.x =
      this.viewW >= WORLD_W
        ? (WORLD_W - this.viewW) / 2
        : Math.max(0, Math.min(WORLD_W - this.viewW, targetX));

    this.y =
      this.viewH >= WORLD_H
        ? (WORLD_H - this.viewH) / 2
        : Math.max(0, Math.min(WORLD_H - this.viewH, targetY));
  }
}
