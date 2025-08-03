'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AgeGateContextType = {
  is21: boolean | null;
  setIs21: (value: boolean) => void;
};

const AgeGateContext = createContext<AgeGateContextType | undefined>(undefined);

export const AgeGateProvider = ({ children }: { children: React.ReactNode }) => {
  const [is21, setIs21State] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('is21');
    if (stored !== null) {
      setIs21State(JSON.parse(stored));
    }
  }, []);

  const setIs21 = (value: boolean) => {
    localStorage.setItem('is21', JSON.stringify(value));
    setIs21State(value);
  };

  return (
    <AgeGateContext.Provider value={{ is21, setIs21 }}>
      {children}
    </AgeGateContext.Provider>
  );
};

export const useAgeGate = () => {
  const context = useContext(AgeGateContext);
  if (!context) throw new Error('useAgeGate must be used within AgeGateProvider');
  return context;
};
