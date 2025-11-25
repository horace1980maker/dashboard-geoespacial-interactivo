
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
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    datasets, selectedDatasetId, onDatasetChange,
    onFileUpload, isUploading, uploadError,
    customLayers, onToggleLayerVisibility, onRemoveLayer,
    onSearchSubmit, isSearching
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
        <aside className="w-80 bg-gray-800 p-4 flex flex-col space-y-6 overflow-y-auto flex-shrink-0">
            <div>
                <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                    <DataIcon className="w-5 h-5 mr-2" />
                    {t('selectDataset')}
                </h2>
                <div className="space-y-2">
                    {datasets.map((dataset) => (
                        <div key={dataset.id}
                             className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedDatasetId === dataset.id ? 'bg-cyan-600/80 shadow-lg' : 'bg-gray-700 hover:bg-gray-600'}`}
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
                                    <p className="text-sm text-gray-300">{dataset.description[language]}</p>
                                </div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center">
                    <SearchIcon className="w-5 h-5 mr-2" />
                    {t('askTheDocument')}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                     <p className="text-sm text-gray-300">{t('askTheDocumentDescription')}</p>
                     <textarea
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t('askTheDocumentPlaceholder')}
                        className="w-full h-24 p-2 bg-gray-900/50 rounded-md text-gray-200 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
                        disabled={isSearching}
                     />
                     <button
                        onClick={handleSearchClick}
                        disabled={isSearching || !searchQuery.trim()}
                        className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105"
                     >
                        {isSearching ? <LoadingSpinner className="w-5 h-5 mr-2" /> : <SearchIcon className="w-5 h-5 mr-2" />}
                        {isSearching ? t('searchingDocument') : t('searchButton')}
                     </button>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-emerald-400 mb-4 flex items-center">
                    <UploadIcon className="w-5 h-5 mr-2" />
                    {t('uploadShapefile')}
                </h2>
                <div className="bg-gray-700 p-4 rounded-lg space-y-3">
                    <p className="text-sm text-gray-300">{t('uploadShapefileDescription')}</p>
                    <label className={`w-full flex items-center justify-center px-4 py-2 font-bold rounded-lg transition-all duration-200 transform hover:scale-105 ${isUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'}`}>
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
                        <div className="flex items-start text-red-300 text-xs p-2 bg-red-900/50 rounded-md">
                            <WarningIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{uploadError}</span>
                        </div>
                    )}
                </div>
            </div>

            {customLayers.length > 0 && (
                 <div className="border-t border-gray-700 pt-6">
                    <h2 className="text-xl font-semibold text-fuchsia-400 mb-4 flex items-center">
                        <LayerIcon className="w-5 h-5 mr-2" />
                        {t('uploadedLayers')}
                    </h2>
                    <div className="space-y-2">
                        {customLayers.map(layer => (
                            <div key={layer.id} className="bg-gray-700 p-2 rounded-lg flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={layer.isVisible}
                                    onChange={() => onToggleLayerVisibility(layer.id)}
                                    className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-fuchsia-500 focus:ring-fuchsia-600 cursor-pointer"
                                />
                                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: layer.color }}></div>
                                <span className="text-sm text-gray-200 truncate flex-grow" title={layer.name}>
                                    {layer.name}
                                </span>
                                <button
                                    onClick={() => onRemoveLayer(layer.id)}
                                    aria-label={t('removeLayer')}
                                    className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-600 flex-shrink-0"
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
