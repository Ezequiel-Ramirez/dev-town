import type { PropsWithChildren } from 'react';

interface Props {
  className?: string;
  as?: 'div' | 'section' | 'aside';
}

/** Dark panel with the chunky three-layer 16-bit border. */
export function PixelPanel({ children, className = '', as: Tag = 'div' }: PropsWithChildren<Props>) {
  return (
    <Tag className={`pixel-frame bg-panel text-[#f4f4ff] ${className}`}>{children}</Tag>
  );
}
