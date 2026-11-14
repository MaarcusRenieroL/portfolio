"use client";

import { useEffect, useState } from "react";
import { Zap, ShieldAlert, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "~/components/ui/button";

const MAX_TOKENS = 10;
const REFILL_INTERVAL_MS = 1500;

export function RateLimiterDemo() {
  const [tokens, setTokens] = useState(MAX_TOKENS);
  const [status, setStatus] = useState<"ready" | "ok" | "limited">("ready");
  const [logs, setLogs] = useState<Array<{ id: number; status: number; text: string; time: string }>>([
    { id: 1, status: 200, text: "Initial bucket capacity ready (10/10 tokens)", time: "00:00:01" },
  ]);

  // Token Bucket continuous refill loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTokens((prev) => {
        if (prev < MAX_TOKENS) return prev + 1;
        return prev;
      });
    }, REFILL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  const handleRequest = () => {
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false });
    const logId = Date.now();

    if (tokens > 0) {
      setTokens((prev) => prev - 1);
      setStatus("ok");
      setLogs((prev) => [
        {
          id: logId,
          status: 200,
          text: `HTTP 200 OK · Token consumed (${tokens - 1}/${MAX_TOKENS} remaining)`,
          time: nowTime,
        },
        ...prev.slice(0, 4),
      ]);
    } else {
      setStatus("limited");
      setLogs((prev) => [
        {
          id: logId,
          status: 429,
          text: "HTTP 429 Too Many Requests · Rate limit exceeded (Retry-After: 2s)",
          time: nowTime,
        },
        ...prev.slice(0, 4),
      ]);
    }
  };

  const handleReset = () => {
    setTokens(MAX_TOKENS);
    setStatus("ready");
  };

  const percentage = (tokens / MAX_TOKENS) * 100;

  return (
    <div className="w-full rounded-xl border border-emerald-500/20 bg-[#060a08]/90 p-5 shadow-lg backdrop-blur-md text-neutral-100 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span className="font-semibold text-white tracking-wide">
            Live Rate Limiter Micro-Lab
          </span>
        </div>
        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
          <span>Algorithm: Token Bucket</span>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 hover:text-white transition-colors"
            title="Reset Tokens"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Visual Token Gauge */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[11px]">
          <span className="text-neutral-400">Available Bucket Tokens:</span>
          <span className={`font-bold ${tokens === 0 ? "text-red-400" : "text-emerald-400"}`}>
            {tokens} / {MAX_TOKENS}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              tokens === 0 ? "bg-red-500" : "bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handleRequest}
          className="gap-2"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Fire Request</span>
        </Button>
        <span className="text-[11px] text-neutral-400">
          Refills +1 token every 1.5s
        </span>
      </div>

      {/* Status Output Console */}
      <div className="rounded-lg border border-neutral-800 bg-[#040605] p-3 space-y-1.5 text-[11px]">
        <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
          Server Response Stream
        </div>
        {logs.map((log) => (
          <div key={log.id} className="flex items-center gap-2">
            <span className="text-neutral-400">{log.time}</span>
            {log.status === 200 ? (
              <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="h-3 w-3 text-red-400 shrink-0" />
            )}
            <span className={log.status === 200 ? "text-neutral-300" : "text-red-300"}>
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
