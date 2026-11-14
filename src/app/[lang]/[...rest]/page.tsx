import { notFound } from "next/navigation";

/** Any path that matches no page lands here, so it renders the styled 404 inside the layout with a real 404 status. */
export default function CatchAll(): never {
  notFound();
}
