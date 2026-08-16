import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

/** A downloadable file, e.g. the CV in `public/`. */
const isFileHref = (href: string) => /\.(pdf|docx?|zip)(\?.*)?$/i.test(href);

/** Files and external sites open in a new tab so the town stays behind. */
export const opensInNewTab = (href: string) => isExternalHref(href) || isFileHref(href);

export const newTabProps = (href: string) =>
  opensInNewTab(href) ? ({ target: '_blank', rel: 'noopener noreferrer' } as const) : {};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function PixelButton({ children, className = '', ...rest }: PropsWithChildren<ButtonProps>) {
  return (
    <button type="button" className={`pixel-btn ${className}`} {...rest}>
      {children}
    </button>
  );
}

interface LinkProps {
  href: string;
  className?: string;
  ariaLabel?: string;
}

export function PixelLink({
  href,
  children,
  className = '',
  ariaLabel,
}: PropsWithChildren<LinkProps>) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`pixel-btn inline-block no-underline ${className}`}
      {...newTabProps(href)}
    >
      {children}
    </a>
  );
}
