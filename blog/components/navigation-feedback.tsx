"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationInFlight = useRef(false);

  useEffect(() => {
    navigationInFlight.current = false;
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isInternalNavigation(event)) {
        if (navigationInFlight.current) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        navigationInFlight.current = true;
        setIsNavigating(true);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

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
