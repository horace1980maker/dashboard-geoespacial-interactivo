
import React from 'react';
import { GlobeIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

export const Header: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="flex items-center p-4 bg-gray-800 border-b border-gray-700 shadow-md">
            <GlobeIcon className="w-8 h-8 text-cyan-400 mr-3" />
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mr-auto">
                {t('appTitle')}
            </h1>
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    aria-pressed={language === 'en'}
                >
                    EN
                </button>
                <button 
                    onClick={() => setLanguage('es')} 
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${language === 'es' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    aria-pressed={language === 'es'}
                >
                    ES
                </button>
            </div>
        </header>
    );
};