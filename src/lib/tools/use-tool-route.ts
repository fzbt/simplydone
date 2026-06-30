"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * Manages the currently active tool via the `?tool=` URL search param.
 * Falls back to null on the home view.
 */
export function useToolRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTool = searchParams.get("tool");

  const setTool = React.useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set("tool", id);
      } else {
        params.delete("tool");
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      // Scroll to top on tool change
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [router, pathname, searchParams]
  );

  return { activeTool, setTool };
}
