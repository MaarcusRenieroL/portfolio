import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          background: "#0a0a0a",
          color: "white",
        }}
      >
        <div style={{ fontSize: 60, fontWeight: 700 }}>
          Maarcus Reniero L
        </div>

        <div style={{ fontSize: 28, opacity: 0.7, marginTop: 20 }}>
          Full-stack developer building scalable systems
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
