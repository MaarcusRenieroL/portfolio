"use client";

import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { useState, useEffect } from "react";
import { Progress } from "~/components/ui/progress";

const fetcher = (url: string) => {
  return fetch(url).then((response) => response.json());
}

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export const SpotifyPlayer = () => {
  const { data } = useSWR("/api/spotify", fetcher, {
    refreshInterval: 5000
  });

  const [localProgress, setLocalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (data?.progress && !isDragging) {
      setLocalProgress(data.progress);
    }
  }, [data?.progress, isDragging]);

  useEffect(() => {
    if (!data?.isPlaying) return;

    const interval = setInterval(() => {
      if (!isDragging && data.progress) {
        setLocalProgress(prev => prev + 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.isPlaying, data?.progress, isDragging]);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!data?.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newProgress = Math.floor(percentage * data.duration);
    
    setLocalProgress(newProgress);
    setIsDragging(false);
  };

  if (!data || !data.isPlaying) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-neutral-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Not listening to anything
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            Spotify • Paused
          </p>
        </div>
      </div>
    )
  }

  const progressPercentage = data.duration ? (localProgress / data.duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-2 p-3 rounded transition">
      <Link href={data.songUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
        <Image src={data.albumImageUrl} alt="album-cover" width={50} height={50} className="w-12 h-12 rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{data.title}</p>
          <p className="text-xs text-neutral-400 truncate">{data.artist}</p>
        </div>
      </Link>

      <div className="flex items-center gap-2 text-xs text-neutral-400">
        <span>{formatTime(localProgress)}</span>
        <div
          className="flex-1 cursor-pointer"
          onClick={handleSeek}
        >
          <Progress 
            value={progressPercentage} 
            className="h-1 bg-neutral-700 [&>div]:bg-green-500"
          />
        </div>
        <span>{formatTime(data.duration)}</span>
      </div>
    </div>
  )
}
