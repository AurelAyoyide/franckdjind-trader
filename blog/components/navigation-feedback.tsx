"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const NAVIGATION_TIMEOUT_MS = 12000;

function isInternalNavigation(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  const link = target.closest<HTMLAnchorElement>("a[href]");
  if (!link || link.target === "_blank" || link.hasAttribute("download")) {
    return false;
  }

  const destination = new URL(link.href, window.location.href);
  const current = new URL(window.location.href);

  return (
    destination.origin === current.origin &&
    (destination.pathname !== current.pathname || destination.search !== current.search)
  );
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const clearNavigationTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const stopNavigation = useCallback(() => {
    clearNavigationTimeout();
    setIsNavigating(false);
  }, [clearNavigationTimeout]);

  const startNavigation = useCallback(() => {
    clearNavigationTimeout();
    setIsNavigating(true);
    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;
      setIsNavigating(false);
    }, NAVIGATION_TIMEOUT_MS);
  }, [clearNavigationTimeout]);

  useEffect(() => {
    stopNavigation();
  }, [pathname, search, stopNavigation]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) {
        startNavigation();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        stopNavigation();
      }
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("pageshow", stopNavigation);
    window.addEventListener("popstate", stopNavigation);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("pageshow", stopNavigation);
      window.removeEventListener("popstate", stopNavigation);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearNavigationTimeout();
    };
  }, [clearNavigationTimeout, startNavigation, stopNavigation]);

  return (
    <div
      aria-hidden={!isNavigating}
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden transition-opacity ${
        isNavigating ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="navigation-progress h-full w-2/5 rounded-r-full bg-market shadow-[0_0_18px_rgba(23,201,133,0.9)]" />
    </div>
  );
}
