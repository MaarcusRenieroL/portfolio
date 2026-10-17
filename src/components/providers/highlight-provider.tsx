"use client";

import React, { createContext, useContext, useState } from "react";
import { playBlip } from "~/lib/audio";

interface HighlightContextType {
  hoveredSkill: string | null;
  setHoveredSkill: (skill: string | null) => void;
}

const HighlightContext = createContext<HighlightContextType>({
  hoveredSkill: null,
  setHoveredSkill: () => {},
});

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const [hoveredSkill, setHoveredSkillState] = useState<string | null>(null);

  const setHoveredSkill = (skill: string | null) => {
    setHoveredSkillState(skill);
    if (skill) {
      playBlip();
    }
  };

  return (
    <HighlightContext.Provider value={{ hoveredSkill, setHoveredSkill }}>
      {children}
    </HighlightContext.Provider>
  );
}

export function useHighlight() {
  return useContext(HighlightContext);
}
