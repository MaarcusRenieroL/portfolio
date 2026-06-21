import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title")?.slice(0, 80) || "maarcus reniero l";
  const subtitle =
    searchParams.get("subtitle")?.slice(0, 140) ||
    "full-stack developer building scalable systems";

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
        <div style={{ fontSize: 60, fontWeight: 700 }}>{title}</div>

        <div style={{ fontSize: 28, opacity: 0.7, marginTop: 20 }}>
          {subtitle}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 40,
            fontSize: 22,
            opacity: 0.5,
          }}
        >
          maarcus.dev
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
