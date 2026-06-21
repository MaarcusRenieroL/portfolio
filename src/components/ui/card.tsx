import * as React from "react";

import { cn } from "~/lib/utils";

/**
 * shared surface used across the site. defaults to the standard bordered
 * panel (`border border-border/60 bg-card/35`); pass `className` to adjust
 * padding, hover, or layout per usage.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("border border-border/60 bg-card/35", className)}
      {...props}
    />
  );
}

export { Card };
