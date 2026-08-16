import { palette } from '@/game/art/palette';
import { px, type Ctx } from '@/game/art/pixelDraw';
import { Tile, TILE } from '@/game/domain/tiles';
import { hash01, tileAt } from '@/game/domain/world';

/**
 * Props (trees, lamps, benches) sit on top of whatever terrain surrounds them,
 * so we infer a base surface from the neighbours instead of storing two layers.
 */
function baseSurface(col: number, row: number): Tile {
  const neighbours = [
    tileAt(col - 1, row),
    tileAt(col + 1, row),
    tileAt(col, row - 1),
    tileAt(col, row + 1),
  ];
  if (neighbours.includes(Tile.Sidewalk)) return Tile.Sidewalk;
  if (neighbours.includes(Tile.Path)) return Tile.Path;
  if (neighbours.includes(Tile.Sand)) return Tile.Sand;
  return Tile.Grass;
}

function drawGrass(ctx: Ctx, x: number, y: number, col: number, row: number) {
  px(ctx, x, y, TILE, TILE, palette.grass);

  const a = hash01(col, row);
  if (a > 0.55) {
    px(ctx, x + ((a * 13) | 0), y + ((a * 29) % 13 | 0), 1, 2, palette.grassShade);
  }
  const b = hash01(col + 17, row + 5);
  if (b > 0.6) {
    px(ctx, x + ((b * 12) | 0), y + ((b * 41) % 12 | 0), 2, 1, palette.grassLight);
  }
}

function drawFlowers(ctx: Ctx, x: number, y: number, col: number, row: number) {
  drawGrass(ctx, x, y, col, row);
  const a = hash01(col + 3, row + 9);
  const color = a > 0.5 ? palette.flower : palette.flowerAlt;
  px(ctx, x + 4, y + 5, 2, 2, color);
  px(ctx, x + 10, y + 9, 2, 2, color);
  px(ctx, x + 7, y + 12, 1, 1, color);
}

function drawRoad(ctx: Ctx, x: number, y: number, col: number, row: number) {
  px(ctx, x, y, TILE, TILE, palette.asphalt);
  const a = hash01(col + 31, row + 13);
  if (a > 0.5) px(ctx, x + ((a * 14) | 0), y + ((a * 53) % 14 | 0), 2, 1, palette.asphaltDark);
  const b = hash01(col + 7, row + 29);
  if (b > 0.72) px(ctx, x + ((b * 14) | 0), y + ((b * 23) % 14 | 0), 1, 1, palette.asphaltDark);
}

function drawSidewalk(ctx: Ctx, x: number, y: number) {
  px(ctx, x, y, TILE, TILE, palette.sidewalk);
  // 8x8 slabs: grout on the top and left edge of each slab.
  px(ctx, x, y, TILE, 1, palette.sidewalkDark);
  px(ctx, x, y, 1, TILE, palette.sidewalkDark);
  px(ctx, x + 8, y, 1, TILE, palette.sidewalkDark);
  px(ctx, x, y + 8, TILE, 1, palette.sidewalkDark);
}

function drawPath(ctx: Ctx, x: number, y: number, col: number, row: number) {
  px(ctx, x, y, TILE, TILE, palette.path);
  const a = hash01(col + 5, row + 41);
  if (a > 0.45) px(ctx, x + ((a * 13) | 0), y + ((a * 31) % 13 | 0), 2, 2, palette.pathDark);
}

function drawSand(ctx: Ctx, x: number, y: number, col: number, row: number) {
  px(ctx, x, y, TILE, TILE, palette.sand);
  const a = hash01(col + 19, row + 2);
  if (a > 0.6) px(ctx, x + ((a * 13) | 0), y + ((a * 17) % 13 | 0), 1, 1, palette.pathDark);
}

function drawWater(ctx: Ctx, x: number, y: number, col: number, row: number, time: number) {
  px(ctx, x, y, TILE, TILE, palette.water);

  // Darker shoreline wherever the pond meets the shore.
  const isWater = (c: number, r: number) => tileAt(c, r) === Tile.Water;
  if (!isWater(col, row - 1)) px(ctx, x, y, TILE, 3, palette.waterDark);
  if (!isWater(col, row + 1)) px(ctx, x, y + TILE - 2, TILE, 2, palette.waterDark);
  if (!isWater(col - 1, row)) px(ctx, x, y, 2, TILE, palette.waterDark);
  if (!isWater(col + 1, row)) px(ctx, x + TILE - 2, y, 2, TILE, palette.waterDark);

  // Waves drift horizontally so the pond feels alive without any assets.
  const drift = Math.floor(time / 420) % 6;
  const a = hash01(col + 11, row + 23);
  const b = hash01(col + 43, row + 7);
  px(ctx, x + (((a * 16 + drift) | 0) % 12) + 1, y + 3 + ((a * 9) | 0), 4, 1, palette.waterLight);
  if (b > 0.45) {
    px(ctx, x + (((b * 16 + drift * 2) | 0) % 12) + 1, y + 4 + ((b * 8) | 0), 3, 1, palette.waterLight);
  }
}

