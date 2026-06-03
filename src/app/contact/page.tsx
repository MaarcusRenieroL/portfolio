import Link from "next/link";
import {
  ArrowUpRightIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  MapPinnedIcon,
} from "lucide-react";

import { SectionHeading } from "~/components/misc/section-heading";
import { CopyEmailButton } from "~/components/misc/copy-email-button";

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
    value: "linkedin.com/maarcus-reniero-l",
    href: "https://www.linkedin.com/maarcus-reniero-l",
    icon: LinkedinIcon,
  },
];

const fitItems = [
  ["frontend-heavy builds", "next.js, react, tailwind, design systems"],
  ["full-stack product work", "api flows, validation, data, auth, delivery"],
  ["internal tools", "dashboards, workflows, admin surfaces, automation"],
  ["technical collaboration", "architecture review, debugging, pair builds"],
];

export default function ContactPage() {
  return (
    <section className="flex w-full flex-col gap-10">
      <SectionHeading
        index="06"
        title="contact"
        eyebrow="open channel"
        description="reach out for full-stack work, product builds, collaborations, or just a good technical conversation."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <aside className="border border-border/60 bg-card/35 p-5">
          <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinnedIcon className="size-4 text-primary" />
            chennai, india
          </div>

          <h2 className="text-2xl font-semibold">available for focused builds</h2>
          <p className="mt-4 text-sm leading-7 text-foreground/85">
            best fit: frontend-heavy full-stack work, internal tools, saas
            workflows, project architecture, and product-minded implementation.
          </p>

          <a
            href="mailto:maarcusreniero.l@gmail.com?subject=portfolio%20contact"
            className="mt-6 inline-flex h-10 items-center gap-2 border border-primary/50 bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <MailIcon className="size-4" />
            send email
          </a>
          <div className="mt-2">
            <CopyEmailButton />
          </div>
        </aside>

        <div className="grid gap-3">
          {contactLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="group grid gap-3 border border-border/60 bg-background/45 p-4 transition-colors hover:border-primary/45 sm:grid-cols-[2.75rem_1fr_auto] sm:items-center"
              >
                <span className="grid size-11 place-items-center border border-border/60 bg-card/45 text-primary">
                  <Icon className="size-5" />
                </span>

                <span>
                  <span className="block text-xs font-semibold text-muted-foreground">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-sm text-foreground">
                    {link.value}
                  </span>
                </span>

                <ArrowUpRightIcon className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {fitItems.map(([label, text]) => (
          <div
            key={label}
            className="border border-border/60 bg-card/35 p-4 transition-colors hover:border-primary/45"
          >
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>
    </section>
  );
}
