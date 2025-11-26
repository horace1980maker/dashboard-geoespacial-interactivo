import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Country, DataSetId, SelectedFeature, CustomLayer } from '../types';
import { MAP_CONFIG } from '../constants';

// Fix for default marker icon issues in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
    countries: Country[];
    datasetId: DataSetId;
    customLayers: CustomLayer[];
    onCountrySelect: (country: Country | null) => void;
    onFeatureSelect: (feature: SelectedFeature) => void;
    selectedCountryId: string | null;
    onMapClick: () => void;
}

const createCountryHexagonSvg = (scale: number, isSelected: boolean) => {
    const finalScale = isSelected ? scale + 2 : scale;
    const width = finalScale * Math.sqrt(3);
    const height = finalScale * 2;

    const fillColor = isSelected ? 'rgba(0, 158, 226, 0.95)' : 'rgba(0, 31, 137, 0.9)';
    const strokeColor = isSelected ? '#4CC6FF' : '#009EE2';
    const strokeWeight = isSelected ? 2 : 1.5;

    return `
        <svg width="${width}" height="${height}" viewBox="-0.87 -1 1.74 2" preserveAspectRatio="xMidYMid meet" style="display: block;">
            <defs>
                <radialGradient id="grad1-${scale}-${isSelected}" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" style="stop-color:rgba(255,255,255,0.4);" />
                    <stop offset="100%" style="stop-color:rgba(255,255,255,0);" />
                </radialGradient>
            </defs>
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="${fillColor}"
                  stroke="${strokeColor}"
                  stroke-width="${strokeWeight / finalScale}" />
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="url(#grad1-${scale}-${isSelected})" />
        </svg>
    `;
};

const createCustomHexagonSvg = (color: string) => {
    const scale = 8;
    const width = scale * Math.sqrt(3);
    const height = scale * 2;

    return `
        <svg width="${width}" height="${height}" viewBox="-0.87 -1 1.74 2" preserveAspectRatio="xMidYMid meet" style="display: block;">
            <path d="M 0,-1 L 0.866,-0.5 L 0.866,0.5 L 0,1 L -0.866,0.5 L -0.866,-0.5 Z"
                  fill="${color}"
                  fill-opacity="0.85"
                  stroke-width="${1.5 / scale}"
                  stroke="rgba(0,0,0,0.6)"
            />
        </svg>
    `;
};

// Component to handle map clicks
const MapEvents = ({ onMapClick }: { onMapClick: () => void }) => {
    const map = useMap();
    useEffect(() => {
        map.on('click', (e) => {
            // Leaflet click event doesn't have a simple 'placeId' check, 
            // but we can check if the click target is the map container itself or a tile
            // However, markers/polygons stop propagation by default in React-Leaflet usually,
            // or we handle their clicks separately.
            // If the event bubbles to the map, it's a map click.
            onMapClick();
        });
        return () => {
            map.off('click');
        };
    }, [map, onMapClick]);
    return null;
};

