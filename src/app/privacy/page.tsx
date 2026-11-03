import type { Metadata } from "next";
import { Eyebrow } from "~/components/site/ui";

export const metadata: Metadata = { title: "Privacy", description: "No tracking cookies, no ads, no accounts. The only personal data is what you type into the contact form." };

export default function PrivacyPage() {
  return (
    <>
      <header className="section-sm" style={{ paddingBottom: 40 }}>
        <div className="atmos" />
        <div className="wrap-narrow stack" style={{ gap: 20, position: "relative" }}>
          <Eyebrow kanji="秘" className="rise">Privacy · updated [date]</Eyebrow>
          <h1 className="h1 wipe">Privacy</h1>
          <p className="lead rise">Short version: no tracking cookies, no ads, no accounts. The only personal data this site handles is what you type into the contact form.</p>
        </div>
      </header>
      <section style={{ paddingBottom: 112 }}>
        <div className="wrap-narrow">
          <div className="facts" data-reveal>
            <div><span className="label">Cookies</span><span className="h4">None for tracking</span><span className="small">Only your theme choice, saved in your browser.</span></div>
            <div><span className="label">Analytics</span><span className="h4">Vercel Web Analytics</span><span className="small">Cookieless, aggregate page views only.</span></div>
            <div><span className="label">Contact form</span><span className="h4">Sent by email</span><span className="small">Delivered through Resend to my inbox.</span></div>
          </div>
          <article className="prose">
            <h2 style={{ marginTop: 0 }}>What the contact form collects</h2>
            <p>Your name, email, optional company or university, the reason you picked and your message. I use it only to reply to you.</p>
            <h2>Who processes it</h2>
            <p>The form is sent through <strong>Resend</strong>, an email delivery service, and lands in my Gmail inbox. The site is hosted on <strong>Vercel</strong>, which keeps standard server logs.</p>
            <h2>Analytics</h2>
            <p>I use Vercel Web Analytics to count page views and see which pages are useful. It sets no cookies and doesn&apos;t build a profile of you; I only see aggregate numbers like visits per page, country and device type.</p>
            <h2>How long it&apos;s kept</h2>
            <p>I keep messages as long as the conversation is useful, and delete them when you ask.</p>
            <h2>Your rights</h2>
            <p>You can ask to see, correct or delete anything you&apos;ve sent me. Email <a href="mailto:maarcusreniero.l@gmail.com">maarcusreniero.l@gmail.com</a>.</p>
            <h2>Who runs this site</h2>
            <p>Maarcus Reniero L, Chennai, India. This is a personal, non-commercial site.</p>
          </article>
        </div>
      </section>
    </>
  );
}
