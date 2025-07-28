"use client";

import useSWR from "swr";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "online": return "bg-green-500";
    case "idle": return "bg-yellow-500";
    case "dnd": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case "online": return "Online";
    case "idle": return "Idle";
    case "dnd": return "Do Not Disturb";
    default: return "Offline";
  }
};

export const DiscordStatus = () => {
  const { data, error } = useSWR("/api/discord", fetcher, {
    refreshInterval: 30000,
  });

  if (error || !data?.result || data?.error) return null;

  const { status, user, activities } = data.result;
  console.log(user)
  const activity = activities?.[0];

  return (
    <HoverCard openDelay={50} closeDelay={50}>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer text-sm hover:text-green-500 transition-colors duration-500">discord</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Discord Avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-neutral-400" />
                </div>
              )}
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${getStatusColor(status)}`}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {user?.username ?? "Unknown"}
              </p>
              <p className="text-xs text-muted-foreground">{user?.tag}</p>
              <p className="text-xs text-muted-foreground">{getStatusText(status)}</p>
            </div>
          </div>

          {activity && (
            <div className="flex gap-3 items-center">
              {activity.assets?.large_image && (
                <Image
                  src={
                    activity.assets.large_image.startsWith("mp:external")
                      ? `https://media.discordapp.net/${activity.assets.large_image.replace("mp:", "")}`
                      : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`
                  }
                  alt="Activity"
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.name}</p>
                {activity.state && (
                  <p className="text-xs text-muted-foreground">
                    {activity.state}
                  </p>
                )}
                {activity.details && (
                  <p className="text-xs text-muted-foreground italic">
                    {activity.details}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Guild: <span className="text-foreground font-medium">{user.guild}</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
