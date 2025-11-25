
import React, { createContext, useState, useContext, useMemo } from 'react';
import type { Language } from '../types';
import { getTranslator, translations } from '../lib/i18n';

type Translator = (key: keyof typeof translations.en) => string;

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Translator;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    
    const t = useMemo(() => getTranslator(language), [language]);

    const value = { language, setLanguage, t };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};