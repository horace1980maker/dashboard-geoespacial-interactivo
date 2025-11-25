import React from 'react';
import type { SelectedFeature } from '../types';
import { CloseIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface FeatureInfoPanelProps {
    data: SelectedFeature;
    onClose: () => void;
}

export const FeatureInfoPanel: React.FC<FeatureInfoPanelProps> = ({ data, onClose }) => {
    const { t, language } = useLanguage();
    const { properties } = data;

    const renderPropertyValue = (value: any): React.ReactNode => {
        if (value === null || value === undefined) {
            return '';
        }
        if (value instanceof Date) {
            return value.toLocaleDateString(language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }
        if (Array.isArray(value)) {
            return (
                <ul className="list-disc list-inside mt-1 space-y-1">
                    {value.map((item, index) => <li key={index}>{renderPropertyValue(item)}</li>)}
                </ul>
            )
        }
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value, null, 2);
            } catch {
                return '[Object]';
            }
        }
        return String(value);
    };

    const rawId = properties?.Id ?? properties?.id ?? properties?.ID;
    const featureId = rawId !== undefined && rawId !== null ? String(rawId).trim() : 'N/A';
    const featureName = String(properties?.name || properties?.Name || properties?.NAME || `${t('featureId')} ${featureId}`);

    return (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] bg-gray-900/70 backdrop-blur-md rounded-lg shadow-2xl border border-emerald-300/20 overflow-hidden flex flex-col animate-slide-in-right">
            <header className="flex justify-between items-start p-3 bg-black/20 border-b border-emerald-300/10 flex-shrink-0">
                <h3 className="text-xl font-bold text-white truncate" title={featureName}>{featureName}</h3>
                <button onClick={onClose} aria-label="Close panel" className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex-shrink-0 ml-2">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="p-4 overflow-y-auto">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-400 mb-2">{t('shapefileProperties')}</h4>
                <div className="bg-black/20 p-3 rounded-md space-y-2 text-sm font-mono">
                    {Object.keys(properties).length > 0 ? (
                        Object.entries(properties).map(([key, value]) => {
                            if (value === null || value === undefined || value === '') {
                                return null;
                            }
                            if (Array.isArray(value) && value.length === 0) {
                                return null;
                            }
                            
                            const renderedValue = renderPropertyValue(value);

                            return (
                                <div key={key} className="grid grid-cols-10 gap-2 items-start">
                                    <strong className="text-gray-400 truncate col-span-3" title={key}>{key}:</strong>
                                    <div className="text-white whitespace-pre-wrap break-all col-span-7">{renderedValue}</div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-gray-500">{t('noProperties')}</p>
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
