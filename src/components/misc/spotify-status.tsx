"use client";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { Progress } from "~/components/ui/progress";
import useSWR from "swr";
import Image from "next/image";
import { useEffect, useState } from "react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const SpotifyStatus = () => {
  const { data } = useSWR("/api/spotify", fetcher, { refreshInterval: 5000 });
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (data?.progress) {
      setLocalProgress(data.progress);
    }
  }, [data?.progress]);

  useEffect(() => {
    if (!data?.isPlaying) return;

    const interval = setInterval(() => {
      setLocalProgress(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.isPlaying]);

  const progressPercentage = data?.duration
    ? (localProgress / data.duration) * 100
    : 0;

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:text-green-500 transition-colors duration-500 text-sm">
          spotify
        </span>
      </HoverCardTrigger>

      <HoverCardContent className="w-72" align="start">
        {data?.isPlaying ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-start">
              <Image
                src={data.albumImageUrl}
                alt="Album cover"
                width={50}
                height={50}
                className="rounded"
              />
              <div className="flex flex-col min-w-0">
                <p className="font-medium truncate">{data.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {data.artist}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(localProgress)}</span>
              <Progress
                value={progressPercentage}
                className="h-1 bg-neutral-700 [&>div]:bg-green-500"
              />
              <span>{formatTime(data.duration)}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">not playing anything</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};
