import { redirect } from "next/navigation";
import { adminExists } from "~/lib/server/auth";
import { hasDb } from "~/lib/server/db";
import { isAdmin } from "~/lib/server/session";
import { StartForm } from "../../_components/start-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  if (!hasDb()) return <div className="card"><h2>Unavailable</h2><p className="muted">The admin needs a database and none is configured.</p></div>;
  let exists = false;
  try {
    exists = await adminExists();
  } catch {
    return <div className="card"><h2>Unavailable</h2><p className="muted">The database is not reachable right now.</p></div>;
  }
  if (!exists && process.env.SETUP_TOKEN) redirect("/admin/setup");
  return <StartForm kind="login" />;
}