const MapResizeHandler = () => {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        const container = map.getContainer();
        resizeObserver.observe(container);

        // Force invalidation after a short delay to ensure initial render is correct
        setTimeout(() => {
            map.invalidateSize();
        }, 0);
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            resizeObserver.disconnect();
        };
    }, [map]);
    return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
    countries, datasetId, customLayers,
    onCountrySelect, onFeatureSelect, selectedCountryId, onMapClick
}) => {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);

    useEffect(() => {
        fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
            .then(res => res.json())
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Failed to load countries GeoJSON", err));
    }, []);

    const dataValues = countries.map(c => c.data[datasetId] || 0).filter(v => v > 0);
    const minVal = Math.min(...dataValues);
    const maxVal = Math.max(...dataValues);

    return (
        <div className="h-full w-full bg-brand-base relative">
            <style>
                {`
                    .country-marker-container {
                        background: transparent;
                        border: none;
                    }
                    .country-marker-container svg {
                        transition: transform 0.15s ease-in-out;
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
                    }
                    .country-marker-container:hover {
                        z-index: 1000 !important;
                    }
                    .country-marker-container:hover svg {
                        transform: scale(1.2);
                    }
                    /* Custom scrollbar for Leaflet popups if needed */
                    .leaflet-popup-content-wrapper {
                        background: #001F89;
                        color: white;
                    }
                    .leaflet-popup-tip {
                        background: #001F89;
                    }
                `}
            </style>
            <MapContainer
                center={[MAP_CONFIG.center[1], MAP_CONFIG.center[0]]}
                zoom={MAP_CONFIG.zoom}
                style={{ height: '100%', width: '100%', background: '#E5E5E5' }}
                zoomControl={false}
            >
                {/* CartoDB Positron Tiles */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Background Countries GeoJSON */}
                {geoJsonData && (
                    <GeoJSON
                        data={geoJsonData}
                        style={(feature) => {
                            const iso = feature?.properties?.ISO_A2;
                            const isFocused = countries.some(c => c.id === iso);
                            return {
                                fillColor: 'transparent',
                                weight: 1.6,
                                opacity: 1,
                                color: '#009EE2',
                                fillOpacity: 0,
                                stroke: isFocused // Only show stroke for focused countries? Original code showed all but styled focused ones.
                                // Original: visible: countryISOs.has(iso) -> only focused countries were visible.
                            };
                        }}
                        filter={(feature) => {
                            // Only show focused countries as per original logic
                            const iso = feature?.properties?.ISO_A2;
                            return countries.some(c => c.id === iso);
                        }}
                        interactive={false} // Background layer, not interactive
                    />
                )}

                {/* Country Markers */}
                {countries.map(country => {
                    const value = country.data[datasetId] || 0;
                    const scale = value > 0 && maxVal > minVal ? 8 + ((value - minVal) / (maxVal - minVal)) * 18 : 8;
                    const isSelected = country.id === selectedCountryId;

                    // Recalculate size for the divIcon
                    const finalScale = isSelected ? scale + 2 : scale;
                    const width = finalScale * Math.sqrt(3);
                    const height = finalScale * 2;

                    const icon = L.divIcon({
                        html: createCountryHexagonSvg(scale, isSelected),
                        className: 'country-marker-container',
                        iconSize: [width, height],
                        iconAnchor: [width / 2, height / 2]
                    });

                    return (
                        <Marker
                            key={country.id}
                            position={[country.coordinates[1], country.coordinates[0]]}
                            icon={icon}
                            eventHandlers={{
                                click: (e) => {
                                    L.DomEvent.stopPropagation(e); // Prevent map click
                                    onCountrySelect(country);
                                }
                            }}
                        />
                    );
                })}

                {/* Custom Layers */}
                {customLayers.map(layer => {
                    if (!layer.isVisible || !layer.geojson) return null;

                    return (
                        <GeoJSON
                            key={layer.id}
                            data={layer.geojson}
                            style={() => ({
                                fillColor: layer.color,
                                color: layer.color,
                                weight: 2,
                                opacity: 0.8,
                                fillOpacity: 0.4
                            })}
                            pointToLayer={(feature, latlng) => {
                                const icon = L.divIcon({
                                    html: createCustomHexagonSvg(layer.color),
                                    className: 'country-marker-container', // Reuse hover effect
                                    iconSize: [8 * Math.sqrt(3), 16],
                                    iconAnchor: [8 * Math.sqrt(3) / 2, 8]
                                });
                                return L.marker(latlng, { icon });
                            }}
                            onEachFeature={(feature, layerInstance) => {
                                layerInstance.on({
                                    mouseover: (e) => {
                                        const target = e.target;
                                        if (target.setStyle) {
                                            target.setStyle({
                                                fillOpacity: 0.6,
                                                weight: 3
                                            });
                                        }
                                    },
                                    mouseout: (e) => {
                                        const target = e.target;
                                        if (target.setStyle) {
                                            // Reset style. GeoJSON layer has a 'resetStyle' method but we need reference to the GeoJSON component.
                                            // Simple workaround: set back to default.
                                            target.setStyle({
                                                fillOpacity: 0.4,
                                                weight: 2
                                            });
                                        }
                                    },
                                    click: (e) => {
                                        L.DomEvent.stopPropagation(e);
                                        const properties = feature.properties || {};
                                        onFeatureSelect({ properties });
                                    }
                                });
                            }}
                        />
                    );
                })}

                <MapEvents onMapClick={onMapClick} />
                <MapResizeHandler />
            </MapContainer>
        </div>
    );
};
