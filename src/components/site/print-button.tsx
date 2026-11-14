"use client";

import { useDict } from "~/components/site/locale";

export function PrintButton() {
  const t = useDict().resume;
  return (
    <button type="button" className="action" onClick={() => window.print()} data-track="resume-print">
      {t.print}
    </button>
  );
}
