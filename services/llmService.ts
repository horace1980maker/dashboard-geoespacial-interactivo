import type { Language } from '../types';
import { DOCUMENT_TEXT } from '../documentData';
import { GoogleGenAI } from '@google/genai';

// LLM Provider types
export type LLMProvider = 'gemini' | 'openai' | 'anthropic';

// Provider interface
interface LLMProviderInterface {
    generateText(prompt: string, options?: { temperature?: number; topP?: number }): Promise<string>;
}

// Gemini Provider
class GeminiProvider implements LLMProviderInterface {
    private client: GoogleGenAI;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({ apiKey });
    }

    async generateText(prompt: string, options?: { temperature?: number; topP?: number }): Promise<string> {
        const response = await this.client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: options?.temperature ?? 0.5,
                topP: options?.topP ?? 0.95,
            }
        });
        return response.text;
    }
}

// OpenAI Provider
class OpenAIProvider implements LLMProviderInterface {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl?: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl || 'https://api.openai.com/v1';
    }

    async generateText(prompt: string, options?: { temperature?: number; topP?: number }): Promise<string> {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: options?.temperature ?? 0.5,
                top_p: options?.topP ?? 0.95
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(error.error?.message || `OpenAI API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
}

// Anthropic Provider
class AnthropicProvider implements LLMProviderInterface {
    private apiKey: string;
    private baseUrl: string;

    constructor(apiKey: string, baseUrl?: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl || 'https://api.anthropic.com/v1';
    }

    async generateText(prompt: string, options?: { temperature?: number; topP?: number }): Promise<string> {
        const response = await fetch(`${this.baseUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1024,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: options?.temperature ?? 0.5,
                top_p: options?.topP ?? 0.95
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(error.error?.message || `Anthropic API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.content[0]?.text || '';
    }
}

// Provider factory
function createLLMProvider(provider: LLMProvider, apiKey: string, baseUrl?: string): LLMProviderInterface {
    switch (provider) {
        case 'gemini':
            return new GeminiProvider(apiKey);
        case 'openai':
            return new OpenAIProvider(apiKey, baseUrl);
        case 'anthropic':
            return new AnthropicProvider(apiKey, baseUrl);
        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}

// Lazy-initialized provider instance
let llmProvider: LLMProviderInterface | null = null;

function getLLMProvider(): LLMProviderInterface {
    if (!llmProvider) {
        const provider = (process.env.LLM_PROVIDER || 'gemini') as LLMProvider;
        let apiKey: string | undefined;
        let baseUrl: string | undefined;

        // Get API key based on provider
        switch (provider) {
            case 'gemini':
                apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
                break;
            case 'openai':
                apiKey = process.env.OPENAI_API_KEY;
                baseUrl = process.env.OPENAI_BASE_URL;
                break;
            case 'anthropic':
                apiKey = process.env.ANTHROPIC_API_KEY;
                baseUrl = process.env.ANTHROPIC_BASE_URL;
                break;
        }

        if (!apiKey) {
            throw new Error(
                `API key not set for provider "${provider}". ` +
                `Please set the appropriate environment variable: ` +
                `${provider === 'gemini' ? 'GEMINI_API_KEY or API_KEY' :
                    provider === 'openai' ? 'OPENAI_API_KEY' :
                        'ANTHROPIC_API_KEY'}`
            );
        }

        llmProvider = createLLMProvider(provider, apiKey, baseUrl);
    }
    return llmProvider;
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Dummy text for "Territorial Insight Cards"
    const dummyAnalysis = `
**Amenazas principales:** Deforestación acelerada por expansión agrícola y ganadería extensiva.
**Servicios críticos:** Regulación hídrica y captura de carbono.
**Medios de vida afectados:** Agricultura de subsistencia y turismo comunitario.
**Conflictos presentes:** Disputas por tenencia de tierra en zonas limítrofes.
**Opciones de SbN:** Restauración de riberas y sistemas agroforestales con cacao.
**Por qué esta zona es estratégica:** Conecta dos grandes reservas de biosfera y es clave para el corredor biológico mesoamericano.
    `.trim();

    return dummyAnalysis;
}

export async function searchDocument(query: string, language: Language): Promise<string> {
    const prompt = `
        You are a helpful research assistant.
        Your task is to answer the user's question based *only* on the content of the document provided below.
        Do not use any external knowledge.
        If the information to answer the question is not found in the document, you MUST respond with the exact phrase: "I couldn't find this information in your uploaded documents."
        Your final response must be in ${language === 'es' ? 'Spanish' : 'English'}.

        User's Question: "${query}"

        Document Content:
        ---
        ${DOCUMENT_TEXT}
        ---
    `;

    try {
        const provider = getLLMProvider();
        const response = await provider.generateText(prompt, {
            temperature: 0.2,
        });

        const textResponse = response.trim();

        // Final check to ensure the model follows instructions
        if (textResponse === "I couldn't find this information in your uploaded documents." && language === 'es') {
            return "No pude encontrar esta información en los documentos cargados.";
        }

        return textResponse;
    } catch (error) {
        console.error("Error calling LLM API for document search:", error);
        throw new Error(getErrorMessage(language));
    }
}

