import { useEffect, useRef } from 'react';
import type { Station, StationEntry } from '@/content/portfolio.config';
import { useReducedMotion } from '@/ui/hooks/useMediaQuery';
import { useTypewriter } from '@/ui/hooks/useTypewriter';
import { PixelPanel } from '../atoms/PixelPanel';
import { PixelLink, isExternalHref, newTabProps } from '../atoms/PixelButton';

interface Props {
  station: Station;
  onClose: () => void;
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border-2 border-ink bg-panelLight px-2 py-1 text-[8px] leading-none text-white/90"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

function EntryBody({ entry }: { entry: StationEntry }) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[11px] leading-relaxed text-accent">{entry.title}</h3>
        {entry.meta ? <p className="text-[8px] leading-relaxed text-white/60">{entry.meta}</p> : null}
      </div>
      {entry.description ? (
        <p className="mt-2 text-[9px] leading-loose text-white/80">{entry.description}</p>
      ) : null}
      {entry.tags?.length ? <Tags tags={entry.tags} /> : null}
    </>
  );
}

/** Anchors cannot nest, so the repo link lives outside the card anchor. */
function RepoLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      {...newTabProps(href)}
      className="mt-1 block border-2 border-t-0 border-ink bg-night/40 px-3 py-2 text-[8px] leading-none text-white/70 no-underline hover:border-accent hover:text-accent"
    >
      VIEW CODE ON GITHUB {'>>'}
    </a>
  );
}

function Entry({ entry }: { entry: StationEntry }) {
  if (!entry.href) {
    return (
      <li className="border-2 border-ink bg-night/60 p-3">
        <EntryBody entry={entry} />
        {entry.repo ? <RepoLink href={entry.repo} /> : null}
      </li>
    );
  }

  const external = isExternalHref(entry.href);

  return (
    <li>
      <a
        href={entry.href}
        {...newTabProps(entry.href)}
        className="block border-2 border-ink bg-night/60 p-3 no-underline transition-colors hover:border-accent hover:bg-panelLight"
      >
        <EntryBody entry={entry} />
        {/* Press Start 2P has no arrow glyphs, so the chevron is plain ASCII. */}
        <p className="mt-3 text-[8px] leading-none text-accent">
          {external ? 'OPEN LINK >>' : 'OPEN >>'}
        </p>
      </a>
      {entry.repo ? <RepoLink href={entry.repo} /> : null}
    </li>
  );
}

export function StationDialog({ station, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const text = station.dialog.join('\n\n');
  const { shown, done, skip } = useTypewriter(text, !reducedMotion);

  useEffect(() => {
    closeRef.current?.focus();
  }, [station.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={station.title}
      className="absolute inset-x-0 bottom-0 z-40 p-3 pb-4 sm:p-6"
    >
      <PixelPanel className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4 border-b-2 border-ink bg-panelLight px-4 py-3">
          <h2 className="text-[11px] leading-relaxed">{station.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="border-2 border-ink bg-panel px-2 py-1 text-[9px] hover:bg-accent hover:text-ink"
            aria-label="Close"
          >
            X
          </button>
        </header>

        <div className="max-h-[46vh] overflow-y-auto px-4 py-4">
          <button
            type="button"
            onClick={skip}
            className="block w-full cursor-text text-left"
            aria-hidden={done}
            tabIndex={-1}
          >
            <p className="whitespace-pre-wrap text-[9px] leading-loose text-white/90">
              {shown}
              {!done ? <span className="animate-blink">_</span> : null}
            </p>
          </button>

          {/* Entries are never gated behind the typewriter: hiding the actual
              content until an animation finishes costs real visitors. */}
          <ul className="mt-4 space-y-3">
            {station.entries.map((entry) => (
              <Entry key={entry.title} entry={entry} />
            ))}
          </ul>

          {station.cta ? (
            <div className="mt-4">
              <PixelLink href={station.cta.href} className="w-full text-center">
                {station.cta.label}
              </PixelLink>
            </div>
          ) : null}
        </div>

        <footer className="border-t-2 border-ink px-4 py-2 text-[8px] leading-relaxed text-white/50">
          ESC or SPACE to close
        </footer>
      </PixelPanel>
    </div>
  );
}
