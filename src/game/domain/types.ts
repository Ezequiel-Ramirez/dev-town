import type { StationId } from '@/content/portfolio.config';

export type Direction = 'down' | 'up' | 'left' | 'right';

export interface Vec2 {
  x: number;
  y: number;
}

/** Axis-aligned rectangle. Units are documented per usage (tiles or pixels). */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A building placed on the map. Coordinates are in tiles. */
export interface Building {
  stationId: StationId;
  /** Footprint. Every tile inside is solid. */
  rect: Rect;
  /** Door column, absolute in tiles. The door sits on the bottom row. */
  doorCol: number;
  /** Sign text painted above the door. */
  sign: string;
  /** Facade base color. */
  color: string;
  /** Roof color. */
  roof: string;
  /** Window glow color. */
  glow: string;
  /** Extra rows of roof drawn above the footprint (visual only). */
  roofOverhang: number;
}

/** The tile the player must stand on to trigger a station. In tiles. */
export interface Trigger {
  stationId: StationId;
  col: number;
  row: number;
}

export interface WorldState {
  /** Player position in world pixels (center of the sprite feet). */
  player: Vec2;
  facing: Direction;
  moving: boolean;
  /** Accumulated distance walked, drives the walk animation. */
  walkPhase: number;
}
