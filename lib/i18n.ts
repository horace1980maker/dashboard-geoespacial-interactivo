
import type { Language } from '../types';

export const translations = {
  en: {
    // Header
    appTitle: "Interactive Geospatial Dashboard",
    // Sidebar
    selectDataset: "Select Dataset",
    uploadShapefile: "Upload Shapefile",
    uploadShapefileDescription: "Upload a .zip containing .shp, .shx, and .dbf files.",
    uploading: "Uploading...",
    selectFile: "Select .zip File",
    uploadedLayers: "Uploaded Layers",
    removeLayer: "Remove layer",
    askTheDocument: "Ask the Document",
    askTheDocumentDescription: "Ask a question about the landscape analysis reports.",
    askTheDocumentPlaceholder: "e.g., What are the main causes of ecosystem degradation?",
    searchButton: "Search",
    // Info Panel
    generateAnalysis: "Generate AI Analysis",
    thinking: "Thinking...",
    generatingResponse: "Generating response...",
    analysisPlaceholder: "Click 'Generate' for an analysis.",
    // Feature Info Panel
    featureId: 'Feature ID',
    shapefileProperties: 'Feature Properties',
    noProperties: 'No properties available for this feature.',
    // Search Panel
    searchPanelTitle: 'Document Analysis',
    searchingDocument: 'Searching...',
    searchPanelPlaceholder: 'The result of your document search will appear here.',
    searchErrorNotFound: "I couldn’t find this information in your uploaded documents.",
    // Errors
    errorTitle: "An Error Occurred",
    errorUnknown: "An unknown error occurred.",
    uploadErrorGeneral: "File could not be processed. Ensure it is a valid zipped shapefile.",
  },
  es: {
    // Header
    appTitle: "Tablero Geoespacial Interactivo",
    // Sidebar
    selectDataset: "Seleccionar Conjunto de Datos",
    uploadShapefile: "Subir Shapefile",
    uploadShapefileDescription: "Suba un .zip que contenga archivos .shp, .shx y .dbf.",
    uploading: "Subiendo...",
    selectFile: "Seleccionar archivo .zip",
    uploadedLayers: "Capas Cargadas",
    removeLayer: "Eliminar capa",
    askTheDocument: "Preguntar al Documento",
    askTheDocumentDescription: "Haga una pregunta sobre los informes de análisis del paisaje.",
    askTheDocumentPlaceholder: "Ej: ¿Cuáles son las causas principales de la degradación de ecosistemas?",
    searchButton: "Buscar",
    // Info Panel
    generateAnalysis: "Generar Análisis con IA",
    thinking: "Pensando...",
    generatingResponse: "Generando respuesta...",
    analysisPlaceholder: "Haga clic en 'Generar' para un análisis.",
    // Feature Info Panel
    featureId: 'ID de la Entidad',
    shapefileProperties: 'Propiedades de la Entidad',
    noProperties: 'No hay propiedades disponibles para esta entidad.',
    // Search Panel
    searchPanelTitle: 'Análisis de Documento',
    searchingDocument: 'Buscando...',
    searchPanelPlaceholder: 'El resultado de la búsqueda en el documento aparecerá aquí.',
    searchErrorNotFound: "No pude encontrar esta información en los documentos cargados.",
    // Errors
    errorTitle: "Ocurrió un Error",
    errorUnknown: "Ocurrió un error desconocido.",
    uploadErrorGeneral: "El archivo no pudo ser procesado. Asegúrese de que sea un shapefile comprimido en .zip válido.",
  }
};

export function getTranslator(lang: Language) {
    return function t(key: keyof typeof translations.en): string {
        return translations[lang]?.[key] || translations.en[key];
    }
}
