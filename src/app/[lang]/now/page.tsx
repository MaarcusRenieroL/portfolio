import type { Metadata } from "next";
import Link from "next/link";
import { Terminal, BookOpen, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export const metadata: Metadata = {
  title: "Now · Maarcus Reniero L",
  description: "What I'm currently building, reading, and exploring at this point in time.",
};

export default function NowPage() {
  return (
    <div className="wrap page py-10 space-y-8">
      {/* Editorial Header */}
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="zoro">NOW</Badge>
          <span className="text-xs text-neutral-400 font-mono">
            Inspired by Derek Sivers&apos; /now movement
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          What I&apos;m Focused On Right Now
        </h1>
        <p className="text-sm text-neutral-400 max-w-xl leading-relaxed">
          A living snapshot of my current engineering projects, books, topics of research, and career availability.
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 pt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Last updated: November 2026 · Chennai, IN</span>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Building */}
        <Card className="border-emerald-500/20 bg-[#080d0a]/90">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Actively Building</CardTitle>
              <p className="text-xs text-neutral-400">High-throughput backend systems</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
            <p>
              Architecting <strong className="text-white">Nyx</strong>, a modular backend framework combining Go microservices with TypeScript consumers, focused on sub-20ms P99 latencies and zero-trust authentication.
            </p>
            <p>
              Polishing <strong className="text-white">next-kit</strong>, an production-ready Next.js 16 starter utilizing cutting-edge server components, caching primitives, and strict security headers.
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Reading & Studying */}
        <Card className="border-emerald-500/20 bg-[#080d0a]/90">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Reading & Deep Dives</CardTitle>
              <p className="text-xs text-neutral-400">Systems and database internals</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-neutral-300 leading-relaxed">
            <div className="rounded-md border border-neutral-800 bg-[#060a08] p-2.5">
              <div className="font-semibold text-white">Designing Data-Intensive Applications</div>
              <div className="text-[11px] text-neutral-400">By Martin Kleppmann · Replication, partitioning & consensus</div>
            </div>
            <div className="rounded-md border border-neutral-800 bg-[#060a08] p-2.5">
              <div className="font-semibold text-white">Database Internals</div>
              <div className="text-[11px] text-neutral-400">By Alex Petrov · B-Trees, LSM-Trees & distributed storage</div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Exploring */}
        <Card className="border-emerald-500/20 bg-[#080d0a]/90">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Exploring & Experimenting</CardTitle>
              <p className="text-xs text-neutral-400">Emerging infrastructure tech</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
            <p>
              Experimenting with <strong className="text-white">eBPF network tracing</strong> for lightweight API observability without sidecar proxy overhead.
            </p>
            <p>
              Implementing distributed consensus algorithms (Raft) in Go to deeply understand leader election and log compaction mechanisms.
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Location & Availability */}
        <Card className="border-emerald-500/20 bg-[#080d0a]/90">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Availability & Location</CardTitle>
              <p className="text-xs text-neutral-400">Open to opportunities</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-neutral-300 leading-relaxed">
            <p>
              Living in <strong className="text-white">Chennai, India (IST)</strong>. Actively interviewing for Full-Stack and Backend Engineering roles:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-neutral-400">
              <li>Full-time Remote roles worldwide (Germany, EU, US, Global).</li>
              <li>On-site or hybrid opportunities in Bangalore and Chennai.</li>
            </ul>
            <div className="pt-1">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <span>Book an intro discussion on my calendar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
