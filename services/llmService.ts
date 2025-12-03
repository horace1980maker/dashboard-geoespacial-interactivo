import type { Language } from '../types';

export async function analyzeCountryData(
    countryName: string,
    datasetName: string,
    dataValue: number | string,
    unit: string,
    language: Language,
    orgId?: string
): Promise<string> {
    if (!orgId) {
        // Fallback for country-level analysis if needed, or just return empty
        return "";
    }

    try {
        const response = await fetch('/api/summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                org_id: orgId,
                country_name: countryName,
                language: language
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error fetching summary:", error);
        return language === 'es' ? "<p>Error al generar el resumen.</p>" : "<p>Error generating summary.</p>";
    }
}

export async function searchDocument(query: string, language: Language, orgId?: string): Promise<string> {
    // If no org selected, maybe search general?
    // User said "Ask the organization ... will also respond only based on the uploaded documents of that organization."
    // So if no org, maybe fail or search general.
    // Let's assume general if no org, or prompt user.

    const targetOrgId = orgId || 'general';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                org_id: targetOrgId,
                language: language
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error("Error searching document:", error);
        return language === 'es' ? "Error al buscar en los documentos." : "Error searching documents.";
    }
}
