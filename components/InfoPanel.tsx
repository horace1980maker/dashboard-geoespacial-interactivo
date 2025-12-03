import React from 'react';
import type { Country, DataSetId, Organization } from '../types';
import { CloseIcon, SparklesIcon, LoadingSpinner, WarningIcon, ArrowLeftIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';
import { COUNTRY_ORGANIZATIONS } from '../constants';

interface InfoPanelProps {
    country: Country;
    dataset: { id: DataSetId; name: string; unit: string; };
    analysis: string | null;
    analysisError: string | null;
    isLoading: boolean;
    onAnalyze: () => void;
    onClose: () => void;
    selectedOrg: Organization | null;
    onOrgSelect: (org: Organization | null) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
    country, dataset, analysis, analysisError, isLoading,
    onAnalyze, onClose, selectedOrg, onOrgSelect
}) => {
    const { t } = useLanguage();
    const dataValue = country.data[dataset.id];

    const organizations = COUNTRY_ORGANIZATIONS[country.id] || [];

    const handleOrgSelect = (org: Organization) => {
        onOrgSelect(org);
        onAnalyze(); // Trigger analysis when org is selected
    };

    const handleBack = () => {
        onOrgSelect(null);
    };

    return (
        <div className="absolute top-4 right-4 w-96 max-h-[calc(100%-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-slide-in-right z-[1000]">
            {/* Header */}
            <header className="flex justify-between items-center p-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                    {selectedOrg && (
                        <button onClick={handleBack} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                    )}
                    <h3 className="text-xl font-bold text-brand-accent">{country.name}</h3>
                </div>
                <button onClick={onClose} aria-label="Close panel" className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <CloseIcon className="w-5 h-5" />
                </button>
            </header>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {!selectedOrg ? (
                    // Organization Selection View
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-base mb-1">{dataset.name}</p>
                            <p className="text-4xl font-bold text-slate-900">
                                {dataValue !== undefined ? new Intl.NumberFormat('en-US').format(dataValue) : 'N/A'}
                                <span className="text-lg font-normal text-slate-500 ml-2">{dataset.unit}</span>
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Organizaciones PARES</h4>
                            <div className="space-y-2">
                                {organizations.map(org => (
                                    <button
                                        key={org.id}
                                        onClick={() => handleOrgSelect(org)}
                                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-brand-accent hover:bg-brand-accent/5 transition-all duration-200 group"
                                    >
                                        <div className="font-semibold text-slate-800 group-hover:text-brand-accent">{org.name}</div>
                                        {org.description && (
                                            <div className="text-xs text-slate-500 mt-1">{org.description}</div>
                                        )}
                                    </button>
                                ))}
                                {organizations.length === 0 && (
                                    <p className="text-sm text-slate-500 italic">No hay organizaciones registradas para este país.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Analysis / Insight Card View
                    <div className="space-y-4 h-full flex flex-col">
                        <div className="bg-brand-accent/10 p-3 rounded-lg border border-brand-accent/20">
                            <h4 className="font-bold text-brand-accent text-sm">{selectedOrg.name}</h4>
                            <p className="text-xs text-slate-600 mt-1">Generando tarjeta de conocimiento territorial...</p>
                        </div>

                        <div className="flex-1 bg-slate-50 rounded-md p-3 overflow-y-auto text-sm min-h-[300px]">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                                    <LoadingSpinner className="w-8 h-8 text-brand-base" />
                                    <p className="mt-3">{t('generatingResponse')}</p>
                                </div>
                            )}
                            {analysisError && !isLoading && (
                                <div className="flex flex-col items-center justify-center h-full text-red-500 text-center">
                                    <WarningIcon className="w-10 h-10 mb-2" />
                                    <p className="font-bold">{t('errorTitle')}</p>
                                    <p className="text-xs mt-1">{analysisError}</p>
                                </div>
                            )}
                            {analysis && !isLoading && (
                                <div className="prose prose-sm prose-slate max-w-none">
                                    <div
                                        className="font-sans text-slate-700"
                                        dangerouslySetInnerHTML={{ __html: analysis }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
