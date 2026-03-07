"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar se o dispositivo está em modo mobile
 * @param query - Media query a ser verificada (padrão: "(max-width: 768px)" - breakpoint md do Tailwind)
 * @returns boolean indicando se a media query corresponde
 */
export function useMediaQuery(query: string = "(max-width: 768px)"): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Evitar erro no SSR
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    
    // Define o valor inicial
    setMatches(mediaQuery.matches);

    // Handler para mudanças
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Adiciona listener
    mediaQuery.addEventListener("change", handler);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
