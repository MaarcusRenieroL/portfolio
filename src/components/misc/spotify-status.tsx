"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { Progress } from "~/components/ui/progress";
import useSWR from "swr";
import Image from "next/image";
import { useEffect, useState } from "react";
import { SPOTIFY_DATA } from "~/lib/types";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const SpotifyStatus = () => {
  const { data } = useSWR<SPOTIFY_DATA>("/api/spotify", fetcher, {
    refreshInterval: 5000,
    revalidateOnFocus: false,
  });

  const [baseProgress, setBaseProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(0);

  useEffect(() => {
    if (data?.progress != null) {
      setBaseProgress(data.progress);
      setLastUpdated(Date.now());
    }
  }, [data?.progress, data?.title, data?.isPlaying]);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      if (!data?.isPlaying) return;
      forceUpdate((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };

    if (data?.isPlaying) {
      raf = requestAnimationFrame(tick);
    }

    return () => cancelAnimationFrame(raf);
  }, [data?.isPlaying]);

  const currentProgress = (() => {
    if (!data?.duration) return 0;
    if (!data.isPlaying) return baseProgress;

    const elapsed = Date.now() - lastUpdated;
    const next = baseProgress + elapsed;

    return Math.max(0, Math.min(next, data.duration));
  })();

  const progressPercentage = data?.duration
    ? Math.min((currentProgress / data.duration) * 100, 100)
    : 0;

  if (!data) {
    return <div className="text-sm text-muted-foreground">loading...</div>;
  }

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-green-500 transition-colors duration-300 text-sm">
          spotify
        </span>
      </HoverCardTrigger>

      <HoverCardContent className="w-72" align="start">
        {data.isPlaying ?
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              {data.albumImageUrl ? (
                <Image
                  src={data.albumImageUrl}
                  alt="Album cover"
                  width={50}
                  height={50}
                  className="rounded"
                />
              ) : (
                <div className="w-[50px] h-[50px] bg-muted rounded" />
              )}

              <div className="flex flex-col min-w-0">
                <p className="font-medium truncate">{data.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {data.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(currentProgress)}</span>

              <Progress
                value={progressPercentage}
                className="h-1 bg-neutral-700 [&>div]:bg-green-500"
              />

              <span>{formatTime(data.duration)}</span>
            </div>
          </div>
          : <div>
            <p className="text-xs text-muted-foreground truncate">not playing</p>
          </div>
        }
      </HoverCardContent>
    </HoverCard>
  );
};
