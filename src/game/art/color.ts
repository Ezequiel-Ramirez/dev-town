/** Lighten (amount > 0) or darken (amount < 0) a `#rrggbb` color. */
export function shade(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  const apply = (channel: number) => {
    const target = amount > 0 ? 255 : 0;
    const next = Math.round(channel + (target - channel) * Math.abs(amount));
    return Math.max(0, Math.min(255, next));
  };

  return `#${((apply(r) << 16) | (apply(g) << 8) | apply(b)).toString(16).padStart(6, '0')}`;
}
