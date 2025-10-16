import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import translations from '../localization/index.js';
import type { Language } from '../types.ts';

interface LocalizationContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: Record<string, string>) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');

    useEffect(() => {
        try {
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage === 'en' || savedLanguage === 'nl') {
                setLanguageState(savedLanguage);
            }
        } catch (error) {
            console.error("Failed to parse language from localStorage", error);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    }

    const t = useCallback((key: string, replacements: Record<string, string> = {}) => {
        const langDict = translations[language] as Record<string, string> | undefined;
        const fallbackDict = translations['en'] as Record<string, string>;

        let translation = (langDict && langDict[key]) || fallbackDict[key] || key;
        
        Object.keys(replacements).forEach(placeholder => {
            translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
        });
        
        return translation;
    }, [language]);

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextType => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};