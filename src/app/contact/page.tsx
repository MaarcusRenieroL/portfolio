import type { Metadata } from "next";
import { ContactForm } from "~/components/site/contact-form";
import { SITE } from "~/lib/content";

export const metadata: Metadata = { title: "Contact", description: "A role, a freelance project, or something you're building: I read every message." };

export default function ContactPage() {
  return (
    <div className="wrap page">
      <header className="stack g24">
        <h1 className="title">Say hello.</h1>
        <p className="lead">A role, a freelance project, or something you&apos;re building: I read every message.</p>
        <p className="muted">{SITE.open}</p>
      </header>

      <dl className="facts">
        <div>
          <dt>Email</dt>
          <dd>
            <a className="link" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </dd>
        </div>
        <div>
          <dt>LinkedIn</dt>
          <dd>
            <a className="link" href={SITE.linkedin} rel="noopener noreferrer">
              maarcus-reniero-l
            </a>
          </dd>
        </div>
        <div>
          <dt>GitHub</dt>
          <dd>
            <a className="link" href={SITE.github} rel="noopener noreferrer">
              MaarcusRenieroL
            </a>
          </dd>
        </div>
      </dl>

      <ContactForm />
    </div>
  );
}
