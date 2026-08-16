import type { Direction } from '@/game/domain/types';
import type { SpriteMatrix, SpritePalette } from './pixelDraw';

export const SPRITE_SIZE = 16;

/**
 * Character palette.
 *   o outline   h/H hair    s/S skin
 *   c/C shirt   p pants     b boots
 */
export const characterPalette: SpritePalette = {
  o: '#1b1b2a',
  h: '#6b3f1f',
  H: '#8a5527',
  s: '#f2c39a',
  S: '#d99f74',
  c: '#38a3d8',
  C: '#2b7fa8',
  p: '#3a3f6b',
  b: '#4a2f1a',
};

// Rows are 16 characters wide. `npm run typecheck` will not catch a typo here,
// so assertSpriteIntegrity() below validates every matrix at startup in dev.

const DOWN_IDLE: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohHHhhhhho...',
  '...osssssssso...',
  '...osossssoso...',
  '...osssSSssso...',
  '....oooooooo....',
  '..occcccccccco..',
  '..osccccccccso..',
  '..osccccccccso..',
  '...oCCCCCCCCo...',
  '...opppoopppo...',
  '...opppoopppo...',
  '...obbboobbbo...',
];

const DOWN_WALK: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohHHhhhhho...',
  '...osssssssso...',
  '...osossssoso...',
  '...osssSSssso...',
  '....oooooooo....',
  '..occcccccccco..',
  '..osccccccccso..',
  '..osccccccccso..',
  '...oCCCCCCCCo...',
  '...opppoopppo...',
  '..opppo..opppo..',
  '..obbbo..obbbo..',
];

const UP_IDLE: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohHHhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohHhhhhhho...',
  '....oooooooo....',
  '..occcccccccco..',
  '..osccccccccso..',
  '..osccccccccso..',
  '...oCCCCCCCCo...',
  '...opppoopppo...',
  '...opppoopppo...',
  '...obbboobbbo...',
];

const UP_WALK: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohHHhhhhho...',
  '...ohhhhhhhho...',
  '...ohhhhhhhho...',
  '...ohHhhhhhho...',
  '....oooooooo....',
  '..occcccccccco..',
  '..osccccccccso..',
  '..osccccccccso..',
  '...oCCCCCCCCo...',
  '...opppoopppo...',
  '..opppo..opppo..',
  '..obbbo..obbbo..',
];

/** Right-facing profile. The left-facing sprite is this one mirrored. */
const SIDE_IDLE: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhssso...',
  '...ohhhhsssso...',
  '...ohhhsossso...',
  '...ohhhsssSSo...',
  '....oooooooo....',
  '...occcccccco...',
  '...osccccccso...',
  '...osccccccso...',
  '...oCCCCCCCCo...',
  '...oppppppppo...',
  '...opppoopppo...',
  '...obbboobbbo...',
];

const SIDE_WALK: SpriteMatrix = [
  '................',
  '.....oooooo.....',
  '....ohhhhhho....',
  '...ohhhhhhhho...',
  '...ohhhhhssso...',
  '...ohhhhsssso...',
  '...ohhhsossso...',
  '...ohhhsssSSo...',
  '....oooooooo....',
  '...occcccccco...',
  '...osccccccso...',
  '...osccccccso...',
  '...oCCCCCCCCo...',
  '...oppppppppo...',
  '....oppppppo....',
  '....obbbbbbo....',
];

interface CharacterFrame {
  matrix: SpriteMatrix;
  flipX: boolean;
}

const FRAMES: Record<Direction, [CharacterFrame, CharacterFrame]> = {
  down: [
    { matrix: DOWN_IDLE, flipX: false },
    { matrix: DOWN_WALK, flipX: false },
  ],
  up: [
    { matrix: UP_IDLE, flipX: false },
    { matrix: UP_WALK, flipX: false },
  ],
  right: [
    { matrix: SIDE_IDLE, flipX: false },
    { matrix: SIDE_WALK, flipX: false },
  ],
  left: [
    { matrix: SIDE_IDLE, flipX: true },
    { matrix: SIDE_WALK, flipX: true },
  ],
};

export function characterFrame(direction: Direction, moving: boolean, phase: number): CharacterFrame {
  const pair = FRAMES[direction];
  if (!moving) return pair[0];
  // Two-beat walk cycle: idle pose, step pose, idle pose, step pose...
  return phase % 2 === 0 ? pair[1] : pair[0];
}

/** The "!" bubble that floats over a building you can enter. */
export const promptBubble: SpriteMatrix = [
  '..oooooooooo..',
  '.oiiiiiiiiiio.',
  'oiiiiiaaiiiiio',
  'oiiiiiaaiiiiio',
  'oiiiiiaaiiiiio',
  'oiiiiiaaiiiiio',
  'oiiiiiiiiiiiio',
  'oiiiiiaaiiiiio',
  'oiiiiiaaiiiiio',
  '.oiiiiiiiiiio.',
  '..ooooiiooooo.',
  '.....oiio.....',
  '......oo......',
  '..............',
];

export const promptPalette: SpritePalette = {
  o: '#1b1b2a',
  i: '#f4f1e4',
  a: '#e0392b',
};

/**
 * Guards against a mistyped sprite row, which would otherwise be an invisible
 * one-pixel-off rendering bug. Runs only in development.
 */
export function assertSpriteIntegrity() {
  const all: Array<[string, SpriteMatrix, number]> = [
    ['DOWN_IDLE', DOWN_IDLE, SPRITE_SIZE],
    ['DOWN_WALK', DOWN_WALK, SPRITE_SIZE],
    ['UP_IDLE', UP_IDLE, SPRITE_SIZE],
    ['UP_WALK', UP_WALK, SPRITE_SIZE],
    ['SIDE_IDLE', SIDE_IDLE, SPRITE_SIZE],
    ['SIDE_WALK', SIDE_WALK, SPRITE_SIZE],
    ['promptBubble', promptBubble, promptBubble[0].length],
  ];

  for (const [name, matrix, width] of all) {
    if (matrix.length !== (name === 'promptBubble' ? matrix.length : SPRITE_SIZE)) {
      console.error(`[sprites] ${name} has ${matrix.length} rows, expected ${SPRITE_SIZE}`);
    }
    matrix.forEach((row, i) => {
      if (row.length !== width) {
        console.error(`[sprites] ${name} row ${i} is ${row.length} chars, expected ${width}`);
      }
    });
  }
}
