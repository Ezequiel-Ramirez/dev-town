import { profile, stations } from '@/content/portfolio.config';
import { newTabProps } from '../atoms/PixelButton';

interface Props {
  active: boolean;
  onClose: () => void;
}

/**
 * The whole portfolio as plain, semantic HTML.
 *
 * It is always in the DOM: hidden it serves screen readers and search engines,
 * visible it is the escape hatch for anyone who does not want to play.
 */
export function TextMode({ active, onClose }: Props) {
  return (
    <div
      className={
        active
          ? 'fixed inset-0 z-50 overflow-y-auto bg-night px-4 py-6 sm:px-8'
          : 'sr-only'
      }
    >
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3">
          <h1 className="text-lg leading-relaxed text-accent">{profile.name}</h1>
          <p className="text-[10px] leading-loose">{profile.role}</p>
          <p className="text-[10px] leading-loose text-white/70">{profile.location}</p>
          <ul className="flex flex-wrap gap-4 text-[10px]">
            <li>
              <a className="text-accent underline underline-offset-4" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
            </li>
            <li>
              <a
                className="text-accent underline underline-offset-4"
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                className="text-accent underline underline-offset-4"
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                className="text-accent underline underline-offset-4"
                href={profile.cvUrl}
                {...newTabProps(profile.cvUrl)}
              >
                Download CV
              </a>
            </li>
          </ul>
          {active ? (
            <button
              type="button"
              onClick={onClose}
              className="pixel-btn mt-4 text-[10px]"
              autoFocus
            >
              {'<< BACK TO THE GAME'}
            </button>
          ) : null}
        </header>

        {stations.map((station) => (
          <section key={station.id} className="space-y-4">
            <h2 className="text-[12px] leading-relaxed text-accent">{station.title}</h2>
            {station.dialog.map((line) => (
              <p key={line} className="text-[9px] leading-loose text-white/70">
                {line}
              </p>
            ))}

            <ul className="space-y-4">
              {station.entries.map((entry) => (
                <li key={entry.title} className="border-2 border-panelLight p-4">
                  <h3 className="text-[10px] leading-relaxed">
                    {entry.href ? (
                      <a
                        className="text-accent underline underline-offset-4"
                        href={entry.href}
                        {...newTabProps(entry.href)}
                      >
                        {entry.title}
                      </a>
                    ) : (
                      entry.title
                    )}
                  </h3>
                  {entry.meta ? (
                    <p className="mt-2 text-[8px] leading-loose text-white/60">{entry.meta}</p>
                  ) : null}
                  {entry.description ? (
                    <p className="mt-2 text-[9px] leading-loose text-white/80">
                      {entry.description}
                    </p>
                  ) : null}
                  {entry.tags?.length ? (
                    <p className="mt-2 text-[8px] leading-loose text-white/60">
                      {entry.tags.join(' · ')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
