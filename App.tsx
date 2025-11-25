
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { Sidebar } from './components/Sidebar';
import { InfoPanel } from './components/InfoPanel';
import { FOCUSED_COUNTRIES, DATASETS, LAYER_COLORS } from './constants';
import type { DataSetId, Country, SelectedFeature, CustomLayer } from './types';
import { analyzeCountryData, searchDocument } from './services/geminiService';
import { Header } from './components/Header';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { LoadingSpinner } from './components/icons';
import { FeatureInfoPanel } from './components/FeatureInfoPanel';
import { SearchPanel } from './components/SearchPanel';

const AppContent: React.FC = () => {
    const { language, t } = useLanguage();
    const [isMapApiLoaded, setIsMapApiLoaded] = useState(false);
    const [selectedDatasetId, setSelectedDatasetId] = useState<DataSetId>('population');
    
    // Selection State
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);

    // Custom Layer State
    const [customLayers, setCustomLayers] = useState<CustomLayer[]>([]);
    
    // Panel Content State
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [searchResult, setSearchResult] = useState<string | null>(null);
    const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

    // Loading and Error State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (window.google?.maps?.marker) {
                setIsMapApiLoaded(true);
                clearInterval(intervalId);
            }
        }, 100);
        return () => clearInterval(intervalId);
    }, []);

    const closeAllPanels = useCallback(() => {
        setSelectedCountry(null);
        setSelectedFeature(null);
        setIsSearchPanelOpen(false);
    }, []);
    
    const handleCountrySelect = useCallback((country: Country | null) => {
        if (country) {
            closeAllPanels();
            setSelectedCountry(country);
            setAnalysis(null);
            setAnalysisError(null);
        } else {
            setSelectedCountry(null);
        }
    }, [closeAllPanels]);

    const handleFeatureSelect = useCallback((feature: SelectedFeature | null) => {
        if (feature) {
            closeAllPanels();
            setSelectedFeature(feature);
        } else {
            setSelectedFeature(null);
        }
    }, [closeAllPanels]);

    const handleFileUpload = async (file: File) => {
        if (!file) return;
        
        setIsUploading(true);
        setUploadError(null);
        closeAllPanels();

        try {
            const buffer = await file.arrayBuffer();
            const geojson = await window.shp.parseZip(buffer);
            
            const newLayer: CustomLayer = {
                id: `layer-${Date.now()}`,
                name: file.name,
                geojson,
                isVisible: true,
                color: LAYER_COLORS[customLayers.length % LAYER_COLORS.length]
            };
            
            setCustomLayers(prevLayers => [...prevLayers, newLayer]);

        } catch (e) {
            console.error("Shapefile parsing failed:", e);
            const message = e instanceof Error ? e.message : t('uploadErrorGeneral');
            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleToggleLayerVisibility = (layerId: string) => {
        setCustomLayers(prevLayers =>
            prevLayers.map(layer =>
                layer.id === layerId ? { ...layer, isVisible: !layer.isVisible } : layer
            )
        );
    };

    const handleRemoveLayer = (layerId: string) => {
        setCustomLayers(prevLayers => prevLayers.filter(layer => layer.id !== layerId));
    };

    const handleAskAI = async () => {
        if (!selectedCountry) return;
        
        setIsAnalyzing(true);
        setAnalysis(null);
        setAnalysisError(null);
        
        const dataset = DATASETS.find(d => d.id === selectedDatasetId)!;
        
        try {
            const result = await analyzeCountryData(
                selectedCountry.name,
                dataset.name[language],
                selectedCountry.data[selectedDatasetId]!,
                dataset.unit[language],
                language
              );
            setAnalysis(result);
        } catch (error) {
            console.error("AI request failed:", error);
            const message = error instanceof Error ? error.message : t('errorUnknown');
            setAnalysisError(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSearchSubmit = async (query: string) => {
        if (!query.trim()) return;

        closeAllPanels();
        setIsSearching(true);
        setSearchError(null);
        setSearchResult(null);
        setIsSearchPanelOpen(true);

        try {
            const result = await searchDocument(query, language);
            setSearchResult(result);
        } catch (error) {
            console.error("Document search failed:", error);
            const message = error instanceof Error ? error.message : t('errorUnknown');
            setSearchError(message);
        } finally {
            setIsSearching(false);
        }
    };
    
    const selectedDataset = useMemo(() => {
        const dataset = DATASETS.find(d => d.id === selectedDatasetId)!;
        return {
            ...dataset,
            name: dataset.name[language],
            unit: dataset.unit[language],
            description: dataset.description[language],
        }
    }, [selectedDatasetId, language]);

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar
                    datasets={DATASETS}
                    selectedDatasetId={selectedDatasetId}
                    onDatasetChange={setSelectedDatasetId}
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                    uploadError={uploadError}
                    customLayers={customLayers}
                    onToggleLayerVisibility={handleToggleLayerVisibility}
                    onRemoveLayer={handleRemoveLayer}
                    onSearchSubmit={handleSearchSubmit}
                    isSearching={isSearching}
                />
                <main className="flex-1 relative">
                    <div className="absolute inset-0">
                        {isMapApiLoaded ? (
                            <MapComponent
                                countries={FOCUSED_COUNTRIES}
                                datasetId={selectedDatasetId}
                                customLayers={customLayers}
                                onCountrySelect={handleCountrySelect}
                                onFeatureSelect={handleFeatureSelect}
                                selectedCountryId={selectedCountry?.id || null}
                                onMapClick={closeAllPanels}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center">
                                <LoadingSpinner className="w-12 h-12 text-cyan-400" />
                            </div>
                        )}
                        {selectedCountry && (
                             <InfoPanel 
                                country={selectedCountry}
                                dataset={selectedDataset}
                                analysis={analysis}
                                analysisError={analysisError}
                                isLoading={isAnalyzing}
                                onAnalyze={handleAskAI}
                                onClose={closeAllPanels}
                            />
                        )}
                        {selectedFeature && (
                            <FeatureInfoPanel 
                                data={selectedFeature}
                                onClose={closeAllPanels}
                            />
                        )}
                        {isSearchPanelOpen && (
                            <SearchPanel
                                result={searchResult}
                                error={searchError}
                                isLoading={isSearching}
                                onClose={closeAllPanels}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export const App: React.FC = () => (
    <LanguageProvider>
        <AppContent />
    </LanguageProvider>
);
