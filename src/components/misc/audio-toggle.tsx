"use client";

import { FC, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAudioEnabled, setAudioEnabled, playThock } from "~/lib/audio";
import { Button } from "../ui/button";

export const AudioToggle: FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEnabled(isAudioEnabled());
    setMounted(true);

    const onToggle = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setEnabled(customEvent.detail);
    };

    window.addEventListener("mr-sfx-toggle", onToggle);
    return () => window.removeEventListener("mr-sfx-toggle", onToggle);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    setAudioEnabled(next);
    if (next) {
      setTimeout(() => playThock(), 50);
    }
  };

  if (!mounted) return null;

  return (
    <Button
      variant="outline"
      size={compact ? "icon" : "default"}
      onClick={toggle}
      className="group relative h-9 border-border/70 bg-background/60 font-mono text-xs transition-colors hover:border-primary/60 hover:text-primary"
      title={enabled ? "Audio SFX is ON. Click to mute." : "Audio SFX is MUTED. Click to enable."}
    >
      {enabled ? (
        <Volume2 className="size-3.5 text-primary" />
      ) : (
        <VolumeX className="size-3.5 text-muted-foreground" />
      )}
      {!compact && (
        <span className="hidden sm:inline">
          sfx: <span className={enabled ? "text-primary font-medium" : "text-muted-foreground"}>{enabled ? "on" : "off"}</span>
        </span>
      )}
    </Button>
  );
};
