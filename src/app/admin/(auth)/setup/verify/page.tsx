import { notFound } from "next/navigation";
import { adminExists } from "~/lib/server/auth";
import { hasDb } from "~/lib/server/db";
import { Wizard } from "../../../_components/wizard";

export const metadata = { title: "Finish setup" };

export default async function VerifySetup() {
  if (!hasDb() || !process.env.SETUP_TOKEN) notFound();
  try {
    if (await adminExists()) notFound();
  } catch {
    notFound();
  }
  return <Wizard kind="setup" />;
}
