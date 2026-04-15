"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    setOpacity(0);

    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setOpacity(1);
    }, 150);

    return () => clearTimeout(timeout);
  }, [pathname, children]);

  return (
    <div
      style={{
        transition: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        opacity,
        width: "100%"
      }}
    >
      {displayChildren}
    </div>
  );
};
