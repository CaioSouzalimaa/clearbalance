"use client";

import {
  createContext,
  useContext,
  useRef,
  useCallback,
  ReactNode,
} from "react";

interface TourContextValue {
  registerStartTour: (fn: () => void) => void;
  startTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  registerStartTour: () => {},
  startTour: () => {},
});

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const startTourRef = useRef<(() => void) | null>(null);

  const registerStartTour = useCallback((fn: () => void) => {
    startTourRef.current = fn;
  }, []);

  const startTour = useCallback(() => {
    startTourRef.current?.();
  }, []);

  return (
    <TourContext.Provider value={{ registerStartTour, startTour }}>
      {children}
    </TourContext.Provider>
  );
};
