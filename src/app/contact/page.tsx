import type { Metadata } from "next";
import { ContactForm } from "~/components/site/contact-form";
import { Linkedin, Mail, Code } from "~/components/site/icons";
import { Eyebrow } from "~/components/site/ui";
import { SITE } from "~/lib/content";

export const metadata: Metadata = { title: "Contact", description: "A role, a freelance project, a master's admission, or something you're building: I read every message." };

export default function ContactPage() {
  const chans = [
    { icon: <Mail width={20} height={20} />, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: <Linkedin width={20} height={20} />, label: "LinkedIn", value: "maarcus-reniero-l", href: SITE.linkedin },
    { icon: <Code width={20} height={20} />, label: "GitHub", value: "MaarcusRenieroL", href: SITE.github },
  ];
  return (
    <section className="section-sm">
      <div className="atmos" />
      <div className="wrap split" style={{ gap: 80, position: "relative" }}>
        <div className="stack" style={{ gap: 28 }}>
          <Eyebrow kanji="信" className="rise">Contact</Eyebrow>
          <h1 className="d-l wipe" style={{ animationDelay: "100ms" }}>Say hello.</h1>
          <p className="lead rise" style={{ animationDelay: "240ms" }}>A role, a freelance project, a master&apos;s admission, or something you&apos;re building: I read every message.</p>
          <div className="panel stack" style={{ gap: 6, padding: "16px 18px" }} data-reveal>
            <span className="label blade">Open to</span>
            <span className="small">{SITE.open}</span>
          </div>
          <div className="stack">
            {chans.map((c, i) => (
              <a key={c.label} className="chan" href={c.href} style={i === chans.length - 1 ? { borderBottom: "1px solid var(--line)" } : undefined} data-reveal>
                {c.icon}
                <span className="stack"><span className="label">{c.label}</span><span className="h4">{c.value}</span></span>
              </a>
            ))}
          </div>
          <span className="label">IST · UTC+5:30 · replies within [x] days</span>
        </div>
        <div className="card" style={{ padding: 40 }} data-reveal="right">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
