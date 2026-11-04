import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 80) || "Maarcus Reniero L";
  const subtitle = searchParams.get("subtitle")?.slice(0, 140) || "Full stack engineer · Java/Spring Boot · TypeScript/Next.js";

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, background: "#0b0b0b", color: "#ededed" }}>
        <div style={{ fontSize: 22, color: "#4ade80", fontWeight: 700, marginBottom: 24 }}>maarcus.dev</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02 }}>{title}</div>
        <div style={{ fontSize: 30, color: "#9a9a9a", marginTop: 24, maxWidth: 900 }}>{subtitle}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
