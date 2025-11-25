
import React from 'react';
import { CloseIcon, LoadingSpinner, WarningIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchPanelProps {
    result: string | null;
    error: string | null;
    isLoading: boolean;
    onClose: () => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ result, error, isLoading, onClose }) => {
    const { t } = useLanguage();

    const renderResult = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                    <LoadingSpinner className="w-8 h-8 text-indigo-400" />
                    <p className="mt-3">{t('searchingDocument')}</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-300 text-center p-4">
                    <WarningIcon className="w-10 h-10 mb-2"/>
                    <p className="font-bold">{t('errorTitle')}</p>
                    <p className="text-xs mt-1">{error}</p>
                </div>
            );
        }
        if (result) {
            const isNotFound = result === "I couldn’t find this information in your uploaded documents." || result === "No pude encontrar esta información en los documentos cargados.";
            return (
                 <div className={`bg-black/20 p-3 rounded-md ${isNotFound ? 'text-center text-gray-400' : ''}`}>
                    <p className="text-gray-200 whitespace-pre-wrap font-sans">{result}</p>
                </div>
            );
        }
        return (
             <div className="text-center text-gray-500 p-8">
                <p>{t('searchPanelPlaceholder')}</p>
            </div>
        );
    };

    return (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] bg-gray-900/70 backdrop-blur-md rounded-lg shadow-2xl border border-indigo-300/20 overflow-hidden animate-slide-in-right flex flex-col">
            <header className="flex justify-between items-center p-3 bg-black/20 border-b border-indigo-300/10 flex-shrink-0">
                <h3 className="text-xl font-bold text-white">{t('searchPanelTitle')}</h3>
                <button onClick={onClose} aria-label="Close panel" className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="overflow-y-auto p-4 text-sm">
               {renderResult()}
            </div>

            <style>{`
                @keyframes slide-in-right {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.4s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                }
            `}</style>
        </div>
    );
};
