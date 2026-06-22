"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Music2Icon } from "lucide-react";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
};

const POLL_INTERVAL = 30_000;

export function SpotifyNowPlaying() {
  const [track, setTrack] = useState<NowPlaying | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/spotify");
        if (!response.ok) return;
        const data = (await response.json()) as NowPlaying;
        if (active) setTrack(data);
      } catch {
        // network hiccup — keep the last known state
      }
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const hasTrack = Boolean(track?.title);

  const content = (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden border border-border/60 bg-background/60 text-primary">
        {hasTrack && track?.albumImageUrl ? (
          <Image
            src={track.albumImageUrl}
            alt={track.album ?? "album art"}
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : (
          <Music2Icon className="size-4" />
        )}
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {track?.isPlaying ? (
            <>
              <Equalizer />
              now playing
            </>
          ) : hasTrack ? (
            "last played"
          ) : (
            "spotify"
          )}
        </span>

        <span className="mt-0.5 block truncate text-sm text-foreground">
          {hasTrack ? `${track?.title} — ${track?.artist}` : "not playing"}
        </span>
      </span>
    </div>
  );

  if (hasTrack && track?.songUrl) {
    return (
      <Link
        href={track.songUrl}
        target="_blank"
        rel="noreferrer"
        className="group block w-full border border-border/60 bg-card/35 p-3 transition-colors hover:border-primary/45 sm:w-64"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="w-full border border-border/60 bg-card/35 p-3 sm:w-64">
      {content}
    </div>
  );
}

function Equalizer() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="w-0.5 animate-equalizer bg-primary"
          style={{ animationDelay: `${bar * 150}ms` }}
        />
      ))}
    </span>
  );
}
