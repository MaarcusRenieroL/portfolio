"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A piece of filter state that mirrors a URL query param (?q=spring), so a
 * filtered view can be shared. The first render matches the server HTML; the
 * param is applied right after mount. History is replaced, not pushed.
 */
export function useQueryState(key: string, initial = "") {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get(key);
    if (fromUrl) setValue(fromUrl);
  }, [key]);

  const set = useCallback(
    (next: string) => {
      setValue(next);
      const url = new URL(window.location.href);
      if (next && next !== initial) url.searchParams.set(key, next);
      else url.searchParams.delete(key);
      window.history.replaceState(window.history.state, "", url);
    },
    [key, initial],
  );

  return [value, set] as const;
}
