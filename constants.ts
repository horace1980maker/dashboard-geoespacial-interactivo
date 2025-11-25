
import type { Country, DataSet } from './types';

export const MAP_CONFIG = {
    center: [-78, 0], // [longitude, latitude]
    zoom: 4
};

export const LAYER_COLORS = ['#34D399', '#F87171', '#60A5FA', '#FBBF24', '#A78BFA', '#EC4899'];

export const FOCUSED_COUNTRIES: Country[] = [
    {
        id: 'GT', name: 'Guatemala', coordinates: [-90.2308, 15.7835],
        data: { population: 18092026, land_area: 107159, protected_areas: 34290, biodiversity_index: 80 }
    },
    {
        id: 'SV', name: 'El Salvador', coordinates: [-88.8965, 13.7942],
        data: { population: 6378453, land_area: 20721, protected_areas: 300, biodiversity_index: 45 }
    },
    {
        id: 'HN', name: 'Honduras', coordinates: [-86.2419, 15.2],
        data: { population: 10593798, land_area: 111888, protected_areas: 27972, biodiversity_index: 75 }
    },
    {
        id: 'CO', name: 'Colombia', coordinates: [-74.2973, 4.5709],
        data: { population: 52085168, land_area: 1141748, protected_areas: 312535, biodiversity_index: 93 }
    },
    {
        id: 'EC', name: 'Ecuador', coordinates: [-78.1834, -1.8312],
        data: { population: 18190484, land_area: 283561, protected_areas: 56160, biodiversity_index: 91 }
    }
];

export const DATASETS: DataSet[] = [
    { 
        id: 'population', 
        name: { en: 'Population', es: 'Población' },
        unit: { en: 'people', es: 'personas' },
        description: { en: 'Total estimated population.', es: 'Población total estimada.' } 
    },
    { 
        id: 'land_area', 
        name: { en: 'Land Area', es: 'Superficie' },
        unit: { en: 'km²', es: 'km²' },
        description: { en: 'Total land area in square kilometers.', es: 'Superficie total en kilómetros cuadrados.' }
    },
    { 
        id: 'protected_areas', 
        name: { en: 'Protected Area', es: 'Área Protegida' },
        unit: { en: 'km²', es: 'km²' },
        description: { en: 'Area of terrestrial and marine protected areas.', es: 'Superficie de áreas protegidas terrestres y marinas.' } 
    },
    { 
        id: 'biodiversity_index', 
        name: { en: 'Biodiversity Index', es: 'Índice de Biodiversidad' },
        unit: { en: 'score', es: 'puntaje' },
        description: { en: 'A relative index of biodiversity (0-100).', es: 'Un índice relativo de biodiversidad (0-100).' } 
    }
];
