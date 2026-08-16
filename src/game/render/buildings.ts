import { palette } from '@/game/art/palette';
import { shade } from '@/game/art/color';
import { frame, px, type Ctx } from '@/game/art/pixelDraw';
import { TILE } from '@/game/domain/tiles';
import type { Building, Rect } from '@/game/domain/types';

const ROOF_H = 22;
const OVERHANG = 4;
const DOOR_W = 14;
const DOOR_H = 22;
const WIN = 12;
const WIN_GAP_X = 10;
const WIN_GAP_Y = 12;
const SIGN_H = 14;

export const SIGN_FONT = '8px "Press Start 2P", monospace';

interface Layout {
  x: number;
  y: number;
  w: number;
  h: number;
  facadeY: number;
  door: Rect;
  sign: Rect;
}

export function layoutOf(building: Building): Layout {
  const x = building.rect.x * TILE;
  const y = building.rect.y * TILE;
  const w = building.rect.w * TILE;
  const h = building.rect.h * TILE;

  const doorX = building.doorCol * TILE + (TILE - DOOR_W) / 2;
  const doorY = y + h - DOOR_H;

  const signW = Math.min(w - 6, building.sign.length * 8 + 10);
  const signX = Math.max(
    x + 3,
    Math.min(x + w - 3 - signW, doorX + DOOR_W / 2 - signW / 2),
  );

  return {
    x,
    y,
    w,
    h,
    facadeY: y + ROOF_H,
    door: { x: doorX, y: doorY, w: DOOR_W, h: DOOR_H },
    sign: { x: signX, y: doorY - SIGN_H - 6, w: signW, h: SIGN_H },
  };
}

const intersects = (a: Rect, b: Rect, margin = 0) =>
  a.x < b.x + b.w + margin &&
  a.x + a.w + margin > b.x &&
  a.y < b.y + b.h + margin &&
  a.y + a.h + margin > b.y;

function drawRoof(ctx: Ctx, building: Building, l: Layout) {
  const { x, y, w } = l;
  const light = shade(building.roof, 0.18);
  const dark = shade(building.roof, -0.22);

  // Three stacked bands fake the perspective of a sloped roof.
  px(ctx, x + 8, y, w - 16, 6, light);
  px(ctx, x + 3, y + 6, w - 6, 7, building.roof);
  px(ctx, x - OVERHANG, y + 13, w + OVERHANG * 2, 7, dark);
  px(ctx, x - OVERHANG, y + ROOF_H - 2, w + OVERHANG * 2, 2, palette.outline);

  // Shingle notches.
  for (let i = x + 2; i < x + w - 2; i += 8) {
    px(ctx, i, y + 6, 1, 7, shade(building.roof, -0.12));
  }
}

function drawFacade(ctx: Ctx, building: Building, l: Layout) {
  const { x, w, h, y, facadeY } = l;
  const facadeH = y + h - facadeY;

  px(ctx, x, facadeY, w, facadeH, building.color);

  // Subtle horizontal siding.
  for (let i = facadeY + 6; i < y + h - 6; i += 8) {
    px(ctx, x, i, w, 1, shade(building.color, -0.1));
  }

  px(ctx, x, y + h - 7, w, 7, shade(building.color, -0.3));
  px(ctx, x, y + h - 7, w, 1, shade(building.color, -0.45));
  frame(ctx, x, facadeY, w, facadeH, palette.outline);
}

function drawWindows(ctx: Ctx, building: Building, l: Layout) {
  const { x, y, w, h, facadeY } = l;

  const cols = Math.max(1, Math.floor((w - WIN_GAP_X) / (WIN + WIN_GAP_X)));
  const usedW = cols * WIN + (cols - 1) * WIN_GAP_X;
  const startX = x + Math.round((w - usedW) / 2);

  const top = facadeY + 8;
  const bottom = y + h - 10;
  const rows = Math.max(1, Math.floor((bottom - top) / (WIN + WIN_GAP_Y)));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rect: Rect = {
        x: startX + c * (WIN + WIN_GAP_X),
        y: top + r * (WIN + WIN_GAP_Y),
        w: WIN,
        h: WIN,
      };

      if (intersects(rect, l.door, 4) || intersects(rect, l.sign, 4)) continue;

      const lit = (r * 7 + c * 3 + building.sign.length) % 3 !== 0;
      const glass = lit ? building.glow : shade(building.glow, -0.45);

      px(ctx, rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2, palette.outline);
      px(ctx, rect.x, rect.y, rect.w, rect.h, glass);
      px(ctx, rect.x, rect.y, rect.w, 3, shade(glass, 0.25));
      px(ctx, rect.x + rect.w / 2 - 1, rect.y, 1, rect.h, palette.outline);
      px(ctx, rect.x, rect.y + rect.h / 2 - 1, rect.w, 1, palette.outline);
      px(ctx, rect.x, rect.y + rect.h - 2, rect.w, 2, shade(glass, -0.3));
    }
  }
}

