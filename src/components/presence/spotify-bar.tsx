"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";

interface TrackInfo {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
}

export function SpotifyBar() {
  const [track, setTrack] = useState<TrackInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchTrack = async () => {
      try {
        const res = await fetch("/api/presence/spotify");
        if (res.ok) {
          const data: TrackInfo = await res.json();
          if (!cancelled) setTrack(data);
        }
      } catch {
        /* ignore network failure */
      }
    };

    void fetchTrack();
    const interval = setInterval(fetchTrack, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (!track || !track.title) return null;

  return (
    <a
      href={track.songUrl || "https://open.spotify.com"}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2.5 rounded-full border border-neutral-800/80 bg-[#070b09]/90 px-3 py-1.5 text-xs text-neutral-300 transition-all duration-200 hover:border-emerald-500/40 hover:bg-neutral-900/90 hover:text-white hover:shadow-[0_0_15px_rgba(74,222,128,0.15)]"
      title={track.isPlaying ? `Currently playing: ${track.title} by ${track.artist}` : `Recently played: ${track.title}`}
    >
      {/* Animated Equalizer Waveform */}
      {track.isPlaying ? (
        <span className="flex h-3 w-3 items-end gap-0.5" aria-hidden="true">
          <span className="h-full w-0.5 rounded-full bg-emerald-400 animate-music-bar-1" />
          <span className="h-2/3 w-0.5 rounded-full bg-emerald-400 animate-music-bar-2" />
          <span className="h-5/6 w-0.5 rounded-full bg-emerald-400 animate-music-bar-3" />
        </span>
      ) : (
        <Music className="h-3 w-3 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
      )}

      <span className="max-w-[170px] truncate font-medium text-neutral-200 group-hover:text-emerald-300">
        {track.title}
      </span>
      {track.artist && (
        <span className="max-w-[110px] truncate text-neutral-500 hidden sm:inline">
          · {track.artist}
        </span>
      )}
    </a>
  );
}
