import { unstable_cache } from "next/cache";
import { query } from "./db";
import { r2Configured } from "./r2";

const names = unstable_cache(
  async () => (await query<{ pathname: string }>("select pathname from media where url like 'r2:%'")).rows.map((r) => r.pathname),
  ["media-r2-names"],
  { tags: ["content"], revalidate: 3600 },
);

/**
 * Library files stored in R2, so live content only points at the assets domain for files that are really there.
 * Cached with the content tag: every publish (the only time a file goes public) refreshes it. Empty without R2.
 */
export async function r2Names(): Promise<Set<string>> {
  if (!r2Configured()) return new Set();
  try {
    return new Set(await names());
  } catch {
    return new Set();
  }
}
