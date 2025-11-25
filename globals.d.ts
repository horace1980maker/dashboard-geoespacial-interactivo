// This is a simplified declaration to satisfy TypeScript for the Google Maps API.
// For a full-featured app, you would use @types/google.maps.

declare global {
    namespace google {
        namespace maps {
            type MapTypeStyle = any;
            
            class LatLng {
              constructor(lat: number, lng: number);
            }
            
            class Point {
                constructor(x: number, y: number);
            }

            interface MapsEventListener {
                remove(): void;
            }

            class Map {
                constructor(el: HTMLElement | null, opts?: any);
                addListener(event: string, callback: (...args: any[]) => void): MapsEventListener;
                set(key: string, value: any): void;
                get(key: string): any;
            }

            class Data {
                constructor(options?: any);
                loadGeoJson(url: string, options?: any, callback?: (features: Data.Feature[]) => void): void;
                addGeoJson(geoJson: any, options?: any): Data.Feature[];
                setStyle(style: any): void;
                setMap(map: Map | null): void;
                addListener(event: string, callback: (e: Data.MouseEvent) => void): MapsEventListener;
                revertStyle(feature?: Data.Feature): void;
                overrideStyle(feature: Data.Feature, style: any): void;
            }
            
            namespace Data {
                class Feature {
                    forEachProperty(callback: (value: any, name: string) => void): void;
                }
                interface MouseEvent {
                    feature: Feature;
                }
            }

            namespace marker {
                class AdvancedMarkerElement {
                    constructor(options: any);
                    map: Map | null;
                    addListener(event: string, callback: (...args: any[]) => void): MapsEventListener;
                }
            }

            interface MapMouseEvent {
                placeId?: string;
            }
            
            interface IconMouseEvent extends MapMouseEvent {}

            namespace event {
                function clearInstanceListeners(instance: any): void;
                function removeListener(listener: MapsEventListener): void;
            }
        }
    }

    namespace GeoJSON {
        // Bounding box
        type BBox = [number, number, number, number] | [number, number, number, number, number, number];

        // Position
        type Position = number[]; // [lng, lat, altitude?]

        // Geometries
        interface Geometry {
            type: string;
            bbox?: BBox;
        }
        
        interface Point extends Geometry {
            type: 'Point';
            coordinates: Position;
        }

        interface MultiPoint extends Geometry {
            type: 'MultiPoint';
            coordinates: Position[];
        }

        interface LineString extends Geometry {
            type: 'LineString';
            coordinates: Position[];
        }

        interface MultiLineString extends Geometry {
            type: 'MultiLineString';
            coordinates: Position[][];
        }

        interface Polygon extends Geometry {
            type: 'Polygon';
            coordinates: Position[][];
        }

        interface MultiPolygon extends Geometry {
            type: 'MultiPolygon';
            coordinates: Position[][][];
        }

        interface GeometryCollection extends Geometry {
            type: 'GeometryCollection';
            geometries: Array<Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon>;
        }

        type GeometryObject = Point | MultiPoint | LineString | MultiLineString | Polygon | MultiPolygon | GeometryCollection;

        // Feature
        interface Feature<G extends GeometryObject | null = GeometryObject, P = any> {
            type: 'Feature';
            geometry: G;
            id?: string | number;
            properties: P;
            bbox?: BBox;
        }

        // Feature Collection
        interface FeatureCollection<G extends GeometryObject | null = GeometryObject, P = any> {
            type: 'FeatureCollection';
            features: Array<Feature<G, P>>;
            bbox?: BBox;
        }

        type GeoJsonObject = GeometryObject | Feature | FeatureCollection;
    }

    interface Window {
        shp: {
            parseZip: (buffer: ArrayBuffer) => Promise<any>;
        };
        google: typeof google;
    }
}

// This empty export is needed to make the file a module, 
// which is required for 'declare global' to work correctly in some TS setups.
export {};