function drawDoor(ctx: Ctx, l: Layout) {
  const { door } = l;
  px(ctx, door.x - 2, door.y - 2, door.w + 4, door.h + 2, palette.outline);
  px(ctx, door.x, door.y, door.w, door.h, palette.door);
  px(ctx, door.x, door.y, door.w, 2, palette.doorDark);
  px(ctx, door.x + 2, door.y + 3, door.w - 4, 7, palette.doorDark);
  px(ctx, door.x + 2, door.y + 12, door.w - 4, 7, palette.doorDark);
  px(ctx, door.x + door.w - 4, door.y + door.h / 2 - 1, 2, 2, palette.knob);
}

function drawSign(ctx: Ctx, building: Building, l: Layout) {
  const { sign } = l;
  const neon = building.stationId === 'arcade';
  const board = neon ? '#1a1030' : palette.signBoard;
  const text = neon ? building.glow : palette.outline;

  px(ctx, sign.x - 2, sign.y - 2, sign.w + 4, sign.h + 4, palette.outline);
  px(ctx, sign.x, sign.y, sign.w, sign.h, board);
  px(ctx, sign.x, sign.y, sign.w, 1, shade(board, 0.2));
  px(ctx, sign.x, sign.y + sign.h - 1, sign.w, 1, shade(board, -0.2));

  ctx.font = SIGN_FONT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = text;
  ctx.fillText(building.sign, Math.round(sign.x + sign.w / 2), Math.round(sign.y + sign.h / 2) + 1);
}

/** Details that sit behind the roof (chimneys, antennas). */
function drawBackDetails(ctx: Ctx, building: Building, l: Layout, time: number) {
  const { x, y, w } = l;

  switch (building.stationId) {
    case 'home': {
      const cx = x + w - 20;
      px(ctx, cx, y - 12, 9, 18, shade(building.roof, -0.3));
      px(ctx, cx - 1, y - 14, 11, 3, palette.outline);
      px(ctx, cx + 2, y - 20, 3, 3, 'rgba(244, 241, 228, 0.55)');
      px(ctx, cx + 4, y - 25, 4, 4, 'rgba(244, 241, 228, 0.35)');
      break;
    }
    case 'tower': {
      const cx = x + Math.round(w / 2);
      px(ctx, cx - 1, y - 16, 2, 16, palette.metalDark);
      px(ctx, cx - 4, y - 18, 8, 2, palette.metal);
      const on = Math.floor(time / 600) % 2 === 0;
      px(ctx, cx - 2, y - 22, 4, 4, on ? '#ff5a5a' : '#7a2323');
      break;
    }
    default:
      break;
  }
}

/** Details that sit in front of the facade (props on the sidewalk). */
function drawFrontDetails(ctx: Ctx, building: Building, l: Layout, time: number) {
  const { x, y, w, h } = l;

  switch (building.stationId) {
    case 'post': {
      const mx = l.door.x + l.door.w + 8;
      px(ctx, mx, y + h - 20, 10, 13, '#c0392b');
      px(ctx, mx, y + h - 20, 10, 3, '#8f2a20');
      px(ctx, mx + 2, y + h - 15, 6, 2, palette.outline);
      px(ctx, mx + 3, y + h - 7, 4, 6, palette.metalDark);
      break;
    }
    case 'kiosk': {
      // Striped awning over the door.
      const aw = l.door.w + 16;
      const ax = l.door.x - 8;
      const ay = l.door.y - 10;
      px(ctx, ax - 1, ay - 1, aw + 2, 8, palette.outline);
      for (let i = 0; i < aw; i += 4) {
        px(ctx, ax + i, ay, 4, 6, i % 8 === 0 ? '#f4f1e4' : '#c0392b');
      }
      break;
    }
    case 'workshop': {
      // Toolbox by the door.
      const tx = l.door.x - 16;
      px(ctx, tx, y + h - 13, 12, 7, '#c0392b');
      px(ctx, tx, y + h - 13, 12, 2, '#8f2a20');
      px(ctx, tx + 4, y + h - 15, 4, 2, palette.metalDark);
      break;
    }
    case 'arcade': {
      // Neon strip under the roof.
      const on = Math.floor(time / 400) % 2 === 0;
      px(ctx, x + 4, l.facadeY + 2, w - 8, 2, on ? building.glow : shade(building.glow, -0.4));
      break;
    }
    default:
      break;
  }
}

export function drawBuilding(ctx: Ctx, building: Building, time: number) {
  const l = layoutOf(building);

  px(ctx, l.x - OVERHANG, l.y + l.h, l.w + OVERHANG * 2, 3, palette.shadow);
  drawBackDetails(ctx, building, l, time);
  drawRoof(ctx, building, l);
  drawFacade(ctx, building, l);
  drawWindows(ctx, building, l);
  drawDoor(ctx, l);
  drawSign(ctx, building, l);
  drawFrontDetails(ctx, building, l, time);

  // Welcome mat in front of the door, on the ground.
  px(ctx, l.door.x - 1, l.y + l.h, l.door.w + 2, 4, shade(palette.path, -0.15));
  px(ctx, l.door.x - 1, l.y + l.h, l.door.w + 2, 1, palette.outline);
}
