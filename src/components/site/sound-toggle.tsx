"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useDict } from "~/components/site/locale";
import { Button } from "~/components/ui/button";
import { SOUND_EVENT, soundEngine } from "~/lib/sound";

/** Header sound switch. Stays in sync when sound is toggled from the command palette. */
export function SoundToggle() {
  const t = useDict().chrome;
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(soundEngine?.isEnabled() ?? false);
    sync();
    window.addEventListener(SOUND_EVENT, sync);
    return () => window.removeEventListener(SOUND_EVENT, sync);
  }, []);

  const label = on ? t.soundOff : t.soundOn;
  return (
    <Button type="button" variant="ghost" size="icon" className="sound-toggle" aria-pressed={on} aria-label={label} title={label} onClick={() => soundEngine?.toggle()}>
      {on ? <Volume2 className="h-3.5 w-3.5 text-[var(--green)]" /> : <VolumeX className="h-3.5 w-3.5" />}
    </Button>
  );
}
