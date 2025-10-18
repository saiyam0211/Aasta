'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface VegModeContextType {
  vegOnly: boolean;
  setVegOnly: (value: boolean) => void;
  toggleVegMode: () => void;
  onVegModeToggle?: (callback: () => void) => void;
}

const VegModeContext = createContext<VegModeContextType | undefined>(undefined);

export function VegModeProvider({ children }: { children: React.ReactNode }) {
  const [vegOnly, setVegOnlyState] = useState(false);
  const [onVegModeToggle, setOnVegModeToggle] = useState<((callback: () => void) => void) | undefined>(undefined);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aasta_veg_mode');
      if (saved !== null) {
        setVegOnlyState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load veg mode from localStorage:', error);
    }
  }, []);

  // Save to localStorage when changed
  const setVegOnly = (value: boolean) => {
    setVegOnlyState(value);
    try {
      localStorage.setItem('aasta_veg_mode', JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save veg mode to localStorage:', error);
    }
  };

  const toggleVegMode = () => {
    setVegOnly(!vegOnly);
    // Trigger the toggle callback if set
    onVegModeToggle?.(() => {});
  };

  return (
    <VegModeContext.Provider value={{ vegOnly, setVegOnly, toggleVegMode, onVegModeToggle: setOnVegModeToggle }}>
      {children}
    </VegModeContext.Provider>
  );
}

export function useVegMode() {
  const context = useContext(VegModeContext);
  if (context === undefined) {
    throw new Error('useVegMode must be used within a VegModeProvider');
  }
  return context;
}
