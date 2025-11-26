
import React from 'react';
import { GlobeIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="flex items-center px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
            <GlobeIcon className="w-8 h-8 text-brand-accent mr-3" />
            <h1 className="text-xl md:text-2xl font-bold text-brand-accent tracking-tight mr-auto">
                {t('appTitle')}
            </h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === 'en' ? 'bg-brand-base text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    aria-pressed={language === 'en'}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('es')} 
                    className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${language === 'es' ? 'bg-brand-base text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                    aria-pressed={language === 'es'}
                >
                    ES
                </button>
            </div>
        </header>
    );
};