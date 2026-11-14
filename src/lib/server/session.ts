import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, sessionValid } from "./auth";
import { hasDb } from "./db";

/** The one gate for every admin page, route handler and server action. Authority lives here, not in the proxy. */
export async function isAdmin(): Promise<boolean> {
  if (!hasDb()) return false;
  try {
    return await sessionValid((await cookies()).get(SESSION_COOKIE())?.value);
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
