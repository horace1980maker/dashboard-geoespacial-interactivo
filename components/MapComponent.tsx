
import React, { useRef, useEffect, useMemo } from 'react';
import type { Country, DataSetId, SelectedFeature, CustomLayer } from '../types';
import { MAP_CONFIG, FOCUSED_COUNTRIES } from '../constants';

interface MapComponentProps {
    countries: Country[];
    datasetId: DataSetId;
    customLayers: CustomLayer[];
    onCountrySelect: (country: Country | null) => void;
    onFeatureSelect: (feature: SelectedFeature) => void;
    selectedCountryId: string | null;
    onMapClick: () => void;
}

const mapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#001B73" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#001441" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#A7C4FF" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#4CC6FF" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1231A3" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#021347" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#E5EDFF" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#1231A3" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#021347" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#4CC6FF" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#009EE2" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#E5EDFF" }] },
  { featureType: "water", elementType: "labels.text.stroke", stylers: [{ color: "#005B94" }] },
];

const createCountryHexagonMarkerContent = (scale: number, isSelected: boolean): HTMLElement => {
    const finalScale = isSelected ? scale + 2 : scale;
    const width = finalScale * Math.sqrt(3);
    const height = finalScale * 2;

    const fillColor = isSelected ? 'rgba(0, 158, 226, 0.95)' : 'rgba(0, 31, 137, 0.9)';
    const strokeColor = isSelected ? '#4CC6FF' : '#009EE2';
    const strokeWeight = isSelected ? 2 : 1.5;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.cursor = 'pointer';
    container.style.transition = 'transform 0.15s ease-in-out';
    container.style.zIndex = isSelected ? '100' : '1';
    container.style.transform = `translate(-50%, -50%)`;

    container.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="-0.87 -1 1.74 2" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">
            <defs>
                <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0);" />
                </radialGradient>
            </defs>
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="${fillColor}"
                  stroke="${strokeColor}"
                  stroke-width="${strokeWeight / finalScale}" />
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="url(#grad1)" />
        </svg>
    `;
    
    container.addEventListener('mouseenter', () => {
        container.style.transform = 'translate(-50%, -50%) scale(1.2)';
        container.style.zIndex = '200';
    });
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'translate(-50%, -50%) scale(1)';
        container.style.zIndex = isSelected ? '100' : '1';
    });

    return container;
};

const createCustomHexagonMarkerContent = (color: string): HTMLElement => {
    const scale = 8;
    const width = scale * Math.sqrt(3);
    const height = scale * 2;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    container.style.cursor = 'pointer';
    container.style.transition = 'transform 0.15s ease-in-out';
    container.style.transform = `translate(-50%, -50%)`;
    container.style.zIndex = '50';

    container.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="-0.87 -1 1.74 2" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4));">
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="${color}"
                  fill-opacity="0.85"
                  stroke-width="${1.5 / scale}"
                  stroke="rgba(0,0,0,0.6)"
            />
        </svg>
    `;
    
    container.addEventListener('mouseenter', () => {
        container.style.transform = 'translate(-50%, -50%) scale(1.2)';
        container.style.zIndex = '200';
    });
    container.addEventListener('mouseleave', () => {
        container.style.transform = 'translate(-50%, -50%) scale(1)';
        container.style.zIndex = '50';
    });

    return container;
};


