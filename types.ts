
export type Language = 'en' | 'es';

export interface LocalizedString {
    en: string;
    es: string;
}

export type DataSetId = 'population' | 'land_area' | 'protected_areas' | 'biodiversity_index';

export interface CountryData {
    population?: number;
    land_area?: number;
    protected_areas?: number;
    biodiversity_index?: number;
}

export interface Country {
    id: string;
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    data: CountryData;
}

export interface DataSet {
    id: DataSetId;
    name: LocalizedString;
    unit: LocalizedString;
    description: LocalizedString;
}

export interface SelectedFeature {
    properties: { [key: string]: any };
}

export interface CustomLayer {
    id: string;
    name: string;
    geojson: any; // GeoJSON FeatureCollection
    isVisible: boolean;
    color: string;
}
