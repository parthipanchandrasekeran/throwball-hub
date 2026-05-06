import Image from 'next/image';
import type { Team } from '@/lib/types';

type Size = 'xs' | 'sm' | 'md' | 'lg';

const SIZE_PX: Record<Size, number> = { xs: 32, sm: 44, md: 64, lg: 80 };
const RADIUS:  Record<Size, string> = { xs: 'rounded-md', sm: 'rounded-md', md: 'rounded-lg', lg: 'rounded-lg' };

const isDarkColor = (c: string) => c.toLowerCase() === '#1f1f1f';

/**
 * Renders a team's logo at a fixed square size when available, falling back
 * to a solid colored tile of the same size when team.logo_url is null.
 *
 * The fallback intentionally has no text — the team's name is rendered next
 * to it everywhere this is used, so an initial inside would just be redundant.
 *
 * Sizes:
 *   xs  20px  — schedule rows, tight inline contexts
 *   sm  28px  — standings table
 *   md  36px  — mini-standings cards, hero pile-up
 *   lg  56px  — bracket cards, future hero
 */
// Accept any object with the visual fields, so both Team and StandingsRow work.
type LogoFields = Pick<Team, 'name' | 'color' | 'logo_url' | 'short_name'>;

export function TeamLogo({ team, size = 'sm' }: { team: LogoFields; size?: Size }) {
  const px = SIZE_PX[size];

  if (!team.logo_url) {
    return (
      <span
        className={`inline-block shrink-0 ${RADIUS[size]}`}
        style={{
          width: px, height: px,
          background: team.color,
          boxShadow: isDarkColor(team.color)
            ? '0 0 0 1px rgba(255,255,255,0.18)'
            : '0 0 0 1px rgba(255,255,255,0.06)',
        }}
        aria-hidden
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 overflow-hidden bg-white border border-white/10 ${RADIUS[size]}`}
      style={{ width: px, height: px }}
    >
      <Image
        src={team.logo_url}
        alt={`${team.name} logo`}
        width={px * 2}
        height={px * 2}
        className="w-full h-full object-cover"
      />
    </span>
  );
}
