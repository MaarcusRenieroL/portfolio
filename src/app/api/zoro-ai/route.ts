import { NextResponse } from "next/server";
import { SITE, PROJECTS, ROLES, SKILLS, CERTIFICATES } from "~/lib/content";

const SYSTEM_PROMPT = `You are Zoro AI, the intelligent, sharp, and honorable portfolio assistant for Maarcus Reniero L.
You speak with the calm confidence and sharp loyalty of Roronoa Zoro, while providing extremely accurate, professional, and concise answers to recruiters, hiring managers, and engineers.

Core knowledge about Maarcus Reniero L:
- Role: Full Stack & Backend Engineer based in Chennai, India.
- Availability: Open to full-time remote opportunities (Germany / Global) and on-site / hybrid roles in Bangalore or Chennai.
- Core Stack: Go, TypeScript, Node.js, Next.js 16 App Router, PostgreSQL, Docker, AWS, Redis, Tailwind CSS v4.
- Flagship Projects:
  * "nyx": High-performance, modular backend framework written in Go and TypeScript with microservices architecture and zero-trust auth.
  * "next-kit": Production-grade starter for Next.js 16 with optimized server components, Tailwind v4, and security headers.
  * "portfolio": The current personal site built with Next.js 16, PostgreSQL CMS, passkey/WebAuthn auth, cookieless telemetry, and Zoro dark-green craft.
- Experience & Work:
  * Builds resilient backends, low-latency APIs, and database migrations. Experienced in Docker containerization, PostgreSQL optimization, and AWS deployments.
- Certifications: AWS Cloud Foundations, Udemy Modern React & Redux, Oracle Academy, and Git/GitHub collaboration.
- Contact: Email: ${SITE.email}, GitHub: ${SITE.github}, LinkedIn: ${SITE.linkedin}.
- Calendar: Visitors can book a technical intro call anytime using the built-in scheduler at /schedule.

Guidelines:
- Keep answers concise, factual, and direct (2 to 4 sentences or bullet points).
- Emphasize his strengths in backend scalability, Go/TypeScript systems, and database craft.
- If asked about hiring or meeting, invite them to book a call at /schedule or email ${SITE.email}.`;

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing message history" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.trim();

    // Fast-path intelligent fallback when GEMINI_API_KEY is not configured
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const lower = lastMessage.toLowerCase();
      let reply = "I am Zoro AI, Maarcus's portfolio companion. He is a full-stack & systems engineer specializing in Go, TypeScript, Next.js 16, PostgreSQL, and Docker. Ask me about his projects, tech stack, or book a call!";

      if (lower.includes("30s") || lower.includes("pitch") || lower.includes("summary") || lower.includes("who is")) {
        reply = "Maarcus Reniero L is a full-stack & backend engineer based in Chennai. He builds production-grade distributed backends, clean APIs, and modern frontends with Go, TypeScript, Next.js 16, PostgreSQL, and Docker. He is actively open for full-time remote roles.";
      } else if (lower.includes("stack") || lower.includes("tech") || lower.includes("skills")) {
        reply = "His primary swords are Go, TypeScript, Node.js, and Next.js 16 on the engineering side, backed by PostgreSQL, Redis, Docker, and AWS on the infrastructure side.";
      } else if (lower.includes("project") || lower.includes("nyx") || lower.includes("next-kit")) {
        reply = "His flagship systems include 'nyx' (a high-throughput modular backend framework in Go & TS) and 'next-kit' (a Next.js 16 production starter). Check the /projects page to see live code and architecture.";
      } else if (lower.includes("book") || lower.includes("call") || lower.includes("hire") || lower.includes("meeting")) {
        reply = "You can book a direct 15, 30, or 45-minute technical discussion with Maarcus right on this site at /schedule, or email him at " + SITE.email + ".";
      }

      return NextResponse.json({ reply });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: lastMessage }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`Gemini status ${res.status}`);
    }

    const json = await res.json();
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "I stand ready. How can I assist your review of Maarcus's engineering work?";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({
      reply: "Maarcus Reniero L is a full-stack & backend engineer specializing in Go, TypeScript, Next.js 16, and PostgreSQL. You can reach him directly at maarcusreniero.l@gmail.com or book a call at /schedule.",
    });
  }
}
