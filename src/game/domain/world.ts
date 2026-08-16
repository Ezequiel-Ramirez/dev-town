import { stationById, type StationId } from '@/content/portfolio.config';
import type { Building, Trigger, Vec2 } from './types';
import { Tile, TILE, isSolidTile } from './tiles';

export const MAP_COLS = 48;
export const MAP_ROWS = 34;
export const WORLD_W = MAP_COLS * TILE;
export const WORLD_H = MAP_ROWS * TILE;

/** Main streets, in tiles. The town is a simple cross so nobody gets lost. */
const ROAD_TOP_ROW = 16;
const ROAD_BOTTOM_ROW = 18;
const ROAD_LEFT_COL = 22;
const ROAD_RIGHT_COL = 24;
const ROAD_CENTER_ROW = 17;
const ROAD_CENTER_COL = 23;
/** Walkway that serves the two southern buildings and the park. */
const PARK_PATH_ROW = 27;

const BUILDING_STYLE: Record<StationId, Pick<Building, 'color' | 'roof' | 'glow'>> = {
  home: { color: '#d9805e', roof: '#8c3b2e', glow: '#ffe9a8' },
  workshop: { color: '#b9b0a0', roof: '#6b5f52', glow: '#ffd47a' },
  arcade: { color: '#7351e0', roof: '#3c2a86', glow: '#5cf2e0' },
  tower: { color: '#84a9c6', roof: '#3d5a75', glow: '#cfe9ff' },
  post: { color: '#d8c458', roof: '#a83c3c', glow: '#fff2b0' },
  kiosk: { color: '#4fae7a', roof: '#2d7350', glow: '#ffe9a8' },
};

interface BuildingPlacement {
  stationId: StationId;
  col: number;
  row: number;
  cols: number;
  rows: number;
  roofOverhang: number;
}

const PLACEMENTS: BuildingPlacement[] = [
  { stationId: 'home', col: 4, row: 8, cols: 7, rows: 6, roofOverhang: 2 },
  { stationId: 'workshop', col: 14, row: 8, cols: 6, rows: 6, roofOverhang: 2 },
  { stationId: 'arcade', col: 27, row: 8, cols: 8, rows: 6, roofOverhang: 2 },
  { stationId: 'tower', col: 38, row: 6, cols: 6, rows: 8, roofOverhang: 1 },
  { stationId: 'post', col: 5, row: 21, cols: 7, rows: 6, roofOverhang: 2 },
  { stationId: 'kiosk', col: 30, row: 22, cols: 5, rows: 5, roofOverhang: 2 },
];

export const buildings: Building[] = PLACEMENTS.map((p) => {
  const station = stationById.get(p.stationId);
  if (!station) throw new Error(`Missing station content for "${p.stationId}"`);

  return {
    stationId: p.stationId,
    rect: { x: p.col, y: p.row, w: p.cols, h: p.rows },
    doorCol: p.col + Math.floor(p.cols / 2),
    sign: station.sign,
    roofOverhang: p.roofOverhang,
    ...BUILDING_STYLE[p.stationId],
  };
});

/** Stand on this tile and the "talk" prompt shows up. */
export const triggers: Trigger[] = buildings.map((b) => ({
  stationId: b.stationId,
  col: b.doorCol,
  row: b.rect.y + b.rect.h,
}));

/** Player spawn, in world pixels: the middle of the town crossroads. */
export const SPAWN: Vec2 = {
  x: ROAD_CENTER_COL * TILE + TILE / 2,
  y: 21 * TILE + TILE / 2,
};

// ---------------------------------------------------------------------------
// Ground layer
// ---------------------------------------------------------------------------

const ground = new Uint8Array(MAP_COLS * MAP_ROWS);

const idx = (col: number, row: number) => row * MAP_COLS + col;

const inBounds = (col: number, row: number) =>
  col >= 0 && col < MAP_COLS && row >= 0 && row < MAP_ROWS;

function set(col: number, row: number, tile: Tile) {
  if (inBounds(col, row)) ground[idx(col, row)] = tile;
}

function fill(col: number, row: number, cols: number, rows: number, tile: Tile) {
  for (let r = row; r < row + rows; r++) {
    for (let c = col; c < col + cols; c++) set(c, r, tile);
  }
}

function get(col: number, row: number): Tile {
  return inBounds(col, row) ? (ground[idx(col, row)] as Tile) : Tile.Tree;
}

/** Asphalt, including the painted center lines. */
const isPaved = (tile: Tile) =>
  tile === Tile.Road || tile === Tile.RoadLineH || tile === Tile.RoadLineV;

/** Deterministic 0..1 noise so grass texture never flickers between frames. */
export function hash01(x: number, y: number): number {
  const n = Math.imul(x | 0, 73856093) ^ Math.imul(y | 0, 19349663);
  return ((n >>> 0) % 1000) / 1000;
}

