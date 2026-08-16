/**
 * Tiny drawing helpers. Everything is drawn in whole world pixels; the canvas
 * transform handles the zoom, so shapes stay perfectly crisp at any scale.
 */

export type Ctx = CanvasRenderingContext2D;

export function px(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

/** 1px outlined rectangle, drawn as four fills so it never blurs. */
export function frame(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  px(ctx, x, y, w, 1, color);
  px(ctx, x, y + h - 1, w, 1, color);
  px(ctx, x, y, 1, h, color);
  px(ctx, x + w - 1, y, 1, h, color);
}

export type SpriteMatrix = readonly string[];
export type SpritePalette = Record<string, string>;

/**
 * Draws a sprite defined as rows of characters. `.` (and any key missing from
 * the palette) is transparent. `flipX` mirrors it, which is how the
 * left-facing character is drawn from the right-facing matrix.
 */
export function drawMatrix(
  ctx: Ctx,
  matrix: SpriteMatrix,
  spritePalette: SpritePalette,
  originX: number,
  originY: number,
  flipX = false,
) {
  const width = matrix[0]?.length ?? 0;

  for (let row = 0; row < matrix.length; row++) {
    const line = matrix[row];
    for (let col = 0; col < line.length; col++) {
      const key = line[col];
      const color = spritePalette[key];
      if (!color) continue;
      const x = flipX ? originX + (width - 1 - col) : originX + col;
      px(ctx, x, originY + row, 1, 1, color);
    }
  }
}

/** Soft elliptical ground shadow, faked with two stacked rectangles. */
export function groundShadow(ctx: Ctx, cx: number, y: number, w: number, color: string) {
  px(ctx, cx - w / 2, y, w, 2, color);
  px(ctx, cx - w / 2 + 1, y - 1, w - 2, 1, color);
}
