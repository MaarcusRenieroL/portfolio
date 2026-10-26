"use client";

import { FC } from "react";
import {
  DownloadIcon,
  MapPinnedIcon,
  ArrowRightIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { ScrambleText } from "../misc/scramble-text";
import { MagneticCTA } from "../misc/magnetic-cta";
import { Reveal } from "../misc/reveal";
import { SpotifyNowPlaying } from "../misc/spotify-now-playing";
import { DiscordPresence } from "../misc/discord-presence";

export const Header: FC = () => {
  return (
    <section className="hero-vignette relative isolate overflow-hidden pb-16 pt-14 sm:pt-20">
      {/* Background layers */}
      <div aria-hidden className="hero-glow grid-pulse absolute inset-0 -z-10" />

      {/* Animated radial orb */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(74,222,128,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Second orb offset */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 70% 60%, rgba(0,220,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="flex flex-col gap-12">
        {/* Hero Section */}
        <Reveal>
          <div className="flex flex-col gap-6">
            {/* Availability chip */}
            <div className="inline-flex w-fit items-center gap-2 border border-border/60 bg-card/50 px-3 py-1.5 font-mono text-[11px]">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />
                <span className="relative size-1.5 rounded-full bg-primary" />
              </span>
              <span className="text-muted-foreground">
                available for focused builds
              </span>
            </div>

            {/* Name and Title */}
            <div>
              <h1 className="text-6xl font-semibold leading-[1.02] tracking-tight sm:text-7xl md:text-8xl">
                <span className="block text-foreground/95">
                  <ScrambleText text="maarcus reniero l" />
                </span>
                <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-accent-foreground bg-clip-text text-transparent">
                  builds range.
                </span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
              full-stack engineer building product-minded web apps across frontend, backend, data, and tooling. strongest work: next.js, typescript, a local-first desktop launcher (nyx), a self-hosted life os, multi-tenant product architecture, internal tools, clean interfaces.
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPinnedIcon className="size-3.5 text-primary" />
                chennai, india
              </span>
              <span className="text-border">·</span>
              <span>full-stack engineer</span>
              <span className="text-border">·</span>
              <span>at ust healthproof</span>
            </div>

            {/* CTAs */}
            <div className="mt-4 flex flex-wrap gap-3">
              <MagneticCTA href="/projects">
                see the work
                <ArrowRightIcon className="size-4" />
              </MagneticCTA>
              <MagneticCTA href="/resume" variant="ghost">
                <DownloadIcon className="size-4" />
                resume
              </MagneticCTA>
            </div>

            {/* Live Strip - Presence */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <SpotifyNowPlaying />
              <DiscordPresence />
            </div>
          </div>
        </Reveal>

        {/* Stats Section */}
        <Reveal delay={0.1}>
          <div className="grid gap-4 border-t border-border/60 pt-12 md:grid-cols-3">
            <div className="border border-border/60 bg-card/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                focus
              </p>
              <p className="mt-2 text-base leading-7 text-foreground">
                product-focused full-stack development
              </p>
            </div>
            <div className="border border-border/60 bg-card/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                daily stack
              </p>
              <p className="mt-2 text-base leading-7 text-foreground">
                typescript, next.js, react, spring boot, sql
              </p>
            </div>
            <div className="border border-border/60 bg-card/40 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                looking for
              </p>
              <p className="mt-2 text-base leading-7 text-foreground">
                frontend-heavy full-stack roles, internal tools, then a masters in ai, cloud, and security
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
