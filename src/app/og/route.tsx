import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.slice(0, 80) || "Maarcus Reniero L";
  const subtitle = searchParams.get("subtitle")?.slice(0, 140) || "Full stack engineer · Java/Spring Boot · TypeScript/Next.js";

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 72, background: "#050A07", color: "#E7F1EA", position: "relative" }}>
        <div style={{ position: "absolute", left: -40, right: -40, top: 360, height: 3, background: "#C8F031", transform: "rotate(-14deg)", boxShadow: "0 0 24px #3FB950" }} />
        <div style={{ fontSize: 22, letterSpacing: 4, color: "#3FB950", textTransform: "uppercase", marginBottom: 24 }}>maarcus.dev</div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02 }}>{title}</div>
        <div style={{ fontSize: 30, color: "#A3BBAA", marginTop: 24, maxWidth: 900 }}>{subtitle}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
