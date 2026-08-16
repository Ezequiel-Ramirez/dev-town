export const TILE = 16;

export enum Tile {
  Grass = 0,
  Flowers = 1,
  Road = 2,
  RoadLineH = 3,
  RoadLineV = 4,
  Sidewalk = 5,
  Path = 6,
  Water = 7,
  Sand = 8,
  Tree = 9,
  Bush = 10,
  Fence = 11,
  Lamp = 12,
  Bench = 13,
}

/** Tiles the player cannot walk through. */
export const SOLID_TILES: ReadonlySet<Tile> = new Set([
  Tile.Water,
  Tile.Tree,
  Tile.Bush,
  Tile.Fence,
  Tile.Lamp,
  Tile.Bench,
]);

export const isSolidTile = (tile: Tile): boolean => SOLID_TILES.has(tile);
