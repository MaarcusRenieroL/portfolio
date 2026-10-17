import Link from "next/link";
import {
  ArrowUpRightIcon,
  MailIcon,
  MapPinnedIcon,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "~/components/icons";

import { SectionHeading } from "~/components/misc/section-heading";
import { CopyEmailButton } from "~/components/misc/copy-email-button";
import { MagneticCTA } from "~/components/misc/magnetic-cta";
import { ContactForm } from "~/components/sections/contact-form";

const contactLinks = [
  {
    label: "email",
    value: "maarcusreniero.l@gmail.com",
    href: "mailto:maarcusreniero.l@gmail.com",
    icon: MailIcon,
  },
  {
    label: "github",
    value: "github.com/maarcusrenierol",
    href: "https://github.com/maarcusrenierol",
    icon: GithubIcon,
  },
  {
    label: "linkedin",
    value: "linkedin.com/in/maarcus-reniero-l",
    href: "https://www.linkedin.com/in/maarcus-reniero-l",
    icon: LinkedinIcon,
  },
];

export default function ContactPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="05"
        title="contact"
        eyebrow="open channel"
        description="reach out for full-stack work, product builds, collaborations, or just a good technical conversation."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <aside className="relative overflow-hidden border border-border/60 bg-card/35 p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          />

          <div className="mb-4 flex items-center gap-2 font-mono text-xs text-primary">
            <MapPinnedIcon className="size-3.5" />
            <span>CHENNAI, INDIA</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            available for focused builds
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            best fit: frontend-heavy full-stack work, internal tools, saas
            workflows, project architecture, and product-minded implementation.
          </p>

          <div className="mt-5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-primary animate-pulse" />
            <span>open for focused builds · response &lt; 24h</span>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <MagneticCTA
              href="mailto:maarcusreniero.l@gmail.com?subject=portfolio%20contact"
            >
              <MailIcon className="size-4" />
              send direct email
            </MagneticCTA>
            <CopyEmailButton />
          </div>
        </aside>

        <ContactForm />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {contactLinks.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              className="group relative overflow-hidden grid gap-3 border border-border/60 bg-background/50 p-4 transition-all hover:border-primary/50 hover:bg-background/80 sm:grid-cols-[2.75rem_1fr_auto] sm:items-center"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
              />

              <span className="grid size-11 place-items-center border border-border/60 bg-card/45 text-primary">
                <Icon className="size-5" />
              </span>

              <span className="min-w-0">
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {link.label}
                </span>
                <span className="mt-0.5 block truncate text-sm font-medium text-foreground">
                  {link.value}
                </span>
              </span>

              <ArrowUpRightIcon className="size-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
