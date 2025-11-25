
import React from 'react';
import type { Country, DataSetId } from '../types';
import { CloseIcon, SparklesIcon, LoadingSpinner, WarningIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface InfoPanelProps {
    country: Country;
    dataset: { id: DataSetId; name: string; unit: string; };
    analysis: string | null;
    analysisError: string | null;
    isLoading: boolean;
    onAnalyze: () => void;
    onClose: () => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ country, dataset, analysis, analysisError, isLoading, onAnalyze, onClose }) => {
    const { t } = useLanguage();
    const dataValue = country.data[dataset.id];

    const buttonText = isLoading 
        ? t('thinking')
        : t('generateAnalysis');

    return (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] bg-gray-900/70 backdrop-blur-md rounded-lg shadow-2xl border border-cyan-300/20 overflow-hidden flex flex-col animate-slide-in-right">
            {/* Header */}
            <header className="flex justify-between items-center p-3 bg-black/20 border-b border-cyan-300/10 flex-shrink-0">
                <h3 className="text-xl font-bold text-white">{country.name}</h3>
                <button onClick={onClose} aria-label="Close panel" className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            
            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto">
                {/* Data Value */}
                <div>
                    <p className="text-sm text-cyan-400 font-semibold uppercase tracking-wider">{dataset.name}</p>
                    <p className="text-4xl font-bold text-white">
                        {dataValue !== undefined ? new Intl.NumberFormat('en-US').format(dataValue) : 'N/A'}
                        <span className="text-lg font-normal text-gray-400 ml-2">{dataset.unit}</span>
                    </p>
                </div>
                
                {/* AI Interaction */}
                <div className="space-y-3">
                     <button
                        onClick={onAnalyze}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        <SparklesIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
                        {buttonText}
                    </button>
                </div>
                
                {/* Result Area */}
                <div className="h-48 bg-black/20 rounded-md p-3 overflow-y-auto text-sm">
                     {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <LoadingSpinner className="w-8 h-8 text-cyan-400" />
                            <p className="mt-3">{t('generatingResponse')}</p>
                        </div>
                    )}
                    {analysisError && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-red-300 text-center">
                            <WarningIcon className="w-10 h-10 mb-2"/>
                            <p className="font-bold">{t('errorTitle')}</p>
                            <p className="text-xs mt-1">{analysisError}</p>
                        </div>
                    )}
                    {analysis && !isLoading && (
                        <p className="text-gray-200 whitespace-pre-wrap font-sans">{analysis}</p>
                    )}
                    {!isLoading && !analysis && !analysisError && (
                        <div className="flex items-center justify-center h-full text-gray-500 text-center">
                            <p>{t('analysisPlaceholder')}</p>
                        </div>
                    )}
                </div>
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
