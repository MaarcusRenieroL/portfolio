"use client";

import { useDict } from "~/components/site/locale";
import { Button } from "~/components/ui/button";

export function PrintButton() {
  const t = useDict().resume;
  return (
    <Button
      type="button"
      variant="outline"
      className="action"
      onClick={() => window.print()}
      data-track="resume-print"
    >
      {t.print}
    </Button>
  );
}
