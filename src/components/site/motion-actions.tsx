"use client";

import Link from "next/link";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { AnimatedGithubIcon, AnimatedLinkedinIcon } from "~/components/site/animated-icons";
import { AnimePowerup, type AnimeTheme } from "~/components/ui/anime-powerup";

const springTransition = { type: "spring" as const, stiffness: 420, damping: 24 };

export function AnimatedSocial({
  href,
  label,
  ext = true,
  theme = "zoro",
  children,
}: {
  href: string;
  label: string;
  ext?: boolean;
  theme?: AnimeTheme;
  children: ReactNode;
}) {
  const content = (
    <m.span
      className="flex h-full w-full items-center justify-center"
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.92 }}
      transition={springTransition}
    >
      {children}
    </m.span>
  );

  return (
    <AnimePowerup theme={theme} className="rounded-[6px]">
      {ext ? (
        <a
          href={href}
          aria-label={label}
          // mailto: must not open a new tab (it leaves an empty one behind)
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noopener noreferrer"
          className="flex h-[30px] w-[30px] items-center justify-center"
        >
          {content}
        </a>
      ) : (
        <Link
          href={href}
          aria-label={label}
          className="flex h-[30px] w-[30px] items-center justify-center"
        >
          {content}
        </Link>
      )}
    </AnimePowerup>
  );
}

export function AnimatedActionLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className="inline-block mt-2">
      <m.div
        className={`action relative group flex items-center gap-2.5 h-9 px-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--green)]/50 hover:bg-[var(--hover)]/40 overflow-hidden text-xs font-mono text-[var(--fg-2)] hover:text-[var(--fg)] transition-colors duration-200 select-none shadow-sm ${className}`}
        initial="rest"
        whileHover="hover"
        whileTap={{ scale: 0.97 }}
      >
        {/* Shimmer sweep effect across the button */}
        <m.div
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[var(--green)]/15 to-transparent"
          variants={{
            rest: { x: "-100%" },
            hover: {
              x: "200%",
              transition: { duration: 0.65, ease: "easeInOut" },
            },
          }}
        />

        {/* Text */}
        <span className="relative z-10 font-medium group-hover:text-[var(--fg)] transition-colors">
          {children}
        </span>

        {/* Dynamic Arrow with spring propulsion */}
        <m.span
          className="relative z-10 inline-flex items-center text-[var(--green)]"
          variants={{
            rest: { x: 0 },
            hover: {
              x: 4,
              transition: { type: "spring", stiffness: 450, damping: 20 },
            },
          }}
          aria-hidden="true"
        >
          →
        </m.span>

        {/* Subtle Katana emerald bottom underline accent */}
        <m.div
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[var(--green)] to-transparent"
          variants={{
            rest: { scaleX: 0 },
            hover: {
              scaleX: 1,
              transition: { duration: 0.25, ease: "easeOut" },
            },
          }}
        />
      </m.div>
    </Link>
  );
}

export function AnimatedContactButtons({
  linkedin,
  github,
  sendHref,
  sendLabel,
}: {
  linkedin: string;
  github: string;
  sendHref: string;
  sendLabel: string;
}) {
  return (
    <div className="contact-links">
      <AnimePowerup theme="linkedin" className="rounded-[6px]">
        <m.a
          className="action"
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
        >
          <AnimatedLinkedinIcon width={13} height={13} />
          <span>LinkedIn</span>
          <span aria-hidden="true" className="text-[10px] opacity-70">↗</span>
        </m.a>
      </AnimePowerup>

      <AnimePowerup theme="github" className="rounded-[6px]">
        <m.a
          className="action"
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          initial="rest"
          whileHover="hover"
          whileTap={{ scale: 0.96 }}
          transition={springTransition}
        >
          <AnimatedGithubIcon width={13} height={13} />
          <span>GitHub</span>
          <span aria-hidden="true" className="text-[10px] opacity-70">↗</span>
        </m.a>
      </AnimePowerup>

      <AnimePowerup theme="zoro" className="rounded-[6px]">
        <Link href={sendHref} className="inline-block">
          <m.span
            className="action primary relative overflow-hidden"
            initial="rest"
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            transition={springTransition}
          >
            {/* Katana Light Sweep flare on primary button */}
            <m.span
              className="absolute inset-0 pointer-events-none"
              variants={{
                rest: { x: "-100%" },
                hover: { x: "100%" },
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
              }}
            />
            <span>{sendLabel}</span>
            <span aria-hidden="true">→</span>
          </m.span>
        </Link>
      </AnimePowerup>
    </div>
  );
}