function drawTree(ctx: Ctx, x: number, y: number, col: number, row: number) {
  drawGrass(ctx, x, y, col, row);
  px(ctx, x + 5, y + 12, 6, 2, palette.shadow);
  px(ctx, x + 7, y + 9, 3, 5, palette.trunk);
  px(ctx, x + 7, y + 9, 1, 5, palette.trunkDark);

  px(ctx, x + 3, y + 2, 10, 8, palette.leaf);
  px(ctx, x + 2, y + 4, 12, 4, palette.leaf);
  px(ctx, x + 5, y + 1, 6, 2, palette.leaf);
  px(ctx, x + 4, y + 3, 4, 2, palette.leafLight);
  px(ctx, x + 3, y + 8, 10, 2, palette.leafDark);
  px(ctx, x + 2, y + 6, 1, 2, palette.leafDark);
  px(ctx, x + 13, y + 6, 1, 2, palette.leafDark);
}

function drawBush(ctx: Ctx, x: number, y: number, col: number, row: number) {
  drawGrass(ctx, x, y, col, row);
  px(ctx, x + 3, y + 13, 10, 2, palette.shadow);
  px(ctx, x + 3, y + 6, 10, 7, palette.leaf);
  px(ctx, x + 2, y + 8, 12, 4, palette.leaf);
  px(ctx, x + 5, y + 7, 3, 2, palette.leafLight);
  px(ctx, x + 3, y + 11, 10, 2, palette.leafDark);
}

function drawFence(ctx: Ctx, x: number, y: number, col: number, row: number) {
  drawGrass(ctx, x, y, col, row);
  px(ctx, x + 1, y + 4, TILE - 2, 2, palette.wood);
  px(ctx, x + 1, y + 9, TILE - 2, 2, palette.wood);
  px(ctx, x + 2, y + 2, 3, 11, palette.woodDark);
  px(ctx, x + 11, y + 2, 3, 11, palette.woodDark);
}

function drawLamp(ctx: Ctx, x: number, y: number, col: number, row: number) {
  const base = baseSurface(col, row);
  if (base === Tile.Sidewalk) drawSidewalk(ctx, x, y);
  else if (base === Tile.Path) drawPath(ctx, x, y, col, row);
  else drawGrass(ctx, x, y, col, row);

  px(ctx, x + 5, y + 14, 6, 2, palette.shadow);
  px(ctx, x + 7, y + 4, 2, 11, palette.metalDark);
  px(ctx, x + 5, y + 13, 6, 2, palette.metal);
  px(ctx, x + 5, y + 1, 6, 4, palette.metal);
  px(ctx, x + 6, y + 2, 4, 3, palette.lampGlow);
  px(ctx, x + 4, y, 8, 1, palette.metalDark);
}

function drawBench(ctx: Ctx, x: number, y: number, col: number, row: number) {
  const base = baseSurface(col, row);
  if (base === Tile.Sand) drawSand(ctx, x, y, col, row);
  else if (base === Tile.Path) drawPath(ctx, x, y, col, row);
  else drawGrass(ctx, x, y, col, row);

  px(ctx, x + 1, y + 13, 14, 2, palette.shadow);
  px(ctx, x + 1, y + 4, 14, 3, palette.wood);
  px(ctx, x + 1, y + 8, 14, 3, palette.wood);
  px(ctx, x + 1, y + 10, 14, 1, palette.woodDark);
  px(ctx, x + 2, y + 11, 2, 3, palette.metalDark);
  px(ctx, x + 12, y + 11, 2, 3, palette.metalDark);
}

export function drawTile(ctx: Ctx, tile: Tile, col: number, row: number, time: number) {
  const x = col * TILE;
  const y = row * TILE;

  switch (tile) {
    case Tile.Grass:
      return drawGrass(ctx, x, y, col, row);
    case Tile.Flowers:
      return drawFlowers(ctx, x, y, col, row);
    case Tile.Road:
      return drawRoad(ctx, x, y, col, row);
    case Tile.RoadLineH:
      drawRoad(ctx, x, y, col, row);
      return px(ctx, x, y + 7, 9, 2, palette.roadLine);
    case Tile.RoadLineV:
      drawRoad(ctx, x, y, col, row);
      return px(ctx, x + 7, y, 2, 9, palette.roadLine);
    case Tile.Sidewalk:
      return drawSidewalk(ctx, x, y);
    case Tile.Path:
      return drawPath(ctx, x, y, col, row);
    case Tile.Water:
      return drawWater(ctx, x, y, col, row, time);
    case Tile.Sand:
      return drawSand(ctx, x, y, col, row);
    case Tile.Tree:
      return drawTree(ctx, x, y, col, row);
    case Tile.Bush:
      return drawBush(ctx, x, y, col, row);
    case Tile.Fence:
      return drawFence(ctx, x, y, col, row);
    case Tile.Lamp:
      return drawLamp(ctx, x, y, col, row);
    case Tile.Bench:
      return drawBench(ctx, x, y, col, row);
    default:
      return drawGrass(ctx, x, y, col, row);
  }
}
