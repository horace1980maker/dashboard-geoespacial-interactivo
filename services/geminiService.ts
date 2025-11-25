import { GoogleGenAI } from "@google/genai";
import type { Language } from '../types';
import { DOCUMENT_TEXT } from '../documentData';

// This lazy-initialized client is a good pattern for this app.
let ai: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

const getErrorMessage = (language: Language) => language === 'es' 
    ? 'Se produjo un error al comunicarse con la IA. Verifique su clave de API y su conexión.'
    : 'An error occurred while communicating with the AI. Please check your API key and connection.';

export async function analyzeCountryData(
    countryName: string,
    datasetName: string,
    dataValue: number | string,
    unit: string,
    language: Language
): Promise<string> {
    const prompt = `
        Provide a brief, insightful, and easy-to-understand socio-economic analysis for ${countryName}, focusing on the following data point:
        - Metric: ${datasetName}
        - Value: ${Intl.NumberFormat('en-US').format(Number(dataValue))} ${unit}

        Based on this single metric, explain what it might imply for the country's development, its people, and its standing in the region.
        Keep the analysis concise, to one or two paragraphs. Do not use markdown formatting. Just return plain text.
        Respond in ${language === 'es' ? 'Spanish' : 'English'}.
    `;

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
                topP: 0.95,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for analysis:", error);
        throw new Error(getErrorMessage(language));
    }
}

export async function searchDocument(query: string, language: Language): Promise<string> {
    const prompt = `
        You are a helpful research assistant.
        Your task is to answer the user's question based *only* on the content of the document provided below.
        Do not use any external knowledge.
        If the information to answer the question is not found in the document, you MUST respond with the exact phrase: "I couldn’t find this information in your uploaded documents."
        Your final response must be in ${language === 'es' ? 'Spanish' : 'English'}.

        User's Question: "${query}"

        Document Content:
        ---
        ${DOCUMENT_TEXT}
        ---
    `;

    try {
        const client = getAiClient();
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.2,
            }
        });

        const textResponse = response.text.trim();
        
        // Final check to ensure the model follows instructions
        if (textResponse === "I couldn’t find this information in your uploaded documents." && language === 'es') {
             return "No pude encontrar esta información en los documentos cargados.";
        }

        return textResponse;
    } catch (error) {
        console.error("Error calling Gemini API for document search:", error);
        throw new Error(getErrorMessage(language));
    }
}