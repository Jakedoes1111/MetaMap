"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export const useStoreHydration = () => {
  const hasHydrated = useStore((state) => state.hasHydrated);
  useEffect(() => {
    if (!hasHydrated) {
      useStore.persist.rehydrate();
    }
  }, [hasHydrated]);

  return hasHydrated;
};

