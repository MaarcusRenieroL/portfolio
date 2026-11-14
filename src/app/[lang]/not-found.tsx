import { NotFoundView } from "~/components/site/error-views";
import { getSearchData } from "~/lib/site-content";

export default async function NotFound() {
  return <NotFoundView search={await getSearchData()} />;
}
