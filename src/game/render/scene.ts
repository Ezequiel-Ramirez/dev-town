import type { StationId } from '@/content/portfolio.config';
import { palette } from '@/game/art/palette';
import { characterFrame, characterPalette, promptBubble, promptPalette } from '@/game/art/sprites';
import { drawMatrix, groundShadow, px, type Ctx } from '@/game/art/pixelDraw';
import { TILE } from '@/game/domain/tiles';
import { MAP_COLS, MAP_ROWS, buildings, tileAt } from '@/game/domain/world';
import type { Camera } from '@/game/engine/Camera';
import type { Player } from '@/game/engine/Player';
import { drawBuilding, layoutOf } from './buildings';
import { drawTile } from './terrain';

const SPRITE_W = 16;
const SPRITE_H = 16;

function drawVisitedBadge(ctx: Ctx, x: number, y: number) {
  px(ctx, x - 1, y - 1, 12, 12, palette.outline);
  px(ctx, x, y, 10, 10, '#3fbf6f');
  px(ctx, x + 2, y + 5, 2, 2, '#f4f1e4');
  px(ctx, x + 4, y + 7, 2, 2, '#f4f1e4');
  px(ctx, x + 6, y + 3, 2, 4, '#f4f1e4');
}

export function renderScene(
  ctx: Ctx,
  camera: Camera,
  player: Player,
  nearby: StationId | null,
  visited: ReadonlySet<StationId>,
  time: number,
) {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = palette.outline;
  ctx.fillRect(0, 0, camera.viewW, camera.viewH);
  ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

  // Only the tiles inside the viewport are drawn, plus one row/column of slack.
  const startCol = Math.max(0, Math.floor(camera.x / TILE) - 1);
  const endCol = Math.min(MAP_COLS - 1, Math.ceil((camera.x + camera.viewW) / TILE) + 1);
  const startRow = Math.max(0, Math.floor(camera.y / TILE) - 1);
  const endRow = Math.min(MAP_ROWS - 1, Math.ceil((camera.y + camera.viewH) / TILE) + 1);

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      drawTile(ctx, tileAt(col, row), col, row, time);
    }
  }

  for (const building of buildings) {
    const left = building.rect.x * TILE;
    const right = left + building.rect.w * TILE;
    const top = building.rect.y * TILE - 32;
    const bottom = top + building.rect.h * TILE + 40;
    const visible =
      right > camera.x &&
      left < camera.x + camera.viewW &&
      bottom > camera.y &&
      top < camera.y + camera.viewH;
    if (!visible) continue;

    drawBuilding(ctx, building, time);

    const layout = layoutOf(building);
    if (visited.has(building.stationId)) {
      drawVisitedBadge(ctx, layout.sign.x + layout.sign.w + 4, layout.sign.y + 2);
    }

    if (nearby === building.stationId) {
      const bob = Math.round(Math.sin(time / 220) * 2);
      drawMatrix(
        ctx,
        promptBubble,
        promptPalette,
        Math.round(layout.door.x + layout.door.w / 2 - 7),
        Math.round(layout.sign.y - 20 + bob),
      );
    }
  }

  // The shadow stays on the ground and shrinks with height, which is what
  // reads as "in the air" — the sprite alone would just look like it slid up.
  const hop = Math.round(player.jumpOffset);
  const drawX = Math.round(player.position.x - SPRITE_W / 2);
  const drawY = Math.round(player.position.y - SPRITE_H) - hop;

  groundShadow(
    ctx,
    Math.round(player.position.x),
    Math.round(player.position.y) - 1,
    Math.max(7, 12 - hop / 2),
    palette.shadow,
  );

  // Feet stay together mid-air instead of cycling through the walk frames.
  const frame = characterFrame(player.facing, player.moving && !player.isJumping, player.stepPhase);
  drawMatrix(ctx, frame.matrix, characterPalette, drawX, drawY, frame.flipX);

  ctx.restore();
}
