import { permanentRedirect } from "next/navigation";
import { localePath } from "~/lib/i18n";
import { langOf } from "~/lib/lang";

/** The Stack page was merged into Skills; old links keep working. */
export default async function StackPage({ params }: { params: Promise<{ lang: string }> }): Promise<never> {
  permanentRedirect(localePath(await langOf(params), "/skills"));
}
