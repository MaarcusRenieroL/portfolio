"use client";

import * as m from "motion/react-m";
import { useLanyard } from "./use-lanyard";
import {
  AnimatedDiscordIcon,
  AnimatedSpotifyIcon,
} from "~/components/site/animated-icons";
import { AnimePowerup } from "~/components/ui/anime-powerup";
import { useDict } from "~/components/site/locale";
import { SITE } from "~/lib/site";

const CODE_APPS = new Set(["Visual Studio Code", "Code", "Neovim", "Cursor"]);

/**
 * Live Discord and Spotify presence via Lanyard. Nothing is assumed: until real
 * presence arrives (or if Lanyard is unreachable) the pills just link out, with
 * no status dot and no "online" claim.
 */
export function HeroPresence() {
  const presence = useLanyard();
  const t = useDict().presence;

  const status = presence?.discord_status;
  const activity =
    presence?.activities?.find((a) => CODE_APPS.has(a.name)) ??
    presence?.activities?.find((a) => a.type !== 4 && a.name !== "Spotify");

  const discordLabel = activity?.name ?? (status ? t.status[status] : "Discord");
  const discordTooltip = status
    ? `Discord · ${t.status[status]}${activity ? ` · ${activity.name}${activity.details ? ` · ${activity.details}` : ""}` : ""}`
    : "Discord";

  const track = presence?.listening_to_spotify ? presence.spotify : null;
  const spotifyTooltip = track ? t.listening(track.song, track.artist) : presence ? t.notListening : "Spotify";

  return (
    <div className="hero-presence">
      <AnimePowerup theme="discord" className="rounded-full">
        <m.a
          href={SITE.discord}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={discordTooltip}
          title={discordTooltip}
          className="presence-pill"
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring" as const, stiffness: 450, damping: 25 }}
        >
          {status && <span className={`presence-dot ${status}`} aria-hidden="true" />}
          <AnimatedDiscordIcon />
          <span className="presence-label">{discordLabel}</span>
        </m.a>
      </AnimePowerup>

      <AnimePowerup theme="spotify" className="rounded-full">
        <m.a
          href={
            track?.track_id ? `https://open.spotify.com/track/${track.track_id}` : SITE.spotify
          }
          target="_blank"
          rel="noopener noreferrer"
          aria-label={spotifyTooltip}
          title={spotifyTooltip}
          className="presence-pill"
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring" as const, stiffness: 450, damping: 25 }}
        >
          {track ? (
            <span className="flex h-3 w-3 items-end gap-0.5" aria-hidden="true">
              <span className="h-full w-0.5 rounded-full bg-[var(--green)] animate-music-bar-1" />
              <span className="h-2/3 w-0.5 rounded-full bg-[var(--green)] animate-music-bar-2" />
              <span className="h-5/6 w-0.5 rounded-full bg-[var(--green)] animate-music-bar-3" />
            </span>
          ) : (
            <AnimatedSpotifyIcon />
          )}
          <span className="presence-label">
            {track ? track.song : "Spotify"}
          </span>
        </m.a>
      </AnimePowerup>
    </div>
  );
}
