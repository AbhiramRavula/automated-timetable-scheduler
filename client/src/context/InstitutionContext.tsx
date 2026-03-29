import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getInstitutions } from '../api';

interface Institution {
  _id: string;
  name: string;
  code: string;
}

interface InstitutionContextType {
  institutions: Institution[];
  activeInstitution: Institution | null;
  setActiveInstitution: (institution: Institution | null) => void;
  isLoading: boolean;
  refreshInstitutions: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [activeInstitution, setActiveInstitutionState] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshInstitutions = async () => {
    try {
      const data = await getInstitutions();
      setInstitutions(data);
      
      // Try to restore active institution from localStorage
      const savedId = localStorage.getItem('active_institution_id');
      if (savedId) {
        const found = data.find((inst: Institution) => inst._id === savedId);
        if (found) {
          setActiveInstitutionState(found);
        } else if (data.length > 0) {
          setActiveInstitution(data[0]);
        }
      } else if (data.length > 0) {
        setActiveInstitution(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveInstitution = (institution: Institution | null) => {
    setActiveInstitutionState(institution);
    if (institution) {
      localStorage.setItem('active_institution_id', institution._id);
    } else {
      localStorage.removeItem('active_institution_id');
    }
    // Optional: reload page to clear all other states when switching institutions
    // window.location.reload(); 
  };

  useEffect(() => {
    refreshInstitutions();
  }, []);

  return (
    <InstitutionContext.Provider value={{ 
      institutions, 
      activeInstitution, 
      setActiveInstitution, 
      isLoading,
      refreshInstitutions 
    }}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
};