export const MapComponent: React.FC<MapComponentProps> = ({ 
    countries, datasetId, customLayers,
    onCountrySelect, onFeatureSelect, selectedCountryId, onMapClick 
}) => {
    const mapDivRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const countryMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
    
    // Refs for custom layers, separated by type for correct rendering
    const customDataLayersRef = useRef<{ [id: string]: google.maps.Data }>({});
    const customMarkersRef = useRef<{ [id: string]: google.maps.marker.AdvancedMarkerElement[] }>({});
    
    const countryISOs = useMemo(() => new Set(FOCUSED_COUNTRIES.map(c => c.id)), []);

    useEffect(() => {
        if (!mapDivRef.current || !window.google?.maps?.Map) return;

        const map = new window.google.maps.Map(mapDivRef.current, {
            center: { lat: MAP_CONFIG.center[1], lng: MAP_CONFIG.center[0] },
            zoom: MAP_CONFIG.zoom,
            disableDefaultUI: true,
            zoomControl: true,
            styles: mapStyles,
            mapId: 'INTERACTIVE_GEO_DASHBOARD'
        });
        mapRef.current = map;

        const dataLayer = new window.google.maps.Data({ map });
        dataLayer.loadGeoJson('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
        dataLayer.setStyle(feature => {
            const iso = feature.getProperty('ISO_A2');
            return {
                visible: countryISOs.has(iso),
                fillOpacity: 0,
                strokeColor: '#009EE2',
                strokeWeight: 1.6,
                strokeOpacity: 0.9,
            };
        });

        map.addListener('click', (e: google.maps.MapMouseEvent | google.maps.IconMouseEvent) => {
            if ('placeId' in e && e.placeId) return;
            // This 'markerClicked' check prevents the map click from firing when a marker is clicked
            if (mapRef.current!.get('markerClicked')) {
                mapRef.current!.set('markerClicked', false);
                return;
            }
            onMapClick();
        });

        return () => {
            if (mapRef.current && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(mapRef.current);
            }
        };
    }, [onMapClick, countryISOs]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !countries.length || !window.google.maps.marker.AdvancedMarkerElement) return;

        countryMarkersRef.current.forEach(marker => { marker.map = null; });
        countryMarkersRef.current = [];

        const dataValues = countries.map(c => c.data[datasetId] || 0).filter(v => v > 0);
        const minVal = Math.min(...dataValues);
        const maxVal = Math.max(...dataValues);

        countries.forEach(country => {
            const value = country.data[datasetId] || 0;
            const scale = value > 0 && maxVal > minVal ? 8 + ((value - minVal) / (maxVal - minVal)) * 18 : 8;
            const isSelected = country.id === selectedCountryId;
            const markerContent = createCountryHexagonMarkerContent(scale, isSelected);

            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                position: { lat: country.coordinates[1], lng: country.coordinates[0] },
                map,
                title: country.name,
                content: markerContent,
                zIndex: isSelected ? 100 : 1,
            });

            marker.addListener('click', () => {
                map.set('markerClicked', true);
                onCountrySelect(country);
            });

            countryMarkersRef.current.push(marker);
        });
    }, [countries, datasetId, selectedCountryId, onCountrySelect]);
    
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
    
        // Cleanup Phase
        Object.values(customDataLayersRef.current).forEach(dataLayer => dataLayer.setMap(null));
        customDataLayersRef.current = {};
        Object.values(customMarkersRef.current).forEach(markerArray => {
            markerArray.forEach(marker => { marker.map = null; });
        });
        customMarkersRef.current = {};
    
        // Render Phase
        customLayers.forEach(layer => {
            if (!layer.isVisible || !layer.geojson || !layer.geojson.features) return;
    
            const shapeFeatures: GeoJSON.Feature[] = [];
            const pointMarkersForLayer: google.maps.marker.AdvancedMarkerElement[] = [];
    
            // Separate features by geometry type
            layer.geojson.features.forEach((feature: GeoJSON.Feature) => {
                if (!feature.geometry) return;
                
                if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                    const processPoint = (coords: number[]) => {
                        if (coords.length < 2) return;
                        const markerContent = createCustomHexagonMarkerContent(layer.color);
                        const marker = new window.google.maps.marker.AdvancedMarkerElement({
                            position: { lng: coords[0], lat: coords[1] },
                            map,
                            content: markerContent,
                            title: feature.properties?.name || 'Custom Point',
                            zIndex: 50,
                        });
    
                        marker.addListener('click', () => {
                            map.set('markerClicked', true);
                            const properties: { [key: string]: any } = feature.properties || {};
                            onFeatureSelect({ properties });
                        });
                        pointMarkersForLayer.push(marker);
                    };
    
                    if (feature.geometry.type === 'Point') {
                        processPoint(feature.geometry.coordinates);
                    } else if (feature.geometry.type === 'MultiPoint') {
                        feature.geometry.coordinates.forEach(processPoint);
                    }
                } else {
                    shapeFeatures.push(feature);
                }
            });
    
            // Render shapes (polygons, lines)
            if (shapeFeatures.length > 0) {
                const shapeGeoJson: GeoJSON.FeatureCollection = {
                    type: 'FeatureCollection',
                    features: shapeFeatures,
                };
                const dataLayer = new window.google.maps.Data({ map });
                
                dataLayer.setStyle({
                    fillColor: layer.color,
                    strokeColor: layer.color,
                    strokeWeight: 2,
                    fillOpacity: 0.4,
                    strokeOpacity: 0.8,
                    clickable: true
                });
    
                dataLayer.addListener('mouseover', (event: google.maps.Data.MouseEvent) => {
                    dataLayer.overrideStyle(event.feature, { fillOpacity: 0.6, strokeWeight: 3 });
                });
        
                dataLayer.addListener('mouseout', () => {
                    dataLayer.revertStyle();
                });
        
                dataLayer.addListener('click', (event: google.maps.Data.MouseEvent) => {
                    map.set('markerClicked', true);
                    const properties: { [key: string]: any } = {};
                    event.feature.forEachProperty((value, name) => {
                        properties[name] = value;
                    });
                    onFeatureSelect({ properties });
                });
                
                dataLayer.addGeoJson(shapeGeoJson);
                customDataLayersRef.current[layer.id] = dataLayer;
            }
            
            // Store point markers for cleanup
            if (pointMarkersForLayer.length > 0) {
                customMarkersRef.current[layer.id] = pointMarkersForLayer;
            }
        });
    }, [customLayers, onFeatureSelect]);

    return <div className="h-full w-full bg-brand-base" ref={mapDivRef}></div>;
};
