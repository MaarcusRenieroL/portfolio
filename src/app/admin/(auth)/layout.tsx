import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SITE } from "~/lib/content";

/** Sign-in and first-run setup: one centred card, nothing else to look at. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="admin-auth flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[22rem]">
        <div className="mb-6 flex items-center justify-between">
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[var(--fg)]">
            <span className="dot" aria-hidden="true" />
            {SITE.domain}
            <span className="rounded-full border border-[var(--line)] px-1.5 py-px font-mono text-[10px] font-normal text-[var(--fg-3)]">admin</span>
          </span>
          <Link href="/" className="inline-flex items-center gap-1 text-[12px] text-[var(--fg-3)] hover:text-[var(--fg)]">
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Site
          </Link>
        </div>
        {children}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-[var(--fg-3)]">Private area. Every sign-in needs the email link and your passkey or code.</p>
      </div>
    </main>
  );
}
