
import React, { useState } from 'react';
import type { DataSet, DataSetId, CustomLayer } from '../types';
import { DataIcon, UploadIcon, LoadingSpinner, WarningIcon, TrashIcon, LayerIcon, SearchIcon } from './icons';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
    datasets: DataSet[];
    selectedDatasetId: DataSetId;
    onDatasetChange: (id: DataSetId) => void;
    onFileUpload: (file: File) => void;
    isUploading: boolean;
    uploadError: string | null;
    customLayers: CustomLayer[];
    onToggleLayerVisibility: (layerId: string) => void;
    onRemoveLayer: (layerId: string) => void;
    onSearchSubmit: (query: string) => void;
    isSearching: boolean;
    selectedOrgName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
    datasets, selectedDatasetId, onDatasetChange,
    onFileUpload, isUploading, uploadError,
    customLayers, onToggleLayerVisibility, onRemoveLayer,
    onSearchSubmit, isSearching, selectedOrgName
}) => {
    const { language, t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
        event.target.value = '';
    };

    const handleSearchClick = () => {
        if (searchQuery.trim()) {
            onSearchSubmit(searchQuery);
        }
    };

    return (
        <aside className="w-80 bg-brand-accent text-white p-4 flex flex-col space-y-6 overflow-y-auto flex-shrink-0 shadow-lg">
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <DataIcon className="w-5 h-5 mr-2 text-brand-base" />
                    {t('selectDataset')}
                </h2>
                <div className="space-y-2">
                    {datasets.map((dataset) => (
                        <div key={dataset.id}
                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${selectedDatasetId === dataset.id ? 'bg-gradient-to-r from-brand-accent to-brand-base shadow-lg' : 'bg-brand-accent/40 hover:bg-brand-accent/60'}`}
                            onClick={() => onDatasetChange(dataset.id)}>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="dataset"
                                    value={dataset.id}
                                    checked={selectedDatasetId === dataset.id}
                                    onChange={() => onDatasetChange(dataset.id)}
                                    className="hidden"
                                />
                                <div className="flex-grow">
                                    <p className="font-bold text-white">{dataset.name[language]}</p>
                                    <p className="text-sm text-sky-100/90">{dataset.description[language]}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-brand-base/40 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <SearchIcon className="w-5 h-5 mr-2" />
                    {selectedOrgName ? `Preguntar a ${selectedOrgName}` : t('askTheDocument')}
                </h2>
                <div className="bg-brand-accent/40 p-4 rounded-xl space-y-3">
                    <p className="text-sm text-sky-100/90">
                        {selectedOrgName
                            ? `Haz preguntas sobre los documentos de ${selectedOrgName}.`
                            : t('askTheDocumentDescription')}
                    </p>
                    <textarea
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={selectedOrgName ? `¿Qué hace ${selectedOrgName}?` : t('askTheDocumentPlaceholder')}
                        className="w-full h-24 p-2 bg-white text-slate-900 rounded-md placeholder:text-slate-400 focus:ring-2 focus:ring-brand-base focus:outline-none transition"
                        disabled={isSearching}
                    />
                    <button
                        onClick={handleSearchClick}
                        disabled={isSearching || !searchQuery.trim()}
                        className="w-full flex items-center justify-center px-4 py-2 bg-brand-base text-white font-bold rounded-full hover:bg-brand-base/90 transition-all duration-200 disabled:bg-brand-accent/40 disabled:cursor-not-allowed"
                    >
                        {isSearching ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <SearchIcon className="w-5 h-5 mr-2" />}
                        {isSearching ? t('searchingDocument') : t('searchButton')}
                    </button>
                </div>
            </div>

            <div className="border-t border-brand-base/40 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <UploadIcon className="w-5 h-5 mr-2" />
                    {t('uploadShapefile')}
                </h2>
                <div className="bg-brand-accent/40 p-4 rounded-xl space-y-3">
                    <p className="text-sm text-sky-100/90">{t('uploadShapefileDescription')}</p>
                    <label className={`w-full flex items-center justify-center px-4 py-2 font-bold rounded-full transition-all duration-200 ${isUploading ? 'bg-brand-accent/40 cursor-not-allowed text-sky-100' : 'bg-brand-base hover:bg-brand-base/90 text-white cursor-pointer'}`}>
                        <input
                            type="file"
                            className="hidden"
                            accept=".zip"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <>
                                <LoadingSpinner className="w-5 h-5 mr-2" />
                                {t('uploading')}
                            </>
                        ) : t('selectFile')}
                    </label>
                    {uploadError && (
                        <div className="flex items-start text-red-100 text-xs p-2 bg-red-900/70 rounded-md">
                            <WarningIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            </div>

            {customLayers.length > 0 && (
                <div className="border-t border-brand-base/40 pt-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <LayerIcon className="w-5 h-5 mr-2" />
                        {t('uploadedLayers')}
                    </h2>
                    <div className="space-y-2">
                        {customLayers.map(layer => (
                            <div key={layer.id} className="bg-brand-accent/40 p-2 rounded-xl flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={layer.isVisible}
                                    onChange={() => onToggleLayerVisibility(layer.id)}
                                    className="h-5 w-5 rounded bg-brand-accent/40 border-brand-base text-brand-base focus:ring-brand-base cursor-pointer"
                                />
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }}></div>
                                <span className="text-sm text-white truncate flex-grow" title={layer.name}>
                                    {layer.name}
                                </span>
                                <button
                                    onClick={() => onRemoveLayer(layer.id)}
                                    aria-label={t('removeLayer')}
                                    className="text-sky-100/80 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-brand-accent/60 flex-shrink-0"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
};
