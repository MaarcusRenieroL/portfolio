import { notFound } from "next/navigation";
import { adminExists } from "~/lib/server/auth";
import { hasDb } from "~/lib/server/db";
import { StartForm } from "../../_components/start-form";

export const metadata = { title: "Setup" };

/** Exists only while there is no admin and a SETUP_TOKEN is configured; otherwise it is a plain 404. */
export default async function SetupPage() {
  if (!hasDb() || !process.env.SETUP_TOKEN) notFound();
  let exists = true;
  try {
    exists = await adminExists();
  } catch {
    notFound();
  }
  if (exists) notFound();
  return <StartForm kind="setup" />;
}
