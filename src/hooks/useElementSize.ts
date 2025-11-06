import { useCallback, useLayoutEffect, useRef, useState } from "react";

export const useElementSize = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const observer = useRef<ResizeObserver>();

  const cleanup = useCallback(() => {
    if (observer.current) {
      observer.current.disconnect();
      observer.current = undefined;
    }
  }, []);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return cleanup;
    }
    observer.current = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.current.observe(element);
    return cleanup;
  }, [cleanup]);

  return { ref, size };
};
