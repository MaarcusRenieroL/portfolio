"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleUserIcon } from "lucide-react";

import { cn } from "~/lib/utils";

type Presence = {
  status: "online" | "idle" | "dnd" | "offline";
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  activity?: { name: string; details: string; state: string } | null;
};

const POLL_INTERVAL = 30_000;

const statusLabel: Record<Presence["status"], string> = {
  online: "online",
  idle: "idle",
  dnd: "do not disturb",
  offline: "offline",
};

const statusColor: Record<Presence["status"], string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  dnd: "bg-rose-500",
  offline: "bg-muted-foreground",
};

export function DiscordPresence() {
  const [presence, setPresence] = useState<Presence | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/discord");
        if (!response.ok) return;
        const data = (await response.json()) as Presence;
        if (active) setPresence(data);
      } catch {
        // keep the last known state on a network hiccup
      }
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const status = presence?.status ?? "offline";
  const name = presence?.displayName ?? "discord";
  const secondary = presence?.activity?.name ?? name;

  return (
    <div className="flex items-center gap-3 border border-border/60 bg-card/35 p-3">
      <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden border border-border/60 bg-background/60 text-primary">
        {presence?.avatarUrl && !avatarFailed ? (
          <Image
            src={presence.avatarUrl}
            alt={`${name} avatar`}
            width={36}
            height={36}
            className="size-full object-cover"
            unoptimized
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <CircleUserIcon className="size-4" />
        )}

        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-card",
            statusColor[status],
          )}
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {statusLabel[status]}
        </span>
        <span className="mt-0.5 block truncate text-sm text-foreground">
          {secondary}
        </span>
      </span>
    </div>
  );
}
