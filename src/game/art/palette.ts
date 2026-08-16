/** Shared 16-bit palette. Limited on purpose — that is what sells the era. */
export const palette = {
  outline: '#1b1b2a',
  shadow: 'rgba(11, 11, 20, 0.28)',

  grass: '#5aa73c',
  grassShade: '#4a8f31',
  grassLight: '#79c455',

  flower: '#ff6b8a',
  flowerAlt: '#ffd447',

  asphalt: '#4a4a5c',
  asphaltDark: '#3d3d4d',
  roadLine: '#ffd447',

  sidewalk: '#c9c2b2',
  sidewalkDark: '#aaa392',

  path: '#d6b57f',
  pathDark: '#bd9a63',

  water: '#2f6fd0',
  waterDark: '#255aa8',
  waterLight: '#6aa6ec',
  sand: '#e2cf9a',

  trunk: '#6b4326',
  trunkDark: '#4d2f1a',
  leaf: '#2f7d3a',
  leafLight: '#43a04b',
  leafDark: '#245f2c',

  wood: '#8a5a33',
  woodDark: '#5f3d21',
  metal: '#8e93a8',
  metalDark: '#5c6076',
  lampGlow: '#ffe08a',

  glass: '#9fe8ff',
  door: '#6b4326',
  doorDark: '#4d2f1a',
  knob: '#ffd447',
  signBoard: '#f4f1e4',
} as const;