function buildGround() {
  fill(0, 0, MAP_COLS, MAP_ROWS, Tile.Grass);

  // Flower patches: sparse, deterministic, only on open grass.
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (hash01(c * 3 + 11, r * 7 + 5) > 0.93) set(c, r, Tile.Flowers);
    }
  }

  // Sidewalks first, then asphalt on top of them.
  fill(0, ROAD_TOP_ROW - 1, MAP_COLS, 1, Tile.Sidewalk);
  fill(0, ROAD_BOTTOM_ROW + 1, MAP_COLS, 1, Tile.Sidewalk);
  fill(ROAD_LEFT_COL - 1, 0, 1, MAP_ROWS, Tile.Sidewalk);
  fill(ROAD_RIGHT_COL + 1, 0, 1, MAP_ROWS, Tile.Sidewalk);

  fill(0, ROAD_TOP_ROW, MAP_COLS, ROAD_BOTTOM_ROW - ROAD_TOP_ROW + 1, Tile.Road);
  fill(ROAD_LEFT_COL, 0, ROAD_RIGHT_COL - ROAD_LEFT_COL + 1, MAP_ROWS, Tile.Road);

  // Dashed center lines, cleared inside the intersection.
  for (let c = 0; c < MAP_COLS; c++) {
    if (c >= ROAD_LEFT_COL && c <= ROAD_RIGHT_COL) continue;
    set(c, ROAD_CENTER_ROW, Tile.RoadLineH);
  }
  for (let r = 0; r < MAP_ROWS; r++) {
    if (r >= ROAD_TOP_ROW && r <= ROAD_BOTTOM_ROW) continue;
    set(ROAD_CENTER_COL, r, Tile.RoadLineV);
  }

  // Park walkway for the southern half. Asphalt always wins.
  for (let c = 2; c <= MAP_COLS - 3; c++) {
    if (isPaved(get(c, PARK_PATH_ROW))) continue;
    set(c, PARK_PATH_ROW, Tile.Path);
  }

  // Pond with a sandy shore. The corners are carved out so neither the water
  // nor the sand reads as a rectangle.
  fill(13, 21, 8, 6, Tile.Sand);
  fill(14, 22, 6, 4, Tile.Water);
  for (const [c, r] of [
    [13, 21], [20, 21], [13, 26], [20, 26],
  ] as Array<[number, number]>) {
    set(c, r, Tile.Grass);
  }
  for (const [c, r] of [
    [14, 22], [19, 22], [14, 25], [19, 25],
  ] as Array<[number, number]>) {
    set(c, r, Tile.Sand);
  }

  // A short paved path from every door to the nearest walkway.
  for (const building of buildings) {
    const doorFrontRow = building.rect.y + building.rect.h;
    for (let r = doorFrontRow; r < MAP_ROWS; r++) {
      const tile = get(building.doorCol, r);
      if (isPaved(tile) || tile === Tile.Sidewalk || tile === Tile.Path) break;
      set(building.doorCol, r, Tile.Path);
    }
  }

  // Street lamps along the north sidewalk, never on a door path.
  for (const col of [3, 12, 20, 27, 35, 44]) set(col, ROAD_TOP_ROW - 1, Tile.Lamp);

  // Park furniture.
  set(15, 26, Tile.Bench);
  set(18, 26, Tile.Bench);
  set(12, 28, Tile.Lamp);
  set(26, 28, Tile.Lamp);
  set(38, 28, Tile.Lamp);

  const trees: Array<[number, number]> = [
    [3, 3], [6, 2], [9, 4], [12, 3], [18, 5], [20, 2],
    [27, 3], [30, 2], [33, 4], [36, 3], [44, 4], [45, 8], [45, 12],
    [2, 20], [14, 20], [19, 20], [28, 20], [38, 21], [42, 24],
    [3, 30], [8, 30], [12, 31], [20, 30], [28, 31], [35, 30], [40, 31], [44, 29],
  ];
  for (const [c, r] of trees) set(c, r, Tile.Tree);

  const bushes: Array<[number, number]> = [
    [4, 5], [11, 2], [16, 3], [31, 5], [41, 4], [6, 29], [17, 31], [33, 29], [43, 21],
  ];
  for (const [c, r] of bushes) set(c, r, Tile.Bush);

  // Tree line around the map so the town feels enclosed. Roads stay open.
  for (let c = 0; c < MAP_COLS; c++) {
    if (c < ROAD_LEFT_COL - 1 || c > ROAD_RIGHT_COL + 1) {
      set(c, 0, Tile.Tree);
      set(c, MAP_ROWS - 1, Tile.Tree);
    }
  }
  for (let r = 0; r < MAP_ROWS; r++) {
    if (r < ROAD_TOP_ROW - 1 || r > ROAD_BOTTOM_ROW + 1) {
      set(0, r, Tile.Tree);
      set(MAP_COLS - 1, r, Tile.Tree);
    }
  }
}

buildGround();

// ---------------------------------------------------------------------------
// Collision layer
// ---------------------------------------------------------------------------

const solid = new Uint8Array(MAP_COLS * MAP_ROWS);

for (let r = 0; r < MAP_ROWS; r++) {
  for (let c = 0; c < MAP_COLS; c++) {
    if (isSolidTile(get(c, r))) solid[idx(c, r)] = 1;
  }
}

for (const b of buildings) {
  for (let r = b.rect.y; r < b.rect.y + b.rect.h; r++) {
    for (let c = b.rect.x; c < b.rect.x + b.rect.w; c++) {
      if (inBounds(c, r)) solid[idx(c, r)] = 1;
    }
  }
}

export const tileAt = get;

export function isSolidAt(col: number, row: number): boolean {
  if (!inBounds(col, row)) return true;
  return solid[idx(col, row)] === 1;
}
